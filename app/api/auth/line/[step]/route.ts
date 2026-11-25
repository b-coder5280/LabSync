import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdminAuth } from '@/lib/firebase-admin';
import { logAuthCallbackFailure, type CallbackStage } from '@/lib/auth-callback-log';
import { safeReturnPath, seal, stateMatches, unseal } from '@/lib/kakao-security';
import { firebaseTokenForProvider } from '@/lib/kakao-flow';
import { beginLine, lineConfig, verifyLine } from '@/lib/line-flow';

export const runtime = 'nodejs';
const cookie = { secure: true, httpOnly: true, path: '/' } as const;
const stateCookie = '__Host-labsync-line-state';
const sessionCookie = '__Host-labsync-line-session';
const headers = { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' };
const json = (body: object, status = 200) => NextResponse.json(body, { headers, status });
type Context = { params: Promise<{ step: string }> };

export async function GET(request: NextRequest, context: Context) {
  const { step } = await context.params;
  const config = lineConfig();
  if (step === 'status') return json({ enabled: !!config });
  if (step !== 'start' && step !== 'callback') return json({ error: 'line/invalid-route' }, 405);
  if (!config || request.nextUrl.origin !== config.origin) return json({ error: 'line/not-configured' }, 503);
  const redirect = (url: URL) => NextResponse.redirect(url, { status: 303, headers });
  if (step === 'start') {
    const { url, flow } = beginLine(config, safeReturnPath(request.nextUrl.searchParams.get('returnTo')));
    const response = redirect(url);
    response.cookies.set(stateCookie, seal(flow, config.cookieSecret, 'line-state', 600), { ...cookie, sameSite: 'lax', maxAge: 600 });
    return response;
  }
  const finish = (error?: string) => {
    const url = new URL('/auth/line', config.origin);
    if (error) url.searchParams.set('error', error);
    const response = redirect(url);
    response.cookies.set(stateCookie, '', { ...cookie, sameSite: 'lax', maxAge: 0 });
    if (error) response.cookies.set(sessionCookie, '', { ...cookie, sameSite: 'strict', maxAge: 0 });
    return response;
  };
  const flow = unseal<{ state: string; nonce: string; verifier: string; returnTo: string }>(
    request.cookies.get(stateCookie)?.value, config.cookieSecret, 'line-state',
  );
  const params = request.nextUrl.searchParams;
  if (!flow || !stateMatches(params.get('state'), flow.state)) return finish('invalid-state');
  if (params.has('error')) return finish(params.get('error') === 'access_denied' ? 'cancelled' : 'provider-error');
  const code = params.get('code');
  if (!code || code.length > 2048) return finish('missing-code');
  let stage: CallbackStage = 'provider-verification';
  try {
    const uid = await verifyLine(code, flow, config);
    stage = 'firebase-init';
    const auth = firebaseAdminAuth();
    stage = 'firebase-session';
    const token = await firebaseTokenForProvider(uid, 'LINE 사용자', 'line', auth);
    stage = 'session-cookie';
    const response = finish();
    response.cookies.set(sessionCookie, seal({ token, returnTo: flow.returnTo }, config.cookieSecret, 'line-session', 60),
      { ...cookie, sameSite: 'strict', maxAge: 60 });
    return response;
  } catch (error) {
    logAuthCallbackFailure('line', stage, error);
    return finish('server-error');
  }
}

export async function POST(request: NextRequest, context: Context) {
  if ((await context.params).step !== 'session') return json({ error: 'line/invalid-route' }, 405);
  const config = lineConfig();
  if (!config) return json({ error: 'line/not-configured' }, 503);
  if (request.nextUrl.origin !== config.origin || request.headers.get('origin') !== config.origin) {
    return json({ error: 'line/invalid-origin' }, 403);
  }
  const session = unseal<{ token: string; returnTo: string }>(request.cookies.get(sessionCookie)?.value, config.cookieSecret, 'line-session');
  const response = session && typeof session.token === 'string'
    ? json({ token: session.token, returnTo: safeReturnPath(session.returnTo) })
    : json({ error: 'line/session-expired' }, 401);
  response.cookies.set(sessionCookie, '', { ...cookie, sameSite: 'strict', maxAge: 0 });
  return response;
}

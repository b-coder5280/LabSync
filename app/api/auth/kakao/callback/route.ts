import { NextRequest, NextResponse } from 'next/server';
import { cookieNames, kakaoConfig, seal, stateMatches, unseal } from '@/lib/kakao-security';
import { exchangeKakaoCode, firebaseTokenForKakao } from '@/lib/kakao-flow';
import { firebaseAdminAuth } from '@/lib/firebase-admin';
export const runtime = 'nodejs';
export async function GET(request: NextRequest) {
  const config = kakaoConfig();
  if (!config) return NextResponse.json({ error: 'kakao/not-configured' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  const names = cookieNames(config.origin);
  const flow = unseal<{ state: string; returnTo: string }>(request.cookies.get(names.state)?.value, config.cookieSecret, 'state');
  function finish(error?: string) {
    const target = new URL('/auth/kakao', config!.origin);
    if (error) target.searchParams.set('error', error);
    const response = NextResponse.redirect(target, 303);
    response.headers.set('Cache-Control', 'no-store'); response.headers.set('Referrer-Policy', 'no-referrer');
    response.cookies.set(names.state, '', { path: '/', maxAge: 0, httpOnly: true, secure: config!.origin.startsWith('https:'), sameSite: 'lax' });
    response.cookies.set(names.session, '', { path: '/', maxAge: 0, httpOnly: true, secure: config!.origin.startsWith('https:'), sameSite: 'strict' });
    return response;
  }
  if (!flow || !stateMatches(request.nextUrl.searchParams.get('state'), flow.state)) return finish('invalid-state');
  if (request.nextUrl.searchParams.has('error')) return finish(request.nextUrl.searchParams.get('error') === 'access_denied' ? 'cancelled' : 'provider-error');
  const code = request.nextUrl.searchParams.get('code');
  if (!code || code.length > 2048) return finish('missing-code');
  try {
    const uid = await exchangeKakaoCode(code, config);
    const token = await firebaseTokenForKakao(uid, firebaseAdminAuth());
    const response = finish();
    response.cookies.set(names.session, seal({ token, returnTo: flow.returnTo }, config.cookieSecret, 'session', 60), {
      httpOnly: true, secure: config.origin.startsWith('https:'), sameSite: 'strict', path: '/', maxAge: 60,
    });
    return response;
  } catch (error) {
    // Do not log codes, provider responses, tokens or credentials.
    const allowed = new Set(['kakao/token-exchange-failed', 'kakao/profile-failed', 'kakao/invalid-identity', 'kakao/user-disabled']);
    const reason = error instanceof Error && allowed.has(error.message) ? error.message.replace('kakao/', '') : 'server-error';
    return finish(reason);
  }
}

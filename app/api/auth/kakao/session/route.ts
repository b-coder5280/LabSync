import { NextRequest, NextResponse } from 'next/server';
import { cookieNames, kakaoConfig, safeReturnPath, unseal } from '@/lib/kakao-security';
export const runtime = 'nodejs';
export async function POST(request: NextRequest) {
  const config = kakaoConfig();
  const headers = { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' };
  if (!config) return NextResponse.json({ error: 'kakao/not-configured' }, { status: 503, headers });
  if (request.headers.get('origin') !== config.origin) return NextResponse.json({ error: 'kakao/invalid-origin' }, { status: 403, headers });
  const name = cookieNames(config.origin).session;
  const session = unseal<{ token: string; returnTo: string }>(request.cookies.get(name)?.value, config.cookieSecret, 'session');
  const response = session && typeof session.token === 'string'
    ? NextResponse.json({ token: session.token, returnTo: safeReturnPath(session.returnTo) }, { headers })
    : NextResponse.json({ error: 'kakao/session-expired' }, { status: 401, headers });
  response.cookies.set(name, '', { maxAge: 0, httpOnly: true, secure: config.origin.startsWith('https:'), sameSite: 'strict', path: '/' });
  return response;
}

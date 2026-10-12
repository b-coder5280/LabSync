import { NextRequest, NextResponse } from 'next/server';
import { cookieNames, kakaoConfig, newState, safeReturnPath, seal } from '@/lib/kakao-security';
export const runtime = 'nodejs';
export function GET(request: NextRequest) {
  const config = kakaoConfig();
  if (!config) return NextResponse.json({ error: 'kakao/not-configured' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  const state = newState();
  const url = new URL('https://kauth.kakao.com/oauth/authorize');
  url.search = new URLSearchParams({ response_type: 'code', client_id: config.clientId, redirect_uri: config.callback, state }).toString();
  const response = NextResponse.redirect(url, 303);
  response.headers.set('Cache-Control', 'no-store'); response.headers.set('Referrer-Policy', 'no-referrer');
  response.cookies.set(cookieNames(config.origin).state, seal({ state, returnTo: safeReturnPath(request.nextUrl.searchParams.get('returnTo')) }, config.cookieSecret, 'state', 600), {
    httpOnly: true, secure: config.origin.startsWith('https:'), sameSite: 'lax', path: '/', maxAge: 600,
  });
  return response;
}

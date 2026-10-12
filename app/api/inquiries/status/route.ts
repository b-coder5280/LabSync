import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { inquiryConfig } from '@/lib/inquiry-server';
import { seal } from '@/lib/kakao-security';
export const dynamic = 'force-dynamic';
export function GET(request: NextRequest) {
  const config = inquiryConfig();
  const headers = { 'Cache-Control': 'no-store' };
  if (!config || request.nextUrl.origin !== config.origin) return NextResponse.json({ enabled: false }, { headers });
  const nonce = randomUUID();
  const response = NextResponse.json({ enabled: true, testOnly: true, nonce }, { headers });
  response.cookies.set('labsync-intake', seal({ nonce, issuedAt: Date.now() }, config.secret, 'intake', 1800), { httpOnly: true, sameSite: 'strict', path: '/', maxAge: 1800 });
  return response;
}

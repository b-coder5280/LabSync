import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { inquiryConfig } from '@/lib/inquiry-server';
import { seal, unseal } from '@/lib/kakao-security';
export const dynamic = 'force-dynamic';
export function GET(request: NextRequest) {
  const config = inquiryConfig();
  const headers = { 'Cache-Control': 'no-store' };
  if (!config || request.nextUrl.origin !== config.origin) return NextResponse.json({ enabled: false }, { headers });
  const existing = unseal<{ nonce: string; issuedAt: number }>(request.cookies.get('labsync-intake')?.value, config.secret, 'intake');
  if (existing && Date.now() - existing.issuedAt < 25 * 60 * 1000) {
    return NextResponse.json({ enabled: true, testOnly: config.testOnly, fixtureOnly: config.mode === 'preview', retentionDays: config.retentionDays, nonce: existing.nonce }, { headers });
  }
  const nonce = randomUUID();
  const response = NextResponse.json({ enabled: true, testOnly: config.testOnly, fixtureOnly: config.mode === 'preview', retentionDays: config.retentionDays, nonce }, { headers });
  response.cookies.set('labsync-intake', seal({ nonce, issuedAt: Date.now() }, config.secret, 'intake', 1800), { httpOnly: true, secure: config.mode !== 'emulator', sameSite: 'strict', path: '/', maxAge: 1800 });
  return response;
}

import { NextRequest, NextResponse } from 'next/server';
import { inquiryConfig, inquiryServices, saveInquiry } from '@/lib/inquiry-server';
import { parseInquiry } from '@/lib/inquiry';
import { unseal } from '@/lib/kakao-security';
export const runtime = 'nodejs';
const headers = { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' };
const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers });
export async function GET(request: NextRequest) {
  if (!inquiryConfig()) return reply({ error: 'inquiry/disabled' }, 503);
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return reply({ error: 'auth/required' }, 401);
  try {
    const { auth, db } = inquiryServices();
    const claims = await auth.verifyIdToken(token, true);
    if (claims.admin !== true) return reply({ error: 'auth/forbidden' }, 403);
    const list = await db.collection('pilotInquiries').orderBy('createdAt', 'desc').limit(20).get();
    return reply({ testOnly: true, inquiries: list.docs.map(d => ({ id: d.id, email: d.get('email'), message: d.get('message'), status: d.get('status') })) });
  } catch { return reply({ error: 'auth/invalid-token' }, 401); }
}
export async function POST(request: NextRequest) {
  const config = inquiryConfig();
  if (!config) return reply({ error: 'inquiry/disabled' }, 503);
  if (request.nextUrl.origin !== config.origin || request.headers.get('origin') !== config.origin) return reply({ error: 'inquiry/invalid-origin' }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return reply({ error: 'inquiry/content-type' }, 415);
  // Count bytes while streaming; Content-Length alone is untrusted.
  const reader = request.body?.getReader();
  if (!reader) return reply({ error: 'inquiry/invalid-input' }, 400);
  const parts: Uint8Array[] = []; let length = 0;
  try {
    while (true) { const chunk = await reader.read(); if (chunk.done) break; length += chunk.value.length; if (length > 12000) { await reader.cancel(); return reply({ error: 'inquiry/too-large' }, 413); } parts.push(chunk.value); }
    const input = JSON.parse(Buffer.concat(parts).toString('utf8'));
    const flow = unseal<{ nonce: string; issuedAt: number }>(request.cookies.get('labsync-intake')?.value, config.secret, 'intake');
    if (!flow || input.nonce !== flow.nonce || Date.now() - flow.issuedAt < 1500 || input.website !== '') return reply({ error: 'inquiry/invalid-challenge' }, 403);
    if (typeof input.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.id)) return reply({ error: 'inquiry/invalid-id' }, 400);
    const data = parseInquiry(input);
    if (!data) return reply({ error: 'inquiry/invalid-input' }, 400);
    const result = await saveInquiry(data, input.id);
    return reply({ ...result, testOnly: true }, result.duplicate ? 200 : 201);
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'inquiry/conflict') return reply({ error: code }, 409);
    if (code === 'inquiry/rate-limit') return reply({ error: code }, 429);
    if (error instanceof SyntaxError) return reply({ error: 'inquiry/invalid-input' }, 400);
    return reply({ error: 'inquiry/storage-unavailable' }, 503);
  }
}
export async function OPTIONS() { return reply({ error: 'inquiry/cross-origin-not-supported' }, 405); }

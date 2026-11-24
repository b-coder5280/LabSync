import { NextRequest, NextResponse } from 'next/server';
import { inquiryConfig, inquiryServices, saveInquiry } from '@/lib/inquiry-server';
import { parseInquiry } from '@/lib/inquiry';
import { readJsonObject } from '@/lib/request-body';
import { validUuid } from '@/lib/operations';
import { unseal } from '@/lib/kakao-security';
export const runtime = 'nodejs';
const headers = { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' };
const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers });
export async function GET(request: NextRequest) {
  if (!inquiryConfig()) return reply({ error: 'inquiry/disabled' }, 503);
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return reply({ error: 'auth/required' }, 401);
  try {
    const { auth, db, config } = inquiryServices();
    const claims = await auth.verifyIdToken(token, true).catch(() => null);
    if (!claims) return reply({ error: 'auth/invalid-token' }, 401);
    if (claims.admin !== true) return reply({ error: 'auth/forbidden' }, 403);
    const collection = config.testOnly ? db.collection('pilotInquiries') : db.collection('labsyncOps').doc('v1').collection('inquiries');
    const list = await collection.orderBy('createdAt', 'desc').limit(20).get();
    return reply({ testOnly: config.testOnly, inquiries: list.docs.flatMap(d => {
      if (!config.testOnly && (d.get('testOnly') !== false || d.get('expiresAt')?.toMillis() <= Date.now())) return [];
      return [{ id: d.id, email: d.get('email'), message: d.get('message'), status: d.get('status'), source: d.get('source') || 'unspecified' }];
    }) });
  } catch { return reply({ error: 'inquiry/storage-unavailable' }, 503); }
}
export async function POST(request: NextRequest) {
  const config = inquiryConfig();
  if (!config) return reply({ error: 'inquiry/disabled' }, 503);
  if (request.nextUrl.origin !== config.origin || request.headers.get('origin') !== config.origin) return reply({ error: 'inquiry/invalid-origin' }, 403);
  const parsed = await readJsonObject(request);
  if (parsed.status !== 200) return reply({ error: 'inquiry/invalid-input' }, parsed.status);
  const input = parsed.value;
  const flow = unseal<{ nonce: string; issuedAt: number }>(request.cookies.get('labsync-intake')?.value, config.secret, 'intake');
  if (!flow || input.nonce !== flow.nonce || Date.now() - flow.issuedAt < 1500 || input.website !== '') return reply({ error: 'inquiry/invalid-challenge' }, 403);
  if (!validUuid(input.id)) return reply({ error: 'inquiry/invalid-id' }, 400);
  const data = parseInquiry(input);
  if (!data) return reply({ error: 'inquiry/invalid-input' }, 400);
  try {
    const result = await saveInquiry(data, input.id);
    return reply({ ...result, testOnly: config.testOnly }, result.duplicate ? 200 : 201);
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'inquiry/preview-fixture-required') return reply({ error: code }, 400);
    if (code === 'inquiry/conflict') return reply({ error: code }, 409);
    if (code === 'inquiry/rate-limit') return reply({ error: code }, 429);
    return reply({ error: 'inquiry/storage-unavailable' }, 503);
  }
}
export async function OPTIONS() { return reply({ error: 'inquiry/cross-origin-not-supported' }, 405); }

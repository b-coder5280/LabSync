import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export type KakaoConfig = { origin: string; clientId: string; clientSecret: string; cookieSecret: string; callback: string };
export function kakaoConfig(env: Record<string, string | undefined> = process.env): KakaoConfig | null {
  if (env.KAKAO_LOGIN_ENABLED !== 'true') return null;
  const { KAKAO_REST_API_KEY: clientId, KAKAO_CLIENT_SECRET: clientSecret, KAKAO_COOKIE_SECRET: cookieSecret } = env;
  if (!clientId || !clientSecret || !cookieSecret || cookieSecret.length < 32 ||
      !env.FIREBASE_ADMIN_CLIENT_EMAIL || !env.FIREBASE_ADMIN_PRIVATE_KEY || !env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) return null;
  try {
    const url = new URL(env.APP_ORIGIN || env.NEXT_PUBLIC_SITE_URL || '');
    if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) return null;
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && url.hostname === 'localhost')) return null;
    return { origin: url.origin, clientId, clientSecret, cookieSecret, callback: `${url.origin}/api/auth/kakao/callback` };
  } catch { return null; }
}
export function safeReturnPath(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || /[\\\r\n]/.test(value)) return '/';
  try {
    const url = new URL(value, 'https://return.invalid');
    if (url.origin !== 'https://return.invalid' || !['/', '/privacy', '/terms'].includes(url.pathname)) return '/';
    return url.pathname + url.search + url.hash;
  } catch { return '/'; }
}
export function newState() { return randomBytes(32).toString('base64url'); }
export function stateMatches(actual: string | null, expected: string): boolean {
  if (!actual || typeof expected !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(actual) || actual.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}
export function seal(value: object, secret: string, purpose: string, ttl: number, now = Date.now()) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', createHash('sha256').update(secret).digest(), iv);
  cipher.setAAD(Buffer.from(purpose));
  const encrypted = Buffer.concat([cipher.update(JSON.stringify({ value, expires: now + ttl * 1000 })), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64url');
}
export function unseal<T>(cookie: string | undefined, secret: string, purpose: string, now = Date.now()): T | null {
  if (!cookie || cookie.length > 8000) return null;
  try {
    const data = Buffer.from(cookie, 'base64url');
    const decipher = createDecipheriv('aes-256-gcm', createHash('sha256').update(secret).digest(), data.subarray(0, 12));
    decipher.setAAD(Buffer.from(purpose)); decipher.setAuthTag(data.subarray(12, 28));
    const payload = JSON.parse(Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString());
    return typeof payload.expires === 'number' && payload.expires > now ? payload.value as T : null;
  } catch { return null; }
}
export function kakaoUid(id: unknown): string {
  if (typeof id !== 'number' || !Number.isSafeInteger(id) || id <= 0) throw new Error('kakao/invalid-identity');
  return `kakao:${id}`;
}
export function cookieNames(origin: string) {
  const prefix = origin.startsWith('https:') ? '__Host-' : '';
  return { state: `${prefix}labsync-kakao-state`, session: `${prefix}labsync-kakao-session` };
}

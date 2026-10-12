export function canonicalOrigin() {
  try {
    const value = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://labsync-pink.vercel.app');
    if (!['https:', 'http:'].includes(value.protocol) || value.username || value.password) throw new Error('invalid origin');
    return value.origin;
  } catch { return 'https://labsync-pink.vercel.app'; }
}
export function structuredData(value: unknown) { return JSON.stringify(value).replace(/</g, '\\u003c'); }

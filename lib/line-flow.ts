import { createHash } from 'node:crypto';
import { newState } from './kakao-security';

export function lineConfig(env: Record<string, string | undefined> = process.env) {
  const { LINE_CHANNEL_ID: clientId, LINE_CHANNEL_SECRET: clientSecret, LINE_COOKIE_SECRET: cookieSecret } = env;
  const preview = env.VERCEL_ENV === 'preview' &&
    env.VERCEL_GIT_COMMIT_REF === 'feat/course-catchup-20261124' &&
    env.OPERATIONS_MODE === 'preview' &&
    env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'labsync-preview' &&
    env.FIREBASE_ADMIN_CLIENT_EMAIL?.endsWith('@labsync-preview.iam.gserviceaccount.com') === true &&
    env.APP_ORIGIN === 'https://labsync-git-feat-course-catchup-20261124-dongbeen-lees-projects.vercel.app';
  if (env.LINE_LOGIN_ENABLED !== 'true' || (!preview && env.LEGAL_APPROVED !== 'true') || !/^\d+$/.test(clientId || '') ||
      !clientId || !clientSecret || !cookieSecret || cookieSecret.length < 32 || !env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      !env.FIREBASE_ADMIN_CLIENT_EMAIL || !env.FIREBASE_ADMIN_PRIVATE_KEY) return null;
  try {
    const raw = env.APP_ORIGIN || '';
    const url = new URL(raw);
    if (url.protocol !== 'https:' || raw !== url.origin) return null;
    return { clientId, clientSecret, cookieSecret, origin: url.origin, callback: url.origin + '/api/auth/line/callback' };
  } catch { return null; }
}

type Config = NonNullable<ReturnType<typeof lineConfig>>;

export function beginLine(config: Config, returnTo: string) {
  const flow = { state: newState(), nonce: newState(), verifier: newState(), returnTo };
  const url = new URL('https://access.line.me/oauth2/v2.1/authorize');
  url.search = new URLSearchParams({
    response_type: 'code', client_id: config.clientId, redirect_uri: config.callback,
    state: flow.state, nonce: flow.nonce, scope: 'openid',
    code_challenge: createHash('sha256').update(flow.verifier).digest('base64url'), code_challenge_method: 'S256',
  }).toString();
  return { url, flow };
}

export async function verifyLine(code: string, flow: { nonce: string; verifier: string }, config: Config, request = fetch) {
  async function post(method: 'token' | 'verify', body: Record<string, string>) {
    const response = await request('https://api.line.me/oauth2/v2.1/' + method, {
      method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(10000), redirect: 'error',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(body),
    });
    if (!response.ok) throw new Error('line/' + method + '-failed');
    return await response.json() as Record<string, unknown>;
  }
  const token = await post('token', {
    grant_type: 'authorization_code', client_id: config.clientId, client_secret: config.clientSecret,
    redirect_uri: config.callback, code, code_verifier: flow.verifier,
  });
  if (typeof token.id_token !== 'string' || !token.id_token) throw new Error('line/token-failed');
  const profile = await post('verify', { id_token: token.id_token, client_id: config.clientId, nonce: flow.nonce });
  if (profile.iss !== 'https://access.line.me' || profile.aud !== config.clientId ||
      profile.nonce !== flow.nonce || typeof profile.exp !== 'number' || profile.exp <= Date.now() / 1000 ||
      typeof profile.sub !== 'string' || !/^U[0-9a-f]{32}$/i.test(profile.sub)) throw new Error('line/invalid-identity');
  return 'line:' + profile.sub;
}

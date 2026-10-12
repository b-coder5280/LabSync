import { test, expect } from '@playwright/test';
import { cookieNames, kakaoConfig, kakaoUid, newState, safeReturnPath, seal, stateMatches, unseal } from '../lib/kakao-security';
import { exchangeKakaoCode, firebaseTokenForKakao } from '../lib/kakao-flow';

test('Kakao state, expiry, cookie purpose and redirect boundaries', () => {
  const state = newState();
  expect(stateMatches(state, state)).toBe(true);
  expect(stateMatches(newState(), state)).toBe(false);
  expect(stateMatches('한'.repeat(43), state)).toBe(false);
  const secret = 'isolated-fixture-secret-not-a-real-key';
  const cookie = seal({ state }, secret, 'state', 600, 1000);
  expect(unseal(cookie, secret, 'state', 2000)).toEqual({ state });
  expect(unseal(cookie, secret, 'session', 2000)).toBeNull();
  expect(unseal(cookie, secret, 'state', 601000)).toBeNull();
  expect(unseal(cookie.slice(0, -4) + 'AAAA', secret, 'state', 2000)).toBeNull();
  for (const url of ['https://evil.example', '//evil.example', '/\\evil.example', '/admin', '/api/auth/kakao/start', 'javascript:alert(1)']) expect(safeReturnPath(url)).toBe('/');
  expect(safeReturnPath('/?source=demo#pilot')).toBe('/?source=demo#pilot');
  expect(cookieNames('https://labsync-pink.vercel.app').state).toMatch(/^__Host-/);
  expect(kakaoConfig({ KAKAO_LOGIN_ENABLED: 'true' })).toBeNull();
  expect(kakaoUid(12345)).toBe('kakao:12345');
  for (const id of [undefined, 'admin', 0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1]) expect(() => kakaoUid(id)).toThrow();
});

test('Kakao exchanges code on server and trusts only verified provider identity', async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const request = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init });
    return calls.length === 1 ? Response.json({ access_token: 'fixture-token', refresh_token: 'never-stored' }) : Response.json({ id: 91234, kakao_account: { email: 'same-as-google@example.test' } });
  }) as typeof fetch;
  const config = { origin: 'https://labsync-pink.vercel.app', callback: 'https://labsync-pink.vercel.app/api/auth/kakao/callback', clientId: 'fixture', clientSecret: 'server-only-fixture', cookieSecret: 'fixture' };
  expect(await exchangeKakaoCode('fixture-code', config, request)).toBe('kakao:91234');
  expect(calls[0].url).toBe('https://kauth.kakao.com/oauth/token');
  expect(String(calls[0].init?.body)).toContain('client_secret=server-only-fixture');
  expect(calls[1].init?.headers).toEqual({ Authorization: 'Bearer fixture-token' });
  await expect(exchangeKakaoCode('bad', config, (async () => new Response('', { status: 401 })) as typeof fetch)).rejects.toThrow('kakao/token-exchange-failed');
});

test('Kakao creates or reuses stable Firebase UID without email merging or admin claims', async () => {
  const created: unknown[] = []; const minted: string[] = [];
  const auth = { getUser: async (uid: string) => ({ uid, disabled: false }), createUser: async (profile: unknown) => { created.push(profile); }, createCustomToken: async (uid: string) => { minted.push(uid); return 'fixture-custom-token'; } };
  expect(await firebaseTokenForKakao('kakao:123', auth)).toBe('fixture-custom-token');
  expect(created).toEqual([]);
  await firebaseTokenForKakao('kakao:456', { ...auth, getUser: async () => { throw { code: 'auth/user-not-found' }; } });
  expect(created).toEqual([{ uid: 'kakao:456', displayName: '카카오 사용자' }]);
  expect(minted).toEqual(['kakao:123', 'kakao:456']);
  await expect(firebaseTokenForKakao('kakao:123', { ...auth, getUser: async uid => ({ uid, disabled: true }) })).rejects.toThrow('kakao/user-disabled');
  await expect(firebaseTokenForKakao('google-user', auth)).rejects.toThrow('kakao/invalid-identity');
});

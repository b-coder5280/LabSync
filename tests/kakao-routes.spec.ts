import { test, expect } from '@playwright/test';

test('isolated Kakao routes reject CSRF, expired sessions and unsupported methods', async ({ playwright }) => {
  test.skip(process.env.KAKAO_ROUTE_FIXTURE !== '1', 'Requires the isolated fixture server on port 3101, never production.');
  const api = await playwright.request.newContext({ baseURL: 'http://localhost:3101' });
  const start = await api.get('/api/auth/kakao/start?returnTo=https://evil.example', { maxRedirects: 0 });
  expect(start.status()).toBe(303);
  const destination = new URL(start.headers().location);
  expect(destination.hostname).toBe('kauth.kakao.com');
  expect(destination.searchParams.get('redirect_uri')).toBe('http://localhost:3101/api/auth/kakao/callback');
  expect(start.headers()['set-cookie']).toMatch(/HttpOnly/i);
  expect(start.headers()['set-cookie']).toMatch(/SameSite=lax/i);
  const badState = await api.get('/api/auth/kakao/callback?state=forged&code=not-a-code', { maxRedirects: 0 });
  expect(badState.headers().location).toBe('http://localhost:3101/auth/kakao?error=invalid-state');
  const fresh = await api.get('/api/auth/kakao/start', { maxRedirects: 0 });
  const state = new URL(fresh.headers().location).searchParams.get('state');
  const denied = await api.get('/api/auth/kakao/callback?error=access_denied&state=' + state, { maxRedirects: 0 });
  expect(denied.headers().location).toBe('http://localhost:3101/auth/kakao?error=cancelled');
  expect(denied.headers()['set-cookie']).toContain('Max-Age=0');
  expect((await api.post('/api/auth/kakao/session', { headers: { origin: 'https://evil.example' } })).status()).toBe(403);
  expect((await api.post('/api/auth/kakao/session', { headers: { origin: 'http://localhost:3101' } })).status()).toBe(401);
  expect((await api.get('/api/auth/kakao/session')).status()).toBe(405);
  await api.dispose();
});

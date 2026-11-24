import { expect, test } from '@playwright/test';
import { createHash } from 'node:crypto';
import { beginLine, lineConfig, verifyLine } from '../lib/line-flow';

const env = {
  LINE_LOGIN_ENABLED: 'true', LEGAL_APPROVED: 'true', APP_ORIGIN: 'https://example.invalid',
  LINE_CHANNEL_ID: '123', LINE_CHANNEL_SECRET: 'fixture', LINE_COOKIE_SECRET: 'x'.repeat(32),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'demo-labsync-intake', FIREBASE_ADMIN_CLIENT_EMAIL: 'test@example.invalid',
  FIREBASE_ADMIN_PRIVATE_KEY: 'fixture',
};

test('LINE opt-in, redirect, PKCE and identity verification', async () => {
  expect(lineConfig({ ...env, LEGAL_APPROVED: 'false' })).toBeNull();
  expect(lineConfig({ ...env, APP_ORIGIN: 'https://example.invalid/extra' })).toBeNull();
  const config = lineConfig(env)!;
  const { flow, url } = beginLine(config, '/dashboard');
  expect(url.searchParams.get('scope')).toBe('openid');
  expect(url.searchParams.get('code_challenge')).toBe(createHash('sha256').update(flow.verifier).digest('base64url'));
  expect(url.searchParams.get('code_challenge_method')).toBe('S256');
  expect(url.searchParams.get('nonce')).toBe(flow.nonce);
  expect(url.searchParams.get('state')).not.toBe(flow.nonce);
  const sub = 'U' + 'a'.repeat(32);
  const claims = { sub, exp: Date.now()/1000+120, iss: 'https://access.line.me', aud: '123', nonce: flow.nonce };
  function response(verified: object): typeof fetch {
    return async (target, settings) => {
      const body = settings?.body as URLSearchParams;
      if (String(target).endsWith('/token')) {
        expect(body.get('code_verifier')).toBe(flow.verifier);
        expect(body.get('redirect_uri')).toBe(config.callback);
        return Response.json({ id_token: 'fixture' });
      }
      expect(body.get('nonce')).toBe(flow.nonce);
      expect(body.get('client_id')).toBe('123');
      return Response.json(verified);
    };
  }
  expect(await verifyLine('fixture', flow, config, response(claims))).toBe('line:' + sub);
  for (const alternate of [{ nonce: 'other' }, { aud: 'other' }, { exp: 0 }, { iss: 'https://example.invalid' }, { sub: 'admin' }]) {
    await expect(verifyLine('fixture', flow, config, response({ ...claims, ...alternate }))).rejects.toThrow('line/invalid-identity');
  }
});

test('LINE can be tested without production policy approval only on isolated LabSync Preview', () => {
  const preview = {
    ...env, LEGAL_APPROVED: 'false', VERCEL_ENV: 'preview',
    VERCEL_GIT_COMMIT_REF: 'feat/course-catchup-20261124', OPERATIONS_MODE: 'preview',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'labsync-preview',
    FIREBASE_ADMIN_CLIENT_EMAIL: 'test@labsync-preview.iam.gserviceaccount.com',
    APP_ORIGIN: 'https://labsync-git-feat-course-catchup-20261124-dongbeen-lees-projects.vercel.app',
  };
  expect(lineConfig(preview)?.callback).toBe(preview.APP_ORIGIN + '/api/auth/line/callback');
  for (const override of [
    { VERCEL_ENV: 'production' }, { VERCEL_GIT_COMMIT_REF: 'main' },
    { NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'labsync-80acb' },
    { FIREBASE_ADMIN_CLIENT_EMAIL: 'test@labsync-80acb.iam.gserviceaccount.com' },
    { APP_ORIGIN: 'https://labsync-pink.vercel.app' }, { LINE_LOGIN_ENABLED: 'false' },
  ]) expect(lineConfig({ ...preview, ...override })).toBeNull();
});

test('LINE defaults to disabled on the review build', async ({ request }) => {
  expect(await request.get('/api/auth/line/status').then(r => r.json())).toEqual({ enabled: false });
  expect((await request.get('/api/auth/line/start')).status()).toBe(503);
  expect((await request.post('/api/auth/line/session')).status()).toBe(503);
});

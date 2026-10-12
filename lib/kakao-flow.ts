import { kakaoUid, type KakaoConfig } from './kakao-security';

export async function exchangeKakaoCode(code: string, config: KakaoConfig, request: typeof fetch = fetch) {
  const response = await request('https://kauth.kakao.com/oauth/token', {
    method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(10000),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'authorization_code', client_id: config.clientId,
      client_secret: config.clientSecret, redirect_uri: config.callback, code }),
  });
  if (!response.ok) throw new Error('kakao/token-exchange-failed');
  const token: unknown = await response.json();
  if (!token || typeof token !== 'object' || !('access_token' in token) || typeof token.access_token !== 'string') throw new Error('kakao/token-exchange-failed');
  const profileResponse = await request('https://kapi.kakao.com/v2/user/me', {
    headers: { Authorization: `Bearer ${token.access_token}` }, cache: 'no-store', signal: AbortSignal.timeout(10000),
  });
  if (!profileResponse.ok) throw new Error('kakao/profile-failed');
  const profile = await profileResponse.json();
  return kakaoUid(profile.id);
}

type AuthAdapter = {
  getUser(uid: string): Promise<{ uid: string; disabled: boolean }>;
  createUser(properties: { uid: string; displayName: string }): Promise<unknown>;
  createCustomToken(uid: string): Promise<string>;
};
export async function firebaseTokenForKakao(uid: string, auth: AuthAdapter) {
  if (!/^kakao:[1-9]\d*$/.test(uid)) throw new Error('kakao/invalid-identity');
  try {
    const user = await auth.getUser(uid);
    if (user.disabled) throw new Error('kakao/user-disabled');
  } catch (error) {
    if (!(error && typeof error === 'object' && 'code' in error && error.code === 'auth/user-not-found')) throw error;
    try { await auth.createUser({ uid, displayName: '카카오 사용자' }); }
    catch (createError) {
      // Concurrent first logins may race. Re-read; never adopt a different UID.
      if (!(createError && typeof createError === 'object' && 'code' in createError && createError.code === 'auth/uid-already-exists')) throw createError;
      if ((await auth.getUser(uid)).disabled) throw new Error('kakao/user-disabled');
    }
  }
  // No roles or membership claims, no email lookup or automatic linking.
  return auth.createCustomToken(uid);
}

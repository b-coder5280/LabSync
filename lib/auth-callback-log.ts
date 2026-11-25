type Provider = 'kakao' | 'line';
export type CallbackStage = 'provider-verification' | 'firebase-init' | 'firebase-session' | 'session-cookie';

const knownCodes = new Set([
  'app/invalid-credential', 'app/invalid-argument', 'app/network-error',
  'auth/insufficient-permission', 'auth/internal-error', 'auth/invalid-credential',
  'auth/invalid-argument', 'auth/invalid-uid', 'auth/network-request-failed',
  'auth/operation-not-allowed', 'auth/project-not-found', 'auth/uid-already-exists',
  'auth/user-not-found', 'ERR_REQUIRE_ESM', 'ERR_MODULE_NOT_FOUND',
  'MODULE_NOT_FOUND', 'ERR_OSSL_UNSUPPORTED', 'ERR_INVALID_ARG_TYPE',
  'ETIMEDOUT', 'ECONNRESET', 'ENOTFOUND', 'UND_ERR_CONNECT_TIMEOUT',
]);

function knownCode(error: unknown) {
  if (error && typeof error === 'object' && 'code' in error &&
      typeof error.code === 'string' && knownCodes.has(error.code)) return error.code;
  return undefined;
}

export function logAuthCallbackFailure(provider: Provider, stage: CallbackStage, error: unknown) {
  const cause = error instanceof Error ? error.cause : undefined;
  const message = error instanceof Error ? error.message : '';
  const code = knownCode(error) ?? knownCode(cause) ??
    (error instanceof Error && error.name === 'TimeoutError' ? 'timeout' : 'unclassified');
  const detail = /invalid_grant|invalid jwt signature/i.test(message) ? 'key-identity-rejected' :
    /permission_denied|insufficient permission|does not have permission/i.test(message) ? 'permission-denied' :
    /invalid pem|failed to parse private key/i.test(message) ? 'private-key-format' : undefined;
  // Never log the error object, upstream payloads, authorization codes, tokens, or credentials.
  console.error('labsync.auth.callback.failed', { provider, stage, code, detail });
}

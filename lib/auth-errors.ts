export function authErrorMessage(error: unknown): string {
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  const messages: Record<string, string> = {
    "auth/popup-closed-by-user": "로그인이 취소되었습니다. 원하실 때 다시 로그인해 주세요.",
    "auth/cancelled-popup-request": "이미 로그인이 진행 중입니다. 열린 Google 창을 확인해 주세요.",
    "auth/popup-blocked": "팝업이 차단되었습니다. 이 사이트의 팝업을 허용한 뒤 다시 눌러 주세요.",
    "auth/network-request-failed": "네트워크 연결을 확인한 뒤 다시 시도해 주세요.",
    "auth/unauthorized-domain": "현재 주소에서 로그인을 사용할 수 없습니다. 운영자에게 문의해 주세요.",
    "auth/operation-not-allowed": "Google 로그인 설정을 확인 중입니다. 잠시 후 다시 이용해 주세요.",
    "auth/configuration-not-found": "Google 로그인 연결을 준비 중입니다. 운영자의 인증 설정이 완료되면 이용할 수 있습니다.",
    "auth/invalid-api-key": "로그인 설정을 확인 중입니다. 잠시 후 다시 이용해 주세요.",
    "auth/web-storage-unsupported": "로그인 상태를 저장할 수 없습니다. 브라우저의 사이트 저장소를 허용해 주세요.",
    "auth/user-token-expired": "로그인 세션이 만료되었습니다. 다시 로그인해 주세요.",
    "auth/invalid-user-token": "로그인 세션이 만료되었습니다. 다시 로그인해 주세요.",
    "auth/user-disabled": "사용이 중지된 계정입니다. 운영자에게 문의해 주세요.",
    "auth/account-exists-with-different-credential": "이 이메일은 다른 로그인 방식으로 등록되어 있습니다. 운영자에게 문의해 주세요.",
    "auth/invalid-credential": "Google 인증을 완료하지 못했습니다. 다시 로그인해 주세요.",
    "auth/invalid-auth-event": "Google 인증 응답을 확인하지 못했습니다. 다시 로그인해 주세요.",
    "auth/too-many-requests": "시도가 많아 잠시 제한되었습니다. 잠시 후 다시 시도해 주세요.",
  };
  return messages[code] ?? "로그인을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}

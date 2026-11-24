# LINE 로그인 완료보고 · 실습 2-5

로그인 선택 메뉴와 서버 OAuth 흐름을 구현했습니다. **PASS** · 기본 비활성, 승인·HTTPS·환경 설정 확인, PKCE S256, state·nonce·발급자·대상·만료 검증과 제공업체별 UID를 모의 응답으로 검사합니다. **BLOCKED** · 실제 채널, 콜백 등록, 호스팅 Preview에서의 로그인과 프로필 반환 확인.

운영자 계정으로 LINE Login 채널과 HTTPS `/api/auth/line/callback`을 등록합니다. `LINE_CHANNEL_ID`, `LINE_CHANNEL_SECRET`, `LINE_COOKIE_SECRET`, `APP_ORIGIN`, Firebase Admin 및 정책 승인 설정 후 `LINE_LOGIN_ENABLED=true`로 켭니다. 현재 범위는 `openid`이며 표시 이름은 앱이 기본값을 사용합니다. 이메일과 프로필 정보를 추가 수집하게 될 경우 필요성과 별도 설정을 먼저 확인합니다. LINE 식별자는 Google 계정에 자동 연결되지 않습니다.

[LINE 공식 웹 로그인](https://developers.line.biz/en/docs/line-login/integrate-line-login/) · [PKCE](https://developers.line.biz/en/docs/line-login/integrate-pkce/)

2026-11-24 KST: 사용자가 `LabSync` Provider를 생성했습니다. 신규 LINE Login 채널의 서비스 제공 지역 목록은 일본·태국·대만·인도네시아이며 한국이 없습니다. 한국 대상 LabSync의 채널 생성과 실제 계정 로그인 시험은 이 단계에서 보류했습니다. 과제의 막힌 지점으로 기록합니다. [공식 지역 목록](https://developers.line.biz/en/docs/line-login/getting-started/)

[다음 실습 → 2-6 구글 플레이 사전 준비](https://claude.ai/artifact/1GBHSTTKx9mqACctvchKrc#b2-6)

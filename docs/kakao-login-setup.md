# Kakao 로그인 설정

상태: 코드 IMPLEMENTED / 모의 경계 TESTED_LOCAL / 실제 앱·키·로그인 FOUNDER_ACTION_REQUIRED. 현재 기본 비활성이며 준비 중 안내만 표시한다. 설정 문자열이 존재하는 것과 유효한 credential로 로그인되는 것은 다르다.

## 선택한 방식

Kakao REST authorization code를 서버에서 교환하고 `/v2/user/me`의 검증된 숫자 ID를 Firebase `kakao:<id>` UID로 연결한다. Firebase Admin SDK가 custom token을 발급하고 브라우저가 `signInWithCustomToken`으로 기존 Firebase 세션을 사용한다. 이메일로 Google 계정과 자동 병합하지 않는다. 같은 사람의 두 제공업체 계정은 별개이며 명시적인 계정 연결 기능은 이번 범위에 없다. 카카오 이메일/프로필 scope는 추가 요청하지 않고 표시 이름은 “카카오 사용자”다.

Firebase OIDC 대안은 Identity Platform 업그레이드를 요구한다. 현재 custom-token 방식은 그 업그레이드를 하지 않는다. OIDC/SAML Tier 2는 공식 가격표상 50 MAU까지 무료, 초과 $0.015/MAU이며 변경 가능하다. 선택한 방식도 Firebase·Vercel의 사용량/요금 제한을 받으므로 무제한 무료를 보장하지 않는다.

## 대표자 콘솔 순서

1. Kakao Developers에서 LabSync 앱 존재 여부 확인 후 없으면 생성. 실제 운영자 정보·앱 이름·아이콘 입력.
2. 앱의 Kakao 로그인 활성화. 플랫폼/웹 사이트 도메인 항목에 `https://labsync-pink.vercel.app` 등록.
3. 앱 → 플랫폼 키 → REST API 키의 Redirect URI 등록. 코드에서 확정한 운영값은 **`https://labsync-pink.vercel.app/api/auth/kakao/callback`**. 개발 시 **`http://localhost:3100/api/auth/kakao/callback`**도 별도 등록. Firebase Google callback과 다르다.
4. REST API 키와 로그인 Client Secret 확인. Client Secret 사용을 켠 상태로 설정. 현재 코드는 REST 방식이며 OIDC는 켤 필요 없다. 이메일 등 추가 동의항목은 요구하지 않는다. 앱 권한/비즈 앱 요건이 Console에 표시되면 대표자가 검토하며 임의 신청하지 않는다.
5. Firebase 프로젝트의 서버용 service account 및 필요한 Authentication 사용자 조회/생성 권한을 대표자가 설정. 불필요한 Owner 권한을 부여하지 않는다. private key는 채팅/저장소에 보내지 않고 Vercel 서버 환경변수에 직접 입력. 키 생성·IAM 변경은 대표자 작업이다.
6. 아래 서버 변수를 Production에 입력하고 설정 완료 후만 `KAKAO_LOGIN_ENABLED=true`. 승인된 새 배포 후 실계정 검증.

| 서버 Key (NEXT_PUBLIC 금지) | 값/역할 |
|---|---|
| KAKAO_LOGIN_ENABLED | 준비 중 false; 완료 후 true |
| APP_ORIGIN | https://labsync-pink.vercel.app (경로 없음) |
| KAKAO_REST_API_KEY | Kakao REST API 키 |
| KAKAO_CLIENT_SECRET | Kakao 로그인 Client Secret |
| KAKAO_COOKIE_SECRET | 암호학적으로 무작위 생성한 최소 32자 비밀값 |
| FIREBASE_ADMIN_CLIENT_EMAIL | 해당 Firebase service account 이메일 |
| FIREBASE_ADMIN_PRIVATE_KEY | 해당 private key PEM; 실제 줄바꿈 또는 literal \\n 지원 |

기존 `NEXT_PUBLIC_FIREBASE_PROJECT_ID`와 브라우저 Firebase 네 변수도 필요하다. localhost 검증 시 `.env.local`의 APP_ORIGIN을 `http://localhost:3100`으로 설정한다. 임의 Vercel Preview URL로 운영 callback을 대체하지 않는다.

## 보안 및 검증

- start: 무작위 32바이트 state, AES-GCM 인증 암호화 쿠키 10분. HTTPS에서는 __Host-, Secure, HttpOnly, SameSite=Lax, Path=/.
- callback: state/만료/변조 검사 후 서버에서만 token 교환. OIDC ID token을 사용하는 흐름이 아니므로 nonce는 사용하지 않는다. 공급자 응답의 ID만 신뢰.
- completion: custom token은 URL에 넣지 않으며 1분 encrypted HttpOnly SameSite=Strict 쿠키로 전달. 같은 origin의 POST session 요청만 허용하고 읽은 뒤 쿠키 삭제. 서버 저장소 기반 전역 재사용 차단은 없다. 만료와 쿠키 삭제를 전역 one-time 보장으로 해석하지 않는다.
- returnTo는 `/`, `/privacy`, `/terms`만 허용. 외부 redirect 차단. 토큰/secret 로그 없음, 응답 no-store.
- Firebase 기존 사용자 비활성 여부 확인, UID 중복 생성 경합 처리. admin/연구실 claim 부여 없음.
- 로컬 테스트: state 변조·만료·목적 불일치, redirect, 잘못된 ID, token 교환/프로필 모의 응답, 기존/신규/disabled 사용자, callback 위조/취소, session 타 origin403·없음401·GET405. 실제 카카오/서버 키 테스트는 미실행.
- 설정 후 재개: `/api/auth/kakao/status` enabled 확인 → 실제 Kakao 동의/취소 → Firebase UID 확인 → 새로고침/새 탭 → 로그아웃 → 서버 로그 비밀정보 미노출 확인. Google 재검증도 수행.

[Kakao REST](https://developers.kakao.com/docs/ko/kakaologin/rest-api), [Firebase custom token](https://firebase.google.com/docs/auth/admin/create-custom-tokens), [Firebase OIDC](https://firebase.google.com/docs/auth/web/openid-connect), [Identity Platform 가격](https://cloud.google.com/identity-platform/pricing).

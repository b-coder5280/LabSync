# LabSync

기존 Google Calendar를 사용하는 공용장비 연구실을 위한 운영 지원 홈페이지입니다. Next.js App Router, TypeScript, React와 직접 작성한 CSS를 사용합니다.

헤더의 Google 로그인은 Firebase Authentication의 팝업 방식을 사용합니다. 파일럿 문의는 이메일 또는 설정한 문의 URL로 연결합니다. 기존 Request Assistant는 공개된 예시 체험이며 실제 Calendar나 연구실 데이터에 접근하지 않습니다.

## 실행

Node.js 22.9 이상에서 `.env.example`을 `.env.local`로 복사하고 실제 공개 웹 앱 설정을 입력합니다.

```sh
npm ci
npm run dev
npm run lint
npm run build
npm run typecheck
npm run start -- --port 3100
```

다른 터미널에서 `npx playwright test`를 실행합니다. 테스트는 설치된 Microsoft Edge를 사용합니다. 실제 Firebase 설정과 네트워크가 준비되면 `LABSYNC_AUTH_READY=1` 환경변수로 팝업 차단 통합 검사도 실행할 수 있습니다. Google 계정 로그인 성공 검증은 실제 계정으로 별도 수행해야 합니다.

## 설정과 배포

환경변수 이름은 [.env.example](.env.example), 설정 절차는 [Google 준비 안내](docs/google-oauth-readiness.md)에 있습니다. `NEXT_PUBLIC_*` 값은 빌드 시 브라우저에 공개되므로 변경 후 새 빌드가 필요합니다. Google 로그인에는 관리자 credential이 필요 없습니다. 선택적인 카카오 로그인은 [서버 설정](docs/kakao-login-setup.md)이 필요하며 기본 비활성입니다.

`NEXT_PUBLIC_CONTACT_URL`이 유효하면 우선 사용하고, 없으면 `NEXT_PUBLIC_CONTACT_EMAIL`을 사용합니다. 이메일 설정도 없으면 대표자가 승인한 `dongbeen@gm.gist.ac.kr`로 연결합니다. 메일 앱 실행은 접수 완료가 아닙니다.

## 인증과 권한

Firebase SDK가 계정의 안정적인 `uid`와 세션을 관리합니다. 로그인 상태는 local persistence로 복원되며 다른 탭의 로그인·로그아웃도 구독합니다. 별도 사용자 DB는 없습니다. 선택적인 카카오 서버 흐름은 검증된 제공업체 ID로 Firebase custom token을 발급하고 단기 암호화 쿠키로 전달합니다. 화면에서는 이름과 제공된 이메일만 표시합니다.

로그인은 연구실 사용 권한을 부여하지 않습니다. 현재 회원별 연구실 데이터·DB·고객 포털은 없으며 계정 패널에 이용 권한 확인 전 상태를 표시합니다. 향후 고객 데이터 API에는 서버 토큰 검증과 UID 기반 membership 검사가 먼저 필요합니다. 카카오 OAuth API는 state·Origin·만료 검사를 별도로 수행합니다.

10월 14일 작업 상태·승인 경계·시연 순서는 [준비 보고서](docs/oct14-readiness.md), 대표자 설정은 [체크리스트](docs/founder-actions.md)를 참고하세요. 정책은 승인 전 초안이며 분석 수집은 기본 비활성입니다. 이번 수정본은 Production에 배포하지 않았습니다.

문구와 파일럿 조건은 `lib/site-config.ts`에서 관리합니다. Pretendard는 `public/fonts`에서 직접 제공하고 라이선스를 함께 보관합니다. 변경 및 검증 내역은 [검증 보고서](docs/verification.md)를 참고하세요.

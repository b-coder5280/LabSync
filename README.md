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

주 CTA는 홈페이지 문의 도우미로 이동합니다. 운영 웹 저장은 비활성이며 상황·연락처·요약 작성 후 승인된 `dongbeen@gm.gist.ac.kr` 메일로 이어 보낼 수 있습니다. 실제 전송은 사용자가 메일 앱에서 합니다. 승인된 로컬 Emulator 모드에서는 가상 정보만 실제 테스트 저장합니다. `NEXT_PUBLIC_CONTACT_URL`은 현재 CTA에서 사용하지 않는 과거 호환 설정입니다.

## 인증과 권한

Firebase SDK가 계정의 안정적인 `uid`와 세션을 관리합니다. 로그인 상태는 local persistence로 복원되며 다른 탭의 로그인·로그아웃도 구독합니다. 별도 사용자 DB는 없습니다. 선택적인 카카오 서버 흐름은 검증된 제공업체 ID로 Firebase custom token을 발급하고 단기 암호화 쿠키로 전달합니다. 화면에서는 이름과 제공된 이메일만 표시합니다.

로그인은 연구실 사용 권한을 부여하지 않습니다. 운영 연구실 DB·고객 포털은 없습니다. 로컬 문의 Emulator API만 추가했으며 Vercel에서는 강제 비활성입니다. [DB 감사](docs/db_rules.md)에 schema/Rules/API 검사 범위가 있습니다. 카카오 OAuth API는 state·Origin·만료 검사를 별도로 수행합니다.

10월 14일 작업 상태·승인 경계·시연 순서는 [준비 보고서](docs/oct14-readiness.md), 대표자 설정은 [체크리스트](docs/founder-actions.md)를 참고하세요. 정책은 승인 전 초안이며 분석 수집은 기본 비활성입니다. 이번 수정본은 Production에 배포하지 않았습니다.

문구와 파일럿 조건은 `lib/site-config.ts`에서 관리합니다. Pretendard는 `public/fonts`에서 직접 제공하고 라이선스를 함께 보관합니다. 변경 및 검증 내역은 [검증 보고서](docs/verification.md)를 참고하세요.

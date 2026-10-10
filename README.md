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

환경변수 이름은 [.env.example](.env.example), 실제 프로젝트의 값과 Firebase·Vercel 메뉴 및 검증 절차는 [인증 및 배포 안내](docs/auth-deployment.md)에 정리되어 있습니다. `NEXT_PUBLIC_*` 값은 브라우저에 공개되며 빌드 시 반영되므로 변경 후 재배포해야 합니다. 관리자 credential, 서비스 계정 키, Google client secret은 필요하지 않습니다.

`NEXT_PUBLIC_CONTACT_URL`이 유효하면 우선 사용하고, 없으면 `NEXT_PUBLIC_CONTACT_EMAIL`을 사용합니다. 둘 다 없으면 문의 준비 상태 안내로 이동하며 접수 성공을 표시하지 않습니다.

## 인증과 권한

Firebase SDK가 계정의 안정적인 `uid`와 세션을 관리합니다. 로그인 상태는 브라우저의 local persistence로 복원되고, 토큰 변경과 다른 탭의 로그인·로그아웃을 구독합니다. 별도 사용자 DB나 자체 토큰 저장 코드는 없습니다. 화면에서는 이름과 이메일만 표시합니다.

로그인은 연구실 사용 권한을 부여하지 않습니다. 현재 저장소에는 회원별 데이터, DB, 보호 API, 고객 포털이 없으므로 새 사용자에게 연결되는 연구실도 없습니다. 계정 패널에는 이용 권한 확인 전 상태를 표시합니다. 추후 데이터 API를 추가할 때에는 서버의 토큰 검증과 UID 기반 연구실 membership 확인이 먼저 필요합니다. 클라이언트 로그인 상태만으로 권한을 판정해서는 안 됩니다.

문구와 파일럿 조건은 `lib/site-config.ts`에서 관리합니다. Pretendard는 `public/fonts`에서 직접 제공하고 라이선스를 함께 보관합니다. 변경 및 검증 내역은 [검증 보고서](docs/verification.md)를 참고하세요.

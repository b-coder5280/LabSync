# LabSync

기존 Google Calendar를 사용하는 공용장비 연구실을 위한 운영 지원 홈페이지입니다. Next.js App Router, TypeScript, React와 직접 작성한 CSS를 사용합니다.

헤더의 Google 로그인은 Firebase Authentication의 팝업 방식을 사용합니다. 초대된 연구실은 대시보드에서 운영 요청을 접수하고 처리 상태를 확인합니다. 기존 Request Assistant는 공개된 예시 체험이며 실제 Calendar나 연구실 데이터에 접근하지 않습니다.

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

첫 화면 버튼은 무료 데모로 이동합니다. 파일럿 웹 문의 저장은 기본 비활성이며 상황·연락처·요약 작성 후 기존 `dongbeen@gm.gist.ac.kr` 메일로 이어 보낼 수 있습니다. 실제 전송은 사용자가 메일 앱에서 합니다. 승인된 로컬 Emulator 모드에서는 가상 정보만 실제 테스트 저장합니다. `NEXT_PUBLIC_CONTACT_URL`은 현재 CTA에서 사용하지 않는 과거 호환 설정입니다.

## 인증과 권한

Firebase SDK가 계정의 안정적인 `uid`와 세션을 관리합니다. 로그인 상태는 local persistence로 복원되며 다른 탭의 로그인·로그아웃도 구독합니다. 새 운영 데이터는 Firestore의 `labsyncOps/v1` 네임스페이스에 저장합니다. 선택적인 카카오 서버 흐름은 검증된 제공업체 ID로 Firebase custom token을 발급하고 단기 암호화 쿠키로 전달합니다. 화면에서는 이름과 제공된 이메일만 표시합니다.

로그인 후 연구실 초대를 사용해야 대시보드의 운영 데이터에 접근할 수 있습니다. 운영 API와 문의 저장은 로컬 Emulator에서 검증할 수 있으며, 실운영 사용은 별도 정책 승인과 서버 설정이 필요합니다. [DB 감사](docs/db_rules.md)에 schema/Rules/API 검사 범위가 있습니다. 카카오 OAuth API는 state·Origin·만료 검사를 별도로 수행합니다.

10월 14일 작업 상태·승인 경계·시연 순서는 [준비 보고서](docs/oct14-readiness.md), 대표자 설정은 [체크리스트](docs/founder-actions.md)를 참고하세요. 정책은 승인 전 초안이며 분석 수집은 기본 비활성입니다. 이번 수정본은 Production에 배포하지 않았습니다.

문구와 파일럿 조건은 `lib/site-config.ts`에서 관리합니다. Pretendard는 `public/fonts`에서 직접 제공하고 라이선스를 함께 보관합니다. 변경 및 검증 내역은 [검증 보고서](docs/verification.md)를 참고하세요.

## 7~12주차 개발 브랜치 검증

[수업 완료보고](docs/course-evidence/COURSE_COMPLETION_KR.md)와 [검증 및 배포 체크리스트](docs/course-evidence/14-release-checklist.md)를 참고하세요.

별도 터미널에서 공식 Firebase CLI로 가상 프로젝트를 실행합니다. Java 21과 Node.js 22.9 이상이 필요합니다.

```sh
npx firebase-tools@15.37.0 emulators:start --only auth,firestore --project demo-labsync-intake
```

다른 터미널에서 로컬 Preview용 빌드를 시작합니다.

```sh
bash scripts/course-emulator.sh build
bash scripts/course-emulator.sh serve
```

`http://localhost:3100`을 열고 또 다른 터미널에서 `bash scripts/course-emulator.sh test`를 실행합니다. 기본 브라우저는 Edge입니다. Chromium Headless Shell 바이너리가 있다면 `LABSYNC_CHROMIUM_PATH`에 실행 파일 경로를 지정할 수 있습니다. `inquiry` 모드의 기존 연속 테스트는 비어 있는 전용 Emulator에서 별도로 실행합니다. 이 흐름의 테스트는 Emulator 토큰을 쓰며 실제 Google 계정 로그인은 별도로 확인합니다.

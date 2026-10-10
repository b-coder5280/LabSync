# LabSync 인증·디자인 검증

검증일: 2026-10-10 (KST)

## 기존 구조와 변경

Next.js App Router + React + TypeScript, Pretendard 로컬 폰트, 직접 작성한 CSS를 유지했습니다. 기존 인증 시스템, 사용자 DB, membership, API 또는 고객 대시보드는 없었습니다. 기존 Request Assistant는 브라우저 내부 예시이며 Calendar에 요청하지 않습니다.

| 기존 | 변경 |
| --- | --- |
| Google 로그인 없음 | Firebase Google 팝업 로그인, 계정 패널, 로그아웃, 초기화·진행 상태와 오류 안내 |
| 문의 주소 미설정으로 비활성 CTA | 지정한 이메일 `dongbeen@gm.gist.ac.kr`로 연결 |
| 어두운 Hero와 요청 예시 중심 | 밝은 배경, 핵심 가치·파일럿 문의·운영 흐름 중심 |
| Request Assistant 두 번 등장, 반복 설명 | 실제 요청 체험 한 번 유지, 중복 섹션 축소 |
| 모바일 탐색 메뉴 숨김 | 로그인과 메뉴 버튼을 헤더에 유지, 모바일 메뉴 추가 |

실제 LabSync 및 DealMate 배포 사이트를 Microsoft Edge로 열어 1440px·375px 스크린샷을 저장하고 확인했습니다. 최초 도구 접근 및 브라우저 요청은 실패했으나 네트워크 허용 후 재시도에서 성공했습니다. DealMate의 간결한 헤더, 정보 계층, 로그인과 다른 행동을 구분하는 구성을 참고했습니다. 해당 사이트의 실제 계정 인증 성공은 검사하지 않았고 디자인이나 코드를 복제하지 않았습니다.

## 인증 구현과 한계

- Firebase Web SDK `signInWithPopup`을 사용합니다. Firebase 기본 authDomain을 유지하여 외부 호스팅 redirect 저장소 문제에 의존하지 않습니다.
- 로그인 중 중복 실행 잠금, 세션 초기화 중 잘못된 로그인 버튼 표시 방지, Google 아이콘, 이름·이메일·로그아웃 패널을 구현했습니다.
- `browserLocalPersistence`와 `onIdTokenChanged`로 상태를 복원·구독합니다. SDK의 `uid`가 식별자이며 이메일 기반 권한 판정이나 사용자 DB 중복 생성은 하지 않습니다.
- 기본 identity scope 외 Calendar 권한을 요청하지 않습니다. 관리자 credential, 비공개 키, 직접 저장하는 OAuth token이 없습니다.
- 초기 공개 설정 요청의 HTTP 400 `CONFIGURATION_NOT_FOUND`는 사용자 설정 후 재검사에서 HTTP 200으로 해결되었습니다. 허용 도메인에 localhost와 운영 주소가 포함됩니다. 실제 로그인 버튼에서 Google OAuth 화면에 도달하고 `/__/auth/handler` 콜백 및 Calendar scope 미요청을 확인했습니다.
- 사용자가 로컬 실계정 로그인·새로고침 유지·로그아웃 모두 성공했다고 확인했습니다. 이는 **사용자 수행 확인**이며 에이전트가 직접 계정 인증을 완료한 검증은 아닙니다. **Production 인증은 아직 미검증**입니다.
- 로그인만으로 연구실 권한을 부여하지 않으며 계정 패널에 이용 권한 확인 전 상태를 표시합니다. 현재 보호 DB/API가 없으므로 서버 권한 검사를 완료했다고 주장하지 않습니다. 공개 예시에 실제 데이터 접근·전송을 새로 추가하지 않았습니다.

## 로컬 검사

- `npm run build`: 실제 공개 Firebase 설정을 넣은 Production 빌드 통과.
- `npm run lint`, `npm run typecheck`: 통과.
- Playwright: 375·768·1440px에서 가로 넘침 없음, 헤더 로그인 표시, 모바일 메뉴 열기/닫기, 문의 메일 링크, 섹션 이동 검사.
- 기존 예약 변경·취소·권한·오류 예시 네 가지의 선택→요약→뒤로→완료 흐름과 실제 전송 없음 검사.
- 키보드 skip link, 보이는 focus, 페이지 JavaScript 예외 없음 검사.
- 팝업 취소·차단·네트워크·허용 도메인·인증 응답·만료·저장소·초기설정 오류 문구와 내부 오류 숨김 검사.
- 설정 누락 시 Firebase 초기화 전에 안전하게 실패하는지 검사.
- `LABSYNC_AUTH_READY=1`로 실서비스 네트워크 검사를 실행했습니다. 실제 Firebase 도메인 조회, Google 팝업 취소와 두 차례 재시도, 중복 클릭 잠금, query/hash 유지가 통과했습니다. 팝업 차단은 `window.open`이 null을 반환하는 브라우저 상황을 재현하고 실제 Firebase SDK의 오류 처리를 검사합니다. 차단 후 포커스가 사라져 Escape가 전달되지 않던 문제를 발견해 document 수준의 키 처리로 수정했습니다.
- 전체 페이지와 Hero 스크린샷을 직접 열어 검토했고, 태블릿 제목 폭과 모바일 텍스트 크기·버튼 영역을 조정했습니다. 전 페이지 WCAG 자동 인증을 수행했다는 의미는 아닙니다.

## 산출물

- `artifacts/labsync-before-{1440,375}.png`: 기존 실제 배포 화면
- `artifacts/dealmate-reference-{1440,375}.png`: 참고 사이트
- `artifacts/landing-{1440,768,375}.png`: 변경 후 전체 화면
- `artifacts/hero-{1440,768,375}.png`: 변경 후 첫 화면

## 수정 파일

- `components/AuthControl.tsx`, `lib/firebase-client.ts`, `lib/auth-errors.ts`: 인증 연결·상태·오류 처리
- `components/SiteHeader.tsx`: 계정 접근과 모바일 탐색
- `app/page.tsx`, `app/refinements.css`, `app/layout.tsx`: 화면 구성과 반응형 디자인
- `components/ContactCTA.tsx`, `lib/site-config.ts`: 문의 연결·메시지
- `.env.example`, 로컬 Git 제외 `.env.local`: 실제 프레임워크의 환경변수
- `package.json`, `package-lock.json`: Firebase 의존성
- `tests/landing.spec.ts`, `tests/live-auth.spec.ts`: 회귀·상태 및 실제 Google 팝업 검사
- `README.md`, `docs/auth-deployment.md`, 이 문서: 설정·배포·검증 기록
- `next-env.d.ts`: Next.js 빌드가 생성한 타입 경로 갱신

## 남은 배포 작업과 의존성

Firebase 초기화·Google 제공업체·허용 도메인 설정은 확인되었습니다. 남은 작업은 Vercel Production 환경변수 확인과 새 코드 배포입니다. 이 실행 환경에는 인증된 Vercel CLI/프로젝트 연결이나 관리자 브라우저가 없어 Production 저장값 조회나 배포를 수행하지 않았습니다. 공개 운영 사이트에는 아직 이전 코드가 표시됩니다. 정확한 값과 단계는 [인증 및 배포 안내](auth-deployment.md)를 참고하세요.

`npm audit`은 high 9건을 보고했습니다. 4건은 Firebase 패키지에 포함되지만 이 앱에서 import/사용하지 않는 Firestore의 gRPC 경로이며, 5건은 ESLint의 glob 개발 의존성 경로입니다. 취약점이 없다고 주장하지 않습니다. audit의 자동 제안은 Firebase/Next ESLint를 이전 major로 내리는 변경이므로 적용하지 않았습니다. 실제 사용 범위와 호환성을 검토해 별도 의존성 업데이트가 필요합니다.

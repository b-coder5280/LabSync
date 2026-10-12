# LabSync 10월 14일 준비 보고서

## 2026-10-12 최신 검토본 — 이 절이 아래 10/11 기록보다 우선

Production 공개 승인 **미수신**. 원격 push/배포/운영 DB 생성/분석 활성화/결제는 하지 않았다. 대표자가 검토할 실행 주소는 **http://localhost:3100** (로컬 문의는 가상 정보만 입력).

### 왜 운영 화면이 그대로였는가

- 원격 `main`: `git ls-remote`로 `eb422222e44ace16f256278c2a673c8591eb22e3` 확인.
- 대표자 Vercel 직접 확인: Production Ready/Current, branch main, SHA `eb42222`, 배포 `9zoWSAQza`, 운영 alias `labsync-pink.vercel.app`. 앞 7자와 전체 SHA가 일치한다.
- 공개 GitHub Vercel 성공 상태도 동일 SHA 및 배포 URL `https://vercel.com/dongbeen-lees-projects/labsync/9zoWSAQzaA1Qyd6TNpZUmjEo2phL`을 가리킨다. `artifacts/oct12-baseline.json`에 조회 결과 보관.
- 이전 모든 수정이 미커밋/미푸시 상태였다. 작업 시작 시 보존 checkpoint **03a45d8**을 로컬 main에 만들었고 원격은 변경하지 않았다. 이번 검토본은 이 checkpoint 위의 후속 변경이다.

| 기능 | 로컬 수정본 | GitHub main | Production | 필요한 조치 |
|---|---|---|---|---|
| Google 로그인 | 기존 SDK 재사용, 팝업/차단/취소 회귀 통과 | 기존 구현 | 기본 인증창 동작 | 새 버전 배포 후 대표자 실계정 UID·유지·로그아웃 재검증 |
| 새 레이아웃/제품 흐름 | IMPLEMENTED/TESTED_LOCAL | 미반영 | 이전 화면 | 공개 승인 후 push/build |
| 문의 도우미 | 3단계 입력/요약/메일 연결 | 미반영 | 준비 안내 CTA | 공개 승인 후 도우미만 배포 가능 |
| 문의 저장/API | **로컬 Emulator 실제 저장**·17검사 | 없음 | 없음, 강제 비활성 | 운영 DB·보관정책·남용방지 운영 설정 별도 승인 필요 |
| Kakao | 기존 코드 재사용, 설정 없으면 준비 중 | 없음 | 없음 | 외부 앱/키/서버 credential 후 실계정 검증 |
| 정책 | 기존 초안 보완, 로컬만 표시 | 없음 | 없음 | 승인 전 Vercel404; 법률 문서 공개는 이번 배포 범위 제외 |
| SEO/FAQ/OG | 구현·로컬 출력 확인 | 이전 metadata | 이전 metadata | 공개 승인 후 새 metadata 배포; 공유 앱 캐시 실측 별도 |
| GA4/Clarity | 코드만, 기본 off | 없음 | 수집 안 함 | 이번 배포에서도 off 유지 |

### 눈으로 볼 결과와 실제 증거

- [이전 Desktop](../artifacts/oct12-production-1440.png) / [새 Desktop](../artifacts/oct12-local-after-1440.png)
- [이전 Mobile](../artifacts/oct12-production-375.png) / [새 Mobile](../artifacts/oct12-local-after-375.png)
- [새 Tablet](../artifacts/oct12-local-after-768.png), [카카오 준비 상태](../artifacts/oct12-login-menu-375.png)
- [실제 Emulator 저장 결과](../artifacts/oct12-inquiry-saved.png), [운영용 메일 전달 분기](../artifacts/oct12-inquiry-email.png)
- 첫 화면을 Calendar 유지→요청 정리→운영자 확인→결과 기록 UI로 재구성. 문제/해결/체험의 중복 설명을 줄이고 파일럿·FAQ·문의 순서로 정리했다. 기존 색상은 실제로 파랑이므로 이름의 pink를 이유로 색을 바꾸지 않았다.
- 문의 CTA는 `#contact`로 이동. 이메일/10자 이상 문의/Calendar 수만 필수, 이름·소속 선택. 운영에서는 저장하지 않으며 마지막 메일 앱 연결 후 사용자가 직접 발송한다. 로컬에서는 동의 후 Firestore transaction commit이 끝나야 테스트 저장 성공을 표시한다.
- 웹 문의 데이터는 `demo-labsync-intake` **127.0.0.1 Emulator만** 사용. VERCEL 환경에서는 올바른 emulator 변수까지 주입해도 GET/POST503, status enabled=false를 확인했다. 운영 DB 연결 코드를 숨겨 켜는 flag는 없다.
- 실제 연구실 운영 요청/membership/운영자 대시보드는 만들지 않았다. 체험 모드가 실제 접수로 보이던 완료 제목을 수정했다.

### 검사 결과와 남은 위험

- build/lint/typecheck 통과. Google 공개 설정/허용 도메인·popup 재시도/차단·UI375/768/1440·SEO·Kakao 순수 경계: **13 passed**. 문의 입력 실패/중복 클릭/메일 분기: **2 passed**. 최종 정책 변경 후 inquiry/readiness **3 passed** 재확인.
- Firestore/Auth Emulator **17개 검사**: 실제 문서 저장·동시재시도1건·키 충돌·이메일3회/시간 제한·분당 전체20회 제한·동의/입력/Origin/challenge/honeypot·익명/일반/운영자 API·클라이언트 직접 읽기/쓰기/role/타 lab 경로 거부·브라우저 저장 후 성공. `artifacts/oct12-inquiry-results.json`.
- Emulator의 auth는 운영 서명 검증을 대신하지 않는다. 다른 lab 경로 거부는 deny-all 규칙 검사이며 실제 Lab A/B membership 격리가 완성됐다는 뜻이 아니다. 운영 inquiries 생성은 미승인이다.
- 강제 Vercel fixture에서 정책 /privacy, /terms **404**, inquiry API **503**. 로컬 검토 모드에서만 초안 제공. `artifacts/oct12-release-evidence.json`.
- 이전 skip5개: (1) Firebase 공개 설정 (2) Google popup cancel/reopen (3) blocked popup은 이번 실제 네트워크 검사로 해소. (4) Kakao route fixture는 지난 격리검사 통과/실제 제공업체 미설정, (5) analytics fixture는 지난 mock검사 통과/실제 수집 의도적으로 비활성. mock을 실계정/실측으로 계산하지 않음.
- Google 실계정 성공·UID·세션·로그아웃은 이전 대표자 확인 이후 이번 턴에는 미실행. 비밀번호를 에이전트가 입력하지 않음. 새 배포 후 대표자가 검증해야 한다.
- npm audit: **high9 → high5**, `--omit=dev` **0**. 운영 패키지 수정은 아래 advisory 평가 참조. 남은5건을 해결 완료로 표시하지 않는다.

| Advisory / 영향 패키지 | 실제 경로·조치 | 잔여 위험 |
|---|---|---|
| GHSA-m9gg-hp2v-232j (high), GHSA-f596-whhp-79r4 (low) | firebase→firestore→grpc-js1.9.16. 서버 인증서 판정/오류노출 취약점. @firebase/firestore 하위 grpc-js를 패치된1.14.6으로 한정 override, lock 갱신. Admin 경로는 이미1.14.6 | 앱은 해당 gRPC 서버/인증서 코드를 실행하지 않았으나 운영 dependency 경고를 제거. 다운그레이드/force 없음 |
| GHSA-vfj7-8cjw-p6xm (high) | eslint-config-next→@next/eslint-plugin-next→fast-glob→micromatch→braces3.0.3, 개발 전용5항목. 안전한 upstream patched 버전 아직 없음 | 깊은 brace pattern으로 개발 도구 DoS 가능. 실제 Next getRootDirs는 settings.next.rootDir glob이 있을 때 호출되며 현재 설정에 없음. 사용자 HTTP 입력 경로 없음. 신뢰하지 않는 lint 설정 실행 금지, upstream 패치 후 갱신 |

근거: [gRPC 인증서 advisory](https://github.com/grpc/grpc-node/security/advisories/GHSA-m9gg-hp2v-232j), [gRPC 오류 advisory](https://github.com/grpc/grpc-node/security/advisories/GHSA-f596-whhp-79r4), [braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). 원본 audit는 artifacts/audit-oct12-before.json, after.json, production.json. 격리 도구 artifacts/emulator-tools의 의존성은 배포 package가 아니다.

### 배포 승인 범위와 롤백

승인 요청 대상: 새 홈페이지/CTA·입력 도우미/명확한 예시 체험/기존 Google 로그인/SEO·공유 자산/의존성 패치. 카카오 준비 중, 분석 off, 문의 서버 저장 off, 정책 초안 비공개, 결제 없음. 새 DB rules 파일은 **자동 배포하지 않는다**.

주요 코드 변경: app/page.tsx·release.css·layout.tsx, OperationsPreview/PilotInquiry/ContactCTA/RequestAssistant/SiteFooter, app/api/inquiries/*·lib/inquiry*·firestore.rules/firebase.json(로컬 전용), lib/legal-preview·privacy/terms, package/lock. 이전 checkpoint의 Kakao/SEO/분석 코드를 함께 포함한다. 전체 변경 파일은 승인 직전 `git diff --name-status eb42222 HEAD`로 확인한다.

승인 후만 main push → Vercel 자동 Production build → 배포 SHA/Ready/Current와 alias 확인 → 3해상도·CTA·Google popup/대표자 실계정·정책404·문의503·수집0 검증. Vercel 관리자 접근이 없으면 대표자가 Deployments의 새 commit 배포 상태를 확인한다. 공개 환경변수는 기존 Google4개 유지; SITE_URL과 CONTACT_EMAIL은 사이트 설정이며 Google 인증 필수4개와 구분한다. `LEGAL_DRAFT_PREVIEW`/Emulator 변수를 Vercel에 등록하지 않는다.

문제 발생 시 Vercel labsync → Deployments → 기존 **9zoWSAQza / eb42222** → 배포 메뉴 **Rollback/Instant Rollback**(UI에 제공되는 항목)로 복구하고 Current·운영 alias·로그인·CTA를 다시 확인한다. 롤백 권한/메뉴가 없으면 기존 SHA를 새 로컬 복구 브랜치에 checkout하여 검증·승인 후 재배포한다. `reset --hard`나 force push로 기록을 삭제하지 않는다. 이번엔 운영 데이터 migration이 없어 DB 롤백이 필요 없다. 이전 버전의 문의 CTA 준비안내 문제는 롤백 시 되돌아온다.

대표자의 다음 단계는 **화면 검토와 배포 승인**이다. 도메인/키/토스 작업을 한 번에 요구하지 않는다. 아직 승인하지 않았다는 10/12 지시를 유지한다.

---

## 아래는 2026-10-11 이력 (현 상태는 위 최신 절 참고)

기준일 2026-10-11. 기존 Next.js 16.3.8 App Router / Firebase Auth / Vercel 프로젝트를 개선했다. 새 코드의 Production 배포는 **하지 않았다**. 실제 로컬 preview: http://localhost:3100.

요구사항의 출처는 사용자 요청서다. 강의 6주차 PDF/PPT가 없으므로 강의 원문의 확정/검토/다음주/복습은 BLOCKED(원문 미확인). [요구사항 매트릭스](requirements-oct14.md)의 R01–R12와 아래 항목을 대조한다.

상태는 서로 대체하지 않는다: IMPLEMENTED=코드/문서 작성, TESTED_LOCAL=실행한 로컬 검사, TESTED_PRODUCTION=명시된 운영 검사 범위만, FOUNDER_ACTION_REQUIRED=대표자 작업, SUBMITTED=실제 접수, PENDING_REVIEW=실제 심사대기, BLOCKED=필수 조건 부족, NOT_STARTED=미실행. 이번 외부 신청은 없으므로 SUBMITTED/PENDING_REVIEW 항목은 **0건**.

## 목표별 결과

| 요청서 목표 | 실제 결과/상태 | 변경 파일 | 검증/Production 범위 | 대표자·다음 조치/제한 |
|---|---|---|---|---|
| R01 Google 앱 신청 | 준비 문서 IMPLEMENTED | google-oauth-readiness.md | 운영 identity scope 확인; Console 심사 상태 미확인 | Branding/Audience 확인 후 요구 시 제출. 신청 미수행 |
| R02 Toss 신청 | 준비 문서 IMPLEMENTED, 신청 BLOCKED | toss-readiness.md | 키/SDK/결제 없음 | 사업자 여부 확인; 실결제 신청 금지 유지. 테스트 키 후 격리 구현 재개 |
| R03 Google 로그인 | 기존 코드 유지, TESTED_PRODUCTION 일부 | AuthControl.tsx | 운영 popup·cancel·scope; 로컬 실계정은 이전 사용자 성공 확인 | 새 배포 후 실계정/세션/로그아웃 재검증 |
| R04 Kakao 로그인 | IMPLEMENTED / TESTED_LOCAL | app/api/auth/kakao/*, app/auth/kakao, lib/kakao-*, firebase-admin, KakaoCompletion | state·ID·Origin·쿠키·mock Firebase 검사; 운영 없음 | 앱/키/서버 credential 미준비. 기본 off, 실계정 미검증 |
| R05 DB/권한 | 감사 및 OAuth 경계 TESTED_LOCAL | db_rules.md, tests/kakao-* | 연구실 DB 없음; DB 격리6항목 N/A | Console 별도 DB 확인. 로그인에 membership/admin 부여 안 함 |
| R06 SEO/AEO/GEO | IMPLEMENTED / TESTED_LOCAL | layout, robots, sitemap, public-content, seo | canonical/구조화 데이터/정책noindex 검사 | 새 배포·공유·색인 미검증 |
| R07 검색 등록 | 태그·안내 IMPLEMENTED | layout, seo-checklist.md | 공개 태그 코드 준비 | 대표자 소유권 확인/제출. 등록/색인 미완료 |
| R08 GA4/Clarity | IMPLEMENTED / TESTED_LOCAL | AnalyticsConsent, analytics-client, analytics.spec | 기본 수집0·격리 동의/철회/허용 event 검사 | 두 flag false; 속성/정책 확정 전 실측 금지 |
| R09 자체 도메인 | 후보·전환 문서 IMPLEMENTED | seo-checklist.md | 3후보 RDAP404; 구매 보장 아님 | 보유 없음, 구매/DNS FOUNDER_ACTION_REQUIRED |
| R10 개인정보/약관 | 승인 전 초안 IMPLEMENTED | app/privacy, app/terms | 로컬 noindex·초안 표시 | 실제 보유기간/국외처리/법적 근거/환불·VAT 승인 후 공개 |
| R11 브랜드/UX | IMPLEMENTED / TESTED_LOCAL | page, readiness.css, SiteFooter, icon, OG, ContactCTA | 375/768/1440, 메뉴/문의/데모 회귀 | 수정본 미배포. 기존 운영 문의 CTA 준비안내 문제는 배포 전 남아 있음 |
| R12 기록/시연 | IMPLEMENTED | 이 문서·traps·founder-actions | 실행 결과와 제한 구분 | 강의 원문 입수 후 분류 보완 |

## 실행 증거

- Production: `artifacts/oct14-production.json` (HTTP200, accounts.google.com popup, identity scope, Firebase callback, 취소 안내, tracking script0). 운영 실제 account login 완료를 관찰한 것은 아니다. 문의 href는 `#contact-status`로 확인됐다.
- 최신 소스 `npm run build`, `npm run typecheck`, `npm run lint`: 통과. lint 경고 없음.
- 기본 Playwright: **10 passed, 5 skipped**. skip은 실제 Firebase/팝업 검증3개, Kakao fixture1개, analytics fixture1개다. skip을 통과로 계산하지 않는다.
- 별도 Kakao route fixture: **1 passed** (외부 토큰 교환 없이 localhost3101). 암호화/state/사용자 매핑3개는 기본 suite 포함.
- 별도 Analytics fixture: **1 passed** (localhost3102, 외부 tracking script 요청 전부 mock). 실제 GA/Clarity 수신 검증 아님.
- 375/768/1440 변경 전후 스크린샷은 `artifacts/oct14-before-*.png`, `artifacts/landing-*.png`, `artifacts/hero-*.png`. 가로 넘침 없음, primary mailto 대상 확인, 공개 데모 네트워크 mutation 없음.
- `git diff --check` 통과. `.env.local`은 Git 제외. 실제 Admin/Kakao private credential을 사용/수집하지 않음.
- 의존성 audit high9건은 후속 검토 필요. 강제 버전 downgrade는 하지 않았다. [오류/제한 기록](traps.md).

현재 Vercel `labsync` ↔ `labsync-pink.vercel.app` 연결은 대표자 확인이며, Production commit/branch는 관리자 접근이 없어 미확인. 로컬 main 시작 HEAD는 eb422222e44ace16f256278c2a673c8591eb22e3. 이 SHA를 운영 SHA로 표시하지 않는다. 변경 전 zip/patch를 artifacts에 보관했다.

## Codex / 대표자 작업표

| 단계 | Codex 작업 | 이동빈 작업 | 완료 기준 | 상태 |
|---|---|---|---|---|
| 구현 | 인증 경계·디자인·SEO·초안·수집 차단 | 변경 내용 검토 | 코드/빌드/테스트 | TESTED_LOCAL |
| 외부 설정 | 실제 Key/URI·실패 경계 문서 | Kakao/Firebase/검색/분석 콘솔 직접 설정 | 설정값과 실계정 결과 | FOUNDER_ACTION_REQUIRED |
| 정책/결제 | 실제 처리 초안·Toss 요건/테스트 설계 | 사업자/보유기간/환불/계약 결정 | 승인된 정책·사업 조건 | FOUNDER_ACTION_REQUIRED |
| 배포 | 배포 후 회귀 절차 준비 | 공개 범위·중요 배포 승인 | 새 build/실계정·문의·SEO 확인 | FOUNDER_ACTION_REQUIRED |
| 심사 | 필요 여부/요건 안내 | 직접 신청·접수 증거 기록 | 실제 접수/심사 상태 | NOT_STARTED |

정확한 key와 Console 순서는 [대표자 체크리스트](founder-actions.md). Production 공개 승인 요구는 사용자 요청서 0.6 및 마지막 지시의 “중요한 배포 … 전에 반드시 승인을 받습니다”에 근거한다. 정책도 별도 승인 전 초안으로 요청됐다. 따라서 코드가 준비돼도 자동 배포하지 않는다.

## 3–5분 시연 (현재 로컬 수정본 기준)

1. **0:00–0:45** 첫 화면: PI/책임자, 기존 Calendar 유지, 파일럿 ₩300,000·최대5개·6주·자동갱신 없음. 운영 사이트와 로컬 수정본을 구분한다.
2. **0:45–1:30** Google 버튼 → 계정 선택 또는 취소. 대표자가 직접 로그인하면 새로고침 유지·로그아웃 시연. 연구실 권한 자동 부여 없음 설명. 카카오는 준비 중임을 명시한다.
3. **1:30–2:30** 공개 요청 체험에서 장비/요청 선택 → 요약 → 예시 완료. 실제 Calendar 수정이나 요청 전송이 아님을 화면 문구와 함께 보여준다.
4. **2:30–3:15** 파일럿 문의의 mailto 수신자 확인(실제 메일은 시연 중 보내지 않아도 됨), 모바일 메뉴/FAQ.
5. **3:15–4:00** 정책 승인 전 초안 및 분석 수집 비활성 설정 표시. robots/sitemap 보여주기.
6. **4:00–4:30** 대표자 체크리스트로 카카오 외부 설정·검색 등록·사업자/Toss·도메인 구매·배포 승인 미완료를 설명한다.

시연 전에 localhost3100 서버와 네트워크를 확인한다. 새 기능이 Production에서 작동한다고 소개하려면 승인된 배포와 해당 검증을 먼저 완료해야 한다.

# LabSync 10월 14일 준비 보고서

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

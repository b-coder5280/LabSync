# 10월 14일 요구사항·현황표

기준: 2026-10-11 사용자 요청서. 10월 7일 6주차 강의 PDF/PPT는 첨부 폴더와 저장소에서 발견되지 않았다. 강의 원문의 확정/검토/다음 주/복습 분류는 모두 **원문 미확인**이며 요청서의 설명과 분리한다. 추가 첨부 시 대조가 필요하다.

| ID | 요구사항 | 원문상 일정/상태 | 기존 구현 | Codex 작업 | 이동빈 작업 | 완료 검증 |
|---|---|---|---|---|---|---|
| R01 | Google 앱 신청 | 원문 미확인; 요청서는 10/14 목표로 지정 | Firebase identity 로그인 | scope·공개 준비 감사 | branding/게시 상태 확인·필요 시 제출 | 콘솔 증거·Production 실계정 |
| R02 | Toss 신청 | 원문 미확인; 요청서는 10/14 목표로 지정 | 없음 | 요건·테스트 계획 | 사업자 상태 확인·계약 직접 수행 | 접수증 이후에만 SUBMITTED |
| R03 | Google 로그인 | 원문 미확인; 추가 완성 목표 | 구현·로컬 사용자 확인 | Production 팝업·오류 검사 | 실제 계정 로그인 | 성공·갱신·로그아웃 |
| R04 | Kakao 로그인 | 원문 미확인; 추가 완성 목표 | 없음 | 서버 OAuth→Firebase custom token | 앱·키·서버 credential 설정 | 모의 경계 테스트와 실계정 분리 |
| R05 | DB/권한 | 원문 미확인; Firebase 유지 | DB 없음; Auth만 사용 | 저장소 감사·인증 경계 테스트 | 콘솔 내 별도 DB 존재 여부 확인 | 없는 DB의 RLS를 통과로 간주하지 않음 |
| R06 | SEO/AEO/GEO | 원문 미확인 | 기본 metadata | canonical·robots·sitemap·FAQ·구조화 데이터 | 공개 문구 승인 | 로컬 출력 검사·배포 후 HTTP |
| R07 | Search Console/Naver | 원문 미확인 | 미확인 | 검증 태그·설정 가이드 | 소유권 확인·sitemap 제출 | 콘솔 확인 |
| R08 | GA4/Clarity | 원문 미확인 | 미연동 | opt-in 코드·민감정보 제외 | 속성·프로젝트·정책 승인 | 기본 수집 차단 테스트; 실측 별도 |
| R09 | 자체 도메인 | 원문 미확인 | 보유 없음(대표자 확인) | 후보·연결 체크리스트 | 구매/DNS 승인 | HTTPS·callback·canonical 재검사 |
| R10 | 개인정보/약관 | 원문 미확인 | 없음 | 실제 처리 기반 승인 전 초안 | 보관·국외이전·환불 조건 검토 | 초안 noindex·공개 전 승인 |
| R11 | 브랜드/디자인 | 원문 미확인 | 파란색 UI·LS 로고 | 대상 구매자 명시·자산·반응형 | 최종 디자인 승인 | 375/768/1440 스크린샷 |
| R12 | 작업/오류 기록 | 원문 미확인 | 기존 docs | traps·readiness·시연 계획 | 외부 상태 업데이트 | 코드/로컬/운영/심사 구분 |

## 체크포인트 및 배포 증거

- 시작 HEAD: `eb422222e44ace16f256278c2a673c8591eb22e3` (로컬 commit, Production SHA로 단정하지 않음).
- 시작 변경: `docs/auth-deployment.md`, `docs/verification.md` — 이전 사용자 작업 보존.
- `artifacts/checkpoint-oct11-head.zip`: HEAD 전체 소스.
- `artifacts/checkpoint-oct11-working.patch`: 시작 시 tracked 변경분. `.env.local`은 복제하거나 공개하지 않음.
- Production commit/branch: Vercel 관리자 연결이 없어 미확인. 대표자는 Deployments → Current Production → Source의 branch/SHA 확인 필요.
- 프로젝트/도메인: 이전 사용자 확인으로 Vercel `labsync` ↔ `labsync-pink.vercel.app`. 도메인 소유권과 인증 성공은 별개.

## 진행 경계

코드·격리 테스트·문서만 진행. Production 배포, 도메인 구매, DNS 변경, 개인정보 정책 공개, 분석 수집 활성화, 실결제 계약은 대표자 승인 전 보류. 사업자등록 상태·Kakao 앱·Clarity·GA4 소유 확인은 FOUNDER_ACTION_REQUIRED. Toss 테스트 구현 승인과 키가 아직 없어 결제 API를 만들지 않음.

# 이번 작업의 오류와 제한

2026-10-12 갱신: gRPC를1.14.6으로 패치하여 audit high9→5, production0. 남은5는 patched version 없는 개발용 braces 경로. 정확한 advisory·도달 경로·위험은 oct14-readiness 최신 절에 기록했다. 강의 원문은 수신했고 현재 Vercel 배포 eb42222는 대표자 확인으로 확정됐다. 로컬 DB는 승인된 Emulator 문의만 새로 구현했으며 운영 DB는 여전히 없다. 이전 항목은 발생 당시 이력이다.

브라우저 문의 자동화가 실제 사용자보다 빨라 최소1.5초 anti-bot 조건에 걸려 첫 실행이 실패했다. 서버 저장 성공으로 오인하지 않았고, 명시된 최소 간격을 테스트에 반영한 재실행에서 실제 commit과 화면 성공을 확인했다. UI 실패 테스트도 별도로503 응답/입력 유지/중복 클릭 차단을 검증했다.

- 운영 사이트 문의 CTA가 `#contact-status`로 연결됨을 브라우저에서 발견. 대표자가 이미 승인한 이메일을 코드 fallback으로 추가. 환경변수 미등록에도 실제 mailto로 연결하며 접수완료로 표시하지 않는다. 새 배포 전 운영 문제는 남아 있다.
- 초기 CONFIGURATION_NOT_FOUND는 이전 작업에서 Firebase Auth 초기화 이후 해결. 이번 운영 Google popup은 열림. 과거 “No Environment Variables” 화면만으로 현재 배포 상태를 추정하지 않는다.
- Next.js 16.3.8 dev가 AGENTS.md/CLAUDE.md를 자동 생성. 로컬 패키지의 Route Handler 문서를 읽고 기존 버전 기억에만 의존하지 않았다.
- dev 생성 타입의 ProcessEnv NODE_ENV 요구로 테스트 fixture typecheck 실패. 순수 config 함수 인자를 string/undefined record로 좁혀 수정.
- 새 footer navigation이 기존 Playwright `navigation` selector와 충돌. 메뉴 검사를 #main-navigation으로 한정. canonical trailing slash는 URL 의미가 동일해 검사 수정.
- 모바일 Hero에서 줄 연결이 빽빽해 명시적 줄바꿈/32px으로 조정.
- PowerShell 기본 Get-Content 인코딩으로 한글이 깨져 보였음. UTF8로 읽어 실제 파일 내용과 구분. 명령 quoting 실패는 실행 전에 파싱 실패했으며 이후 .NET UTF8 파일 치환 사용.
- 분석 검증은 가짜 ID와 외부 스크립트 차단으로 수행. 이를 GA4/Clarity 실측이라고 보고하지 않음.
- Kakao state 쿠키 삭제는 서버 저장소의 전역 one-time nonce 기록과 다름. credential 실제 유효성은 외부 설정 후 검증 필요.
- npm audit에서 high 9건이 보고된 상태(전이 의존성 포함). 강제 downgrade는 하지 않음. 출시 전 advisory/영향 경로를 검토할 후속 항목이며 빌드 통과를 취약점 없음으로 해석하지 않음.
- 강의 PDF/PPT 미첨부, Vercel 관리자 미연결, 실제 배포 SHA/branch·Console 심사 상태 미확인. 요청서만으로 강의의 확정/검토/복습 분류를 꾸며내지 않음.
- 실제 데이터베이스/API가 없으므로 DB RLS 6개 시나리오를 passed로 기록하지 않음.

롤백 자료: `artifacts/checkpoint-oct11-head.zip`, `artifacts/checkpoint-oct11-working.patch`. 시작 HEAD eb422222e44ace16f256278c2a673c8591eb22e3. 운영 배포를 바꾸지 않아 Production rollback은 실행하지 않았다. 배포 승인 후에는 Vercel 이전 Production deployment ID를 먼저 기록하고 이상 시 그 배포를 rollback한 뒤 인증/문의 재검증한다.

# 14 · 검증 및 출시 체크리스트

공개 저장소에는 보고서를 제공합니다. 전후 캡처, 원본 응답, 테스트 로그와 영상은 수업 제출 ZIP에 포함했습니다.

| 작업 | 상태 |
| --- | --- |
| 기준선 공개 URL HTTP·PC·390px 확인 | PASS |
| 개발 브랜치 npm ci / lint / build / typecheck | PASS |
| Next.js 빌드 로컬 Preview | PASS · `http://localhost:3100` 실행 검증 |
| Playwright / Firebase Emulator 데이터·권한 | PASS · Playwright 20건(로컬 17 + 설정별 3), 문의 테스트 17개 항목 |
| 호스팅 Preview Google 로그인 · 사용자 요청 및 승인 이력 | PASS · 사용자 화면에서 확인. 실기기와 두 계정 역할은 남음 |
| GitHub 개발 브랜치 업로드와 Vercel 호스팅 Preview | PASS · 개발 브랜치 및 Vercel Preview 연결 |
| Production | 최종 사용자 승인 대기. 배포와 도메인 설정 없음. |

## 호스팅 Preview에서 완료한 설정과 운영 전 남은 작업

1. 기존 GitHub 및 Vercel 프로젝트 연결과 개발 브랜치 Preview 생성을 완료했습니다. Production은 사용자 승인 대기 상태입니다.
2. `labsync-preview`에 Google 로그인과 Firestore를 연결했습니다. 두 계정의 코드 초대·역할 검증은 호스팅 Preview에서 진행합니다.
3. 대표자가 정책·보유기간·삭제 책임을 확인합니다. 승인된 환경에서는 서버 전용 Firebase Admin 설정, `OPERATIONS_MODE=live`, `OPERATIONS_ORIGIN`, `LEGAL_APPROVED=true`를 적용하고 최초 연구실과 관리자를 프로비저닝합니다. 기존 운영 Firestore 규칙을 무조건 덮어쓰는 대신 IAM과 기존 Rules를 검토한 뒤 새 네임스페이스 접근 정책을 반영합니다.
4. 운영 문의를 열려면 `INQUIRY_MODE=live`, HTTPS `INQUIRY_ORIGIN`, 최소 32자 비밀 `INQUIRY_COOKIE_SECRET`, 합의된 `INQUIRY_RETENTION_DAYS` 및 Firestore TTL을 구성합니다. `inquiries`와 `inquiry_limits`의 `expiresAt`을 TTL 대상으로 봅니다. 운영자 조회 및 계정 삭제 처리를 담당자에게 배정합니다.
5. Search Console, Kakao·LINE, Play Console, PG는 운영자가 본인 계정에서 소유 확인·동의·심사·결제를 진행합니다. 사업자 정보 및 시험·제출 준비는 해당 완료보고를 참고합니다.

## Production 승인 전 마지막 확인

- 실제 Preview 주소의 데스크톱과 모바일에서 Google 로그인 → 새로고침 세션 → 로그아웃, 두 계정 역할 격리, 신청·승인·반려·계정 삭제 신청, 데이터 저장을 확인합니다.
- 기존 공개 주소의 현재 상태, 이전 Vercel 배포 참조, 전용 Preview의 검색 접근 제한, 주요 정책의 승인 내용을 같이 확인합니다.
- 사용자 승인 이후에만 Production 병합·배포를 진행합니다. 배포 뒤 공개 URL의 기존 로그인과 모바일, SEO·정책, Calendar 변경 없는 요청 경로를 다시 확인하고 운영 After를 촬영합니다.

[Vercel Git 배포 동작](https://vercel.com/docs/git) · [로컬 재현](../../README.md) · 검증 로그(별도 제출 ZIP)

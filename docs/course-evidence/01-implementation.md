# 01 · LabSync 구현 증빙

브랜치 `feat/course-catchup-20261124` · 잠금 파일 보정 `c9baba6` · 기능 구현 `d63fffa`

## 요청 흐름

Google 로그인 → 코드로 연구실 참여 → 요청 작성 → 관리자 검토 → 승인·반려 → 필요한 실제 작업 뒤 완료 기록. 서비스는 Google Calendar를 직접 조회하거나 쓰지 않습니다. 공개 샘플 흐름은 신원과 저장소 없이 체험할 수 있습니다.

## 변경 경로

| 영역 | 코드 |
| --- | --- |
| Firebase ID 유지 | `components/AuthControl.tsx`, `lib/firebase-client.ts`, `lib/firebase-admin.ts` |
| 대시보드 및 삭제 화면 | `app/dashboard/`, `app/account-deletion/`, `components/LabWorkspace.tsx`, `app/workspace.css` |
| API와 입력 | `app/api/operations/`, `lib/operations-server.ts`, `lib/operations.ts`, `lib/request-body.ts` |
| 문의 및 운영자 접수함 | `app/api/inquiries/`, `lib/inquiry*.ts`, `components/PilotInquiry.tsx` |
| 공개 정보와 메타데이터 | `app/page.tsx`, `app/{pricing,faq,guide,privacy,terms,refund}/`, `app/llms.txt/`, `app/sitemap.ts`, `app/manifest.ts` |
| 운영·검증 도구 | `scripts/provision-lab.mjs`, `scripts/course-emulator.sh`, `tests/operations.spec.ts` |

## 저장소 및 권한

새 문서는 `labsyncOps/v1` 아래에만 추가됩니다. 기존 Firebase Auth UID와 프로젝트 설정을 사용합니다. 기존 운영 컬렉션을 수정하거나 옮기는 작업은 실행하지 않았습니다.

| Firestore 경로 | 역할 |
| --- | --- |
| `profiles/{uidHash}/lab_members/{labId}` | Firebase UID에 연결한 연구실 멤버십, 서버가 읽는 member/admin 역할 |
| `labs/{labId}` | 표시 이름, demo/pilot/managed 상태. 데이터 접근 역할과 별개 |
| `labs/{labId}/requests/{requestId}` | 유형, 캘린더, 기존·희망 시각(KST), 사유, 연락 이메일, 상태, 버전 |
| `…/request_events/{version}` | 변경 상태, 처리 메모, 시각, 행위자. 요청과 같은 트랜잭션으로 저장 |
| `invites/{codeHash}` | 7일 만료, 검증된 이메일 바인딩, 단건 사용. 기존 멤버 역할 유지 |
| `account_deletion_requests/{uidHash}` | 운영자 검토용 삭제 신청. Firebase 계정·데이터 실제 삭제는 승인된 절차로 별도 수행 |
| `inquiries/{uuid}`, `inquiry_limits/{key}` | 운영 문의와 접수 제한. 로컬 테스트는 기존 `pilotInquiries`, `intakeLimits`를 사용하고 `testOnly`로 표기 |

서버는 Firebase ID 토큰 취소 여부와 연구실 멤버십을 확인합니다. 연구실 관리자는 담당 연구실 큐에만 접근합니다. 문의·삭제 접수함은 운영자 전용 Firebase `admin` 클레임으로 분리합니다. Firestore 클라이언트 Rules는 직접 읽기·쓰기를 거부하고 각 API는 별도로 권한을 검사합니다. 조회는 최근 50건, 운영자 접수함은 유형별 최근 20건입니다. 서버 쿼리는 기본 단일 필드 인덱스를 사용합니다.

상태 변경은 버전 확인을 사용하며 접수·검토 중에는 승인 또는 반려가 가능합니다. 승인에서만 처리 완료를 기록할 수 있습니다. 동일 ID·내용으로 재요청하면 중복 저장하지 않습니다. 문의는 서명 쿠키 기반 확인과 honeypot, 본문 크기, 이메일·전체 전송률 제한을 사용합니다. 만료 기반 운영 데이터 정리에는 콘솔 TTL 정책 또는 승인된 운영 절차가 필요합니다.

## 검증 및 환경

- **PASS** Firebase Auth·Firestore Emulator, Playwright 모바일 390px에서 접수 → 새로고침 → 관리자 승인 → 사용자 이력 → 삭제 신청 → 로그아웃.
- **PASS** 두 연구실 격리, 일반 회원 승격·상태 변경 거부, 위조 토큰 거부, 잘못된 날짜·이메일 차단, 승인·반려·완료, 중복 트랜잭션, 직접 Firestore 접근 거부.
- **PASS** 가상 문의 저장과 운영자 조회. 유입 경로 기록 및 요청 중복 방지. 실제 문의 지표에서 제외.
- **BLOCKED** 실제 Google 계정 및 Vercel Preview, Firebase 운영 DB 확인. Emulator 브라우저 E2E는 테스트 전용 Firebase 세션으로 시작합니다.
- 설정 이름은 [환경변수 예제](../../.env.example)와 [릴리스 체크리스트](14-release-checklist.md)에 있습니다. 실데이터 모드는 `LEGAL_APPROVED` 및 Firebase Admin 설정이 있어야 동작합니다. 운영 키를 소스에 저장하지 않습니다.

신청 화면(별도 제출 ZIP) · 관리자 처리이력(별도 제출 ZIP) · Preview 테스트 로그(별도 제출 ZIP)

# 저장소와 권한 감사

## 2026-10-12 갱신

대표자가 **Emulator 구현만 승인**했다. 운영 Firebase DB는 생성하지 않았다. `demo-labsync-intake`의 로컬 Firestore(127.0.0.1:8085)/Auth(9095)만 사용한다. 아래 “DB 없음/N/A”는 기존 운영 상태이며 새 로컬 문의 테스트와 구분한다.

최소 schema: `pilotInquiries/{UUID}`에 email/name?/organization?/calendarCount/message/consent/consentVersion/createdAt/status=Submitted/testOnly/payloadHash. `intakeLimits/{HMAC(email+hour) 또는 global-minute}`에 count만 저장. users/lab membership/operationalRequests는 만들지 않는다. 메일·이름·내용을 URL/analytics/log에 기록하지 않는다.

`firestore.rules`는 모든 클라이언트 read/write를 거부한다. 서버 POST만 schema·Origin·암호화 challenge·최소시간·honeypot·크기·동의·idempotency·transaction rate-limit 검사 후 생성. GET은 Auth Emulator ID token 검증과 admin claim을 요구하며 최근20건만 반환한다. 실제 운영용 admin provisioning/IAM/retention 정책은 미구현·미승인. Admin SDK가 Rules를 우회하므로 서버 검사와 Rules를 둘 다 테스트했다.

`npm run test:inquiry`: scripts/test-inquiry-emulator.mjs로 실제 문서 commit을 확인한17검사. 익명/타사용자/가짜 client admin 직접 읽기·쓰기·users role 생성·타 lab 경로 모두 거부. 실제 lab data 격리가 아닌 deny-all 확인이다. 모의 DB adapter 대신 실제 Emulator 사용, 운영 writes0. Auth Emulator는 서명 안전성을 운영 수준으로 증명하지 않는다.

실행 준비: `npm install --prefix artifacts/emulator-tools firebase-tools @firebase/rules-unit-testing`, Java21 PATH 설정 후 해당 firebase CLI `emulators:start --only firestore,auth --project demo-labsync-intake --config firebase.json`. 별도 Next process에 `.env.example`의 localhost Emulator 변수와 INQUIRY_MODE=emulator 설정. VERCEL 환경 또는 정해진127.0.0.1/ demo project 이외 경로는 실패하도록 고정. 운영 배포에 이 변수를 넣지 않는다. 내보내기 없이 Emulator 종료 시 가상 데이터 삭제. live 전환은 별도 설계/리소스 승인 및 정책 확정 후 새 코드가 필요하다.

---

2026-10-11. 상태: 코드 감사 및 OAuth 경계 TESTED_LOCAL. 연구실 DB 격리 테스트는 적용 대상 없음이며 통과로 보고하지 않는다.

실제 코드에는 Firestore/Realtime Database/SQL 연결, 연구실 컬렉션, CRUD API, 관리자 화면이 없다. Firebase는 Authentication만 사용한다. Firebase Console에 별도 데이터베이스가 있는지는 관리자 접근이 없어 미확인: 대표자가 확인해야 한다. 저장소에 없는 배포 규칙을 안전하다고 추정하지 않는다.

| 저장 위치 | 실제 데이터/스키마 | 권한 |
|---|---|---|
| Firebase Auth | uid, 제공된 displayName/email/photoURL 및 인증 메타데이터 | Firebase Auth SDK 및 선택적 Admin 서버 |
| Google 계정 | Firebase 할당 UID | identity scope만 사용 |
| Kakao 계정 | uid=`kakao:<검증된 숫자 ID>`, displayName=카카오 사용자 | 서버 검증 후 get/create, 이메일 병합 없음 |
| 브라우저 Firebase 저장소 | SDK 세션 | Firebase SDK 관리; 앱 자체 bearer token 복제 없음 |
| 브라우저 localStorage | 분석 동의 granted/denied | 서비스 접근 권한과 무관 |
| OAuth 임시 쿠키 | encrypted state 및 custom-token 전달 | HttpOnly/만료/Origin 검사 |
| Request Assistant | 컴포넌트 메모리의 예시 | 공개 데모, 전송·Calendar 변경·DB 저장 없음 |
| 문의 | 사용자가 보내는 이메일 | 운영자 메일함; 사이트 접수 API 없음 |

현재 Security Rules 파일/배포 대상 없음. 로그인은 연구실 membership이나 admin 권한을 생성하지 않는다. 클라이언트 임의 role 값은 서버에서 읽거나 권한에 사용하지 않는다. 보호할 고객 데이터가 생기기 전에 서버 ID-token 검증과 UID→연구실 membership 및 최소 CRUD rule을 먼저 도입해야 한다. Admin SDK는 DB Rules를 우회하므로 향후 서버 DB 접근에도 별도 인가가 필수다.

| 요청된 보안 시나리오 | 결과/한계 |
|---|---|
| 비로그인 보호 데이터 읽기 | DB/보호 데이터 없음: N/A |
| 타 사용자 데이터 읽기 | 데이터 API 없음: N/A |
| Lab A → Lab B 읽기/변경 | membership/DB 없음: N/A |
| 클라이언트 admin 승격 | role 입력·권한 발급 경로 없음; custom token 추가 claim 없음 |
| 관리자 URL 직접 접근 | 관리자 기능 없음: N/A |
| 생성/수정/삭제 규칙 | 연구실 CRUD 없음: N/A |

실행한 관련 검증: `tests/kakao-security.spec.ts`, `tests/kakao-routes.spec.ts`의 state/ID/Origin/disabled 경계; `tests/landing.spec.ts`의 데모 비전송 회귀. 모의 Firebase adapter를 사용해 실제 고객 계정을 생성/변경하지 않았다. 현재 취약점 수정은 신규 OAuth 경계의 위조 state·외부 redirect·타 origin token 요청 차단이며 DB 취약점을 발견/수정했다고 주장하지 않는다.

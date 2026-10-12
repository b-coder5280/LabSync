# Toss 신청·테스트 준비

상태: 요건 문서 IMPLEMENTED. 실결제 신청 BLOCKED (BUSINESS_STATUS_UNKNOWN), 대표자 확인 FOUNDER_ACTION_REQUIRED. 제출/심사대기 없음. 결제 SDK/API 실행 NOT_STARTED.

대표자는 사업자등록 여부가 아직 확인되지 않았으며 실결제 신청을 하지 말라고 명시했다. 사업자가 없다고 단정하지 않는다. 이번 준비는 아래 요건·격리 테스트 설계까지이며 테스트 키가 없어 실제 Toss 호출은 하지 않았다. 운영 결제 버튼·라이브 키·구독을 추가하지 않았다.

| 항목 | 현재/필요 조치 |
|---|---|
| 서비스 | 기존 Google Calendar 공용장비 운영 지원 Paid Pilot v0 |
| 가격/범위 | ₩300,000, Calendar 최대 5개, 최초 onboarding, go-live 후 6주, 자동 갱신 없음 |
| 운영 URL | https://labsync-pink.vercel.app/; 자체 도메인은 향후 구매 |
| 대표/문의 | 이동빈 / dongbeen@gm.gist.ac.kr |
| 사업자 | 등록 여부·상호·번호·주소·정산계좌·대표자/업종 서류 확인 필요 |
| 결제 방식 | 단건 pilot 대금 후보; 자동결제 아님. buyer commitment 확인 필요 |
| 가격 표시 | 부가세 포함 여부 대표자 확정 필요 |
| 정책 | /terms, /privacy는 승인 전 초안; 환불·취소·제공 개시 기준 확정 필요 |
| 심사 | Toss Console의 실제 신청서/업종별 요구 서류 확인 후 대표자가 제출 |

대표자 순서: 사업자 상태 확인 → buyer 지불 의사 확인 → VAT/취소·환불/제공 조건 승인 → 정책 공개 승인·배포 → Toss 신청 요건·서류 확인 → 대표자가 가맹 신청/계약. 접수번호/날짜가 있어야 SUBMITTED, 실제 심사 중 확인이 있어야 PENDING_REVIEW.

## 테스트 환경 준비 설계

대표자 테스트 키 설정 후 Production과 분리된 비공개 환경에서만 진행한다. 예정 key 이름은 `NEXT_PUBLIC_TOSS_CLIENT_KEY`, 서버 `TOSS_SECRET_KEY`; **현재 코드가 읽는 변수가 아니며 Vercel Production에 등록하지 않는다**. 제공되는 테스트용 키인지 확인하고 라이브 키는 받지 않는다.

구현 재개 시: Firebase ID token 서버 검증 → 서버 생성 주문ID/UID/금액 KRW300000 저장 → 테스트 결제창 → success에서 서버가 주문 소유자·금액·상태와 paymentKey 검증 후 승인 → 승인 결과 저장. fail/cancel은 결제완료로 표시하지 않는다. 같은 주문/승인 중복 호출은 동일 결과를 반환하며 새 청구를 만들지 않는다. 승인 API timeout은 조회/대사 후 처리한다. 별도 주문 저장소와 idempotency가 필요하므로 현재 공개 데모에 임시 메모리 결제를 붙이지 않는다.

필수 검증: 금액 조작 거부, 타 UID 주문 거부, 인증 누락 거부, 취소/실패 표시, 중복 callback/승인, timeout 재시도, 테스트 표시, 운영 노출 차단. 모두 아직 미실행이다.

[Toss 시작 가이드](https://docs.tosspayments.com/guides/get-started), [공식 FAQ](https://docs.tosspayments.com/resources/faq). 계약·업종별 요구는 실제 신청 Console에서 재확인한다.

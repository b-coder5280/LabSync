# 구글 플레이 사전 준비 완료보고 · 실습 2-6

| 항목 | 상태 |
| --- | --- |
| 웹 앱 manifest·아이콘 | PASS · 로컬 HTTP 200 |
| 개발자 계정 등록비 | 개인 계정 등록 화면에서 일회성 USD 25 결제 완료를 사용자가 보고했습니다. |
| Play 개발자 본인·주소·기기 인증 | Play Console 홈에서 남은 인증 항목 확인 대기. 안드로이드 기기 인증이 요구되면 계정 소유자가 진행합니다. |
| 계정 및 데이터 삭제 | PASS · 웹 URL, 로그인 후 삭제 신청, 운영자 조회 검증. 실제 삭제 절차·기한 승인 대기. |
| Android | TWA와 Digital Asset Links 경로를 우선 검토. 운영 도메인, 기존 패키지 ID 소유권, Play 서명, 공식 target SDK 표를 확인한 뒤 AAB 생성. Google OAuth는 시스템 브라우저 방식 사용. 앱 패키지와 기기 시험은 NOT TESTED. |
| 비공개 테스트 | BLOCKED · Play Console 출시 준비, 실제 AAB와 링크, 동의한 Android 테스터 필요. |
| 제출 | NOT TESTED · Data safety, 앱 액세스, 로고·feature graphic, 스토어 캡처, 지원 정보, 앱 실기기 E2E 확인 필요. |

유료 전체 배포 계정은 공식 안내에서 일회성 USD 25를 확인했습니다. 신규 개인 계정과 조직 계정에 해당하는 추가 인증 항목은 실제 콘솔에서 확인합니다. [개발자 계정 공식 절차](https://support.google.com/android-developer-console/answer/16604405) · [Play Console 계정 정보](https://support.google.com/googleplay/android-developer/answer/13628312)

**달력** 11/24 기준 개발자 계정과 취소·삭제 운영 담당자를 확인합니다. 이후 웹 Preview 승인, 패키지/서명·AAB 및 기기 점검, 비공개 테스트 링크, 실제 opt-in 순입니다. 적용 대상 신규 개인 계정은 12명 이상 연속 14일 참여가 필요합니다. 12번째 테스터가 11/24에 참여했다는 확인이 없으므로 12/8 신청을 현재 일정으로 확정할 수 없습니다. 출석부 테스터 탭과 초대 발송은 사용자의 동의 및 승인을 받아 진행합니다.

**스토어 문구 초안** · 이름 LabSync · 짧은 설명 “기존 Google Calendar를 유지하며 연구실 운영 요청을 관리합니다.” · 긴 설명 “대학·연구기관의 공용장비 운영 담당자와 연구원이 예약 변경·취소, 권한 요청, 동기화·운영 오류의 접수와 처리 이력을 확인할 수 있습니다. 연구실 담당자의 초대가 필요하며 공개 데모는 샘플로 이용할 수 있습니다.” · 지원 `기존 공개 사이트의 문의 연락처` · 웹 정책·삭제 URL은 승인 배포 후 실제 URL을 검증합니다.

[Play Console](https://play.google.com/console/) · [개인 계정 테스트 공식 요건](https://support.google.com/googleplay/android-developer/answer/14151465) · [계정 삭제 안내](https://support.google.com/googleplay/android-developer/answer/13327111)

[다음 실습 → 2-7 결제 신청](https://claude.ai/artifact/1GBHSTTKx9mqACctvchKrc#b2-7)

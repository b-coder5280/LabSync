# LabSync Preview 검증 기록

2026년 11월 24일 KST

- 검증 배포 [Vercel Preview](https://labsync-git-feat-course-catchup-20261124-dongbeen-lees-projects.vercel.app), 커밋 `4a5dc77badd0ec48a27126e1b11d79da7f6106a5`, 배포 ID `dpl_J17sVWGmE6wx2Y5k4x8jmdYARABM`.
- Google로 로그인한 사용자가 Preview 테스트 연구실을 열고 예약 변경 요청을 제출했습니다. 사용자가 제공한 화면의 **나의 요청** 목록에서 최종 상태가 **승인**으로 표시되고, 같은 요청의 상세 화면에 **접수** 및 **승인** 처리 이력이 각각 표시됩니다.
- Firestore 연결 준비 상태와 Preview 배포의 READY 상태를 확인했습니다. 별도의 새로고침 수행 여부와 두 계정 간 초대 및 권한은 이 화면에서 확인할 수 없습니다.
- 검증 범위는 Preview의 테스트 데이터입니다. Google Calendar 실제 일정 변경이나 Production 배포는 이 검증에 포함되지 않습니다.

## 후속 검증

| 항목 | 상태 |
| --- | --- |
| 공개 문의 | 에뮬레이터 테스트 완료. 호스팅 Preview에서 비활성 상태 |
| Kakao 및 LINE 로그인 | 연동 코드 존재. 외부 앱 설정 및 호스팅 실로그인 검증 대기 |
| 연구실 초대 및 역할 분리 | 서로 다른 Preview 계정으로 검증 대기 |
| Production | 사용자 승인 대기 |

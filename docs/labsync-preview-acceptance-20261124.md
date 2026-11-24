# LabSync Preview 검증 기록

2026년 11월 24일 KST

- 검증 배포 [Vercel Preview](https://labsync-git-feat-course-catchup-20261124-dongbeen-lees-projects.vercel.app), 커밋 `4a5dc77badd0ec48a27126e1b11d79da7f6106a5`, 배포 ID `dpl_J17sVWGmE6wx2Y5k4x8jmdYARABM`.
- Google로 로그인한 사용자가 Preview 테스트 연구실을 열고 예약 변경 요청을 제출했습니다. 사용자가 제공한 화면의 **나의 요청** 목록에서 최종 상태가 **승인**으로 표시되고, 같은 요청의 상세 화면에 **접수** 및 **승인** 처리 이력이 각각 표시됩니다.
- Firestore 연결 준비 상태와 Preview 배포의 READY 상태를 확인했습니다. 별도의 새로고침 수행 여부와 두 계정 간 초대 및 권한은 이 화면에서 확인할 수 없습니다.
- 검증 범위는 Preview의 테스트 데이터입니다. Google Calendar 실제 일정 변경이나 Production 배포는 이 검증에 포함되지 않습니다.

## 후속 검증

| 항목 | 상태 |
| --- | --- |
| 공개 문의 | 에뮬레이터 17개 항목 통과. 호스팅 Preview에서는 샘플 입력 전용으로 활성화했고 발급 API HTTP 200과 보안 쿠키를 확인했습니다. 사용자가 호스팅 Preview에서 샘플 문의 저장 완료를 확인했습니다. 접수번호 원문은 보고서에 수집하지 않았습니다. |
| Kakao 및 LINE 로그인 | 연동 코드 존재. 외부 앱 설정 및 호스팅 실로그인 검증 대기 |
| 연구실 초대 및 역할 분리 | 서로 다른 Preview 계정으로 검증 대기 |
| Production | 사용자 승인 대기 |

## 호스팅 Preview 추가 확인

- FAQ, 요금, 가이드, robots.txt, llms.txt가 호스팅 Preview에서 HTTP 200으로 응답했습니다. Preview의 색인 제외 헤더를 확인했습니다.
- 가상 문의만 받도록 하는 변경은 `9ab819f7f350e3a458eaf12a8a4e9cd0c5f4702f`에서 Vercel 빌드를 통과했습니다. 공개 문의의 운영 활성화는 별도 정책 승인 및 보유기간·삭제 설정 후 진행합니다.
- 일반 GitHub Actions 실행은 Preview 인증에서 리디렉트되어 저장 동작에 도달하지 못했습니다. 서명 접수 확인, 실제 Firestore 쓰기 응답 및 중복 제출을 재현할 수 있는 [테스트 스크립트](../scripts/test-inquiry-preview.mjs)를 제공했습니다. 호스팅 저장 검증은 인증된 Preview 세션이 필요합니다.
- 운영 주소 `labsync-pink.vercel.app`에서 기존 커밋 `a007c80`과 기존 Production 배포를 조회했습니다.

## 수업 제출용 재점검 · 2026년 11월 24일 KST

- 사용자 확인: 호스팅 Preview에서 샘플 문의 저장 완료. 실제 고객 문의는 집계하지 않았습니다.
- 운영 홈 200, 운영 llms.txt 404. Preview 홈·FAQ·요금·가이드·sitemap.xml·robots.txt·llms.txt 모두 200이며 `X-Robots-Tag: noindex`가 있습니다.
- Preview FAQ에 FAQPage, 가이드에 Google Calendar 공식 출처를 확인했습니다. Preview 사이트맵에 공개 경로 4개가 있습니다.

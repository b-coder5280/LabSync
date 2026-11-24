# LabSync 7–12주차 수업 완료보고

공개 저장소에는 보고서를 제공합니다. 전후 캡처, 원본 응답, 테스트 로그와 영상은 수업 제출 ZIP에 포함했습니다.

**이동빈 · 6번 | GIST AI Startup Making & Operating | 2026-11-24 KST**

LabSync는 기존 Google Calendar를 사용하는 연구실의 예약 변경·취소, 권한, 운영 오류 요청을 접수하고 담당자의 처리 상태와 메모를 공유합니다. 기존 공개 홈페이지를 먼저 확인한 뒤, `b-coder5280/LabSync`의 `feat/course-catchup-20261124` 개발 브랜치에서 구현하고 로컬 검증 및 Vercel 호스팅 Preview를 진행했습니다.

| 주차 | 수행 결과 | 외부 조건 |
| --- | --- | --- |
| 7 | 운영 사이트 PC·390px 캡처, 공개 9항목 전후 감사 및 호스팅 Preview에서 홈·FAQ·가이드·sitemap.xml·robots.txt·llms.txt 확인 | 검색 콘솔 등록·소유 확인·색인은 계정 권한 필요 |
| 8 | 무료 데모 중심 랜딩, 4P, FAQ와 Google Calendar 요청 가이드, 문의 경로 | 실고객 반응 및 실제 외부 유입은 미측정 |
| 9 | 초대 기반 회원 역할, 연구실 격리, 상태 이력, 요금·정책·계정 삭제·문의 접수. 기존 Kakao 준비 유지, LINE OAuth 경로 추가 | 운영 정책·실제 소셜 계정·PG 심사와 결제는 사용자 작업 |
| 10 | Play 사전준비, manifest, 삭제 신청 웹 경로, 고정 AI 질문 및 문의 출처 | 실제 Android AAB·테스터·독립 AI 측정은 미완료 |
| 11 | 전후 콘텐츠·사업 기준표·90일 41항목·30개 고객 질문 초안 | 호스팅 Preview 확인. 운영 공개 After 및 외부 AI 재측정 필요 |
| 12 | 샘플 운영 화면으로 18초 광고와 60초 발표 초안, 카카오톡 공유 문구·QR | 영상 게시와 출석부 기록은 사용자 승인 대기 |

## 확인한 동작

- **연구실 요청** Google Firebase Auth 구조를 유지하고 초대로 연구실을 선택합니다. 사용자 요청의 입력 검증, 새로고침 후 저장, 관리자 승인·반려·완료와 이력, 다른 연구실과 일반 회원의 권한 차단을 테스트했습니다.
- **문의와 삭제 신청** 로컬 에뮬레이터에서 가상 문의 저장과 운영자 조회를 시험했고, 호스팅 Preview에서는 사용자가 테스트 문의 저장 결과를 확인했습니다. 앱 계정 삭제 신청은 운영자 접수까지 검증했습니다. 실제 Firebase 계정 삭제와 정책 적용은 운영 절차가 필요합니다.
- **공개 기능** 무료 샘플 데모, 요금, FAQ와 공식 근거 가이드, 개인정보·이용·환불 안내, sitemap.xml·robots.txt·llms.txt를 로컬 Preview에서 확인했습니다. 대시보드의 비공개 데이터는 인증된 API에서만 제공합니다.
- **영업 조건** 무료 샘플, 연구실당 6주 30만원의 파일럿 제안, 맞춤 상담을 표시했습니다. 고객·문의·매출·색인·AI 추천 실적은 측정하지 않았습니다.

## 검증과 승인

`npm ci`, `npm run lint`, `npm run typecheck`, `npm run build`를 실행했습니다. Playwright 20건을 통과했습니다. 로컬 Preview 17건, 별도 설정 회귀 3건입니다. 이후 호스팅 Preview에서 사용자 Google 로그인, 테스트 연구실 개설, 요청 접수·승인 이력과 샘플 문의 저장을 확인했습니다. 별도 계정 및 실기기 검증은 남아 있습니다. 문의 전용 테스트는 17개 검증 항목을 통과했습니다. 브라우저 및 Firebase 데이터 결과는 최종 검증 로그(별도 제출 ZIP)와 문의 단독 로그(별도 제출 ZIP) 및 설정별 회귀 로그(별도 제출 ZIP)에 있습니다. Before(별도 제출 ZIP) · After 로컬(별도 제출 ZIP) · 모바일(별도 제출 ZIP) · 관리자 검토(별도 제출 ZIP).

현 공개 운영 주소는 [labsync-pink.vercel.app](https://labsync-pink.vercel.app/)입니다. 마지막 재확인에서 공개 HTML 해시가 기준선과 같았습니다. 개발 브랜치와 [Vercel Preview](https://labsync-git-feat-course-catchup-20261124-dongbeen-lees-projects.vercel.app)가 연결되었습니다. Preview 전용 Firebase 저장소를 확인했습니다. FAQ, 요금, 가이드, robots.txt, llms.txt는 호스팅 Preview에서 HTTP 200을 확인했습니다. 자세한 결과는 [Preview 검증 기록](../labsync-preview-acceptance-20261124.md)에 있습니다. Production 배포는 최종 검증 결과를 바탕으로 사용자가 승인하는 단계에서 진행합니다.

**사용자 준비** · 두 번째 Preview 테스트 계정으로 초대와 역할 확인 → 실제 개인정보·삭제·사업자·파일럿 조건 확인 → Kakao·LINE·Play·PG 및 검색 콘솔에 필요한 본인 인증. [릴리스 체크리스트](14-release-checklist.md)

[구현](01-implementation.md) · [SEO](02-seo-audit.md) · [4P](03-4p.md) · [90일](11-facts-and-90days.md) · [영상](13-video.md)

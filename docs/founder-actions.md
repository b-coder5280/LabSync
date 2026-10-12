# 이동빈 대표자 체크리스트

모든 미완료 항목은 FOUNDER_ACTION_REQUIRED. 비공개 키·인증 코드를 채팅에 보내지 않는다. 비용·DNS·외부 신청·Production 공개는 아직 수행하지 않았다.

| 순서 | 직접 할 일 | 입력/위치 | 완료 후 재검증 |
|---|---|---|---|
| 1 | 수정본·정책 초안 검토 | http://localhost:3100, /privacy, /terms | 구매자 문구·문의·정책 실제 처리 일치 |
| 2 | Production 변수와 배포 정보 확인 | Vercel labsync Settings Environment Variables 및 Deployments Source | [Google 6개 Key](google-oauth-readiness.md), 현재 SHA/branch 기록 |
| 3 | 정책 확정 및 공개 범위 승인 | 보유기간·법적 근거·수탁/국외이전·계정삭제·VAT·취소/환불 | 초안 표시/색인 여부 수정 후 배포 승인 |
| 4 | 최종 Production 배포 승인 | 변경 코드·이전 배포 ID·롤백 경로 검토 | Google 실계정/세션/로그아웃, 이메일 링크, SEO |
| 5 | Kakao 앱/REST키/secret/URI 설정 | [카카오 순서·정확한 callback](kakao-login-setup.md) | status→실계정→취소→세션→로그아웃 |
| 6 | 서버 Firebase credential 입력 | Vercel 서버 전용 환경변수, least privilege | 키 미노출, 프로젝트·UID 확인 |
| 7 | GA4 속성/Clarity 프로젝트 확인 | G-4T1V2FEFXK가 LabSync 것인지 확인 | 정책 승인 전 flag false 유지 |
| 8 | 검색 소유권 확인 | [검색 설정](seo-checklist.md) | meta 확인·sitemap 제출·실제 색인 별도 |
| 9 | Google branding/게시 상태 확인 | 동일 Google Cloud 프로젝트 Auth Platform | 요구되는 경우만 대표자가 심사 제출 |
| 10 | 사업자 상태 확인 | [Toss 준비](toss-readiness.md) | 등록 여부·buyer commitment·계약 요건 |
| 11 | 테스트 결제 키/환경 준비 | 실결제 금지, 별도 비공개 환경 | 키 준비 후 테스트 구현 재개 |
| 12 | 자체 도메인 선택·구매 승인 | 후보/유사 브랜드 검토 후 구매창 재확인 | DNS·HTTPS·양쪽 OAuth·canonical 전환 |
| 13 | 실제 강의 PDF/PPT 전달 | 현재 첨부는 요청서만 존재 | 확정/검토/다음주/복습 원문 대조 |

정책 초안 참고: [개인정보보호위원회 작성지침 목록(2026 지침)](https://www.privacy.go.kr/front/bbs/bbsList.do?bbsNo=BBSMSTR_000000000049). 실제 처리와 법적 근거 검토 후 승인해야 하며 문서 생성만으로 법적 적합성이 확정되지 않는다.

설정 후 응답에는 “어떤 항목을 완료했는지”만 알려주면 된다. 키 값·사업자 서류 자체·비밀번호는 보내지 않는다. 설정과 승인 완료가 확인되면 해당 검사부터 재개한다.

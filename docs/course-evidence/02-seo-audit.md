# 02 · 공개 9항목 SEO/AEO/GEO 감사

2026-11-24 KST. Before는 실제 공개 HTTP 응답 및 브라우저, After는 개발 브랜치의 로컬 Preview 응답 및 브라우저입니다. After의 canonical은 실제 공개 주소를 가리킵니다.

| 항목 | Before · labsync-pink.vercel.app | After · localhost:3100 |
| --- | --- | --- |
| 로그인 없이 공개 접근 | PASS · 홈 200 | PASS · 홈, 가격, FAQ, 가이드 200 |
| title / description | PASS · 서버 HTML에 존재 | PASS · 각 공개 페이지별 내용과 설명 |
| canonical / OG | PASS · 홈 canonical·OG 이미지/alt 존재 | PASS · 페이지별 canonical·OG 제목/설명·공용 OG 이미지 |
| sitemap.xml | PASS · 배포 홈 1건 | PASS · 홈·요금·FAQ·가이드 |
| robots.txt | PASS · 공개 경로 허용 | PASS · 공개 허용, API·인증 경로 제외. 개인 API는 Firebase 인증 필요 |
| FAQ / FAQPage | PASS · 홈 FAQ와 동일한 구조화 데이터 | PASS · 홈과 전용 FAQ 모두 응답에 FAQ 텍스트와 JSON-LD |
| 한 줄 정의 / 근거·출처 | FAIL · 서비스 문구 있음, 확인 가능한 공식 근거 링크 없음 | PASS · 첫 두 문장 정의·범위 및 Google 공유 권한 근거와 날짜 |
| 이미지 alt | N/A · 본문 `img` 없음. OG alt 있음 | PASS · 샘플 캡처의 설명 alt와 OG 이미지 alt |
| llms.txt | FAIL · 404 | PASS · UTF-8 텍스트 200, 공개 페이지 네 곳 연결 |

대시보드 HTML은 로그인 안내만 제공합니다. 요청과 처리 이력은 인증된 API 응답으로 전달합니다. 검색엔진 등록·처리·색인은 [콘솔 증빙](search-console-status.md)에서 별도로 봅니다. FAQ 구조화 데이터나 llms.txt 추가를 노출 성과로 집계하지 않습니다.

공개 변경 전 증빙(별도 제출 ZIP) · 로컬 검증 후 증빙(별도 제출 ZIP)

## 7주차 공개 운영 재검증 · 2026년 11월 24일 KST

사용자가 승인한 SEO 변경을 운영에 배포했습니다. 운영 커밋은 `185fa05572118b168efccc7f848077a93a27d2b2`입니다. 이 배포에서 수정한 파일은 `.env.example`, `app/layout.tsx`, `app/page.tsx`, `app/llms.txt/route.ts`입니다. Firebase 설정·인증 코드·데이터 처리 경로에는 변경이 없습니다.

| 공개 검증 | 결과 |
| --- | --- |
| 홈 | HTTP 200. 모바일 사용자 에이전트 요청도 HTTP 200. |
| 메타데이터 | title, description, canonical, OG 확인. OG 이미지 HTTP 200와 대체 텍스트 확인. |
| FAQ | 사용자에게 표시되는 6개 질문·답변이 FAQPage 구조화 데이터와 일치. |
| 서비스 정의·공식 출처 | 운영 홈에서 서비스 정의와 Google Calendar 공유 권한 공식 안내 링크 확인. |
| llms.txt | HTTP 200, UTF-8 텍스트. |
| sitemap.xml / robots.txt | 두 경로 모두 HTTP 200. 사이트맵에 운영 홈 등록, 로봇 파일에서 사이트맵 참조 확인. |
| 본문 이미지 | 본문 이미지 요소 없음. OG 이미지 대체 텍스트는 확인. |
| 기존 Google 로그인 UI | 운영 HTML에서 기존 로그인 버튼 확인. 실제 계정으로 다시 로그인하는 검증은 수행하지 않았습니다. |

공개 HTML에는 Google 소유확인 태그가 없습니다. Google·Naver·Bing 속성, 소유권 및 사이트맵 처리 상태는 각 콘솔 화면에서 별도로 확인할 항목입니다.

[운영 사이트](https://labsync-pink.vercel.app/) · [llms.txt](https://labsync-pink.vercel.app/llms.txt) · [배포 커밋](https://github.com/b-coder5280/LabSync/commit/185fa05572118b168efccc7f848077a93a27d2b2)

# 검색·도메인 준비

현재 canonical은 실제 주소 `https://labsync-pink.vercel.app/`. 자체 도메인은 보유하지 않는다. 가상의 구매 도메인을 설정하지 않았다. 구현: Next Metadata(title/description/canonical/OG), 1200×630 OG, SVG favicon, robots, sitemap, Organization/Service/FAQPage JSON-LD, 한국어 FAQ. 별도 평점·고객 수·등록번호를 생성하지 않았다. `/privacy`, `/terms`는 초안 noindex; `/auth` noindex, robots는 `/api/`, `/auth/` 제외. 공개 sitemap은 root만 포함한다. robots는 접근 통제 수단이 아니다.

TESTED_LOCAL: canonical·JSON-LD·robots/sitemap HTTP·정책 noindex·375/768/1440 화면. 새 metadata/이미지의 Production 배포 및 Kakao 공유 debugger 결과는 미검증. llms.txt는 보장된 효과가 없어 이번에 추가하지 않았다. FAQ와 명확한 서비스 문장이 AEO/GEO 준비이며 순위/노출을 보장하지 않는다.

## 대표자 검색 Console

1. Google Search Console에 URL-prefix `https://labsync-pink.vercel.app/` 추가 → HTML meta 방식의 content 값만 `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`에 입력 → 승인된 재배포 → 소유권 확인.
2. sitemap으로 `https://labsync-pink.vercel.app/sitemap.xml` 제출 → URL 검사 → 실시간 테스트/색인 요청 → 이후 색인 상태 확인. 제출과 색인 완료는 다르다.
3. Naver Search Advisor 웹마스터 도구에서 같은 URL 추가 → meta content 값 `NEXT_PUBLIC_NAVER_SITE_VERIFICATION` → 승인된 재배포 → 소유 확인 → 사이트맵 제출·수집/색인 진단.
4. 정책이 승인되면 문구/noindex/sitemap을 함께 수정한 뒤 공개 승인. 토큰이 없으면 검증 meta 태그는 출력하지 않는다.

## 도메인 후보 (2026-10-11 조회)

| 후보 | 적합성 | 등록 조회 | 일반 .com 최초/갱신 참고 |
|---|---|---|---|
| labsync-ops.com | 운영 서비스 명확, 하이픈 입력 부담 | Verisign RDAP404 | 각각 USD11.08 |
| getlabsync.com | 짧은 행동형, 서비스 설명 보완 필요 | Verisign RDAP404 | 각각 USD11.08 |
| labsync-lab.com | 연구실 맥락, lab 중복 | Verisign RDAP404 | 각각 USD11.08 |

RDAP404는 조회 당시 등록 기록 미발견이며 구매 가능/가격 보장이 아니다. 가격은 Porkbun 일반 .com 공개표 참고이며 premium 여부·세금·환율·실제 결제창을 구매 직전 재확인해야 한다. [기존 Lab Sync 연구 자동화 브랜드](https://lab-sync.com/about/)와 혼동 가능성이 있어 후보 모두 상표 검토 필요. KIPRIS 및 목표 시장 상표 검색은 대표자 결정 사항이며 법적 사용 가능 판정은 하지 않았다. 구매/DNS 변경은 하지 않았다.

구매 후 순서: Vercel labsync Domains에 apex/www 추가 → Vercel이 해당 프로젝트에 제시하는 DNS record를 등록(지금 IP/CNAME을 추측하지 않음) → 한 주소를 canonical로 선택하고 나머지 redirect → HTTPS 확인 → Firebase Authorized domains 추가 → Google OAuth branding/허용 origin 점검 → Kakao 웹 도메인과 정확한 `/api/auth/kakao/callback` 등록 → `APP_ORIGIN`, `NEXT_PUBLIC_SITE_URL` 변경 후 rebuild → 로그인/로그아웃·returnTo·canonical·sitemap·공유 확인 → 검색 소유권 갱신. 이전 주소 redirect는 인증 전환 검증 후 처리한다.

[Google sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [Naver 등록](https://searchadvisor.naver.com/guide/faq-start-register), [Porkbun 가격](https://porkbun.com/products/domains).

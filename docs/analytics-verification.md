# Analytics 검증

상태: IMPLEMENTED / 격리 TESTED_LOCAL. Production 수집 비활성. GA4 `G-4T1V2FEFXK`는 대표자가 소유/용도를 확인할 후보이며 코드 기본값으로 넣지 않았다. Clarity 프로젝트도 미확인. 실제 GA realtime·Clarity recording·실제 CTA event 수신은 NOT_STARTED.

`components/AnalyticsConsent.tsx`는 `NEXT_PUBLIC_ANALYTICS_ENABLED=true`와 `NEXT_PUBLIC_PRIVACY_APPROVED=true`, 유효한 서비스 ID 및 브라우저 동의를 모두 요구한다. 기본값 false. `.env.example`에 `NEXT_PUBLIC_GA4_MEASUREMENT_ID`, `NEXT_PUBLIC_CLARITY_PROJECT_ID`가 있다. 정책 승인 flag는 법률 검토나 공개 승인을 대체하지 않는다.

수집 범위: 홈페이지만. GA page_view는 query/hash/referrer 없이 canonical origin/root와 제목 LabSync. allowlist는 pilot_inquiry_click, login_start, login_success이며 method는 google/kakao만 허용. Google success는 SDK 성공 후 기록. Kakao는 시작만 기록하며 callback 성공 이벤트는 이번에 연결하지 않았다. 메일 링크 클릭을 접수완료로 오인하지 않으므로 inquiry_completed/conversion을 만들지 않았다. 이름·이메일·UID·token·요청 내용은 매개변수에 없다.

Clarity는 query/hash 없는 root에만 최초 로드하고 body 전체 및 계정/동의 UI를 mask한다. auth/policy 이동 시 동의 거부 후 새 문서로 reload해 스크립트를 종료한다. 동의 철회도 reload하며 다음 로드부터 수집하지 않는다. 이미 서버로 전달된 기록을 이 동작이 삭제하지는 않는다. 광고 관련 동의는 denied다. 스크립트 제공업체가 처리하는 IP/기기 등까지 없다고 주장하지 않는다.

로컬 증거: `tests/analytics.spec.ts` 별도 3102 fixture, 가짜 ID, 외부 GA/Clarity 요청 전부 차단/빈 JS 응답. 동의 전 0 script, 동의 후 각각 1개, page_view 1 event, CTA allowlist, 주입 email/token/임의 event 제외, 철회 후 script0 검증. 실제 분석 서비스로 보내지 않았다. 기본 빌드 `tests/readiness.spec.ts`도 분석 네트워크 요청0 확인.

대표자 활성화 순서:
1. GA4 속성/웹 스트림의 실제 LabSync 소유 확인; 기존 속성을 중복 생성하지 않기. Clarity 기존 프로젝트 확인/없으면 생성.
2. 개인정보 초안의 실제 수탁자·국외이전·보유기간·동의/철회 내용을 확정하고 공개 승인. 분석 설정과 페이지 문구를 함께 승인.
3. GA Enhanced Measurement의 자동 outbound click/form/search/history 측정을 끄고 Google signals/광고 기능도 검토. 자동 mailto link_url/검색어 등 별도 수집이 섞이지 않도록 한다. Clarity Console Strict masking 설정도 확인하고 내부 연구실 경로를 제외.
4. 실제 ID 입력 후 두 flag true, 승인된 배포. 본인의 동의한 브라우저로 GA realtime/DebugView page_view 1건·CTA1건 확인; 거부 브라우저0, 중복 tag 없음 확인. Clarity 화면 마스킹/URL/query/입력값 기록 제외를 직접 확인. 이상이면 즉시 flag false 후 rebuild.
5. 결과의 일시·속성ID·스크린샷을 기록해야 TESTED_PRODUCTION으로 변경한다.

[GA 개인정보 정책](https://developers.google.com/analytics/devguides/collection/protocol/ga4/policy), [Clarity masking](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-masking), [Consent V2](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-consent-api-v2).

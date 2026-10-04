# 구현 및 검증 기록

검증일: 2026-10-04 (KST)

## 초기 상태

작업 폴더에는 `.vscode/extensions.json`만 있었습니다. 기존 framework, 예약·admin·Calendar·Firebase 코드, 환경변수, 공개 자산, Git 저장소가 없었습니다. 기존 VS Code 설정은 변경하지 않았습니다.

## 실행 결과

| 검사 | 결과 |
| --- | --- |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS, 정적 페이지 생성 |
| 375px / 768px / 1440px Edge 브라우저 | PASS |
| 가로 넘침 / H1 하나 / 한국어 lang | PASS |
| 내부 anchor 대상 | PASS |
| 주요 CTA 4개 문구 및 미설정 fallback 이동 | PASS |
| 브라우저 console error / pageerror | PASS, 오류 없음 |
| title / OG 1200×630 / PNG 응답 / favicon | PASS |
| 실제 외부 문의 접수 | 미검증: 문의 주소 미제공 |
| canonical / 공개 OG URL | 설정 대기: NEXT_PUBLIC_SITE_URL 미제공 |
| GitHub push / Vercel 배포 | 미실행: 원격 저장소·배포 연결 없음 |
| Lighthouse 점수 | 측정하지 않음 |

`npx playwright test`로 3개 화면 검사를 재실행할 수 있습니다. 먼저 `npm run build`, `npm start -- --port 3100`을 실행합니다. 테스트는 설치된 Microsoft Edge를 사용합니다. 전체 화면 캡처는 `artifacts/landing-{375,768,1440}.png`에 저장되며 Git에서 제외됩니다.

공개 URL 미설정 시 Next.js는 OG 이미지 기준 주소로 localhost:3000을 사용합니다. 공개 전 실제 NEXT_PUBLIC_SITE_URL을 설정하고 재빌드해야 합니다. 문의 주소가 없을 때 CTA는 접수 가능한 것처럼 동작하지 않고, 문의 준비 안내로 이동합니다.

## A–J 콘텐츠 자체 검토

이 결과는 사용자 연구나 실제 전환율 검증이 아닌 구현자 검토입니다.

| 항목 | 결과 | 근거 |
| --- | --- | --- |
| A. 3초 내 서비스 이해 | PASS | 첫 화면에 Google Calendar, 공용장비, 연구실, 운영 대행 표시 |
| B. 새 예약 SaaS 오해 방지 | PASS | 기존 Calendar 유지, 운영 대행 명시 |
| C. 연구원/연구실 대상 | PASS | 첫 화면 대상 문구와 headline |
| D. ₩300,000 가격 | PASS | Hero 및 단일 Pilot 카드 |
| E. Pilot 포함 사항 | PASS | 온보딩·최대 5개·6주·운영시간·접수 목표·자동 갱신 없음 |
| F. 제외 범위 | PASS | Calendar 대체·IT·메일·장비 유지보수·데이터 관리 제외 |
| G. 미확인 주장 없음 | PASS | 가상 후기·고객·ROI·실적 없음 |
| H. CTA 통일 | PASS | 4개 모두 Paid Pilot 문의하기 |
| I. 모바일 이해 가능 | PASS | 375px 실브라우저 캡처 및 CTA 동작 확인 |
| J. 기존 기능 보존 | PASS | 기존 앱 자체가 없었으며 VS Code 설정 보존 |

## 가상 고객 관점 검토

- 대학원생: 기존 Calendar의 변경·취소·권한 요청을 대신 처리하는 서비스를 이해할 수 있고, 비공식 관리자 문제에 연결됩니다. 과장된 절감 수치는 없습니다. 가장 큰 문의 장벽은 외부 운영자에게 권한을 맡기는 부담과 본인의 구매 권한 부족입니다.
- PI / 연구실 관리자: 30만원으로 6주간 운영 대행을 검증하는 제안과 포함 범위를 이해할 수 있습니다. 실제 운영 부담이 적은 연구실에서는 필요성을 덜 느낄 수 있습니다. 과장된 ROI는 없으며, 가장 큰 문의 장벽은 지출에 비해 어떤 효과를 관찰할지 아직 확신하기 어렵다는 점입니다.

## 남은 제한

- 실제 문의 URL 또는 이메일, 공개 사이트 URL을 제공해야 합니다.
- 원격 저장소와 Vercel 계정 연결이 필요합니다. 자격 증명은 채팅으로 공유하지 않습니다.
- favicon은 임시 LS 모노그램입니다.
- npm audit에서 린트 개발 의존성의 braces → micromatch → fast-glob → Next ESLint 경로에 high 5건이 보고되었습니다. Next 14로의 강제 다운그레이드는 적용하지 않았습니다. 런타임 패키지가 아닌 개발 도구 경로이며, upstream 수정 확인이 필요합니다.
- Pretendard v1.3.9 공식 파일과 SIL OFL 라이선스를 포함했습니다. 출처: https://github.com/orioncactus/pretendard/tree/v1.3.9

## 변경 파일

모두 신규 파일입니다.

```
.env.example
.gitignore
README.md
package.json
package-lock.json
tsconfig.json
next-env.d.ts
eslint.config.mjs
playwright.config.ts
app/layout.tsx
app/page.tsx
app/globals.css
app/opengraph-image.png
app/opengraph-image.alt.txt
components/ContactCTA.tsx
components/OperationDiagram.tsx
lib/site-config.ts
public/icon.svg
public/fonts/PretendardVariable.woff2
public/fonts/LICENSE.txt
tests/landing.spec.ts
docs/verification.md
```

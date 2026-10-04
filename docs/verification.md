# LabSync 리디자인 검증

검증일: 2026-10-04 (KST)

## 변경 범위

Next.js 16.3.8 / React 19.3.0 / 기존 Pretendard와 CSS를 유지했습니다. 기존 앱에는 `/`와 OG 이미지 경로만 있으며 backend/admin/Calendar 기능은 없습니다. 새 의존성을 추가하지 않았습니다. 사용자가 스테이징한 `.vscode/extensions.json`은 수정하거나 커밋에 포함하지 않습니다.

기존 독립 Current Workflow, Safety, Pilot Fit, Scope 섹션을 통합·축소했습니다. 과도한 섹션 번호, 반복 카피, 고객용 내부 용어 `v0`, 문의 채널 준비 안내를 제거했습니다.

새 구조는 Hero → 문제와 운영 비교 → 운영 타임라인과 확인 원칙 → Pilot과 대상·범위 → Final CTA입니다. 1440px 전체 페이지 높이는 5,033px에서 3,282px로 줄었습니다. SEM-1 변경 카드는 실제 고객 기록이 아닌 명시적인 운영 예시입니다.

## 실제 검사

| 검사 | 결과 |
| --- | --- |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npx playwright test` | PASS, 3개 viewport |
| 375 / 768 / 1440px | PASS, 실제 Edge 캡처 확인 |
| 가로 넘침 / H1 하나 / 한국어 lang | PASS |
| Hero 줄바꿈 / 운영 예시 / 가격 / 모바일 타임라인 | PASS |
| 내부 anchor 대상 | PASS |
| CTA 4개 / 문의 주소 미설정 시 비활성 상태 | PASS |
| 브라우저 console error / pageerror | PASS, 오류 없음 |
| title / OG 1200×630 / PNG 응답 / favicon | PASS |
| `git diff --check` | PASS |

검사 방법: `npm run build` 후 `npm start -- --port 3100`, 별도 터미널에서 `npx playwright test`. 테스트는 설치된 Microsoft Edge를 사용합니다. 전체 페이지·Hero·Pilot 캡처는 Git에서 제외된 `artifacts/redesign-*.png`에 있습니다.

## 유지한 조건

- ₩300,000, 최대 5개 공용장비 Google Calendar
- 초기 설정/온보딩, 운영 시작 후 6주 운영 관찰
- 월–금 09:00–18:00 KST
- 영업시간 기준 4시간 이내 접수 확인 목표
- 해결 시간 보장 없음, 자동 갱신 없음

## 문의 설정

사용자는 전용 문의 주소가 아직 없으며 CTA 디자인만 유지하도록 요청했습니다. 환경변수 예제의 값은 비어 있고 가짜 주소는 추가하지 않았습니다.

- 값이 없으면 실제 전송이나 빈 링크가 없는 비활성 버튼으로 렌더링합니다.
- `NEXT_PUBLIC_CONTACT_URL`에 Google Form URL을 넣고 재빌드/재배포하면 모든 CTA가 링크로 바뀝니다.
- URL이 없고 `NEXT_PUBLIC_CONTACT_EMAIL`만 있으면 mailto로 연결됩니다.
- 요청에 따라 공개 페이지의 문의 채널 준비 안내는 삭제했습니다.

`NEXT_PUBLIC_SITE_URL`도 미설정입니다. 빌드는 성공하지만 Next.js는 OG 이미지 기준 주소로 localhost:3000을 사용합니다. 실제 도메인 설정 후 재빌드해야 합니다. Lighthouse 점수 및 실제 외부 문의 전송은 측정하지 않았습니다.

## 변경 파일

```
app/page.tsx
app/globals.css
app/opengraph-image.png
app/opengraph-image.alt.txt
components/ContactCTA.tsx
components/OperationDiagram.tsx
lib/site-config.ts
public/icon.svg
tests/landing.spec.ts
README.md
docs/verification.md
```

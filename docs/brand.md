# LabSync 브랜드와 화면

2026-10-12 후속 검토안: 기존 타깃/파란색/가격/CTA를 유지하면서 Hero를 “예약은 Calendar에. 운영 요청은 LabSync에.”로 간결하게 정리했다. 기존 “공용장비 예약은 그대로. 운영 요청은 LabSync로.” 대비 두 도구의 역할 분리가 즉시 읽히고, PI·책임자 대상 설명과 6주 유료 파일럿을 같은 화면에서 보완한다. 실제 예약→요청→운영자 확인→결과 기록 UI를 `OperationsPreview`로 보여준다(예시/자동처리 아님 표시). 중복 timeline을 제거하고 문제→체험→가격→FAQ→문의 순서로 재구성했다. 문의는 `PilotInquiry`의 상황/연락처/확인3단계. 새 screenshots는 artifacts/oct12-local-after-*.png, 이전 운영은 oct12-production-*.png. 아래 10/11 문구 선택 기록과 구분한다.

대상: 기존 Google Calendar로 공용장비를 운영하는 PI/연구실 책임자. 핵심 행동은 파일럿 문의, 로그인은 보조 접근 기능이다. 고객 후기/실적/가짜 통계 없음.

실제 배포를 확인한 결과 이미 파란색 계열이었다. hostname의 pink를 화면 색으로 추정하지 않았다. 기존 파랑 CTA·네이비 텍스트·흰 배경과 Pretendard를 유지하고 정보 위계와 구매 조건을 보완했다.

| 문구 대안 | 판단 |
|---|---|
| A 공용장비 예약은 그대로, 운영 요청은 LabSync로 | 대상 명확, 요청 도구로만 보일 여지 |
| B 장비 예약은 그대로, 번거로운 운영은 LabSync로 | 이해 쉬움, PI 구매 맥락 보완 필요 |
| C 예약 시스템을 바꾸지 않고, 연구실 운영 부담을 줄이세요 | 가치 명확, 긴 제목 |

선택: “예약 방식은 그대로, 공용장비 운영 부담은 LabSync로.” 기존 방식 유지와 운영 부담 감소를 결합하고 첫 화면에 PI/책임자 및 ₩300,000·최대5 Calendar·onboarding·6주·자동갱신 없음 표시. “파일럿 문의하기”를 가장 강한 CTA로 유지. 이메일 앱을 연 뒤 직접 보내야 함을 FAQ에 명시.

자산: `public/icon.svg` LS 선형 모노그램, `app/opengraph-image.png` 1200×630, 재생성 `scripts/render-brand.mjs`, 로컬 Pretendard 라이선스 유지. 화면 규칙은 `globals.css`, `refinements.css`, `readiness.css`; 기존 color variables를 사용한다. 버튼 focus/disabled/loading, reduced-motion 기존 규칙을 유지한다. 카카오 활성화 전에는 노란 로그인 기능을 완료된 것처럼 표시하지 않는다.

검증 이미지: 변경 전 `artifacts/oct14-before-375.png`, `-768.png`, `-1440.png`; 변경 후 `artifacts/landing-375.png`, `-768.png`, `-1440.png` 및 hero 이미지. 화면별 가로 넘침·메뉴·문의 목적지·예시 요청 비전송을 자동 검사한다. 브랜드 변경본은 아직 Production에 배포하지 않았다.

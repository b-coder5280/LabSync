# 카카오 로그인 완료보고 · 실습 2-4

기존 Kakao 서버 경로와 Firebase 고유 UID 방식을 유지했습니다. 기본 상태는 준비 중입니다. Kakao 식별자를 검증해 별도 Firebase UID를 생성하고 Google 계정과 이메일로 자동 병합하지 않습니다. 기존 단위 테스트와 격리된 모의 환경의 API 테스트에서 로그인 상태 검증, 리디렉션 범위, 유효기간, 계정 분리를 확인했습니다. 운영 앱 생성·연동과 로그인 실사용은 BLOCKED입니다.

서비스 소유자가 Kakao Developers 앱을 확인하고 REST 플랫폼 로그인 및 실제 Preview 콜백을 등록해야 합니다. 콜백은 `/api/auth/kakao/callback`이며 키·Client Secret 및 쿠키 비밀은 콘솔에서 입력합니다. 현재 경로는 이메일·프로필 동의 범위를 요청하지 않습니다. 이메일을 수집해야 하는 경우 동의 설정 자격과 개인정보 목적을 먼저 확인합니다.

[공식 준비 절차](https://developers.kakao.com/docs/ko/kakaologin/prerequisite)

[다음 실습 → 2-5 LINE 로그인](https://claude.ai/artifact/1GBHSTTKx9mqACctvchKrc#b2-5)

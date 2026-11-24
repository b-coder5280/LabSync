# 00 · 변경 전 점검

공개 저장소에는 보고서를 제공합니다. 전후 캡처, 원본 응답, 테스트 로그와 영상은 수업 제출 ZIP에 포함했습니다.

2026-11-24 KST · LabSync · AI Startup Making & Operating · 6번 이동빈

| 항목 | 기준선 |
| --- | --- |
| GitHub | `b-coder5280/LabSync`, `origin/main` `a007c80b25b5ab74d94f6f747e246e428bf765cb`. 복제 직후 작업 트리 깨끗함. 원격 조회 성공, 쓰기 인증 없음. |
| 런타임 | Node 24.22.3, npm 11.19.1, npm lockfile, Next.js 16.3.8, App Router |
| 공개 주소 | https://labsync-pink.vercel.app/ HTTP 200. Vercel 응답 헤더 확인. Vercel 프로젝트의 연결 저장소·Production 브랜치 설정은 콘솔 권한 필요. |
| 로그인 | 기존 Firebase Auth Google 팝업·브라우저 로컬 세션·로그아웃 코드 확인. Supabase 사용 흔적 없음. 공개 화면에 Google 로그인 버튼을 확인했으나 자동화 브라우저에서 로그인 팝업 이동이 확인되지 않았음. 실제 계정 로그인·세션·redirect 설정은 미검증. |
| 데이터 | 기존 코드상 웹 운영 저장소 없이 메일 문의와 로컬 Firestore Emulator 테스트만 존재. 기존 Firebase 운영 프로젝트 Firestore 생성 및 운영 레코드는 콘솔 권한 필요. |
| 기준선 빌드 | 원본 `npm ci` 실패 (`@emnapi/runtime`, `@emnapi/core` 잠금 파일 누락). 잠금 파일만 보정한 뒤 원본 기능으로 lint·typecheck·build 통과. |
| 기준선 테스트 | 브라우저 11건 통과, 6건 조건부 생략. 생략은 실제 Google OAuth, 별도 Kakao·Analytics 설정, 문의 Emulator 검증. |
| 공개 URL 응답 | `/`, `/sitemap.xml`, `/robots.txt` 200. `/dashboard`, `/llms.txt`, `/privacy`, `/terms` 404. |

Desktop 1440px(별도 제출 ZIP) · Mobile 390px(별도 제출 ZIP) · 원본 HTML(별도 제출 ZIP) · 기준선 테스트 로그(별도 제출 ZIP) · [9항목 전후 점검](02-seo-audit.md)

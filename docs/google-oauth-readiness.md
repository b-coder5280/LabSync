# Google OAuth 준비 상태 — 2026-10-11

상태: 기존 코드 IMPLEMENTED, 로컬 실계정 로그인·새로고침 유지·로그아웃은 이전 대표자 확인. 이번 TESTED_PRODUCTION 범위는 인증창 열기·취소·기본 scope뿐이다. Production 실계정 완료 및 Console 게시/검증 상태는 FOUNDER_ACTION_REQUIRED.

Next.js App Router이며 Vite가 아니다. `lib/firebase-client.ts`가 다음 네 개를 모두 요구한다. 빠지면 `components/AuthControl.tsx`는 “Google 로그인 연결을 준비 중입니다”를 표시하고 인증을 실행하지 않는다.

| Vercel Production Key | 값 |
|---|---|
| NEXT_PUBLIC_FIREBASE_API_KEY | AIzaSyDRflx2ZwfjpKCyjsNJrz_XTkzik6r5VtY |
| NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN | labsync-80acb.firebaseapp.com |
| NEXT_PUBLIC_FIREBASE_PROJECT_ID | labsync-80acb |
| NEXT_PUBLIC_FIREBASE_APP_ID | 1:125665645452:web:9833dc9f237e85921e3ca9 |
| NEXT_PUBLIC_SITE_URL | https://labsync-pink.vercel.app |
| NEXT_PUBLIC_CONTACT_EMAIL | dongbeen@gm.gist.ac.kr |

앞 네 개는 인증 필수, 뒤 두 개는 사이트 설정이다. `storageBucket`, `messagingSenderId`, `measurementId`는 현재 인증 코드에서 읽지 않는다. 위 Firebase 값은 공개 웹 설정이다. Google 로그인에는 Admin private key가 필요 없다. Vercel labsync → Settings → Environment Variables → Production에 등록 후 새 build를 포함한 Redeploy가 필요하다. 과거 build를 단순 승격하면 공개 변수가 바뀌지 않는다. 환경변수 등록만으로 이미 열린 페이지는 바뀌지 않는다.

대표자가 프로젝트 Domains에서 운영 주소를 확인했다. 이번 공개 감사에서 실제 Google popup을 열었으므로 해당 배포에는 Google 설정이 반영되어 있다. Vercel 변수 목록 자체와 배포 SHA는 관리자 연결이 없어 직접 확인하지 못했다.

## 실제 흐름과 심사 구분

`prepareAuth` → browserLocalPersistence → `signInWithPopup(GoogleAuthProvider)` → `onIdTokenChanged`; 로그아웃은 Firebase `signOut`. redirect 방식이 아니므로 외부 Hosting의 redirect storage 우회 설정은 현재 흐름에 적용하지 않는다.

운영 popup scope: `openid https://www.googleapis.com/auth/userinfo.email profile`. Callback: `https://labsync-80acb.firebaseapp.com/__/auth/handler`. Calendar 권한은 요청하지 않는다. 현재 scope만으로 민감/제한 scope 심사가 필요하다고 판단할 근거는 없지만 브랜드 검증, OAuth 게시 상태와 정책 적합성 확인은 별개다. 콘솔 화면을 확인하지 않았으므로 검증 완료/신청 완료로 표시하지 않는다.

대표자 순서:
1. Firebase Authentication → Sign-in method Google 및 Settings → Authorized domains에 `labsync-pink.vercel.app`, `localhost` 확인.
2. Google Cloud에서 같은 프로젝트의 Google Auth Platform → Branding/Audience/Data Access/Clients 확인. 앱 이름, 지원 이메일, 홈페이지, 승인된 정책 URL, 요청 scope와 실제 게시 상태를 기록.
3. 검증이 요구되면 도메인 소유권 및 승인된 공개 정책을 준비하고 대표자가 직접 제출. 접수 증거가 생긴 뒤에만 SUBMITTED/PENDING_REVIEW 기록.
4. 승인된 배포 후 실제 Google 계정으로 로그인 → 새로고침 → 새 탭 → 로그아웃 → 새로고침 검사. 로그인≠연구실 접근 권한 안내 유지.

공식 근거: [Production readiness](https://developers.google.com/identity/protocols/oauth2/production-readiness/overview), [민감 scope 검증](https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scope-verification), [정책](https://developers.google.com/identity/protocols/oauth2/production-readiness/policy-compliance).

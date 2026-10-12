# Google 로그인 및 Vercel 배포

> 2026-10-11 갱신: 아래 10/10 진단은 당시 기록이다. 이번 공개 운영 검사에서는 Google popup이 실제 열리고 취소 안내가 표시됐다. 현재 scope/정확한 환경변수는 [Google 준비 안내](google-oauth-readiness.md), 새 카카오 서버 변수는 [카카오 설정](kakao-login-setup.md)을 우선 참고한다. 문의 CTA의 운영 미연결은 코드 fallback으로 수정했으나 아직 새 배포 전이다. 아래 “관리자 키 불필요” 설명은 Google 로그인에 해당하며 선택적 카카오 custom-token 서버에는 별도 credential이 필요하다.

## 현재 운영 배포 진단 (2026-10-10 재확인)

사용자가 Vercel `labsync` → Settings → Domains에서 `labsync-pink.vercel.app` 연결을 확인했습니다. 운영 사이트에서 Next.js `/_next/` 스크립트와 변경된 홈페이지·Google 로그인 버튼을 직접 확인했습니다. 버튼을 누르면 **"Google 로그인 연결을 준비 중입니다. 파일럿 안내는 아래에서 확인해 주세요."**가 표시됩니다.

이 문구는 `components/AuthControl.tsx`의 `!firebaseConfigured` 분기이며, Firebase 요청을 보내기 전에 종료됩니다. `lib/firebase-client.ts`는 아래 네 `NEXT_PUBLIC_FIREBASE_*` 값이 모두 있어야 초기화합니다. 사용자가 확인한 Vercel의 `No Environment Variables Added`와 일치하는 환경변수 누락 문제입니다. Firebase 콘솔의 `CONFIGURATION_NOT_FOUND` 안내는 뒷문장이 다른 별도 오류입니다.

현재 운영 배포에 로그인 구현이 있으므로 이번 문제에는 추가 인증 코드 수정이 필요하지 않습니다. 아래 네 Firebase 값을 **Production** 환경으로 저장하고, 해당 코드가 포함된 현재 Production 배포를 **Redeploy하여 다시 빌드**합니다. 기존 산출물을 단순 재사용하거나 다른 Preview 배포를 Promote하는 것으로 대체하지 않습니다. 재배포 후 로그인 팝업이 열리는지 확인합니다. Next.js의 공개 환경변수는 빌드 시 포함되므로 환경변수 저장만으로 기존 화면이 변경되지는 않습니다.

## 사용 중인 구성

- Firebase 프로젝트: `labsync-80acb`
- Firebase 웹 앱: `1:125665645452:web:9833dc9f237e85921e3ca9`
- Firebase Auth 도메인: `labsync-80acb.firebaseapp.com`
- 운영 사이트: `https://labsync-pink.vercel.app`
- 방식: Firebase Web SDK `signInWithPopup` + `browserLocalPersistence` + `onIdTokenChanged`
- 로그인 용도로만 Google 기본 identity scope를 사용합니다. Calendar scope, Analytics, Firestore, Storage는 사용하지 않습니다.

Firebase의 [Google 로그인 문서](https://firebase.google.com/docs/auth/web/google-signin)와 [외부 호스팅 redirect 안내](https://firebase.google.com/docs/auth/web/redirect-best-practices)를 확인했습니다. Vercel에서는 기본 Firebase authDomain을 유지하고 팝업 방식으로 연결했습니다. 팝업 차단 시 안내하고 재시도를 받으며 자동 redirect 전환은 하지 않습니다. `authDomain`을 Vercel 주소로 바꾸면 안 됩니다. 현재 페이지·query·hash는 팝업 동안 그대로 유지됩니다.

## Firebase Console

1. 프로젝트 `labsync-80acb` → Build → Authentication → 처음이라면 **시작하기**를 완료합니다.
2. Sign-in method → Google → 사용 설정. 프로젝트 지원 이메일을 실제 운영 이메일로 선택하고 저장합니다.
3. Authentication → Settings → Authorized domains에 `labsync-pink.vercel.app`을 등록합니다. 로컬 테스트에는 `localhost`도 등록합니다. 프로토콜과 경로는 입력하지 않습니다.
4. Firebase 설정 → 프로젝트 설정 → 일반 → 내 앱에서 위 웹 앱의 설정 값과 아래 값을 비교합니다.

2026-10-10 초기 검사에서는 HTTP 400 `CONFIGURATION_NOT_FOUND`가 발생했으나, 사용자의 Authentication 초기화와 Google 활성화 후 재검사에서 **HTTP 200으로 해결**되었습니다. 실제 허용 도메인에는 `localhost`, `labsync-80acb.firebaseapp.com`, `labsync-80acb.web.app`, `labsync-pink.vercel.app`이 있습니다. 로컬 버튼에서 `accounts.google.com`까지 이동하고 실제 콜백 주소가 위 Firebase authDomain의 `/__/auth/handler`임을 확인했습니다. 요청 scope는 `openid https://www.googleapis.com/auth/userinfo.email profile`이며 Calendar 권한은 없습니다.

사용자가 `http://localhost:3100`에서 실계정 로그인, 새로고침 후 유지, 로그아웃 모두 성공했다고 확인했습니다. 이는 사용자 수행 결과이며, 에이전트가 직접 계정 자격 증명을 입력하거나 인증 완료 화면을 관찰한 검증은 아닙니다. Production에서는 별도로 배포 후 확인해야 합니다.

Google Cloud Console의 OAuth 설정을 별도로 점검해야 하는 경우 **동일 Firebase 프로젝트**의 Google Auth Platform → Clients에서 Firebase가 사용하는 웹 클라이언트를 확인합니다. 승인된 redirect URI는 `https://labsync-80acb.firebaseapp.com/__/auth/handler`입니다. Vercel `/callback` 경로를 새로 만드는 방식이 아닙니다. 실제 OAuth client ID나 동의 화면 상태는 아직 확인하지 못했으므로 다른 클라이언트를 임의로 생성하거나 변경하지 않습니다. 동의 화면이 Testing이고 사용자 제한이 적용된다면 실제 검증 계정을 테스트 사용자로 추가해야 합니다.

## Vercel 환경변수

Vercel Dashboard → 해당 LabSync 프로젝트 → Settings → Environment Variables에서 다음 이름으로 **Production**에 등록합니다. Preview에서도 로그인할 경우 해당 배포 도메인을 Firebase에서 별도로 허용해야 합니다. 무작위 미리보기 도메인 전체를 허용하려 하지 마세요.

| 이름 | 실제 값 |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyDRflx2ZwfjpKCyjsNJrz_XTkzik6r5VtY` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `labsync-80acb.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `labsync-80acb` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:125665645452:web:9833dc9f237e85921e3ca9` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | `dongbeen@gm.gist.ac.kr` |
| `NEXT_PUBLIC_SITE_URL` | `https://labsync-pink.vercel.app` |
| `NEXT_PUBLIC_CONTACT_URL` | 비워 두거나 제거 — 이메일 문의 사용 |

위 Firebase 웹 설정은 공개 설정입니다. 비공개 키, 관리자 credential, client secret, access token은 등록하거나 소스에 추가하지 않습니다. `storageBucket`, `messagingSenderId`, `measurementId`는 이번 인증에 필요하지 않습니다.

동일 값은 로컬의 Git 제외 파일 `.env.local`에 연결했습니다. `.env.local`을 Git에 올리지 마세요. Vercel에는 자동으로 전달되지 않습니다. 설정 후 새 코드 배포를 진행하고 환경변수가 반영되도록 다시 빌드해야 합니다. 기존 배포에 환경변수만 저장하는 것으로는 충분하지 않습니다.

## 배포 후 실제 계정 확인

1. 운영 주소에서 헤더 로그인 버튼이 세션 초기화 이후 표시되는지 확인합니다.
2. Google 로그인을 눌러 계정 선택까지 진행하고, 로그인 후 이름·이메일과 이용 권한 확인 전 안내가 표시되는지 확인합니다.
3. `/#pilot`에서 로그인해 같은 위치를 유지하는지 확인합니다.
4. 새로고침·탭 재열기 후 로그인 상태가 복원되는지 확인합니다.
5. 다른 탭을 열고 로그아웃한 뒤 두 탭 모두 로그아웃 상태로 바뀌는지 확인합니다.
6. 팝업 취소·차단·네트워크 끊김에서 안내가 표시되고 다시 시도할 수 있는지 확인합니다.
7. 파일럿 문의가 `dongbeen@gm.gist.ac.kr` 수신자의 메일 작성으로 연결되는지 확인합니다. 메일 클라이언트에서 전송하기 전에는 접수되지 않습니다.

현재 공개 요청 체험에는 실제 전송·데이터 접근 기능이 없습니다. 로그인·로그아웃과 무관하게 공개 예시는 볼 수 있지만 실제 연구실 접근은 제공되지 않습니다. 기존 DB나 API가 없으므로 이번 작업에서 서버/DB 권한 보호를 검증했다고 주장하지 않습니다. 향후 보호 자원 추가 전 서버에서 Firebase ID token의 서명·issuer·audience·만료와 UID별 membership을 검증하고, 로그아웃/권한 철회 정책도 함께 구현해야 합니다.

현재 실행 환경에 Vercel 프로젝트 연결, 인증된 CLI 또는 연결된 관리자 브라우저가 없어 Production 환경변수의 실제 저장값 조회·등록이나 배포는 수행하지 않았습니다. 사용자 확인으로 `labsync`의 환경변수가 비어 있고 운영 도메인이 이 프로젝트에 연결됨을 확인했습니다. 공개 사이트에는 이제 로그인 구현이 배포되어 있으며, 직접 누른 결과 환경변수 누락 분기로 진입합니다. `.env.local`의 authDomain·projectId·appId·사이트 주소·문의 이메일은 위 값과 일치하고 API key는 HTTP 200 조회에 사용되었습니다.

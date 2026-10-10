# Google 로그인 및 Vercel 배포

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

현재 실행 환경에 Vercel 프로젝트 연결, 인증된 CLI 또는 연결된 관리자 브라우저가 없어 Production 환경변수의 실제 저장값 조회·등록이나 배포는 수행하지 않았습니다. 공개 운영 사이트를 다시 확인했으며 아직 이전 홈페이지로 로그인 버튼이 없습니다. 따라서 Firebase 설정 완료와 별개로 위 환경변수를 확인하고 새 코드를 Vercel에 배포해야 합니다. `.env.local`의 authDomain·projectId·appId·사이트 주소·문의 이메일은 위 값과 일치하고 API key는 HTTP 200 조회에 사용되었습니다.

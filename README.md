# LabSync 공개 홈페이지

Google Calendar로 공용장비를 운영하는 연구실을 위한 유료 운영 대행 서비스의 단일 페이지 홈페이지입니다. Next.js App Router, TypeScript, CSS로 구현하며 예약·로그인·결제 기능은 포함하지 않습니다.

## 실행

Node.js 22.9 이상 환경에서:

```sh
npm ci
npm run dev
npm run lint
npm run typecheck
npm run build
npm start
```

## 공개 설정

`.env.example`을 `.env.local`로 복사한 뒤 실제 값을 설정합니다. 환경변수는 빌드에 반영되므로 변경 후 다시 빌드합니다.

- `NEXT_PUBLIC_CONTACT_URL`: 실제 문의 URL (http/https), 우선 사용
- `NEXT_PUBLIC_CONTACT_EMAIL`: URL이 없을 때 사용할 문의 이메일
- `NEXT_PUBLIC_SITE_URL`: 실제 공개 사이트 URL, canonical과 Open Graph 기준 URL

문의 값이 없거나 유효하지 않으면 CTA는 페이지 하단의 문의 채널 준비 안내로 이동합니다. 개발 화면에는 설정 TODO가 표시됩니다. 실제 문의 접수는 주소 설정 전까지 불가능합니다. 잘못된 URL 프로토콜은 허용하지 않습니다.

문구와 Pilot 조건은 `lib/site-config.ts`에서 수정합니다. Pretendard v1.3.9를 `public/fonts`에서 직접 제공하며 SIL Open Font License를 함께 포함합니다. 글꼴 로딩 중에는 시스템 한국어 글꼴을 사용합니다. `public/icon.svg`는 임시 LS 모노그램입니다.

## Vercel

이 폴더를 GitHub 저장소에 연결하고 Vercel에서 Import합니다. Framework Preset은 Next.js, Root Directory는 저장소 루트, Build Command는 `npm run build`입니다. 위 공개 환경변수를 설정하고 배포합니다. 사용자 계정이나 저장소 URL이 제공되지 않아 원격 저장소 및 Vercel 연결은 자동 생성하지 않았습니다.

공개 전 실제 문의 목적지와 `NEXT_PUBLIC_SITE_URL`을 설정하고 CTA 전송 경로를 확인하세요. `.env.local` 및 `.vercel`은 Git에서 제외됩니다.

#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."
export NEXT_PUBLIC_FIREBASE_API_KEY=emulator-only
export NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=demo-labsync-intake.firebaseapp.com
export NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-labsync-intake
export NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:labsync-local
export NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL=http://127.0.0.1:9095
export FIRESTORE_EMULATOR_HOST=127.0.0.1:8085
export FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9095
export OPERATIONS_MODE=emulator
export OPERATIONS_ORIGIN=http://localhost:3100
export INQUIRY_MODE=emulator
export INQUIRY_ORIGIN=http://localhost:3100
export INQUIRY_COOKIE_SECRET=isolated-local-emulator-fixture-not-a-real-secret
export INQUIRY_EMULATOR_READY=1
export LEGAL_DRAFT_PREVIEW=true
unset VERCEL KAKAO_LOGIN_ENABLED LINE_LOGIN_ENABLED NEXT_PUBLIC_ANALYTICS_ENABLED NEXT_PUBLIC_PRIVACY_APPROVED

case "${1:-test}" in
  build) npm run build ;;
  serve) npm run start -- --hostname 127.0.0.1 --port 3100 ;;
  test) npx playwright test --workers=2 ;;
  inquiry) npm run test:inquiry ;;
  *) echo 'Usage: bash scripts/course-emulator.sh [build|serve|test|inquiry]' >&2; exit 1 ;;
esac

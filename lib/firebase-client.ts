import { getApp, getApps, initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
export const firebaseConfigured = Object.values(config).every(Boolean);
export function getClientAuth() {
  if (!firebaseConfigured) throw new Error("auth/configuration-missing");
  return getAuth(getApps().length ? getApp() : initializeApp(config));
}
export async function prepareAuth() {
  const auth = getClientAuth();
  await setPersistence(auth, browserLocalPersistence);
  return auth;
}

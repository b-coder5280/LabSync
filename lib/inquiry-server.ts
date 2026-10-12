import 'server-only';
import { createHmac } from 'node:crypto';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import type { Inquiry } from './inquiry';

// This release supports only the approved local emulator. No live credential fallback.
export function inquiryConfig() {
  const origin = process.env.INQUIRY_ORIGIN;
  if (process.env.VERCEL || process.env.INQUIRY_MODE !== 'emulator' || origin !== 'http://localhost:3100' && origin !== 'http://localhost:3103' || process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8085' || process.env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9095' || !process.env.INQUIRY_COOKIE_SECRET || process.env.INQUIRY_COOKIE_SECRET.length < 32) return null;
  return { origin, secret: process.env.INQUIRY_COOKIE_SECRET, projectId: 'demo-labsync-intake' };
}
export function inquiryServices() {
  const config = inquiryConfig();
  if (!config) throw new Error('inquiry/disabled');
  const app = getApps().find(a => a.name === 'labsync-intake-emulator') || initializeApp({ projectId: config.projectId }, 'labsync-intake-emulator');
  return { db: getFirestore(app), auth: getAuth(app), config };
}
export async function saveInquiry(data: Inquiry, id: string) {
  const { db, config } = inquiryServices();
  const digest = (s: string) => createHmac('sha256', config.secret).update(s).digest('hex');
  const payloadHash = digest(JSON.stringify(data));
  const record = db.collection('pilotInquiries').doc(id);
  const bucket = Math.floor(Date.now() / 3600000);
  const limit = db.collection('intakeLimits').doc(digest(data.email + ':' + bucket));
  const global = db.collection('intakeLimits').doc('global-' + Math.floor(Date.now() / 60000));
  return db.runTransaction(async tx => {
    const [existing, rate, total] = await Promise.all([tx.get(record), tx.get(limit), tx.get(global)]);
    if (existing.exists) {
      if (existing.data()?.payloadHash !== payloadHash) throw new Error('inquiry/conflict');
      return { id, duplicate: true };
    }
    if ((rate.data()?.count || 0) >= 3 || (total.data()?.count || 0) >= 20) throw new Error('inquiry/rate-limit');
    tx.create(record, { ...data, payloadHash, createdAt: new Date(), status: 'Submitted', consentVersion: 'emulator-test-v1', testOnly: true });
    tx.set(limit, { count: (rate.data()?.count || 0) + 1 });
    tx.set(global, { count: (total.data()?.count || 0) + 1 });
    return { id, duplicate: false };
  });
}

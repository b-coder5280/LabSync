import 'server-only';
import { createHmac } from 'node:crypto';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { firebaseAdminApp } from './firebase-admin';
import type { Inquiry } from './inquiry';

export function inquiryConfig() {
  const origin = process.env.INQUIRY_ORIGIN;
  const secret = process.env.INQUIRY_COOKIE_SECRET;
  if (!origin || !secret || secret.length < 32) return null;
  const firestore = process.env.FIRESTORE_EMULATOR_HOST;
  const auth = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  if (!process.env.VERCEL && process.env.INQUIRY_MODE === 'emulator' &&
      ['http://localhost:3100', 'http://localhost:3103'].includes(origin) &&
      firestore === '127.0.0.1:8085' && auth === '127.0.0.1:9095') {
    return { origin, secret, projectId: 'demo-labsync-intake', testOnly: true, retentionDays: 0 };
  }
  const retentionDays = Number(process.env.INQUIRY_RETENTION_DAYS);
  if (process.env.INQUIRY_MODE !== 'live' || process.env.LEGAL_APPROVED !== 'true' ||
      firestore || auth || !Number.isInteger(retentionDays) || retentionDays < 1 || retentionDays > 365) return null;
  try {
    const url = new URL(origin);
    if (url.protocol !== 'https:' || url.origin !== origin) return null;
    firebaseAdminApp();
    return { origin, secret, testOnly: false, retentionDays };
  } catch { return null; }
}

export function inquiryServices() {
  const config = inquiryConfig();
  if (!config) throw new Error('inquiry/disabled');
  const name = 'labsync-intake-emulator';
  const app = config.testOnly
    ? getApps().find(a => a.name === name) || initializeApp({ projectId: config.projectId }, name)
    : firebaseAdminApp();
  return { db: getFirestore(app), auth: getAuth(app), config };
}
export async function saveInquiry(data: Inquiry, id: string) {
  const { db, config } = inquiryServices();
  const digest = (s: string) => createHmac('sha256', config.secret).update(s).digest('hex');
  const payloadHash = digest(JSON.stringify(data));
  const record = config.testOnly ? db.collection('pilotInquiries').doc(id) : db.collection('labsyncOps').doc('v1').collection('inquiries').doc(id);
  const bucket = Math.floor(Date.now() / 3600000);
  const limits = config.testOnly ? db.collection('intakeLimits') : db.collection('labsyncOps').doc('v1').collection('inquiry_limits');
  const limit = limits.doc(digest(data.email + ':' + bucket));
  const global = limits.doc('global-' + Math.floor(Date.now() / 60000));
  return db.runTransaction(async tx => {
    const [existing, rate, total] = await Promise.all([tx.get(record), tx.get(limit), tx.get(global)]);
    if (existing.exists) {
      if (existing.data()?.payloadHash !== payloadHash) throw new Error('inquiry/conflict');
      return { id, duplicate: true };
    }
    if ((rate.data()?.count || 0) >= 3 || (total.data()?.count || 0) >= 20) throw new Error('inquiry/rate-limit');
    const createdAt = new Date();
    tx.create(record, {
      ...data, payloadHash, createdAt, status: 'Submitted', testOnly: config.testOnly,
      consentVersion: config.testOnly ? 'emulator-test-v1' : 'web-intake-v1',
      ...(config.testOnly ? {} : { expiresAt: new Date(createdAt.getTime() + config.retentionDays * 86400000) }),
    });
    const expiresAt = new Date(createdAt.getTime() + 86400000);
    tx.set(limit, { count: (rate.data()?.count || 0) + 1, expiresAt });
    tx.set(global, { count: (total.data()?.count || 0) + 1, expiresAt });
    return { id, duplicate: false };
  });
}

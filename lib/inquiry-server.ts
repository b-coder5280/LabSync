import 'server-only';
import { createHash, createHmac } from 'node:crypto';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { firebaseAdminApp } from './firebase-admin';
import { isCloudOperationsPreview } from './operations-server';
import { previewInquiry, type Inquiry } from './inquiry';

type InquiryConfig =
  | { mode: 'emulator'; origin: string; secret: string; testOnly: true; retentionDays: 0 }
  | { mode: 'preview'; origin: string; secret: string; testOnly: true; retentionDays: 0 }
  | { mode: 'live'; origin: string; secret: string; testOnly: false; retentionDays: number };

const hostedPreviewOrigin = 'https://labsync-git-feat-course-catchup-20261124-dongbeen-lees-projects.vercel.app';

export function inquiryConfig(): InquiryConfig | null {
  const firestore = process.env.FIRESTORE_EMULATOR_HOST;
  const auth = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  if (isCloudOperationsPreview() && !firestore && !auth) {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    if (!privateKey || process.env.OPERATIONS_ORIGIN !== hostedPreviewOrigin) return null;
    const secret = createHash('sha256').update('labsync-preview-intake-v1\0').update(privateKey).digest('hex');
    return { mode: 'preview', origin: hostedPreviewOrigin, secret, testOnly: true, retentionDays: 0 };
  }
  const origin = process.env.INQUIRY_ORIGIN;
  const secret = process.env.INQUIRY_COOKIE_SECRET;
  if (!origin || !secret || secret.length < 32) return null;
  if (!process.env.VERCEL && process.env.INQUIRY_MODE === 'emulator' &&
      ['http://localhost:3100', 'http://localhost:3103'].includes(origin) &&
      firestore === '127.0.0.1:8085' && auth === '127.0.0.1:9095') {
    return { mode: 'emulator', origin, secret, testOnly: true, retentionDays: 0 };
  }
  const retentionDays = Number(process.env.INQUIRY_RETENTION_DAYS);
  if (process.env.INQUIRY_MODE !== 'live' || process.env.LEGAL_APPROVED !== 'true' ||
      firestore || auth || !Number.isInteger(retentionDays) || retentionDays < 1 || retentionDays > 365) return null;
  try {
    const url = new URL(origin);
    if (url.protocol !== 'https:' || url.origin !== origin) return null;
    firebaseAdminApp();
    return { mode: 'live', origin, secret, testOnly: false, retentionDays };
  } catch { return null; }
}

export function inquiryServices() {
  const config = inquiryConfig();
  if (!config) throw new Error('inquiry/disabled');
  const name = 'labsync-intake-emulator';
  const app = config.mode === 'emulator'
    ? getApps().find(a => a.name === name) || initializeApp({ projectId: 'demo-labsync-intake' }, name)
    : firebaseAdminApp();
  return { db: getFirestore(app), auth: getAuth(app), config };
}
export async function saveInquiry(data: Inquiry, id: string) {
  const { db, config } = inquiryServices();
  if (config.mode === 'preview' &&
      (data.email !== previewInquiry.email || data.message !== previewInquiry.message ||
       data.calendarCount !== previewInquiry.calendarCount || data.name || data.organization || data.source)) {
    throw new Error('inquiry/preview-fixture-required');
  }
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
      consentVersion: config.mode === 'live' ? 'web-intake-v1' : `${config.mode}-test-v1`,
      ...(config.testOnly ? {} : { expiresAt: new Date(createdAt.getTime() + config.retentionDays * 86400000) }),
    });
    const expiresAt = new Date(createdAt.getTime() + 86400000);
    tx.set(limit, { count: (rate.data()?.count || 0) + 1, expiresAt });
    tx.set(global, { count: (total.data()?.count || 0) + 1, expiresAt });
    return { id, duplicate: false };
  });
}

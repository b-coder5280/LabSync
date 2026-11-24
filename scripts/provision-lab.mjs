import { createHash } from 'node:crypto';
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const [id, name, adminUid, plan = 'demo'] = process.argv.slice(2);
if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{0,63}$/.test(id || '') || !name?.trim() || name.length > 120 ||
    !adminUid || !['demo', 'pilot', 'managed'].includes(plan)) {
  throw new Error('Usage: node scripts/provision-lab.mjs LAB_ID "LAB_NAME" ADMIN_UID [demo|pilot|managed]');
}
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const emulator = projectId === 'demo-labsync-intake' && process.env.FIRESTORE_EMULATOR_HOST === '127.0.0.1:8085' &&
  process.env.FIREBASE_AUTH_EMULATOR_HOST === '127.0.0.1:9095';
if (!emulator && (!projectId || process.env.LABSYNC_PROVISION_PROJECT !== projectId ||
    process.env.OPERATIONS_MODE !== 'live' || process.env.LEGAL_APPROVED !== 'true' ||
    process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST)) {
  throw new Error('Use the local emulator or set the approved target project explicitly with LABSYNC_PROVISION_PROJECT.');
}
const app = initializeApp({
  projectId,
  ...(emulator ? {} : {
    credential: cert({
      projectId,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  }),
});
const user = await getAuth(app).getUser(adminUid);
if (user.disabled || !user.emailVerified) throw new Error('Initial lab admin must be a verified active Firebase account.');
const db = getFirestore(app);
const root = db.collection('labsyncOps').doc('v1');
const lab = root.collection('labs').doc(id);
const profile = root.collection('profiles').doc(createHash('sha256').update(user.uid).digest('hex'));
await db.runTransaction(async tx => {
  if ((await tx.get(lab)).exists) throw new Error('This lab already exists. No data was overwritten.');
  const at = new Date().toISOString();
  tx.create(lab, { name: name.trim(), plan, createdAt: at });
  tx.set(profile, { uid: user.uid }, { merge: true });
  tx.create(profile.collection('lab_members').doc(id), { role: 'admin', joinedAt: at });
});
console.log(`Created lab ${id} in ${projectId}.`);

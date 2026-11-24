import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';
import {
  getFirestore, type DocumentData, type Firestore, type Transaction,
} from 'firebase-admin/firestore';
import { firebaseAdminApp } from './firebase-admin';
import {
  emailField, isStatus, nextStatuses, parseRequest, textField, validId, validUuid,
  type Lab, type RequestFields, type RequestStatus, type Role,
} from './operations';

export class OperationsError extends Error {
  constructor(readonly status: number, readonly code: string) { super(code); }
}

export function isCloudOperationsPreview() {
  return process.env.OPERATIONS_MODE === 'preview' &&
    process.env.VERCEL_ENV === 'preview' &&
    process.env.VERCEL_GIT_COMMIT_REF === 'feat/course-catchup-20261124' &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'labsync-preview' &&
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.endsWith('@labsync-preview.iam.gserviceaccount.com') === true;
}

export function operationsServices() {
  const mode = process.env.OPERATIONS_MODE;
  const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST;
  const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  if (mode === 'emulator' && !process.env.VERCEL &&
      firestoreHost === '127.0.0.1:8085' && authHost === '127.0.0.1:9095' &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'demo-labsync-intake') {
    const name = 'labsync-operations-emulator';
    const app = getApps().find(a => a.name === name) || initializeApp({ projectId: 'demo-labsync-intake' }, name);
    return { db: getFirestore(app), auth: getAuth(app), testOnly: true };
  }
  const cloudPreview = isCloudOperationsPreview();
  const live = mode === 'live' && process.env.LEGAL_APPROVED === 'true';
  if ((!cloudPreview && !live) || firestoreHost || authHost) throw new OperationsError(503, 'operations/disabled');
  try {
    const app = firebaseAdminApp();
    return { db: getFirestore(app), auth: getAuth(app), testOnly: cloudPreview };
  } catch {
    throw new OperationsError(503, 'operations/configuration');
  }
}

export async function verifyOperationsUser(request: Request, auth: ReturnType<typeof getAuth>) {
  const token = request.headers.get('authorization')?.match(/^Bearer (\S+)$/i)?.[1];
  if (!token) throw new OperationsError(401, 'auth/required');
  try { return await auth.verifyIdToken(token, true); }
  catch { throw new OperationsError(401, 'auth/invalid-token'); }
}

const opsRoot = (db: Firestore) => db.collection('labsyncOps').doc('v1');
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const actorKey = (uid: string) => hash(uid);
const labRef = (db: Firestore, id: string) => opsRoot(db).collection('labs').doc(id);
const memberRef = (db: Firestore, uid: string, id: string) =>
  opsRoot(db).collection('profiles').doc(actorKey(uid)).collection('lab_members').doc(id);

export async function checkPreviewStorage() {
  if (!isCloudOperationsPreview()) throw new OperationsError(404, 'operations/not-found');
  const { db } = operationsServices();
  await opsRoot(db).get();
  return { ready: true };
}

export async function openPreviewLab(db: Firestore, user: DecodedIdToken) {
  if (!isCloudOperationsPreview() || user.firebase.sign_in_provider !== 'google.com' || user.email_verified !== true) {
    throw new OperationsError(403, 'lab/forbidden');
  }
  const key = actorKey(user.uid);
  const id = 'demo-' + key.slice(0, 59);
  const ref = labRef(db, id);
  const member = memberRef(db, user.uid, id);
  return db.runTransaction(async tx => {
    const [labRow, memberRow] = await tx.getAll(ref, member);
    if (labRow.exists || memberRow.exists) {
      if (labRow.get('previewOwner') !== key || memberRow.get('role') !== 'admin') {
        throw new OperationsError(403, 'lab/forbidden');
      }
    } else {
      const at = new Date().toISOString();
      tx.create(ref, { name: '내 테스트 연구실', plan: 'demo', createdAt: at, previewOwner: key });
      tx.set(member.parent.parent!, { uid: user.uid }, { merge: true });
      tx.create(member, { role: 'admin', joinedAt: at });
    }
    return { labId: id };
  });
}

async function requireMembership(tx: Transaction, db: Firestore, uid: string, labId: string): Promise<Lab> {
  const [member, lab] = await Promise.all([tx.get(memberRef(db, uid, labId)), tx.get(labRef(db, labId))]);
  const role: Role | undefined = member.get('role');
  if (!lab.exists || (role !== 'admin' && role !== 'member')) throw new OperationsError(403, 'lab/forbidden');
  return { id: labId, name: lab.get('name'), plan: lab.get('plan'), role };
}

function requireId(value: unknown) {
  if (!validId(value)) throw new OperationsError(400, 'operations/invalid-input');
  return value;
}

function requireRequestId(value: unknown) {
  if (!validUuid(value)) throw new OperationsError(400, 'operations/invalid-input');
  return value;
}

function requireAdmin(lab: Lab) {
  if (lab.role !== 'admin') throw new OperationsError(403, 'lab/admin-required');
}

function serializeRequest(id: string, row: DocumentData, uid: string) {
  const { type, calendar, scheduledAt, desiredAt, contact, reason, status, version, createdAt } = row;
  return { id, type, calendar, scheduledAt, desiredAt, contact, reason, status, version, createdAt, own: row.owner === uid };
}

export async function readOperations(db: Firestore, user: DecodedIdToken, search: URLSearchParams) {
  if (search.get('operator') === 'deletions') {
    if (user.admin !== true) throw new OperationsError(403, 'lab/admin-required');
    const records = await opsRoot(db).collection('account_deletion_requests').orderBy('createdAt', 'desc').limit(20).get();
    return { deletions: records.docs.map(record => ({
      uid: record.get('uid'), email: record.get('email'), status: record.get('status'), createdAt: record.get('createdAt'),
    })) };
  }
  const labId = search.get('lab');
  if (!labId) {
    const profiles = opsRoot(db).collection('profiles').doc(actorKey(user.uid));
    const memberships = await profiles.collection('lab_members').get();
    const labs = memberships.empty ? [] : await db.getAll(...memberships.docs.map(member => labRef(db, member.id)));
    return { operator: user.admin === true, labs: labs.flatMap((lab, index) => {
      const role = memberships.docs[index].get('role');
      return lab.exists && (role === 'member' || role === 'admin') ?
        [{ id: lab.id, name: lab.get('name'), role, plan: lab.get('plan') }] : [];
    }) };
  }
  requireId(labId);
  const requests = labRef(db, labId).collection('requests');
  return db.runTransaction(async tx => {
    const lab = await requireMembership(tx, db, user.uid, labId);
    const id = search.get('request');
    if (id) {
      const record = await tx.get(requests.doc(requireRequestId(id)));
      const row = record.data();
      if (!row || lab.role !== 'admin' && row.owner !== user.uid) throw new OperationsError(404, 'request/not-found');
      const events = await tx.get(record.ref.collection('request_events').orderBy('version'));
      return {
        request: serializeRequest(id, row, user.uid),
        events: events.docs.map(event => ({ status: event.get('status'), note: event.get('note'), at: event.get('at') })),
      };
    }
    // Single-field range on a per-owner sort key avoids a composite index on existing projects.
    const ownerPrefix = actorKey(user.uid) + ':';
    const query = lab.role === 'admin' && search.get('view') === 'queue'
      ? requests.orderBy('createdAt', 'desc')
      : requests.orderBy('ownerOrder', 'desc').startAt(ownerPrefix + '\uf8ff').endAt(ownerPrefix);
    const listing = await tx.get(query.limit(50));
    return { lab, requests: listing.docs.map(record => serializeRequest(record.id, record.data(), user.uid)) };
  }, { readOnly: true });
}

async function redeemInvite(db: Firestore, user: DecodedIdToken, value: unknown) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{32}$/.test(value)) throw new OperationsError(400, 'invite/invalid');
  const email = user.email_verified ? emailField(user.email) : null;
  if (!email) throw new OperationsError(403, 'invite/verified-email-required');
  const invite = opsRoot(db).collection('invites').doc(hash(value));
  return db.runTransaction(async tx => {
    const existing = await tx.get(invite);
    const row = existing.data();
    if (!row || row.email !== email) throw new OperationsError(403, 'invite/unavailable');
    const labId = requireId(row.labId);
    const membership = memberRef(db, user.uid, labId);
    const [member, lab] = await Promise.all([tx.get(membership), tx.get(labRef(db, labId))]);
    if (!lab.exists) throw new OperationsError(403, 'invite/unavailable');
    if (row.usedBy === user.uid && member.exists) return { labId };
    if (row.usedBy || row.expiresAt < Date.now()) throw new OperationsError(403, 'invite/unavailable');
    const profile = membership.parent.parent!;
    tx.set(profile, { uid: user.uid }, { merge: true });
    if (!member.exists) tx.create(membership, { role: 'member', joinedAt: new Date().toISOString() });
    tx.update(invite, { usedBy: user.uid, usedAt: new Date().toISOString() });
    return { labId };
  });
}

function createInvite(db: Firestore, user: DecodedIdToken, labId: string, value: unknown) {
  const email = emailField(value);
  if (!email) throw new OperationsError(400, 'operations/invalid-input');
  const code = randomBytes(24).toString('base64url');
  return db.runTransaction(async tx => {
    requireAdmin(await requireMembership(tx, db, user.uid, labId));
    tx.create(opsRoot(db).collection('invites').doc(hash(code)), {
      email, labId, expiresAt: Date.now() + 7 * 86400000, createdAt: new Date().toISOString(), createdBy: user.uid,
    });
    return { code };
  });
}

function createRequest(db: Firestore, uid: string, labId: string, id: string, fields: RequestFields) {
  const record = labRef(db, labId).collection('requests').doc(id);
  return db.runTransaction(async tx => {
    await requireMembership(tx, db, uid, labId);
    const existing = await tx.get(record);
    const payloadHash = hash(JSON.stringify(fields));
    if (existing.exists) {
      if (existing.get('owner') === uid && existing.get('payloadHash') === payloadHash) return { id };
      throw new OperationsError(409, 'request/conflict');
    }
    const at = new Date().toISOString();
    tx.create(record, { ...fields, owner: uid, ownerOrder: actorKey(uid) + ':' + at, status: 'submitted', version: 1, createdAt: at, updatedAt: at, payloadHash });
    tx.create(record.collection('request_events').doc('1'), { version: 1, status: 'submitted', at, note: '', actor: uid });
    return { id };
  });
}

function updateRequest(db: Firestore, uid: string, labId: string, input: Record<string, unknown>) {
  const id = requireRequestId(input.id);
  const { status, version } = input;
  const note = textField(input.note, 1000, 3);
  if (!isStatus(status) || typeof version !== 'number' || !Number.isSafeInteger(version) || version < 1 || !note) {
    throw new OperationsError(400, 'operations/invalid-input');
  }
  const record = labRef(db, labId).collection('requests').doc(id);
  return db.runTransaction(async tx => {
    requireAdmin(await requireMembership(tx, db, uid, labId));
    const stored = await tx.get(record);
    if (!stored.exists) throw new OperationsError(404, 'request/not-found');
    const event = record.collection('request_events').doc(String(version + 1));
    if (stored.get('version') !== version) {
      const previous = await tx.get(event);
      if (previous.get('status') === status && previous.get('note') === note && previous.get('actor') === uid) return { id };
      throw new OperationsError(409, 'request/conflict');
    }
    if (!nextStatuses(stored.get('status') as RequestStatus).includes(status)) throw new OperationsError(409, 'request/transition');
    const at = new Date().toISOString();
    tx.update(record, { status, version: version + 1, updatedAt: at });
    tx.create(event, { version: version + 1, status, at, note, actor: uid });
    return { id };
  });
}

export async function writeOperations(db: Firestore, user: DecodedIdToken, input: Record<string, unknown>) {
  if (input.action === 'join') return redeemInvite(db, user, input.code);
  if (input.action === 'account-deletion') {
    if (input.confirm !== true) throw new OperationsError(400, 'operations/invalid-input');
    const record = opsRoot(db).collection('account_deletion_requests').doc(actorKey(user.uid));
    return db.runTransaction(async tx => {
      if (!(await tx.get(record)).exists) {
        tx.create(record, { uid: user.uid, email: user.email_verified ? user.email : null, status: 'submitted', createdAt: new Date().toISOString() });
      }
      return { submitted: true };
    });
  }
  const labId = requireId(input.labId);
  if (input.action === 'invite') return createInvite(db, user, labId, input.email);
  if (input.action === 'update') return updateRequest(db, user.uid, labId, input);
  const fields = parseRequest(input);
  if (input.action !== 'create' || !fields) throw new OperationsError(400, 'operations/invalid-input');
  return createRequest(db, user.uid, labId, requireRequestId(input.id), fields);
}

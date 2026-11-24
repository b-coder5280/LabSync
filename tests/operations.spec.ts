import { test, expect } from '@playwright/test';
import { createHash, randomUUID } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const origin = 'http://localhost:3100';
const project = 'demo-labsync-intake';
const emulated = process.env.OPERATIONS_MODE === 'emulator' &&
  process.env.FIRESTORE_EMULATOR_HOST === '127.0.0.1:8085' &&
  process.env.FIREBASE_AUTH_EMULATOR_HOST === '127.0.0.1:9095';

test('private dashboard sends no data before login', async ({ page, request }) => {
  await page.goto('/dashboard');
  await expect(page.getByText('상단에서 Google로 로그인해 주세요.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Request Assistant' })).toHaveCount(0);
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/);
  const response = await request.get('/api/operations?lab=unknown');
  expect(response.status()).toBe(401);
  expect(response.headers()['cache-control']).toContain('no-store');
});

test('public information, policies, manifest and crawl paths are reachable', async ({ page, request }) => {
  for (const route of ['/pricing', '/faq', '/guide']) {
    const response = await request.get(route);
    expect(response.ok()).toBeTruthy();
    const html = await response.text();
    expect(html).toContain('href="https://labsync-pink.vercel.app' + route + '"');
    expect(html).toContain('property="og:image"');
  }
  await page.goto('/guide');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('예약 변경 요청');
  await expect(page.getByRole('link', { name: 'Google Calendar 공식 공유 권한 안내' })).toBeVisible();
  for (const route of ['/privacy', '/terms', '/refund', '/account-deletion', '/manifest.webmanifest', '/llms.txt']) {
    expect((await request.get(route)).status(), route).toBe(200);
  }
});

test('emulator persists lab isolation, invitation, lifecycle, deletion and operator intake', async ({ request }) => {
  test.skip(!emulated, 'Requires both isolated Firebase emulators.');
  const app = initializeApp({ projectId: project }, 'operations-e2e');
  const db = getFirestore(app), auth = getAuth(app);
  const root = db.collection('labsyncOps').doc('v1');
  const idHash = (uid: string) => createHash('sha256').update(uid).digest('hex');
  const password = 'LocalFixtureOnly-2026';
  const stamp = randomUUID().slice(0, 8);
  const alpha = 'alpha-' + stamp, beta = 'beta-' + stamp;
  async function fixture(name: string, operator = false) {
    const email = `${name}-${stamp}@example.invalid`;
    const user = await auth.createUser({ email, password, emailVerified: true });
    if (operator) await auth.setCustomUserClaims(user.uid, { admin: true });
    const result = await request.post('http://127.0.0.1:9095/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=emulator-only', {
      data: { email, password, returnSecureToken: true },
    });
    expect(result.ok()).toBeTruthy();
    return { email, uid: user.uid, headers: { Authorization: 'Bearer ' + (await result.json()).idToken } };
  }
  const [admin, member, outsider] = await Promise.all([fixture('admin', true), fixture('member'), fixture('outsider')]);
  const memberDoc = (uid: string, lab: string) => root.collection('profiles').doc(idHash(uid)).collection('lab_members').doc(lab);
  await Promise.all([
    root.collection('labs').doc(alpha).create({ name: 'Alpha sample lab', plan: 'demo' }),
    root.collection('labs').doc(beta).create({ name: 'Beta sample lab', plan: 'demo' }),
    memberDoc(admin.uid, alpha).create({ role: 'admin' }),
    memberDoc(outsider.uid, beta).create({ role: 'admin' }),
  ]);
  const get = (account: typeof admin, query = '') => request.get('/api/operations' + query, { headers: account.headers });
  const post = (account: typeof admin, data: object, source = origin) =>
    request.post('/api/operations', { data, headers: { ...account.headers, Origin: source } });
  expect((await get(member).then(r => r.json())).labs).toEqual([]);
  expect((await get(admin, '?lab=' + beta)).status()).toBe(403);
  expect((await get(outsider, '?lab=' + alpha)).status()).toBe(403);
  expect((await request.get('/api/operations', { headers: { Authorization: 'Bearer invalid' } })).status()).toBe(401);
  expect((await post(admin, { action: 'invite', labId: alpha, email: member.email }, 'https://test.invalid')).status()).toBe(403);
  const invite = await post(admin, { action: 'invite', labId: alpha, email: member.email });
  expect(invite.status()).toBe(200);
  const { code } = await invite.json();
  expect((await post(outsider, { action: 'join', code })).status()).toBe(403);
  expect((await post(member, { action: 'join', code, role: 'admin', plan: 'managed' })).status()).toBe(200);
  expect((await post(member, { action: 'join', code })).status()).toBe(200);
  expect((await get(member).then(r => r.json())).labs).toEqual([{ id: alpha, name: 'Alpha sample lab', plan: 'demo', role: 'member' }]);
  expect((await post(member, { action: 'invite', labId: alpha, email: outsider.email })).status()).toBe(403);

  const id = randomUUID(), secondId = randomUUID();
  const record = { action: 'create', labId: alpha, id, type: 'change', calendar: 'SEM sample',
    reason: 'Synthetic semester change request', contact: member.email, scheduledAt: '2026-11-25T13:00', desiredAt: '2026-11-25T14:00' };
  expect((await post(member, { ...record, desiredAt: '2026-02-30T14:00' })).status()).toBe(400);
  expect((await post(member, { ...record, contact: 'invalid' })).status()).toBe(400);
  expect((await post(member, { ...record, labId: beta })).status()).toBe(403);
  const create = await Promise.all([post(member, record), post(member, record)]);
  expect(create.map(item => item.status())).toEqual([200, 200]);
  expect((await post(member, { ...record, reason: 'Different content' })).status()).toBe(409);
  expect((await post(member, { ...record, id: secondId, type: 'cancel' })).status()).toBe(200);
  const memberQueue = await get(member, `?lab=${alpha}&view=queue`);
  expect((await memberQueue.json()).requests.map((row: { id: string }) => row.id).sort()).toEqual([id, secondId].sort());
  expect((await get(admin, `?lab=${alpha}&view=mine`).then(r => r.json())).requests).toEqual([]);
  expect((await get(admin, `?lab=${alpha}&view=queue`).then(r => r.json())).requests).toHaveLength(2);
  const query = `?lab=${alpha}&request=${id}`;
  expect((await get(outsider, query)).status()).toBe(403);
  const update = { action: 'update', labId: alpha, id, version: 1, status: 'reviewing', note: 'Check sample reservation' };
  expect((await post(member, update)).status()).toBe(403);
  expect((await post(admin, { ...update, status: 'completed' })).status()).toBe(409);
  expect((await post(admin, update)).status()).toBe(200);
  expect((await post(admin, update)).status()).toBe(200);
  expect((await post(admin, { ...update, status: 'rejected' })).status()).toBe(409);
  expect((await post(admin, { ...update, version: 2, status: 'approved' })).status()).toBe(200);
  expect((await post(admin, { ...update, version: 3, status: 'completed' })).status()).toBe(200);
  expect((await post(admin, { ...update, id: secondId, status: 'rejected' })).status()).toBe(200);
  const loaded = await get(member, query).then(r => r.json());
  expect(loaded.request.status).toBe('completed');
  expect(loaded.events.map((event: { status: string }) => event.status)).toEqual(['submitted', 'reviewing', 'approved', 'completed']);
  expect((await get(member, `?lab=${alpha}&request=${secondId}`).then(r => r.json())).request.status).toBe('rejected');

  const doc = `http://127.0.0.1:8085/v1/projects/${project}/databases/(default)/documents/labsyncOps/v1/labs/${alpha}/requests/${id}`;
  expect((await request.get(doc, { headers: member.headers })).status()).toBe(403);
  expect((await request.get(doc, { headers: admin.headers })).status()).toBe(403);
  expect((await request.patch(doc, { headers: admin.headers, data: { fields: { status: { stringValue: 'tampered' } } } })).status()).toBe(403);

  expect((await post(member, { action: 'account-deletion', confirm: false })).status()).toBe(400);
  const deletion = { action: 'account-deletion', confirm: true };
  expect((await post(member, deletion)).status()).toBe(200);
  expect((await post(member, deletion)).status()).toBe(200);
  expect((await get(member, '?operator=deletions')).status()).toBe(403);
  const deletions = await get(admin, '?operator=deletions').then(r => r.json());
  expect(deletions.deletions.filter((item: { uid: string }) => item.uid === member.uid)).toHaveLength(1);
  expect((await auth.getUser(member.uid)).uid).toBe(member.uid);

  const inquiryStatus = await request.get('/api/inquiries/status');
  const challenge = await inquiryStatus.json();
  expect(challenge.testOnly).toBe(true);
  await new Promise(resolve => setTimeout(resolve, 1600));
  const inquiry = { id: randomUUID(), nonce: challenge.nonce, website: '', consent: true, email: member.email,
    name: '', organization: '', message: 'Synthetic class project inquiry', calendarCount: '1', source: 'ai' };
  const sendInquiry = (value: object) => request.post('/api/inquiries', { data: value, headers: { Origin: origin } });
  expect((await sendInquiry({ ...inquiry, website: 'spam' })).status()).toBe(403);
  expect((await sendInquiry({ ...inquiry, consent: false })).status()).toBe(400);
  expect((await sendInquiry({ ...inquiry, source: 'invalid' })).status()).toBe(400);
  expect((await sendInquiry(inquiry)).status()).toBe(201);
  expect((await sendInquiry(inquiry)).status()).toBe(200);
  expect((await request.get('/api/inquiries', { headers: member.headers })).status()).toBe(403);
  const intake = await request.get('/api/inquiries', { headers: admin.headers }).then(r => r.json());
  expect(intake.testOnly).toBe(true);
  expect(intake.inquiries.find((row: { id: string }) => row.id === inquiry.id)?.source).toBe('ai');
});

test('browser session reload, member request, admin review and logout on mobile', async ({ browser, request }) => {
  test.skip(!emulated, 'Requires both isolated Firebase emulators.');
  const adminApp = initializeApp({ projectId: project }, 'operations-ui-e2e');
  const auth = getAuth(adminApp), db = getFirestore(adminApp);
  const root = db.collection('labsyncOps').doc('v1');
  const labId = 'browser-' + randomUUID().slice(0, 8);
  const lab = root.collection('labs').doc(labId);
  await lab.create({ name: 'SEM 데모 연구실', plan: 'demo' });
  const { initializeApp: initClient } = await import('firebase/app');
  const { connectAuthEmulator, getAuth: clientAuth, signInWithEmailAndPassword } = await import('firebase/auth');

  async function session(role: 'admin' | 'member') {
    const email = `${role}-${labId}@example.invalid`;
    const password = 'OnlyForLocalEmulator42!';
    const user = await auth.createUser({ email, password, emailVerified: true, displayName: role === 'admin' ? '샘플 관리자' : '샘플 신청자' });
    const uidKey = createHash('sha256').update(user.uid).digest('hex');
    await root.collection('profiles').doc(uidKey).collection('lab_members').doc(labId).create({ role });
    const client = clientAuth(initClient({ apiKey: 'emulator-only', projectId: project }, email));
    connectAuthEmulator(client, 'http://127.0.0.1:9095', { disableWarnings: true });
    const { user: signedIn } = await signInWithEmailAndPassword(client, email, password);
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
      storageState: { cookies: [], origins: [{ origin, localStorage: [{
        // Seed only the initial login with an actual emulator-issued Firebase session.
        name: 'firebase:authUser:emulator-only:[DEFAULT]', value: JSON.stringify(signedIn.toJSON()),
      }] }] },
    });
    return context;
  }
  const member = await session('member');
  const page = await member.newPage();
  await page.goto('/dashboard');
  await expect(page.getByText('Demo / Sample data · 테스트 연구실')).toBeVisible();
  await expect(page.getByLabel('내 연구실')).toHaveValue(labId);
  const form = page.locator('form').filter({ has: page.getByRole('heading', { name: 'Request Assistant' }) });
  await form.getByLabel('캘린더 또는 장비 이름').fill('SEM-2');
  await form.getByLabel('기존 예약 시간').fill('2026-11-25T15:00');
  await form.getByLabel('변경할 시간').fill('2026-11-25T16:00');
  await form.getByLabel('요청 사유').fill('샘플 일정과 겹쳐 한 시간 뒤로 이동을 요청합니다.');
  await form.screenshot({ path: 'artifacts/course-request-form.png' });
  await form.getByRole('button', { name: '요청 접수' }).click();
  await expect(form.getByRole('status')).toContainText('요청을 접수했습니다.');
  await page.reload();
  await expect(page.getByRole('button', { name: '예약 변경 · SEM-2 접수' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  const admin = await session('admin');
  const queue = await admin.newPage();
  await queue.goto('/dashboard');
  await queue.getByRole('button', { name: '관리자 큐' }).click();
  await queue.getByRole('button', { name: '예약 변경 · SEM-2 접수' }).click();
  const details = queue.getByRole('region', { name: '선택한 요청 상세' });
  await details.getByLabel('다음 상태').selectOption('approved');
  await details.getByLabel('신청자에게 표시될 처리 메모').fill('샘플 확인을 마쳤습니다. 일정 변경 담당자 확인을 요청합니다.');
  await details.getByRole('button', { name: '처리 상태 저장' }).click();
  await expect(queue.getByRole('button', { name: '예약 변경 · SEM-2 승인' })).toBeVisible();
  await expect(details).toContainText('샘플 확인을 마쳤습니다.');
  await details.screenshot({ path: 'artifacts/course-admin-review.png' });

  await page.reload();
  await page.getByRole('button', { name: '예약 변경 · SEM-2 승인' }).click();
  await expect(page.getByRole('region', { name: '선택한 요청 상세' })).toContainText('샘플 확인을 마쳤습니다.');
  await page.getByRole('link', { name: '계정 및 데이터 삭제 신청' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: '삭제 요청 접수' }).click();
  await expect(page.getByRole('status')).toContainText('계정 삭제 요청을 접수했습니다.');
  await page.getByRole('button', { name: '샘플 신청자' }).click();
  await page.getByRole('button', { name: '로그아웃' }).click();
  await page.reload();
  await expect(page.getByText('상단에서 Google로 로그인해 주세요.')).toBeVisible();
  const records = await lab.collection('requests').get();
  expect(records.size).toBe(1);
  expect((await request.get('/api/operations?lab=' + labId)).status()).toBe(401);
  await member.close();
  await admin.close();
});

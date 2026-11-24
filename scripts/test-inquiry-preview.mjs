import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';

const origin = process.env.LABSYNC_PREVIEW_ORIGIN;
const share = process.env.LABSYNC_PREVIEW_SHARE;
const url = new URL(origin ?? '');
const stableHost = 'labsync-git-feat-course-catchup-20261124-dongbeen-lees-projects.vercel.app';
const deploymentHost = /^labsync-[a-z0-9]+-dongbeen-lees-projects\.vercel\.app$/;
assert.ok(url.protocol === 'https:' && url.origin === origin &&
  (url.hostname === stableHost || deploymentHost.test(url.hostname)));
assert.ok(share, 'Set LABSYNC_PREVIEW_SHARE to a temporary share token for the tested deployment');
const endpointFor = (path) => {
  const target = new URL(path, origin);
  target.searchParams.set('x-vercel-share', share);
  return target;
};
const options = { redirect: 'manual' };
const challenge = await fetch(endpointFor('/api/inquiries/status'), options);
assert.equal(challenge.status, 200, 'Preview challenge requires a share token scoped to this URL');
const condition = await challenge.json();
assert.equal(condition.enabled, true);
assert.equal(condition.testOnly, true);
assert.equal(condition.fixtureOnly, true);
assert.equal(typeof condition.nonce, 'string');
const cookies = challenge.headers.getSetCookie();
const intake = cookies.find(header => header.startsWith('labsync-intake='));
assert.match(intake ?? '', /; secure/i);
assert.match(intake ?? '', /; httponly/i);
const cookie = cookies.map(header => header.split(';')[0]).join('; ');
await delay(1700);

const id = randomUUID();
const input = {
  id, nonce: condition.nonce, email: 'preview-fixture@example.invalid',
  name: '', organization: '', calendarCount: '2–5',
  message: 'LabSync Preview 파일럿 문의 접수 테스트입니다.',
  source: 'unspecified', website: '', consent: true,
};
const endpoint = endpointFor('/api/inquiries');
const headers = { Cookie: cookie, Origin: origin, 'Content-Type': 'application/json' };
const submit = (data) => fetch(endpoint, {
  ...options, method: 'POST', headers, body: JSON.stringify(data),
});
assert.equal((await fetch(endpoint, { ...options, headers })).status, 401, 'Anonymous reads should be blocked');
const rejected = await submit({ ...input, email: 'different-fixture@example.invalid' });
assert.equal(rejected.status, 400);
assert.equal((await rejected.json()).error, 'inquiry/preview-fixture-required');
const saved = await submit(input);
assert.equal(saved.status, 201, 'Expected a new storage receipt');
assert.deepEqual(await saved.json(), { id, duplicate: false, testOnly: true });
const retry = await submit(input);
assert.equal(retry.status, 200);
assert.deepEqual(await retry.json(), { id, duplicate: true, testOnly: true });
console.log('PASS: hosted fixture-only intake, committed receipt, duplicate retry, anonymous read blocked.');

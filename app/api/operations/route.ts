import {
  checkPreviewStorage, isCloudOperationsPreview, openPreviewLab,
  OperationsError, operationsServices, readOperations, verifyOperationsUser, writeOperations,
} from '@/lib/operations-server';
import { readJsonObject } from '@/lib/request-body';

export const runtime = 'nodejs';
const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex', 'Referrer-Policy': 'no-referrer' };
const reply = (body: object, status = 200) => Response.json(body, { status, headers });

async function handle(request: Request) {
  const url = new URL(request.url);
  const write = request.method === 'POST';
  if (!write && url.searchParams.get('preview') === 'readiness' && isCloudOperationsPreview()) {
    try { return reply(await checkPreviewStorage()); }
    catch { return reply({ ready: false }, 503); }
  }
  const token = request.headers.get('authorization');
  if (!token) return reply({ error: 'auth/required' }, 401);
  if (write && request.headers.get('origin') !== (process.env.OPERATIONS_ORIGIN || url.origin)) {
    return reply({ error: 'operations/invalid-origin' }, 403);
  }
  try {
    const { db, auth, testOnly } = operationsServices();
    const user = await verifyOperationsUser(request, auth);
    if (!write) return reply({ ...await readOperations(db, user, url.searchParams), testOnly, canOpenPreviewLab: isCloudOperationsPreview() && user.firebase.sign_in_provider === 'google.com' && user.email_verified === true });
    const input = await readJsonObject(request);
    if (input.status !== 200) return reply({ error: 'operations/invalid-input' }, input.status);
    if (input.value.action === 'open-preview-lab') return reply(await openPreviewLab(db, user));
    return reply({ ...await writeOperations(db, user, input.value), testOnly });
  } catch (error) {
    if (error instanceof OperationsError) return reply({ error: error.code }, error.status);
    return reply({ error: 'operations/storage-unavailable' }, 503);
  }
}

export const GET = handle;
export const POST = handle;

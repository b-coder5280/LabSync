export const requestTypes = {
  change: '예약 변경',
  cancel: '예약 취소',
  permission: '권한 요청',
  sync: '동기화·운영 오류',
  other: '기타',
};
export const requestStatuses = {
  submitted: '접수',
  reviewing: '검토 중',
  approved: '승인',
  rejected: '반려',
  completed: '처리 완료',
};
export type RequestStatus = keyof typeof requestStatuses;
export type RequestType = keyof typeof requestTypes;
export type Role = 'member' | 'admin';
export type Lab = { id: string; name: string; role: Role; plan: 'demo' | 'pilot' | 'managed' };
export type RequestFields = {
  type: RequestType; calendar: string; scheduledAt: string; desiredAt: string; reason: string; contact: string;
};
export type LabRequest = RequestFields & {
  id: string; status: RequestStatus; createdAt: string; version: number; own: boolean;
};
export type RequestEvent = { status: RequestStatus; note: string; at: string };

const transitions: Record<RequestStatus, RequestStatus[]> = {
  submitted: ['reviewing', 'approved', 'rejected'],
  reviewing: ['approved', 'rejected'],
  approved: ['completed'],
  rejected: [],
  completed: [],
};

export function nextStatuses(status: RequestStatus) {
  return transitions[status];
}

export function isStatus(value: unknown): value is RequestStatus {
  return typeof value === 'string' && Object.hasOwn(requestStatuses, value);
}

export function validId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9-]{0,63}$/.test(value);
}

export function validUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);
}

export function textField(value: unknown, max: number, min = 0) {
  if (typeof value !== 'string' || value.length > max || /[\u0000-\u0008\u000b-\u000c\u000e-\u001f]/u.test(value)) return null;
  const clean = value.trim();
  return clean.length >= min ? clean : null;
}

export function emailField(value: unknown) {
  const clean = textField(value, 254, 3);
  return clean && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean) ? clean.toLowerCase() : null;
}

function localTime(value: unknown) {
  if (value === '' || value === undefined) return '';
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(value + ':00.000Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 16) === value ? value : null;
}

export function parseRequest(input: Record<string, unknown>): RequestFields | null {
  const type = input.type;
  if (typeof type !== 'string' || !Object.hasOwn(requestTypes, type)) return null;
  const calendar = textField(input.calendar, 120, 1);
  const reason = textField(input.reason, 1000, 5);
  const contact = emailField(input.contact);
  const scheduledAt = localTime(input.scheduledAt);
  const desiredAt = type === 'change' ? localTime(input.desiredAt) : '';
  if (!calendar || !reason || !contact || scheduledAt === null || desiredAt === null) return null;
  if (type === 'cancel' && !scheduledAt || type === 'change' && (!scheduledAt || !desiredAt || scheduledAt === desiredAt)) return null;
  return { type: type as RequestType, calendar, reason, contact, scheduledAt, desiredAt };
}

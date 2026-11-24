export const inquirySources = { search: '검색', ai: 'AI 답변', referral: '지인 소개', other: '기타', unspecified: '선택 안 함' };
export type Inquiry = { email: string; name: string; organization: string; calendarCount: string; message: string; consent: true; source?: keyof typeof inquirySources };
export const previewInquiry = {
  email: 'preview-fixture@example.invalid',
  name: '',
  organization: '',
  calendarCount: '2–5',
  message: 'LabSync Preview 파일럿 문의 접수 테스트입니다.',
  source: 'unspecified',
  website: '',
};

export function parseInquiry(value: unknown): Inquiry | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  const text = (key: string, max: number) => typeof v[key] === 'string' && v[key].length <= max && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v[key] as string) ? (v[key] as string).trim() : null;
  const email = text('email', 254), name = text('name', 80), organization = text('organization', 120), message = text('message', 2000);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || name === null || organization === null || !message || message.length < 10 || v.consent !== true || !['1', '2–5', '6+', '미정'].includes(String(v.calendarCount))) return null;
  if (v.source !== undefined && (typeof v.source !== 'string' || !Object.hasOwn(inquirySources, v.source))) return null;
  return { email: email.toLowerCase(), name, organization, message, calendarCount: String(v.calendarCount), consent: true, ...(v.source && v.source !== 'unspecified' ? { source: v.source as keyof typeof inquirySources } : {}) };
}

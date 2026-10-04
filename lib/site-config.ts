function httpUrl(value: string | undefined) {
  if (!value) return undefined;
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) ? url.href : undefined; } catch { return undefined; }
}
const contactUrl = httpUrl(process.env.NEXT_PUBLIC_CONTACT_URL);
const rawEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
const contactEmail = rawEmail && /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(rawEmail) ? rawEmail : undefined;
export const siteConfig = {
  brandName: "LabSync",
  title: "LabSync | 연구실 공용장비 Google Calendar 운영",
  headline: "공용장비 예약은 그대로. 운영 문제는 LabSync가 맡습니다.",
  headlineLead: "공용장비 예약은 그대로.",
  description: "Google Calendar를 사용하는 연구실의 공용장비 예약 변경, 취소, 권한 및 운영 문제를 대신 처리하는 managed service.",
  pilotPrice: "₩300,000", pilotCalendarLimit: 5, pilotObservationPeriod: "6주",
  serviceHours: "월–금 09:00–18:00 KST", ackTarget: "영업시간 기준 4시간 이내 접수 확인 목표",
  cta: "6주 Paid Pilot 문의하기", contactUrl, contactEmail,
  contactHref: contactUrl || (contactEmail ? `mailto:${contactEmail}?subject=${encodeURIComponent("LabSync Paid Pilot 문의")}` : undefined),
  siteUrl: httpUrl(process.env.NEXT_PUBLIC_SITE_URL),
};

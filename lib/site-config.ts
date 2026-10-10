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
  headline: "장비 예약은 그대로, 운영은 더 간단하게.",
  headlineLead: "공용장비 예약은 그대로.",
  description: "기존 Google Calendar를 유지하면서 예약 변경, 접근 권한, 운영 오류 대응에 드는 연구실의 수작업을 줄입니다.",
  pilotPrice: "₩300,000", pilotCalendarLimit: 5, pilotObservationPeriod: "6주",
  serviceHours: "월–금 09:00–18:00 KST", ackTarget: "영업시간 기준 4시간 이내 접수 확인 목표",
  cta: "파일럿 문의하기", contactUrl, contactEmail,
  contactHref: contactUrl || (contactEmail ? `mailto:${contactEmail}?subject=${encodeURIComponent("LabSync Paid Pilot 문의")}` : undefined),
  siteUrl: httpUrl(process.env.NEXT_PUBLIC_SITE_URL),
};

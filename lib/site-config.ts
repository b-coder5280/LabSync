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
  headline: "공용장비 예약은 그대로. 운영 요청은 LabSync로.",
  headlineLead: "공용장비 예약은 그대로.",
  description: "공용장비 Google Calendar의 변경·취소·권한·오류를 채팅하듯 요청하세요. LabSync 운영자가 요청과 현재 상태를 확인하고 처리 결과까지 검증합니다.",
  pilotPrice: "₩300,000", pilotCalendarLimit: 5, pilotObservationPeriod: "6주",
  serviceHours: "월–금 09:00–18:00 KST", ackTarget: "영업시간 기준 4시간 이내 접수 확인 목표",
  cta: "6주 Paid Pilot 문의하기", contactUrl, contactEmail,
  contactHref: contactUrl || (contactEmail ? `mailto:${contactEmail}?subject=${encodeURIComponent("LabSync Paid Pilot 문의")}` : undefined),
  siteUrl: httpUrl(process.env.NEXT_PUBLIC_SITE_URL),
};

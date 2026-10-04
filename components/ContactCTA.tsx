import { siteConfig as s } from "@/lib/site-config";
export function ContactCTA({ label = s.cta }: { label?: string }) {
  const content = <>{label}<span aria-hidden="true">↗</span></>;
  // TODO: Set NEXT_PUBLIC_CONTACT_URL (preferred) or NEXT_PUBLIC_CONTACT_EMAIL.
  // Keep the requested visual without implying that an inquiry was submitted.
  if (!s.contactHref) {
    return <button className="cta" type="button" disabled aria-label={`${label} — 문의 링크 설정 전`} title="문의 링크 설정 전">{content}</button>;
  }
  return <a className="cta" href={s.contactHref}>{content}</a>;
}

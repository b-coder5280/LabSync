import { siteConfig as s } from "@/lib/site-config";
export function ContactCTA({ label = s.cta }: { label?: string }) {
  const content = <>{label}<span aria-hidden="true">↗</span></>;
  if (!s.contactHref) {
    return <a className="cta" href="#contact-status">{content}</a>;
  }
  return <a className="cta" href={s.contactHref}>{content}</a>;
}

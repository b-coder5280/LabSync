import { siteConfig as s } from "@/lib/site-config";
export function ContactCTA() {
  return <a className="cta" href={s.contactHref || "#contact-status"}>{s.cta}<span aria-hidden="true">↗</span></a>;
}

"use client";
import { siteConfig as s } from "@/lib/site-config";
import { track } from "@/lib/analytics-client";
export function ContactCTA({ label = s.cta }: { label?: string }) {
  const content = <>{label}<span aria-hidden="true">↗</span></>;
  if (!s.contactHref) {
    return <a className="cta" href="#contact-status">{content}</a>;
  }
  return <a className="cta" href={s.contactHref} onClick={() => track('pilot_inquiry_click')}>{content}</a>;
}

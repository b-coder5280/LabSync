"use client";
import { siteConfig as s } from "@/lib/site-config";
import { track } from "@/lib/analytics-client";
export function ContactCTA({ label = s.cta }: { label?: string }) {
  const content = <>{label}<span aria-hidden="true">↗</span></>;
  return <a className="cta" href="#contact" onClick={() => track('pilot_inquiry_click')}>{content}</a>;
}

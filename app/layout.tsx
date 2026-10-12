import type { Metadata } from "next";
import { siteConfig as s } from "@/lib/site-config";
import "./globals.css";
import "./assistant.css";
import "./refinements.css";
import "./readiness.css";
import "./release.css";
import { canonicalOrigin } from '@/lib/seo';
import { AnalyticsConsent } from '@/components/AnalyticsConsent';
export const metadata: Metadata = {
  title: s.title, description: s.description,
  metadataBase: new URL(canonicalOrigin()), alternates: { canonical: '/' },
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined, other: { 'naver-site-verification': process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION || [] } },
  openGraph: { title: s.title, description: s.description, locale: "ko_KR", type: "website", ...(s.siteUrl ? { url: s.siteUrl } : {}) },
  twitter: { card: "summary_large_image", title: s.title, description: s.description },
  icons: { icon: "/icon.svg" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body data-clarity-mask="true">{children}<AnalyticsConsent /></body></html>;
}

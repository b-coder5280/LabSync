import type { Metadata } from "next";
import { siteConfig as s } from "@/lib/site-config";
import "./globals.css";
import "./assistant.css";
import "./refinements.css";
export const metadata: Metadata = {
  title: s.title, description: s.description,
  ...(s.siteUrl ? { metadataBase: new URL(s.siteUrl), alternates: { canonical: s.siteUrl } } : {}),
  openGraph: { title: s.title, description: s.description, locale: "ko_KR", type: "website", ...(s.siteUrl ? { url: s.siteUrl } : {}) },
  twitter: { card: "summary_large_image", title: s.title, description: s.description },
  icons: { icon: "/icon.svg" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}

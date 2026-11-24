import Link from 'next/link';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

export function PublicPage({ title, children }: { title: string; children: React.ReactNode }) {
  return <><a className="skip-link" href="#main">본문으로 바로가기</a><SiteHeader />
    <main className="legal-page container" id="main">
      <Link className="back-link" href="/">← LabSync 홈페이지</Link>
      <h1>{title}</h1>{children}
    </main><SiteFooter /></>;
}

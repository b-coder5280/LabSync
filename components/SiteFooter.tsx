import Link from 'next/link';
import { AnalyticsSettingsButton } from './AnalyticsConsent';
export function SiteFooter() {
  return <footer className="site-footer"><div className="container footer-grid"><div><Link className="wordmark" href="/">Lab<span className="brand-link" aria-hidden="true" />Sync</Link><p>공용장비 예약은 익숙하게.<br />반복되는 운영은 함께.</p></div><div><p>대표 이동빈 · Lee Dongbin</p><a href="mailto:dongbeen@gm.gist.ac.kr">dongbeen@gm.gist.ac.kr</a><p>© 2026 LabSync</p></div><nav aria-label="정책 및 설정"><Link href="/privacy">개인정보처리방침 · 초안</Link><Link href="/terms">파일럿 이용 안내 · 초안</Link><AnalyticsSettingsButton /></nav></div></footer>;
}

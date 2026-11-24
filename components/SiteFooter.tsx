import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { AnalyticsSettingsButton } from './AnalyticsConsent';
export function SiteFooter() {
  return <footer className="site-footer"><div className="container footer-grid"><div><Link className="wordmark" href="/">Lab<span className="brand-link" aria-hidden="true" />Sync</Link><p>공용장비 예약은 익숙하게.<br />반복되는 운영은 함께.</p></div><div><p>대표 이동빈 · Lee Dongbin</p><a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a><p>© 2026 LabSync</p></div><nav aria-label="정책 및 설정"><Link href="/pricing">파일럿 요금</Link><Link href="/faq">FAQ</Link><Link href="/privacy">개인정보 안내</Link><Link href="/terms">이용조건</Link><Link href="/refund">취소·환불</Link><Link href="/account-deletion">계정 삭제 신청</Link><AnalyticsSettingsButton /></nav></div></footer>;
}

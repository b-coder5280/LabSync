"use client";
import { useEffect, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

type TrackingWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; clarity?: ((...args: unknown[]) => void) & { q?: unknown[][] }; [key: `ga-disable-${string}`]: boolean | undefined };
const ga = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || '';
const clarity = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || '';
const enabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true' && process.env.NEXT_PUBLIC_PRIVACY_APPROVED === 'true';
const validGa = /^G-[A-Z0-9]+$/.test(ga);
const validClarity = /^[a-z0-9]+$/.test(clarity);
const key = 'labsync:analytics-consent:v1';
function readConsent() { try { const value = localStorage.getItem(key); return value === 'granted' || value === 'denied' ? value : null; } catch { return null; } }
function subscribeConsent(callback: () => void) {
  function changed(event: Event) {
    if (event instanceof StorageEvent && event.key === key && event.newValue !== 'granted' && (document.getElementById('labsync-ga') || document.getElementById('labsync-clarity'))) { location.reload(); return; }
    callback();
  }
  window.addEventListener('storage', changed); window.addEventListener('labsync:consent-changed', changed);
  return () => { window.removeEventListener('storage', changed); window.removeEventListener('labsync:consent-changed', changed); };
}

export function AnalyticsConsent() {
  const pathname = usePathname();
  const choice = useSyncExternalStore(subscribeConsent, readConsent, () => null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    const show = () => setVisible(true);
    window.addEventListener('labsync:consent-settings', show);
    return () => window.removeEventListener('labsync:consent-settings', show);
  }, []);

  useEffect(() => {
    if (pathname !== '/' && (document.getElementById('labsync-ga') || document.getElementById('labsync-clarity'))) {
      const w = window as unknown as TrackingWindow;
      w[`ga-disable-${ga}`] = true;
      w.clarity?.('consentv2', { analytics_Storage: 'denied', ad_Storage: 'denied' });
      location.reload();
      return;
    }
    if (!enabled || choice !== 'granted' || pathname !== '/') return;
    const w = window as unknown as TrackingWindow;
    if (validGa && !document.getElementById('labsync-ga')) {
      w.dataLayer ??= [];
      // gtag expects Arguments objects in the dataLayer.
      // eslint-disable-next-line prefer-rest-params -- Google's gtag queue uses Arguments objects.
      w.gtag = function () { w.dataLayer!.push(arguments); };
      w.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      w.gtag('js', new Date());
      w.gtag('config', ga, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false,
        page_location: location.origin + '/', page_referrer: '', page_title: 'LabSync' });
      w.gtag('event', 'page_view', { page_location: location.origin + '/', page_referrer: '', page_title: 'LabSync' });
      const script = document.createElement('script'); script.id = 'labsync-ga'; script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${ga}`; document.head.appendChild(script);
    }
    // Clarity observes the browser URL; don't load it on query/hash or auth URLs.
    if (validClarity && !location.search && !location.hash && !document.getElementById('labsync-clarity')) {
      w.clarity ??= Object.assign((...args: unknown[]) => { w.clarity!.q!.push(args); }, { q: [] as unknown[][] });
      w.clarity('consentv2', { analytics_Storage: 'granted', ad_Storage: 'denied' });
      const script = document.createElement('script'); script.id = 'labsync-clarity'; script.async = true;
      script.src = `https://www.clarity.ms/tag/${clarity}`; document.head.appendChild(script);
    }
    const events = new Set(['pilot_inquiry_click', 'login_start', 'login_success']);
    function capture(event: Event) {
      const detail = (event as CustomEvent).detail;
      if (!detail || !events.has(detail.event)) return;
      const parameters = detail.method === 'google' || detail.method === 'kakao' ? { method: detail.method } : {};
      w.gtag?.('event', detail.event, parameters);
    }
    window.addEventListener('labsync:analytics', capture);
    return () => window.removeEventListener('labsync:analytics', capture);
  }, [choice, pathname]);

  function choose(value: 'granted' | 'denied') {
    try { localStorage.setItem(key, value); } catch { setDismissed(true); setVisible(false); return; }
    const w = window as unknown as TrackingWindow;
    if (value === 'denied') {
      w[`ga-disable-${ga}`] = true;
      w.gtag?.('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      w.clarity?.('consentv2', { analytics_Storage: 'denied', ad_Storage: 'denied' });
      // Stop running scripts as well as future collection after withdrawal.
      if (choice === 'granted') { location.reload(); return; }
    }
    window.dispatchEvent(new Event('labsync:consent-changed')); setDismissed(true); setVisible(false);
  }
  if (!visible && !(enabled && (validGa || validClarity) && choice === null && !dismissed)) return null;
  return <aside className="consent-panel" aria-label="분석 수집 설정" data-clarity-mask="true"><strong>선택적 방문 분석</strong><p>{enabled ? '동의한 경우에만 방문과 버튼 사용을 분석합니다. 동의하지 않아도 로그인과 문의를 이용할 수 있습니다.' : '현재 방문 분석 수집은 비활성 상태입니다. 정책과 설정 승인 후 선택적으로 제공할 예정입니다.'}</p><Link href="/privacy">개인정보처리방침 초안 보기</Link><div>{enabled && <button type="button" className="secondary-button" onClick={() => choose('granted')}>분석 동의</button>}<button type="button" className="secondary-button" onClick={() => choose('denied')}>{enabled ? '동의하지 않음 / 철회' : '닫기'}</button></div></aside>;
}
export function AnalyticsSettingsButton() {
  return <button type="button" className="text-button" onClick={() => window.dispatchEvent(new Event('labsync:consent-settings'))}>분석 수집 설정</button>;
}

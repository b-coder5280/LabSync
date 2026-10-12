export type AnalyticsEvent = 'pilot_inquiry_click' | 'login_start' | 'login_success';
export function track(event: AnalyticsEvent, method?: 'google' | 'kakao') {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('labsync:analytics', { detail: { event, method } }));
}

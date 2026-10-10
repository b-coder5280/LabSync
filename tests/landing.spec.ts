import { test, expect } from '@playwright/test';
import { authErrorMessage } from '../lib/auth-errors';
import { firebaseConfigured, getClientAuth } from '../lib/firebase-client';

for (const width of [375, 768, 1440]) {
  test(`landing and request regression at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('h1')).toHaveText('장비 예약은 그대로,운영은 더간단하게.');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('button', { name: 'Google로 로그인', exact: true })).toBeEnabled();
    for (const cta of await page.locator('.cta').all()) {
      await expect(cta).toHaveText('파일럿 문의하기↗');
      await expect(cta).toHaveAttribute('href', /^mailto:dongbeen@gm\.gist\.ac\.kr\?subject=/);
    }
    const anchors = await page.locator('a[href^="#"]').evaluateAll(links => links.map(link => link.getAttribute('href')));
    for (const href of anchors) if (href) await expect(page.locator(href)).toHaveCount(1);
    await page.screenshot({ path: `artifacts/landing-${width}.png`, fullPage: true });
    await page.screenshot({ path: `artifacts/hero-${width}.png` });
    if (width <= 800) {
      const menu = page.getByRole('button', { name: '메뉴 열기' });
      await menu.click();
      await expect(page.getByRole('button', { name: '메뉴 닫기' })).toHaveAttribute('aria-expanded', 'true');
      await page.getByRole('navigation').getByRole('link', { name: '파일럿 안내' }).click();
      await expect(page.getByRole('navigation')).toBeHidden();
      await expect(page).toHaveURL(/#pilot$/);
    }
    await page.locator('.secondary-button').click();
    await expect(page).toHaveURL(/#how-it-works$/);
    await expect(page.locator('#how-title')).toBeInViewport();
    const demo = page.locator('#request-assistant .assistant');
    const mutations: string[] = [];
    page.on('request', request => { if (request.method() !== 'GET' && !request.url().includes('googleapis.com')) mutations.push(request.url()); });
    for (const type of ['예약 시간 변경', '예약 취소', 'Calendar 권한', '운영 오류']) {
      await demo.getByRole('button', { name: '처음부터' }).click();
      await demo.getByRole('button', { name: type, exact: true }).click();
      await demo.getByRole('button', { name: 'SEM-2', exact: true }).click();
      if (type === '예약 시간 변경') await demo.getByLabel('변경할 시간').selectOption('17:00–18:00');
      await demo.getByRole('button', { name: '요청 요약 확인' }).click();
      await expect(demo.locator('.assistant-summary')).toContainText('SEM-2');
      await demo.getByRole('button', { name: '이전 단계' }).click();
      await demo.getByRole('button', { name: '요청 요약 확인' }).click();
      await demo.getByRole('button', { name: '요청 보내기' }).click();
      await expect(demo.getByRole('status')).toContainText('실제 요청은 전송되지 않았습니다.');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    expect(mutations).toEqual([]);
    await page.reload();
    await expect(demo.locator('h3')).toHaveText('무엇을 도와드릴까요?');
    expect(errors).toEqual([]);
    expect((await page.request.get('/icon.svg')).ok()).toBe(true);
  });
}

test('keyboard skip link and visible focus', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: '본문으로 바로가기' })).toBeFocused();
  expect(await page.locator('.skip-link').evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe('none');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});

test('blocked popup is reported by the Firebase SDK and can be retried', async ({ page }) => {
  test.skip(process.env.LABSYNC_AUTH_READY !== '1', 'Requires enabled Firebase Authentication and network access; not a simulated login.');
  await page.addInitScript(() => { window.open = () => null; });
  await page.goto('/#pilot');
  const login = page.getByRole('button', { name: 'Google로 로그인', exact: true });
  await login.click();
  await expect(page.getByRole('status')).toContainText('팝업이 차단되었습니다.');
  await expect(login).toBeEnabled();
  await expect(page).toHaveURL(/#pilot$/);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('status')).toHaveCount(0);
});

test('auth failures are actionable without exposing raw errors', () => {
  for (const [code, text] of [
    ['auth/popup-closed-by-user', '취소'], ['auth/popup-blocked', '팝업'],
    ['auth/network-request-failed', '네트워크'], ['auth/unauthorized-domain', '현재 주소'],
    ['auth/invalid-auth-event', '인증 응답'], ['auth/user-token-expired', '만료'],
    ['auth/web-storage-unsupported', '저장소'],
    ['auth/configuration-not-found', '인증 설정'],
  ]) expect(authErrorMessage({ code })).toContain(text);
  expect(authErrorMessage(new Error('private detail'))).not.toContain('private detail');
});

test('missing web configuration fails before initializing Firebase', () => {
  test.skip(firebaseConfigured, 'This check requires a test process without Firebase environment variables.');
  expect(() => getClientAuth()).toThrow('auth/configuration-missing');
});

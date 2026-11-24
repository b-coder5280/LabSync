import { test, expect } from '@playwright/test';

test('public SEO, draft policies and disabled integrations', async ({ page, request }) => {
  const external: string[] = [];
  page.on('request', req => { if (/googletagmanager|google-analytics|clarity\.ms/.test(req.url())) external.push(req.url()); });
  await page.goto('/');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\/labsync-pink\.vercel\.app\/?$/);
  const data = await page.locator('script[type="application/ld+json"]').textContent();
  expect(JSON.parse(data!)['@graph'].map((item: { '@type': string }) => item['@type'])).toEqual(['Organization', 'Service', 'FAQPage']);
  await page.getByRole('button', { name: '로그인', exact: true }).click();
  await expect(page.locator('#signin-panel').getByRole('button', { name: 'Google로 로그인' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'LINE으로 로그인' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: '카카오로 로그인' })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '분석 수집 설정' }).click();
  await expect(page.getByRole('complementary', { name: '분석 수집 설정' })).toContainText('비활성');
  await page.getByRole('button', { name: '닫기', exact: true }).click();
  expect(external).toEqual([]);
  expect((await request.get('/robots.txt')).status()).toBe(200);
  expect(await (await request.get('/sitemap.xml')).text()).toContain('https://labsync-pink.vercel.app/');
  for (const path of ['/privacy', '/terms']) {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(page.locator('main')).toContainText('승인 전 초안');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect((await request.get('/api/auth/kakao/start')).status()).toBe(503);
  expect((await request.get('/api/auth/kakao/callback?state=forged&code=forged')).status()).toBe(503);
  expect((await request.post('/api/auth/kakao/session')).status()).toBe(503);
  expect(await (await request.get('/api/auth/kakao/status')).json()).toEqual({ enabled: false });
});

test('enabled providers are shown inside the login menu', async ({ page }) => {
  await page.route('**/api/auth/kakao/status', route => route.fulfill({ json: { enabled: true } }));
  await page.route('**/api/auth/line/status', route => route.fulfill({ json: { enabled: true } }));
  await page.goto('/');
  await expect(page.getByRole('link', { name: '카카오로 로그인' })).toHaveCount(0);
  await page.getByRole('button', { name: '로그인', exact: true }).click();
  const panel = page.locator('#signin-panel');
  await expect(panel.getByRole('button', { name: 'Google로 로그인' })).toBeVisible();
  await expect(panel.getByRole('link', { name: '카카오로 로그인' })).toBeVisible();
  await expect(panel.getByRole('button', { name: 'LINE으로 로그인' })).toBeVisible();
});

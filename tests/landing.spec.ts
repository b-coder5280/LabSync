import { test, expect } from '@playwright/test';
for (const width of [375, 768, 1440]) {
  test(`landing at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if(message.type() === 'error') errors.push(message.text()); });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(page).toHaveTitle('LabSync | 연구실 공용장비 Google Calendar 운영');
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
    const anchors = await page.locator('a[href^="#"]').evaluateAll(links => links.map(link => link.getAttribute('href')));
    for (const href of anchors) { if (href && href !== '#') await expect(page.locator(href)).toHaveCount(1); }
    await expect(page.locator('.cta')).toHaveCount(4);
    await expect(page.locator('.hero .cta')).toContainText('6주 Paid Pilot 문의하기');
    for (const cta of await page.locator('.cta').all()) {
      if (await cta.evaluate(element => element.tagName === 'BUTTON')) {
        await expect(cta).toBeDisabled();
      } else {
        await expect(cta).toHaveAttribute('href', /^(https?:\/\/|mailto:)/);
      }
    }
    await expect(page.locator('.operation figcaption')).toContainText('OPERATION EXAMPLE');
    await expect(page.locator('.time-before')).toContainText('15:00 — 16:00');
    await expect(page.locator('.time-after')).toContainText('16:00 — 17:00');
    await expect(page.locator('.request-status')).toContainText('Verified');
    await expect(page.locator('.price')).toHaveText('₩300,000');
    await expect(page.locator('.included-list')).toContainText('자동 갱신 없음');
    await expect(page.locator('main > section')).toHaveCount(5);
    await expect(page.locator('#contact-status')).toHaveCount(0);
    await page.screenshot({ path: `artifacts/redesign-${width}.png`, fullPage: true });
    await page.screenshot({ path: `artifacts/redesign-hero-${width}.png` });
    await page.locator('#pilot').evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await page.screenshot({ path: `artifacts/redesign-pilot-${width}.png` });
    expect(errors).toEqual([]);
    const image = await page.request.get('/opengraph-image.png');
    expect(image.ok()).toBe(true);
    expect(image.headers()['content-type']).toContain('image/png');
    expect((await page.request.get('/icon.svg')).ok()).toBe(true);
  });
}

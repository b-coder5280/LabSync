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
    await expect(page.locator('.cta')).toHaveCount(5);
    await expect(page.locator('.hero .cta')).toContainText('6주 Paid Pilot 문의하기');
    for (const cta of await page.locator('.cta').all()) {
      if (await cta.evaluate(element => element.tagName === 'BUTTON')) {
        await expect(cta).toBeDisabled();
      } else {
        await expect(cta).toHaveAttribute('href', /^(https?:\/\/|mailto:)/);
      }
    }
    await expect(page.locator('.preview-badge')).toHaveCount(2);
    await expect(page.locator('.assistant-disclaimer').first()).toContainText('LabSync 운영자가 요청과 권한을 확인한 뒤 처리합니다.');
    await expect(page.locator('.price')).toHaveText('₩300,000');
    await expect(page.locator('.included-list')).toContainText('자동 갱신 없음');
    await expect(page.locator('main > section')).toHaveCount(8);
    await expect(page.locator('#contact-status')).toHaveCount(0);
    await page.screenshot({ path: `artifacts/assistant-${width}.png`, fullPage: true });
    await page.screenshot({ path: `artifacts/assistant-hero-${width}.png` });
    const demo = page.locator('.hero .assistant');
    const network: string[] = [];
    page.on('request', request => { if (['fetch', 'xhr'].includes(request.resourceType()) || request.method() !== 'GET') network.push(request.url()); });
    for (const type of ['예약 시간 변경', '예약 취소', 'Calendar 권한', '운영 오류']) {
      await demo.getByRole('button', {name: '처음부터'}).click();
      await demo.getByRole('button', {name: type, exact: true}).click();
      await demo.getByRole('button', {name: 'SEM-2', exact: true}).click();
      if (type === '예약 시간 변경') {
        await demo.getByLabel('변경할 시간').selectOption('17:00–18:00');
      }
      await demo.getByRole('button', {name: '요청 요약 확인'}).click();
      await expect(demo.locator('.assistant-summary')).toContainText('SEM-2');
      if (type === '예약 시간 변경') await expect(demo.locator('.assistant-summary')).toContainText('17:00–18:00');
      await demo.getByRole('button', {name: '이전 단계'}).click();
      await demo.getByRole('button', {name: '요청 요약 확인'}).click();
      await demo.getByRole('button', {name: '요청 보내기'}).click();
      await expect(demo.getByRole('status')).toContainText('실제 요청은 전송되지 않았습니다.');
      await expect(page.locator('#request-assistant .assistant h3')).toHaveText('요청 내용을 확인해 주세요.');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
    await demo.screenshot({path: `artifacts/assistant-complete-${width}.png`});
    expect(network).toEqual([]);
    expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
    await page.locator('.preview-link').click();
    await expect(page).toHaveURL(/#request-assistant$/);
    await expect(page.locator('#usage-title')).toBeInViewport();
    await page.reload();
    await expect(demo.locator('h3')).toHaveText('무엇을 도와드릴까요?');
    await page.locator('#pilot').evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await page.screenshot({ path: `artifacts/assistant-pilot-${width}.png` });
    expect(errors).toEqual([]);
    const image = await page.request.get('/opengraph-image.png');
    expect(image.ok()).toBe(true);
    expect(image.headers()['content-type']).toContain('image/png');
    expect((await page.request.get('/icon.svg')).ok()).toBe(true);
  });
}

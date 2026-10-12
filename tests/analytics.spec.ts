import { test, expect } from '@playwright/test';
test('isolated analytics consent, allowlist and withdrawal', async ({ page }) => {
  test.skip(process.env.ANALYTICS_FIXTURE !== '1', 'Requires isolated 3102 fixture with fake IDs');
  const scripts: string[] = [];
  await page.route(/https:\/\/.*(googletagmanager|google-analytics|clarity\.ms).*/, async route => {
    scripts.push(route.request().url());
    await route.fulfill({ contentType: 'application/javascript', body: '/* no external collection */' });
  });
  await page.goto('http://localhost:3102/');
  await expect(page.getByRole('button', { name: '분석 동의', exact: true })).toBeVisible();
  expect(scripts).toEqual([]);
  await page.getByRole('button', { name: '분석 동의', exact: true }).click();
  await expect.poll(() => scripts.length).toBe(2);
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('labsync:analytics', { detail: { event: 'pilot_inquiry_click', email: 'never-send@example.invalid', token: 'never-send' } }));
    window.dispatchEvent(new CustomEvent('labsync:analytics', { detail: { event: 'unapproved_event' } }));
  });
  const queue = await page.evaluate(() => JSON.stringify((window as Window & { dataLayer?: unknown[] }).dataLayer));
  expect(queue).toContain('pilot_inquiry_click');
  expect(queue).not.toMatch(/never-send|unapproved_event/);
  expect((queue.match(/page_view/g) || []).length).toBe(2);
  await page.getByRole('button', { name: '분석 수집 설정' }).click();
  await page.getByRole('button', { name: '동의하지 않음 / 철회' }).click();
  await expect(page.locator('#labsync-ga, #labsync-clarity')).toHaveCount(0);
  expect(scripts.length).toBe(2);
});

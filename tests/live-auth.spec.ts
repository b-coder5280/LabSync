import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

test.describe('live Firebase configuration and Google popup', () => {
  test.skip(process.env.LABSYNC_AUTH_READY !== '1', 'Requires network access and the actual Firebase web configuration.');

  test('Firebase configuration recognizes local and production domains', async ({ request }) => {
    const local = Object.fromEntries(readFileSync('.env.local', 'utf8').split(/\r?\n/).filter(line => line.includes('=')).map(line => {
      const split = line.indexOf('=');
      return [line.slice(0, split), line.slice(split + 1)];
    }));
    const response = await request.get('https://identitytoolkit.googleapis.com/v1/projects', {
      params: { key: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || local.NEXT_PUBLIC_FIREBASE_API_KEY },
    });
    expect(response.status()).toBe(200);
    const configuration = await response.json();
    expect(configuration.authorizedDomains).toEqual(expect.arrayContaining(['localhost', 'labsync-pink.vercel.app']));
  });

  test('Google identity popup can be cancelled and reopened without losing the page', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/?source=auth-check#pilot');
    for (let attempt = 0; attempt < 2; attempt++) {
      const popupPromise = page.waitForEvent('popup');
      await page.getByRole('button', { name: 'Google로 로그인', exact: true }).click();
      await expect(page.getByRole('button', { name: '로그인 중…', exact: true })).toBeDisabled();
      const popup = await popupPromise;
      await popup.waitForURL(url => url.hostname === 'accounts.google.com', { timeout: 25000 });
      const destination = new URL(popup.url());
      expect(destination.searchParams.get('scope')).not.toMatch(/calendar/i);
      expect(destination.searchParams.get('redirect_uri')).toBe('https://labsync-80acb.firebaseapp.com/__/auth/handler');
      await popup.close();
      await expect(page.getByRole('status')).toContainText('로그인이 취소되었습니다.', { timeout: 15000 });
      await expect(page.getByRole('button', { name: 'Google로 로그인', exact: true })).toBeEnabled();
      await expect(page).toHaveURL(/\?source=auth-check#pilot$/);
      await expect(page.locator('#account-panel')).toHaveCount(0);
    }
  });
});

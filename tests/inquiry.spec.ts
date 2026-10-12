import { test, expect } from '@playwright/test';

test('guided inquiry validates, preserves values on failure, and blocks duplicate clicks', async ({ page }) => {
  test.skip(process.env.INQUIRY_EMULATOR_READY !== '1', 'Requires approved local emulator preview; never live collection.');
  await page.goto('/#contact');
  const form = page.locator('.intake');
  await form.getByRole('button', { name: '다음' }).click();
  await expect(form.getByRole('heading')).toHaveText('어떤 운영 부담이 있나요?');
  await form.getByLabel('운영상 어려움 또는 문의').fill('Synthetic inquiry used only for validation testing.');
  await form.getByRole('button', { name: '다음' }).click();
  await form.getByLabel('이메일').fill('invalid');
  await form.getByRole('button', { name: '다음' }).click();
  await expect(form.getByRole('heading')).toHaveText('답변받을 연락처를 알려주세요.');
  await form.getByLabel('이메일').fill('retry@example.invalid');
  await form.getByRole('button', { name: '다음' }).click();
  await form.getByRole('checkbox').check();
  let requests = 0;
  let release: (() => void) | undefined;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/inquiries', async route => { requests++; await pending; await route.fulfill({ status:503, contentType:'application/json', body:JSON.stringify({error:'inquiry/storage-unavailable'}) }); });
  await form.getByRole('button', { name: '테스트 문의 저장' }).click();
  await expect(form.getByRole('button', { name: '저장 확인 중…' })).toBeDisabled();
  release!();
  await expect(form.getByRole('alert')).toContainText('저장하지 못했습니다');
  expect(requests).toBe(1);
  await expect(form).toContainText('retry@example.invalid');
  await expect(form.getByRole('status')).toHaveCount(0);
});

test('disabled intake guides to actual email without claiming receipt', async ({ page }) => {
  await page.route('**/api/inquiries/status', route => route.fulfill({ json: { enabled:false } }));
  await page.goto('/');
  await page.getByRole('link', { name: '파일럿 문의하기' }).first().click();
  await expect(page).toHaveURL(/#contact$/);
  const form=page.locator('.intake');
  await expect(form).toContainText('현재 웹 접수는 준비 중');
  await form.getByLabel('운영상 어려움 또는 문의').fill('Synthetic inquiry for email handoff.');
  await form.getByRole('button', { name:'다음' }).click();
  await form.getByLabel('이메일').fill('fallback@example.invalid');
  await form.getByRole('button', { name:'다음' }).click();
  const link=form.getByRole('link',{name:'메일 앱에서 이어 보내기'});
  await expect(link).toHaveAttribute('href', /^mailto:dongbeen@gm\.gist\.ac\.kr\?/);
  expect(decodeURIComponent((await link.getAttribute('href'))!)).toContain('Synthetic inquiry for email handoff.');
  await expect(form.getByRole('status')).toHaveCount(0);
  await form.screenshot({path:'artifacts/oct12-inquiry-email.png'});
});

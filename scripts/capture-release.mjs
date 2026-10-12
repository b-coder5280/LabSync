import { chromium, request } from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage();
await page.goto('http://localhost:3100/',{waitUntil:'networkidle'});
for(const width of [1440,768,375]) {
  await page.setViewportSize({width,height:960});
  await page.screenshot({path:`artifacts/oct12-local-after-${width}.png`,fullPage:true});
  await page.screenshot({path:`artifacts/oct12-local-hero-${width}.png`});
}
await page.getByRole('button',{name:'다른 로그인 방법'}).click();
await page.screenshot({path:'artifacts/oct12-login-menu-375.png'});
await page.keyboard.press('Escape');
await page.locator('.intake').screenshot({path:'artifacts/oct12-intake-start.png'});
const seo=await page.evaluate(()=>({title:document.title,canonical:document.querySelector('link[rel=canonical]')?.getAttribute('href'),description:document.querySelector('meta[name=description]')?.getAttribute('content'),ogImage:document.querySelector('meta[property="og:image"]')?.getAttribute('content')}));
const api=await request.newContext();
const gate={get:(await api.get('http://localhost:3103/api/inquiries')).status(),post:(await api.post('http://localhost:3103/api/inquiries',{data:{}})).status(),status:await(await api.get('http://localhost:3103/api/inquiries/status')).json()};
if(gate.get!==503||gate.post!==503||gate.status.enabled!==false) throw new Error('Production inquiry guard failed');
const policyGate={privacy:(await api.get('http://localhost:3103/privacy')).status(),terms:(await api.get('http://localhost:3103/terms')).status()};
if(policyGate.privacy!==404||policyGate.terms!==404) throw new Error('Unapproved policy publication guard failed');
await fs.writeFile('artifacts/oct12-release-evidence.json',JSON.stringify({seo,vercelInquiryGuard:gate,policyGate},null,2));
console.log(JSON.stringify({seo,vercelInquiryGuard:gate,policyGate}));
await api.dispose();await browser.close();

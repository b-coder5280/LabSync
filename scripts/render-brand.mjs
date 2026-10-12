// Render a code-native brand asset with the same locally hosted typeface as the site.
import { chromium } from '@playwright/test';
import fs from 'node:fs';
(async () => {
  const browser = await chromium.launch({channel:'msedge',headless:true});
  const page = await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
  await page.goto('http://localhost:3100');
  const icon = fs.readFileSync('public/icon.svg','utf8');
  await page.setContent(`<style>@font-face{font-family:P;src:url(http://localhost:3100/fonts/PretendardVariable.woff2)}*{box-sizing:border-box}body{margin:0;background:#f6f8fb;color:#0b1628;font-family:P,sans-serif}.sheet{padding:64px 72px;width:1200px;height:630px;position:relative}.brand{display:flex;align-items:center;gap:16px;font-size:34px;font-weight:700}.brand svg{width:48px;height:48px}.eyebrow{margin-top:46px;color:#365f9d;font-size:18px;letter-spacing:2px}.title{font-size:62px;line-height:1.25;letter-spacing:-2px;font-weight:700;margin-top:20px}.title span{color:#285fc5}.sub{font-size:23px;color:#536177;margin-top:24px}.line{border-top:1px solid #cbd8e8;margin-top:40px;padding-top:20px;font-size:18px;display:flex;justify-content:space-between;color:#536177}</style><div class="sheet"><div class="brand">${icon}LabSync</div><div class="eyebrow">SHARED EQUIPMENT OPERATIONS</div><div class="title">예약 방식은 그대로,<br>공용장비 운영 부담은 <span>LabSync로.</span></div><div class="sub">PI·연구실 책임자를 위한 Google Calendar 운영 지원</div><div class="line"><span>예약 변경·취소 / 접근 권한 / 운영 오류 대응</span><span>6주 Paid Pilot</span></div></div>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({path:'app/opengraph-image.png'});
  await browser.close();
})();

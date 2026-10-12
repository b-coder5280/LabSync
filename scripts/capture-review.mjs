import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const report = { date: '2026-10-12', productionSha: 'UNVERIFIED', sites: {} };
for (const [name, url] of [['production', 'https://labsync-pink.vercel.app'], ['local-before', 'http://localhost:3100']]) {
  const page = await browser.newPage();
  try {
    const response = await page.goto(url, { waitUntil: 'networkidle' });
    report.sites[name] = { status: response.status(), heading: await page.locator('h1').innerText(), cta: await page.locator('.cta').evaluateAll(es => es.map(e => e.getAttribute('href'))) };
    for (const width of [1440,768,375]) {
      await page.setViewportSize({ width, height: 960 });
      await page.screenshot({ path: `artifacts/oct12-${name}-${width}.png`, fullPage: true });
    }
  } catch (e) { report.sites[name] = { error: e.message }; }
  await page.close();
}
await browser.close();
for (const path of ['commits/eb422222e44ace16f256278c2a673c8591eb22e3/status', 'deployments?per_page=3']) {
  try {
    const r = await fetch('https://api.github.com/repos/b-coder5280/LabSync/' + path);
    const body = await r.json();
    report[path] = { status: r.status, data: r.ok ? body : body.message };
  } catch (e) { report[path] = { error: e.message }; }
}
await fs.writeFile('artifacts/oct12-baseline.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));

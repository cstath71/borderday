import { chromium } from 'playwright';
import path from 'path';

const OUT = '/workspace/borderday/screenshots';
const BASE = 'http://127.0.0.1:4173';

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, name), fullPage: true });
  console.log('wrote', name);
}

const browser = await chromium.launch({ headless: true });

async function seedDemo(page) {
  await page.goto(`${BASE}/en/company/signup`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Load DEMO company/i }).click();
  await page.waitForURL(/\/company\/.+\/dashboard/);
  const url = page.url();
  const m = url.match(/\/company\/([^/]+)\/dashboard/);
  return m ? m[1] : null;
}

{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/en/`, { waitUntil: 'networkidle' });
  await shot(page, 'en-home-hr.png');
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/fr/`, { waitUntil: 'networkidle' });
  await shot(page, 'fr-home-hr.png');
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/en/`, { waitUntil: 'networkidle' });
  await shot(page, 'en-home-desktop.png');
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/en/`, { waitUntil: 'networkidle' });
  await shot(page, 'en-home.png');
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/fr/`, { waitUntil: 'networkidle' });
  await shot(page, 'fr-home.png');
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/en/pricing`, { waitUntil: 'networkidle' });
  await shot(page, 'en-pricing.png');
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/en/for-individuals`, { waitUntil: 'networkidle' });
  await shot(page, 'en-for-individuals.png');
  await ctx.close();
}

let companyId = null;
{
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 1100 } });
  const page = await ctx.newPage();
  companyId = await seedDemo(page);
  console.log('demo companyId', companyId);
  await page.waitForSelector('.employee-card');
  await shot(page, 'en-hr-dashboard-demo.png');
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  // re-seed session in this context (localStorage is per-context)
  const id = await seedDemo(page);
  await page.goto(`${BASE}/en/company/${id}/invite`, { waitUntil: 'networkidle' });
  await page.waitForSelector('form.stack-form, form.card');
  await shot(page, 'en-invite-flow.png');
  await page.locator('form input[type="email"]').fill('screenshot.invite@borderday.example');
  await page.getByRole('button', { name: /Create invite link/i }).click();
  await page.waitForSelector('input[readonly]');
  await shot(page, 'en-invite-link-created.png');
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/en/join/demo-invite-token-borderday`, { waitUntil: 'networkidle' });
  await shot(page, 'en-join-consent.png');
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/en/app`, { waitUntil: 'networkidle' });
  await page.waitForSelector('#border');
  await shot(page, 'en-app.png');
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/it/privacy`, { waitUntil: 'networkidle' });
  await shot(page, 'it-privacy.png');
  await ctx.close();
}

await browser.close();
console.log('done');

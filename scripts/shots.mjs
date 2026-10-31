import { chromium } from 'playwright';
import path from 'path';

const OUT = '/workspace/borderday/screenshots';
const BASE = 'http://127.0.0.1:4173';

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, name), fullPage: true });
  console.log('wrote', name);
}

const browser = await chromium.launch({ headless: true });

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
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/en/pricing`, { waitUntil: 'networkidle' });
  await shot(page, 'en-pricing.png');
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/de/disclaimer`, { waitUntil: 'networkidle' });
  await shot(page, 'de-disclaimer.png');
  await ctx.close();
}

{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/it/privacy`, { waitUntil: 'networkidle' });
  await shot(page, 'it-privacy.png');
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
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1100 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/en/app`, { waitUntil: 'networkidle' });
  await page.waitForSelector('#border');
  await page.selectOption('#border', 'geneva_fr');
  await page.waitForTimeout(400);

  // Ensure annual days is 240
  const annual = page.locator('input.num');
  if (await annual.count()) {
    await annual.fill('240');
    await annual.blur();
  }

  // Click Telework day type
  await page.locator('.day-type-btn').filter({ hasText: /Telework/i }).first().click();
  await page.waitForTimeout(700);

  // Wait for counter cards
  await page.waitForSelector('.counter-card');
  await page.locator('.counter-card').first().scrollIntoViewIfNeeded();
  await shot(page, 'en-app-geneva-logged.png');

  const body = await page.innerText('body');
  const interesting = body.split('\n').filter((l) =>
    /Telework share|Social|of |Within|Over|Approaching|Near|days|%|framework/i.test(l),
  );
  console.log('--- counters ---');
  console.log(interesting.slice(0, 50).join('\n'));

  if (/100%\s*of\s*40%/i.test(body) || /Over limit/i.test(body)) {
    console.error('FAIL: still showing over-limit for one day');
    process.exitCode = 1;
  } else {
    console.log('OK: no false over-limit');
  }
  await ctx.close();
}

await browser.close();

/**
 * Capture company dashboard screenshots for email assets in EN/FR/DE/IT/NL.
 * Writes public/email/dashboard-{lang}.png (~560px wide) and mirrors EN to dashboard.png.
 */
import { chromium } from 'playwright';
import { mkdirSync, copyFileSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'email');
const RAW = join(ROOT, 'screenshots');
const BASE = process.env.BD_PREVIEW || 'http://127.0.0.1:4173';
const STORAGE_KEY = 'borderday-tenant-v1';
const TARGET_W = 560;

const LOCALES = {
  en: {
    company: 'DEMO — Acme Cross-Border SA',
    owner: 'Alex Morgan',
    employees: [
      { email: 'alice.demo@borderday.example', name: 'Alice Martin (Geneva)' },
      { email: 'bruno.demo@borderday.example', name: 'Bruno Weber (Luxembourg)' },
      { email: 'chiara.demo@borderday.example', name: 'Chiara Rossi (Ticino)' },
    ],
  },
  fr: {
    company: 'DÉMO — Acme Transfrontière SA',
    owner: 'Camille Dupont',
    employees: [
      { email: 'alice.demo@borderday.example', name: 'Alice Martin (Genève)' },
      { email: 'bruno.demo@borderday.example', name: 'Bruno Lefèvre (Luxembourg)' },
      { email: 'chiara.demo@borderday.example', name: 'Chiara Rossi (Tessin)' },
    ],
  },
  de: {
    company: 'DEMO — Acme Grenzpendler AG',
    owner: 'Anna Müller',
    employees: [
      { email: 'alice.demo@borderday.example', name: 'Alice Martin (Genf)' },
      { email: 'bruno.demo@borderday.example', name: 'Bruno Weber (Luxemburg)' },
      { email: 'chiara.demo@borderday.example', name: 'Chiara Rossi (Tessin)' },
    ],
  },
  it: {
    company: 'DEMO — Acme Transfrontaliera SA',
    owner: 'Giulia Conti',
    employees: [
      { email: 'alice.demo@borderday.example', name: 'Alice Martin (Ginevra)' },
      { email: 'bruno.demo@borderday.example', name: 'Bruno Weber (Lussemburgo)' },
      { email: 'chiara.demo@borderday.example', name: 'Chiara Rossi (Ticino)' },
    ],
  },
  nl: {
    company: 'DEMO — Acme Grensoverschrijdend BV',
    owner: 'Sophie de Vries',
    employees: [
      { email: 'alice.demo@borderday.example', name: 'Alice Martin (Genève)' },
      { email: 'bruno.demo@borderday.example', name: 'Bruno Weber (Luxemburg)' },
      { email: 'chiara.demo@borderday.example', name: 'Chiara Rossi (Ticino)' },
    ],
  },
};

mkdirSync(OUT, { recursive: true });
mkdirSync(RAW, { recursive: true });

const browser = await chromium.launch({ headless: true });

for (const [lang, names] of Object.entries(LOCALES)) {
  const ctx = await browser.newContext({
    viewport: { width: 640, height: 1600 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/${lang}/demo`, { waitUntil: 'networkidle' });
  await page.waitForURL(/\/demo\/company\/.+\/dashboard/);
  await page.waitForSelector('.employee-card');

  await page.evaluate(
    ({ key, names }) => {
      const raw = localStorage.getItem(key);
      if (!raw) throw new Error('no tenant db');
      const db = JSON.parse(raw);
      const company = db.companies.find((c) => c.isDemo);
      if (company) company.name = names.company;
      const byEmail = Object.fromEntries(names.employees.map((e) => [e.email, e.name]));
      for (const p of db.profiles) {
        if (p.email === 'hr.demo@borderday.example') p.displayName = names.owner;
        if (byEmail[p.email]) p.displayName = byEmail[p.email];
      }
      localStorage.setItem(key, JSON.stringify(db));
    },
    { key: STORAGE_KEY, names },
  );
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('.employee-card');

  // Compact email crop: site chrome + notes + everything under each employee-head.
  await page.addStyleTag({
    content: `
      header, footer, .demo-banner, nav.site-nav, .lang-switch { display: none !important; }
      main, .container, .section { padding-top: 0 !important; margin-top: 0 !important; }
      body { background: #fff !important; }
      .dash-head > div > p.meta,
      .dash-head > div > p[role="note"],
      .dash-actions > p.meta,
      p.meta[role="note"],
      .dash-head + p.meta { display: none !important; }
      .employee-card > *:not(.employee-head) { display: none !important; }
      [data-testid="former-employees"],
      .filters { display: none !important; }
      .employee-card { padding: 0.65rem 0.9rem !important; margin-bottom: 0.45rem !important; }
      .dash-actions .btn, .dash-actions label { font-size: 0.85rem; }
    `,
  });
  await page.waitForTimeout(150);

  const head = page.locator('.dash-head').first();
  const list = page.locator('.employee-list').first();
  const lastHead = page.locator('.employee-card .employee-head').last();
  await lastHead.scrollIntoViewIfNeeded();
  const headBox = await head.boundingBox();
  const listBox = await list.boundingBox();
  const lastBox = await lastHead.boundingBox();
  if (!headBox || !listBox || !lastBox) throw new Error(`missing boxes for ${lang}`);
  const x = Math.max(0, Math.min(headBox.x, listBox.x) - 12);
  const y = Math.max(0, headBox.y - 8);
  const right = Math.max(headBox.x + headBox.width, listBox.x + listBox.width) + 12;
  const bottom = lastBox.y + lastBox.height + 16;
  const rawW = Math.min(page.viewportSize().width - x, right - x);
  const rawH = Math.min(bottom - y, page.viewportSize().height - y - 4);
  if (rawH < 200) throw new Error(`clip too short for ${lang}: ${rawH}`);

  const rawPath = join(RAW, `email-dashboard-${lang}-raw.png`);
  await page.screenshot({
    path: rawPath,
    clip: { x, y, width: rawW, height: rawH },
  });

  const outPath = join(OUT, `dashboard-${lang}.png`);
  await resizePng(rawPath, outPath, TARGET_W);
  const cardCount = await page.locator('.employee-card').count();
  console.log('wrote', outPath, 'cards=', cardCount, 'clipH=', Math.round(rawH));
  await ctx.close();
}

copyFileSync(join(OUT, 'dashboard-en.png'), join(OUT, 'dashboard.png'));
console.log('mirrored dashboard-en.png -> dashboard.png');
await browser.close();

async function resizePng(src, dest, width) {
  try {
    const require = createRequire(import.meta.url);
    const sharp = require('sharp');
    const img = sharp(src);
    const meta = await img.metadata();
    const h = Math.round((meta.height * width) / meta.width);
    await img.resize(width, h).png().toFile(dest);
    return;
  } catch {
    /* canvas fallback */
  }
  const b = await chromium.launch({ headless: true });
  const c = await b.newContext();
  const p = await c.newPage();
  const buf = readFileSync(src);
  const b64 = buf.toString('base64');
  await p.setContent(`<!doctype html><canvas id="c"></canvas>
    <script>
      const img = new Image();
      img.onload = () => {
        const w = ${width};
        const h = Math.round(img.height * w / img.width);
        const c = document.getElementById('c');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        window.__done = true;
      };
      img.src = 'data:image/png;base64,${b64}';
    </script>`);
  await p.waitForFunction(() => window.__done === true);
  const out = await p.evaluate(() => document.getElementById('c').toDataURL('image/png'));
  writeFileSync(dest, Buffer.from(out.split(',')[1], 'base64'));
  await b.close();
}

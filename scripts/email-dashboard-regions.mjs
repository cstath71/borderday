/**
 * Capture region-specific (employer) and multi-border (partner) company dashboard
 * screenshots for email assets. ~560px wide.
 *
 * Employer: public/email/dashboard-{region}-{lang}.png
 * Partner/multi: public/email/dashboard-{lang}.png (+ dashboard.png = EN)
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

mkdirSync(OUT, { recursive: true });
mkdirSync(RAW, { recursive: true });

function teleworkDays(year, month, count) {
  const out = [];
  let d = 1;
  while (out.length < count && d <= 28) {
    const day = String(d).padStart(2, '0');
    const m = String(month).padStart(2, '0');
    out.push({ workDate: `${year}-${m}-${day}`, dayType: 'telework' });
    d += 1;
  }
  return out;
}

function mixDays(specs) {
  // specs: [{workDate, dayType, overnightAway?}]
  return specs;
}

/** Region packs for employer emails — 3 staff on that employer's border(s). */
const REGION_SHOTS = [
  {
    region: 'geneva',
    lang: 'fr',
    company: 'DÉMO — Acme Genève SA',
    owner: 'Camille Dupont',
    employees: [
      {
        email: 'alice.demo@borderday.example',
        name: 'Sophie Martin (Annemasse)',
        border: 'geneva_fr',
        annual: 240,
        days: [
          ...teleworkDays(2026, 1, 4),
          { workDate: '2026-01-10', dayType: 'onsite' },
          { workDate: '2026-01-13', dayType: 'onsite' },
          { workDate: '2026-01-14', dayType: 'onsite' },
        ],
      },
      {
        email: 'bruno.demo@borderday.example',
        name: 'Lucas Bernard (Thonon-les-Bains)',
        border: 'geneva_fr',
        annual: 240,
        // 8 mission-style third_country days → approaching 10-day mission counter
        days: Array.from({ length: 8 }, (_, i) => ({
          workDate: `2026-02-${String(i + 2).padStart(2, '0')}`,
          dayType: 'third_country',
        })),
      },
      {
        email: 'chiara.demo@borderday.example',
        name: 'Camille Roux (Saint-Julien-en-Genevois)',
        border: 'geneva_fr',
        annual: 240,
        days: [
          { workDate: '2026-01-06', dayType: 'telework' },
          { workDate: '2026-01-07', dayType: 'onsite' },
          { workDate: '2026-01-08', dayType: 'onsite' },
          { workDate: '2026-01-09', dayType: 'onsite' },
          { workDate: '2026-03-03', dayType: 'onsite', overnightAway: true },
        ],
      },
    ],
  },
  {
    region: 'basel',
    lang: 'de',
    company: 'DEMO — Acme Basel AG',
    owner: 'Anna Müller',
    employees: [
      {
        email: 'alice.demo@borderday.example',
        name: 'Marie Schneider (Saint-Louis)',
        border: 'basel_fr',
        annual: 240,
        days: [
          ...teleworkDays(2026, 1, 5),
          { workDate: '2026-01-12', dayType: 'onsite' },
          { workDate: '2026-01-13', dayType: 'onsite' },
        ],
      },
      {
        email: 'bruno.demo@borderday.example',
        name: 'Jonas Weber (Lörrach)',
        border: 'basel_de',
        annual: 240,
        // many overnight-away → near 60 non-return
        days: Array.from({ length: 52 }, (_, i) => {
          const month = i < 28 ? 2 : 3;
          const day = (i % 28) + 1;
          return {
            workDate: `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            dayType: 'onsite',
            overnightAway: true,
          };
        }),
      },
      {
        email: 'chiara.demo@borderday.example',
        name: 'Léa Hoffmann (Huningue)',
        border: 'basel_fr',
        annual: 240,
        days: [
          { workDate: '2026-01-08', dayType: 'telework' },
          { workDate: '2026-01-09', dayType: 'onsite' },
          { workDate: '2026-01-15', dayType: 'third_country' },
        ],
      },
    ],
  },
  {
    region: 'ticino',
    lang: 'it',
    company: 'DEMO — Acme Ticino SA',
    owner: 'Giulia Conti',
    employees: [
      {
        email: 'alice.demo@borderday.example',
        name: 'Giulia Bianchi (Como)',
        border: 'ticino_it',
        annual: 240,
        days: [
          ...teleworkDays(2026, 1, 6),
          { workDate: '2026-01-14', dayType: 'onsite' },
          { workDate: '2026-01-15', dayType: 'onsite' },
        ],
      },
      {
        email: 'bruno.demo@borderday.example',
        name: 'Marco Ferrari (Varese)',
        border: 'ticino_it',
        annual: 240,
        // overnight away → non-return counter approaching
        days: Array.from({ length: 36 }, (_, i) => {
          const month = i < 28 ? 2 : 3;
          const day = (i % 28) + 1;
          return {
            workDate: `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            dayType: 'onsite',
            overnightAway: true,
          };
        }),
      },
      {
        email: 'chiara.demo@borderday.example',
        name: 'Elena Rossi (Como)',
        border: 'ticino_it',
        annual: 240,
        days: [
          { workDate: '2026-01-07', dayType: 'telework' },
          { workDate: '2026-01-08', dayType: 'onsite' },
          { workDate: '2026-01-09', dayType: 'onsite' },
        ],
      },
    ],
  },
  {
    region: 'ticino',
    lang: 'en',
    company: 'DEMO — Acme Ticino SA',
    owner: 'Giulia Conti',
    employees: [
      {
        email: 'alice.demo@borderday.example',
        name: 'Giulia Bianchi (Como)',
        border: 'ticino_it',
        annual: 240,
        days: [
          ...teleworkDays(2026, 1, 6),
          { workDate: '2026-01-14', dayType: 'onsite' },
          { workDate: '2026-01-15', dayType: 'onsite' },
        ],
      },
      {
        email: 'bruno.demo@borderday.example',
        name: 'Marco Ferrari (Varese)',
        border: 'ticino_it',
        annual: 240,
        days: Array.from({ length: 36 }, (_, i) => {
          const month = i < 28 ? 2 : 3;
          const day = (i % 28) + 1;
          return {
            workDate: `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            dayType: 'onsite',
            overnightAway: true,
          };
        }),
      },
      {
        email: 'chiara.demo@borderday.example',
        name: 'Elena Rossi (Como)',
        border: 'ticino_it',
        annual: 240,
        days: [
          { workDate: '2026-01-07', dayType: 'telework' },
          { workDate: '2026-01-08', dayType: 'onsite' },
          { workDate: '2026-01-09', dayType: 'onsite' },
        ],
      },
    ],
  },
  {
    region: 'luxembourg',
    lang: 'fr',
    company: 'DÉMO — Acme Luxembourg SA',
    owner: 'Camille Dupont',
    employees: [
      {
        email: 'alice.demo@borderday.example',
        name: 'Émilie Moreau (Thionville)',
        border: 'luxembourg_fr',
        annual: 220,
        days: teleworkDays(2026, 3, 8),
      },
      {
        email: 'bruno.demo@borderday.example',
        name: 'Pieter Janssens (Arlon)',
        border: 'luxembourg_be',
        annual: 220,
        // near 34-day FR/BE/DE LU tax → Attention
        days: teleworkDays(2026, 3, 28),
      },
      {
        email: 'chiara.demo@borderday.example',
        name: 'Anna Schneider (Trier)',
        border: 'luxembourg_de',
        annual: 220,
        days: [
          ...teleworkDays(2026, 1, 3),
          { workDate: '2026-01-12', dayType: 'onsite' },
          { workDate: '2026-01-13', dayType: 'onsite' },
        ],
      },
    ],
  },
  {
    region: 'luxembourg',
    lang: 'en',
    company: 'DEMO — Acme Luxembourg SA',
    owner: 'Alex Morgan',
    employees: [
      {
        email: 'alice.demo@borderday.example',
        name: 'Émilie Moreau (Thionville)',
        border: 'luxembourg_fr',
        annual: 220,
        days: teleworkDays(2026, 3, 8),
      },
      {
        email: 'bruno.demo@borderday.example',
        name: 'Pieter Janssens (Arlon)',
        border: 'luxembourg_be',
        annual: 220,
        days: teleworkDays(2026, 3, 28),
      },
      {
        email: 'chiara.demo@borderday.example',
        name: 'Anna Schneider (Trier)',
        border: 'luxembourg_de',
        annual: 220,
        days: [
          ...teleworkDays(2026, 1, 3),
          { workDate: '2026-01-12', dayType: 'onsite' },
          { workDate: '2026-01-13', dayType: 'onsite' },
        ],
      },
    ],
  },
  {
    region: 'belgium-nl',
    lang: 'nl',
    company: 'DEMO — Acme België BV',
    owner: 'Sophie de Vries',
    employees: [
      {
        email: 'alice.demo@borderday.example',
        name: 'Lars Jansen (Maastricht)',
        border: 'belgium_nl',
        annual: 240,
        days: [
          ...teleworkDays(2026, 1, 6),
          { workDate: '2026-01-12', dayType: 'onsite' },
        ],
      },
      {
        email: 'bruno.demo@borderday.example',
        name: 'Eva Bakker (Breda)',
        border: 'belgium_nl',
        annual: 240,
        days: Array.from({ length: 70 }, (_, i) => {
          const month = Math.floor(i / 20) + 1;
          const day = (i % 20) + 1;
          return {
            workDate: `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            dayType: 'telework',
          };
        }),
      },
      {
        email: 'chiara.demo@borderday.example',
        name: 'Noah Visser (Eindhoven)',
        border: 'belgium_nl',
        annual: 240,
        days: [
          ...teleworkDays(2026, 2, 4),
          { workDate: '2026-02-10', dayType: 'onsite' },
        ],
      },
    ],
  },
];

/** Multi-border demos for partner emails (fiduciaries). */
const MULTI_SHOTS = {
  en: {
    company: 'DEMO — Acme Cross-Border SA',
    owner: 'Alex Morgan',
    employees: [
      { email: 'alice.demo@borderday.example', name: 'Alice Martin (Geneva)', border: 'geneva_fr' },
      { email: 'bruno.demo@borderday.example', name: 'Bruno Weber (Luxembourg)', border: 'luxembourg_fr' },
      { email: 'chiara.demo@borderday.example', name: 'Chiara Rossi (Ticino)', border: 'ticino_it' },
    ],
  },
  fr: {
    company: 'DÉMO — Acme Transfrontière SA',
    owner: 'Camille Dupont',
    employees: [
      { email: 'alice.demo@borderday.example', name: 'Alice Martin (Genève)', border: 'geneva_fr' },
      { email: 'bruno.demo@borderday.example', name: 'Bruno Lefèvre (Luxembourg)', border: 'luxembourg_fr' },
      { email: 'chiara.demo@borderday.example', name: 'Chiara Rossi (Tessin)', border: 'ticino_it' },
    ],
  },
  de: {
    company: 'DEMO — Acme Grenzpendler AG',
    owner: 'Anna Müller',
    employees: [
      { email: 'alice.demo@borderday.example', name: 'Alice Martin (Genf)', border: 'geneva_fr' },
      { email: 'bruno.demo@borderday.example', name: 'Bruno Weber (Luxemburg)', border: 'luxembourg_fr' },
      { email: 'chiara.demo@borderday.example', name: 'Chiara Rossi (Tessin)', border: 'ticino_it' },
    ],
  },
  it: {
    company: 'DEMO — Acme Transfrontaliera SA',
    owner: 'Giulia Conti',
    employees: [
      { email: 'alice.demo@borderday.example', name: 'Alice Martin (Ginevra)', border: 'geneva_fr' },
      { email: 'bruno.demo@borderday.example', name: 'Bruno Weber (Lussemburgo)', border: 'luxembourg_fr' },
      { email: 'chiara.demo@borderday.example', name: 'Chiara Rossi (Ticino)', border: 'ticino_it' },
    ],
  },
  nl: {
    company: 'DEMO — Acme Grensoverschrijdend BV',
    owner: 'Sophie de Vries',
    employees: [
      { email: 'alice.demo@borderday.example', name: 'Alice Martin (Genève)', border: 'geneva_fr' },
      { email: 'bruno.demo@borderday.example', name: 'Bruno Weber (Luxemburg)', border: 'luxembourg_fr' },
      { email: 'chiara.demo@borderday.example', name: 'Chiara Rossi (Ticino)', border: 'ticino_it' },
    ],
  },
};

const browser = await chromium.launch({ headless: true });

async function applyTenant(page, { company, owner, employees, replaceDays }) {
  await page.evaluate(
    ({ key, company, owner, employees, replaceDays }) => {
      const raw = localStorage.getItem(key);
      if (!raw) throw new Error('no tenant db');
      const db = JSON.parse(raw);
      const co = db.companies.find((c) => c.isDemo);
      if (!co) throw new Error('no demo company');
      co.name = company;
      const byEmail = Object.fromEntries(employees.map((e) => [e.email, e]));
      for (const p of db.profiles) {
        if (p.email === 'hr.demo@borderday.example') p.displayName = owner;
        const e = byEmail[p.email];
        if (e) p.displayName = e.name;
      }
      for (const m of db.members) {
        const p = db.profiles.find((x) => x.id === m.userId);
        if (!p) continue;
        const e = byEmail[p.email];
        if (!e) continue;
        m.borderPackId = e.border;
        if (e.annual != null) m.annualWorkingDays = e.annual;
      }
      if (replaceDays) {
        const empIds = new Set();
        for (const e of employees) {
          const p = db.profiles.find((x) => x.email === e.email);
          if (p) empIds.add(p.id);
        }
        db.dayLogs = db.dayLogs.filter((d) => !empIds.has(d.employeeUserId));
        for (const e of employees) {
          const p = db.profiles.find((x) => x.email === e.email);
          if (!p || !e.days) continue;
          for (const day of e.days) {
            db.dayLogs.push({
              id: `demo-${p.id}-${day.workDate}`,
              companyId: co.id,
              employeeUserId: p.id,
              workDate: day.workDate,
              dayType: day.dayType,
              overnightAway: day.overnightAway || false,
            });
          }
        }
      } else {
        // multi: only rename + border remap, keep default day seed for LU attention
        for (const m of db.members) {
          const p = db.profiles.find((x) => x.id === m.userId);
          if (!p) continue;
          const e = byEmail[p.email];
          if (e?.border) m.borderPackId = e.border;
        }
      }
      localStorage.setItem(key, JSON.stringify(db));
    },
    { key: STORAGE_KEY, company, owner, employees, replaceDays },
  );
}

async function captureClip(page, rawPath) {
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
  await page.waitForTimeout(120);
  const head = page.locator('.dash-head').first();
  const list = page.locator('.employee-list').first();
  const lastHead = page.locator('.employee-card .employee-head').last();
  await lastHead.scrollIntoViewIfNeeded();
  const headBox = await head.boundingBox();
  const listBox = await list.boundingBox();
  const lastBox = await lastHead.boundingBox();
  if (!headBox || !listBox || !lastBox) throw new Error('missing boxes');
  const x = Math.max(0, Math.min(headBox.x, listBox.x) - 12);
  const y = Math.max(0, headBox.y - 8);
  const right = Math.max(headBox.x + headBox.width, listBox.x + listBox.width) + 12;
  const bottom = lastBox.y + lastBox.height + 16;
  const rawW = Math.min(page.viewportSize().width - x, right - x);
  const rawH = Math.min(bottom - y, page.viewportSize().height - y - 4);
  if (rawH < 200) throw new Error(`clip too short: ${rawH}`);
  await page.screenshot({ path: rawPath, clip: { x, y, width: rawW, height: rawH } });
  return rawH;
}

async function shot(lang, outName, patch, replaceDays) {
  const ctx = await browser.newContext({
    viewport: { width: 640, height: 1800 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/${lang}/demo`, { waitUntil: 'networkidle' });
  await page.waitForURL(/\/demo\/company\/.+\/dashboard/);
  await page.waitForSelector('.employee-card');
  await applyTenant(page, { ...patch, replaceDays });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('.employee-card');
  // sanity: read labels
  const labels = await page.locator('.employee-card .employee-head').allTextContents();
  const rawPath = join(RAW, `email-${outName}-raw.png`);
  const rawH = await captureClip(page, rawPath);
  const outPath = join(OUT, `${outName}.png`);
  await resizePng(rawPath, outPath, TARGET_W);
  const cards = await page.locator('.employee-card').count();
  console.log('wrote', outPath, 'cards=', cards, 'clipH=', Math.round(rawH));
  console.log('  heads:', labels.map((s) => s.replace(/\s+/g, ' ').slice(0, 80)).join(' | '));
  await ctx.close();
}

const ONLY = (process.env.ONLY || '').split(',').map((s) => s.trim()).filter(Boolean);
for (const r of REGION_SHOTS) {
  if (ONLY.length && !ONLY.includes(`${r.region}-${r.lang}`) && !ONLY.includes(r.region)) continue;
  const outName = `dashboard-${r.region}-${r.lang}`;
  await shot(
    r.lang,
    outName,
    { company: r.company, owner: r.owner, employees: r.employees },
    true,
  );
}

for (const [lang, names] of Object.entries(MULTI_SHOTS)) {
  if (ONLY.length && !ONLY.includes(lang) && !ONLY.includes(`multi-${lang}`)) continue;
  await shot(
    lang,
    `dashboard-${lang}`,
    {
      company: names.company,
      owner: names.owner,
      employees: names.employees.map((e) => ({
        email: e.email,
        name: e.name,
        border: e.border,
      })),
    },
    false,
  );
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

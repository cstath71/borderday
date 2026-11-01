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
const LI_HIRES = process.env.LI_HIRES === '1';
const LI_SRC = join(ROOT, 'growth/li-images/dash-src');

mkdirSync(OUT, { recursive: true });
mkdirSync(RAW, { recursive: true });
if (LI_HIRES) mkdirSync(LI_SRC, { recursive: true });

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
        email: 'sophie.demo@borderday.example',
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
        email: 'lucas.demo@borderday.example',
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
        email: 'camille.demo@borderday.example',
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
        email: 'marie.demo@borderday.example',
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
        email: 'jonas.demo@borderday.example',
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
        email: 'lea.demo@borderday.example',
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
        email: 'giulia.demo@borderday.example',
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
        email: 'marco.demo@borderday.example',
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
        email: 'elena.demo@borderday.example',
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
        email: 'giulia.demo@borderday.example',
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
        email: 'marco.demo@borderday.example',
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
        email: 'elena.demo@borderday.example',
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
        email: 'emilie.demo@borderday.example',
        name: 'Émilie Moreau (Thionville)',
        border: 'luxembourg_fr',
        annual: 220,
        days: teleworkDays(2026, 3, 8),
      },
      {
        email: 'pieter.demo@borderday.example',
        name: 'Pieter Janssens (Arlon)',
        border: 'luxembourg_be',
        annual: 220,
        // near 34-day FR/BE/DE LU tax → Attention
        days: teleworkDays(2026, 3, 28),
      },
      {
        email: 'anna.demo@borderday.example',
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
        email: 'emilie.demo@borderday.example',
        name: 'Émilie Moreau (Thionville)',
        border: 'luxembourg_fr',
        annual: 220,
        days: teleworkDays(2026, 3, 8),
      },
      {
        email: 'pieter.demo@borderday.example',
        name: 'Pieter Janssens (Arlon)',
        border: 'luxembourg_be',
        annual: 220,
        days: teleworkDays(2026, 3, 28),
      },
      {
        email: 'anna.demo@borderday.example',
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
        email: 'lars.demo@borderday.example',
        name: 'Lars Jansen (Maastricht)',
        border: 'belgium_nl',
        annual: 240,
        days: [
          ...teleworkDays(2026, 1, 6),
          { workDate: '2026-01-12', dayType: 'onsite' },
        ],
      },
      {
        email: 'eva.demo@borderday.example',
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
        email: 'noah.demo@borderday.example',
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
      // Seed slots (order) → rewrite email + displayName so emails match demo names
      const SEED = [
        'alice.demo@borderday.example',
        'bruno.demo@borderday.example',
        'chiara.demo@borderday.example',
      ];
      const bound = [];
      for (let i = 0; i < employees.length; i++) {
        const e = employees[i];
        const slot = SEED[i];
        const p =
          db.profiles.find((x) => x.email === e.email) ||
          (slot && db.profiles.find((x) => x.email === slot));
        if (!p) throw new Error('no profile for ' + (e.email || slot));
        p.email = e.email;
        p.displayName = e.name;
        bound.push({ e, p });
      }
      for (const p of db.profiles) {
        if (p.email === 'hr.demo@borderday.example') p.displayName = owner;
      }
      for (const { e, p } of bound) {
        const m = db.members.find((x) => x.userId === p.id);
        if (!m) continue;
        m.borderPackId = e.border;
        if (e.annual != null) m.annualWorkingDays = e.annual;
      }
      if (replaceDays) {
        const empIds = new Set(bound.map(({ p }) => p.id));
        db.dayLogs = db.dayLogs.filter((d) => !empIds.has(d.employeeUserId));
        for (const { e, p } of bound) {
          if (!e.days) continue;
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
      .dash-actions .btn, .dash-actions label { font-size: 0.78rem; padding: 0.35rem 0.55rem !important; }
      .dash-actions { gap: 0.35rem !important; margin-bottom: 0.25rem !important; }
      .dash-head { margin-bottom: 0.25rem !important; gap: 0.35rem !important; }
      .dash-head h1, .dash-head h2 { font-size: 1.25rem !important; margin: 0 !important; }
      .employee-card { font-size: 1.02rem !important; }
      .employee-list { gap: 0.35rem !important; }
      /* Keep invite; drop CSV exports to show 3 cards fully in LI crops */
    `,
  });
  await page.waitForTimeout(120);
  // Compact chrome so all 3 employee cards fit fully in LI 1200 crops
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('.dash-actions')) el.style.display = 'none';
  });
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
  // LI hires: narrow CSS + high DPR so fit-to-width stays sharp and phone-legible
  const ctx = await browser.newContext({
    viewport: { width: LI_HIRES ? 600 : 640, height: 1800 },
    deviceScaleFactor: LI_HIRES ? 4 : 2,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/${lang}/demo`, { waitUntil: 'networkidle' });
  await page.waitForURL(/\/demo\/company\/.+\/dashboard/);
  await page.waitForSelector('.employee-card');
  await applyTenant(page, { ...patch, replaceDays });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('.employee-card');
  // LI-only: SS-framework badge wording for NL→BE (no tax-day threshold)
  if (process.env.LI_SS_BADGES === '1') {
    await page.addStyleTag({
      content: `.employee-head .badge.ok, .employee-head .badge.warn { white-space: nowrap; font-size: 0.72rem !important; }`,
    });
    await page.evaluate(() => {
      const map = {
        'Onder de gevolgde limiet': 'Onder SS-kader (<50%)',
        'Let op': 'SS-kader: let op',
      };
      for (const el of document.querySelectorAll('.employee-head .badge')) {
        const t = (el.textContent || '').trim();
        if (map[t]) el.textContent = map[t];
      }
    });
  }
  const labels = await page.locator('.employee-card .employee-head').allTextContents();
  const rawPath = join(RAW, `email-${outName}-raw.png`);
  const rawH = await captureClip(page, rawPath);
  const cards = await page.locator('.employee-card').count();
  if (LI_HIRES) {
    const hi = join(LI_SRC, `${outName}.png`);
    copyFileSync(rawPath, hi);
    console.log('wrote LI hires', hi, 'cards=', cards, 'clipH=', Math.round(rawH));
  } else {
    const outPath = join(OUT, `${outName}.png`);
    await resizePng(rawPath, outPath, TARGET_W);
    console.log('wrote', outPath, 'cards=', cards, 'clipH=', Math.round(rawH));
  }
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

if (!LI_HIRES) {
  copyFileSync(join(OUT, 'dashboard-en.png'), join(OUT, 'dashboard.png'));
  console.log('mirrored dashboard-en.png -> dashboard.png');
}
await browser.close();

async function resizePng(src, dest, width) {
  try {
    const require = createRequire(import.meta.url);
    const sharp = require('sharp');
    const img = sharp(src);
    const meta = await img.metadata();
    const h = Math.round((meta.height * width) / meta.width);
    await img.resize(width, h, { kernel: sharp.kernel.lanczos3 }).png({ compressionLevel: 9 }).toFile(dest);
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

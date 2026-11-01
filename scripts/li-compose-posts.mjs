import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { createServer } from 'node:http';
import { spawnSync } from 'node:child_process';

const ROOT = '/workspace/borderday';
const OUT = join(ROOT, 'growth/li-images');
const STORE = '/cursor/stores/store-8dd77f93-092d-47f2-9041-65e7f2638e13/borderday/linkedin';
mkdirSync(OUT, { recursive: true });
mkdirSync(STORE, { recursive: true });

const NAVY = '#0B3D91';
const BLUE = '#1E6BD6';
const BG = '#F4F7FC';

const FOOT_TAG = {
  fr: 'Types de jours uniquement · Sans GPS',
  de: 'Nur Tagesarten · Ohne GPS',
  it: 'Solo tipi di giorno · Senza GPS',
  nl: 'Alleen dagtypes · Geen GPS',
  en: 'Day types only · No GPS',
};

const posts = [
  {
    n: '01',
    lang: 'fr',
    headline: 'Employeurs à Genève:\nle calendrier AFC approche.',
    dash: 'public/email/dashboard-geneva-fr.png',
    sub: 'Données démo · Frontière Genève ← France',
  },
  {
    n: '02',
    lang: 'fr',
    headline: 'France → Luxembourg:\nle seuil fiscal de 34 jours.',
    dash: 'public/email/dashboard-luxembourg-fr.png',
    sub: 'Données démo · Frontière Luxembourg',
  },
  {
    n: '03',
    lang: 'de',
    headline: 'Homeoffice über die Grenze:\ndie 50%-Marke der Rahmenvereinbarung.',
    dash: 'public/email/dashboard-basel-de.png',
    sub: 'Demo-Daten · Grenze Basel',
  },
  {
    n: '04',
    lang: 'it',
    headline: 'Ticino ← Italia:\ntelelavoro al massimo al 25%.',
    dash: 'public/email/dashboard-ticino-it.png',
    sub: 'Dati demo · Confine Ticino ← Italia',
  },
  {
    n: '05',
    lang: 'nl',
    headline: 'Grensarbeid NL → België:\nsocialezekerheidskader vs. belasting.',
    dash: 'public/email/dashboard-belgium-nl-nl.png',
    sub: 'Demo-gegevens · België ← Nederland',
  },
  {
    n: '06',
    lang: 'en',
    headline: 'Cross-border telework and social security:\nthe under-50% framework.',
    dash: 'public/email/dashboard-en.png',
    sub: 'Demo data · Mixed corridors',
  },
];

function htmlFor(p) {
  const headlineHtml = p.headline
    .split('\n')
    .map((line) => `<div class="line">${escapeHtml(line)}</div>`)
    .join('');
  return `<!DOCTYPE html>
<html lang="${p.lang}">
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 1200px; height: 1200px; overflow: hidden; }
  body {
    font-family: Inter, system-ui, -apple-system, 'Segoe UI', Arial, sans-serif;
    background: linear-gradient(165deg, #EEF3FB 0%, ${BG} 45%, #E8EEF8 100%);
    color: ${NAVY};
  }
  .frame {
    width: 1200px; height: 1200px;
    padding: 24px 32px 18px;
    display: flex; flex-direction: column;
    position: relative;
  }
  .frame::before {
    content: '';
    position: absolute; inset: 0;
    border: 14px solid ${NAVY};
    border-bottom-color: ${BLUE};
    pointer-events: none;
  }
  .top {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 12px;
  }
  .logo { height: 44px; width: auto; display: block; }
  .badge {
    background: ${BLUE}; color: #fff;
    font-size: 22px; font-weight: 700; letter-spacing: 0.04em;
    padding: 10px 18px; border-radius: 999px;
  }
  h1 {
    font-size: 32px; line-height: 1.12; font-weight: 800;
    letter-spacing: -0.02em; color: ${NAVY};
    margin-bottom: 6px;
  }
  h1 .line + .line { margin-top: 4px; }
  .sub {
    font-size: 18px; color: #4A5B78; font-weight: 500;
    margin-bottom: 10px;
  }
  .dash-wrap {
    flex: 1; min-height: 0;
    background: #fff;
    border-radius: 14px;
    border: 2px solid #D5DEEE;
    box-shadow: 0 14px 32px rgba(11, 61, 145, 0.12);
    overflow: hidden;
    display: flex; align-items: flex-start; justify-content: center;
    padding: 6px 6px 4px;
  }
  .dash-wrap img {
    max-width: 100%; max-height: 100%; width: auto; height: auto;
    display: block; object-fit: contain; object-position: top center;
  }
  .foot {
    margin-top: 10px;
    display: flex; align-items: center; justify-content: space-between;
    font-size: 22px; font-weight: 700;
  }
  .foot .url { color: ${BLUE}; }
  .foot .tag { color: ${NAVY}; opacity: 0.85; font-weight: 600; font-size: 18px; }
</style>
</head>
<body>
  <div class="frame">
    <div class="top">
      <img class="logo" src="/brand/logo.png" alt="BorderDay">
      <div class="badge">HR</div>
    </div>
    <h1>${headlineHtml}</h1>
    <div class="sub">${escapeHtml(p.sub)}</div>
    <div class="dash-wrap">
      <img src="/dash/${p.n}.png" alt="BorderDay dashboard demo">
    </div>
    <div class="foot">
      <span class="url">borderday.com</span>
      <span class="tag">${escapeHtml(FOOT_TAG[p.lang] || FOOT_TAG.en)}</span>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

const mime = { '.html': 'text/html; charset=utf-8', '.png': 'image/png' };
const only = process.env.ONLY ? process.env.ONLY.split(',') : posts.map((p) => p.n);

const server = createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  let path;
  if (url.startsWith('/brand/')) path = join('/workspace/brand/borderday', url.slice(7));
  else if (url.startsWith('/dash/')) {
    const n = url.slice(6).replace('.png','');
    const p = posts.find((x) => x.n === n);
    path = join(ROOT, p.dash);
  } else if (url.startsWith('/card/')) {
    const n = url.slice(6).replace('.html','');
    const p = posts.find((x) => x.n === n);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(htmlFor(p));
    return;
  } else { res.writeHead(404); res.end('no'); return; }
  if (!existsSync(path)) { res.writeHead(404); res.end('missing '+path); return; }
  res.writeHead(200, { 'Content-Type': mime[extname(path)] || 'application/octet-stream' });
  res.end(readFileSync(path));
});

await new Promise((r) => server.listen(4191, '127.0.0.1', r));
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 1200 }, deviceScaleFactor: 2 });

for (const p of posts) {
  if (!only.includes(p.n)) continue;
  await page.goto(`http://127.0.0.1:4191/card/${p.n}.html`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0));
  const raw = `/tmp/li-post-${p.n}-raw.png`;
  const out = join(OUT, `li-post-${p.n}.png`);
  await page.screenshot({ path: raw, type: 'png', clip: { x: 0, y: 0, width: 1200, height: 1200 } });
  // deviceScaleFactor 2 → 2400×2400; Lanczos down to sharp 1200×1200 via Pillow
  const py = spawnSync(
    'python3',
    [
      '-c',
      `from PIL import Image; Image.MAX_IMAGE_PIXELS=None\nim=Image.open(${JSON.stringify(raw)}).convert("RGBA")\nim=im.resize((1200,1200), Image.Resampling.LANCZOS)\nim.save(${JSON.stringify(out)}, "PNG", optimize=True)\n`,
    ],
    { encoding: 'utf-8' },
  );
  if (py.status !== 0) {
    console.error(py.stderr || py.stdout);
    throw new Error('PIL resize failed for ' + p.n);
  }
  writeFileSync(join(STORE, `li-post-${p.n}.png`), readFileSync(out));
  console.log('WROTE', out);
}

await browser.close();
server.close();

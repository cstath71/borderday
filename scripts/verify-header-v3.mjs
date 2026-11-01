/**
 * Header overlap/clip verification — Chromium + WebKit, 5 locales,
 * signed-out + signed-in (Account injected), widths from the brief.
 */
import { chromium, webkit } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4173';
const OUT = process.env.OUT_DIR || '/workspace/borderday-audit/header-resize/v3';
const LANGS = ['en', 'fr', 'de', 'it', 'nl'];
const WIDTHS = [390, 1024, 1180, 1200, 1280, 1366, 1440, 1680];
const ENGINES = [
  ['chromium', chromium],
  ['webkit', webkit],
];

mkdirSync(OUT, { recursive: true });

function boxesIntersect(a, b) {
  return !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
}

async function measure(page, { signedIn }) {
  return page.evaluate(({ signedIn }) => {
    function boxesIntersect(a, b) {
      return !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
    }
    function clipped(el) {
      if (!el) return false;
      return el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1;
    }

    const header = document.querySelector('.site-header');
    const inner = document.querySelector('.site-header .inner');
    const nav = document.querySelector('nav.nav');
    const lang = document.querySelector('form.lang-switch');
    const toggle = document.querySelector('.nav-toggle');
    const select = document.querySelector('form.lang-switch select');
    const apply = document.querySelector('.lang-apply');

    if (signedIn && nav) {
      const links = [...nav.querySelectorAll('a')];
      const signIn = links.find((a) => /sign-in|auth\/sign-in/.test(a.getAttribute('href') || ''));
      if (signIn) signIn.remove();
      let account = links.find((a) => /\/account\/?$/.test(a.getAttribute('href') || ''));
      if (!account) {
        const footerAcc = document.querySelector('footer a[href*="/account"]');
        account = document.createElement('a');
        account.href = footerAcc?.getAttribute('href') || '/en/account';
        account.textContent = footerAcc?.textContent?.trim() || 'Account';
        account.className = 'hide-sm';
        nav.appendChild(account);
      }
    }

    const hamburger = toggle ? getComputedStyle(toggle).display !== 'none' : false;
    const navHidden = !nav || getComputedStyle(nav).display === 'none';
    const innerBox = inner.getBoundingClientRect();
    const langBox = lang.getBoundingClientRect();
    const navLinks = navHidden
      ? []
      : [...nav.querySelectorAll('a')].filter((a) => getComputedStyle(a).display !== 'none');

    const overlaps = [];
    for (const a of navLinks) {
      const b = a.getBoundingClientRect();
      const midY = (b.top + b.bottom) / 2;
      const sameRow = midY >= langBox.top - 2 && midY <= langBox.bottom + 2;
      if (
        sameRow &&
        boxesIntersect(
          { left: b.left, right: b.right, top: b.top, bottom: b.bottom },
          { left: langBox.left, right: langBox.right, top: langBox.top, bottom: langBox.bottom },
        )
      ) {
        overlaps.push({ text: a.textContent.trim(), right: b.right, langLeft: langBox.left });
      }
    }

    const selectText = select ? select.options[select.selectedIndex]?.text : null;
    const logo = document.querySelector('.brand img');
    const logoH = logo ? logo.getBoundingClientRect().height : 0;

    return {
      hamburger,
      navHidden,
      navTexts: navLinks.map((a) => a.textContent.trim()),
      selectText,
      hasApply: !!apply && getComputedStyle(apply).display !== 'none',
      overlaps,
      clipped: {
        header: clipped(header),
        inner: clipped(inner),
        nav: !navHidden && clipped(nav),
        lang: clipped(lang),
      },
      widths: {
        inner: Math.round(innerBox.width),
        nav: nav && !navHidden ? Math.round(nav.getBoundingClientRect().width) : 0,
        lang: Math.round(langBox.width),
        logoH: Math.round(logoH),
      },
    };
  }, { signedIn });
}

const results = [];
let failures = 0;

for (const [engName, eng] of ENGINES) {
  const browser = await eng.launch({ headless: true });
  for (const signedIn of [false, true]) {
    for (const lang of LANGS) {
      for (const w of WIDTHS) {
        const page = await browser.newPage({ viewport: { width: w, height: 900 } });
        await page.goto(`${BASE}/${lang}/`, { waitUntil: 'networkidle' });
        const m = await measure(page, { signedIn });
        const mode = signedIn ? 'in' : 'out';
        const overlapFail = m.overlaps.length > 0;
        const clipFail = Object.values(m.clipped).some(Boolean);
        const applyFail = m.hasApply === true;
        const selectFail = m.selectText && m.selectText.length > 2; // expect EN/FR/…
        const expectDesktop = w >= 1180;
        const desktopFail = expectDesktop && (m.hamburger || m.navHidden || (m.widths?.logoH ?? 0) < 57);
        const mobileMenuOk = w < 1140 ? m.hamburger === true : true;
        // When full nav visible, must not overlap; when hamburger, nav hidden — OK
        const fail = overlapFail || clipFail || applyFail || selectFail || desktopFail || !mobileMenuOk;
        if (fail) failures++;
        const row = {
          engine: engName,
          mode,
          lang,
          w,
          fail,
          overlapFail,
          clipFail,
          applyFail,
          selectFail,
          ...m,
        };
        results.push(row);
        const mark = fail ? 'FAIL' : 'ok';
        if (fail || (w === 1280 && lang === 'en') || (w === 1280 && lang === 'de') || w === 390) {
          console.log(
            `${mark} ${engName} ${mode} ${lang}@${w} ham=${m.hamburger} logo=${m.widths?.logoH} sel=${m.selectText} overlaps=${m.overlaps.length} clip=${JSON.stringify(m.clipped)} nav=${m.navTexts.join('|')}`,
          );
        }

        // Screenshots requested for v3
        if (engName === 'webkit' && signedIn === true && lang === 'en' && w === 1280) {
          await page.screenshot({ path: join(OUT, 'en-1280-webkit-signed-in.png'), fullPage: false });
        }
        if (engName === 'webkit' && signedIn === true && lang === 'de' && w === 1280) {
          await page.screenshot({ path: join(OUT, 'de-1280-webkit-signed-in.png'), fullPage: false });
        }
        if (engName === 'webkit' && signedIn === false && lang === 'nl' && w === 390) {
          await page.screenshot({ path: join(OUT, 'nl-390-webkit.png'), fullPage: false });
        }
        await page.close();
      }
    }
  }
  await browser.close();
}

writeFileSync(join(OUT, 'results.json'), JSON.stringify(results, null, 2));
const failed = results.filter((r) => r.fail);
console.log(`\nTotal ${results.length}, failures ${failed.length}`);
if (failed.length) {
  console.log(failed.slice(0, 30));
  process.exit(1);
}

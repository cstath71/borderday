import { describe, expect, it } from 'vitest';
import en from '../src/i18n/en';
import fr from '../src/i18n/fr';
import de from '../src/i18n/de';
import itDict from '../src/i18n/it';
import nl from '../src/i18n/nl';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BORDER_PACKS } from '../src/borders/packs';
import { LANGS, PAGES, PUBLIC_PATHS } from '../scripts/seo.mjs';

function flatKeys(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object') return [prefix];
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object') keys.push(...flatKeys(v, p));
    else keys.push(p);
  }
  return keys.sort();
}

describe('i18n key parity', () => {
  const enKeys = flatKeys(en);
  it('FR has identical keys to EN', () => {
    expect(flatKeys(fr)).toEqual(enKeys);
  });
  it('DE has identical keys to EN', () => {
    expect(flatKeys(de)).toEqual(enKeys);
  });
  it('IT has identical keys to EN', () => {
    expect(flatKeys(itDict)).toEqual(enKeys);
  });
  it('NL has identical keys to EN', () => {
    expect(flatKeys(nl)).toEqual(enKeys);
  });
  it('brand surfaces avoid the frontier-worker words, including transfrontalier*', () => {
    // Match as substring so "transfrontalier" is caught; brand-only (not counter/legal quotes).
    const banned = /frontalier|frontaliere|grenzgänger|grenzgaenger|grensarbeider/i;
    const dicts = { en, fr, de, it: itDict, nl };
    for (const [lang, d] of Object.entries(dicts)) {
      const surfaces = [
        d.meta.tagline,
        d.meta.description,
        d.footer.tagline,
        d.home.heroTitle,
        d.home.heroBody,
        d.home.inShort,
        d.home.waitlistTitle,
        d.home.waitlistBody,
        d.pricing.title,
        d.pricing.subtitle,
        d.pricing.company,
        d.pricing.individual,
        d.nav.home,
        d.nav.app,
        d.nav.forIndividuals,
        d.nav.forCompanies,
        d.individuals?.title,
        d.faq.title,
      ].filter(Boolean);
      for (const s of surfaces) expect(s, lang).not.toMatch(banned);
    }
    for (const lang of LANGS) {
      for (const path of PUBLIC_PATHS) {
        const page = PAGES[path][lang];
        for (const s of [page.title, page.description, page.h1, page.summary].filter(Boolean)) {
          // Approved FAQ title (9 Nov 2026). The word is the page topic, not a product slogan.
          if (s === 'Questions fréquentes : compter ses jours frontaliers | BorderDay') continue;
          expect(s, `${lang} ${path}`).not.toMatch(banned);
        }
      }
    }
    // seo.mjs slogans / footer-adjacent copy already covered via PAGES; also forbid product coinages
    for (const [lang, d] of Object.entries(dicts)) {
      const blob = JSON.stringify({
        meta: d.meta,
        home: d.home,
        pricing: d.pricing,
        footer: d.footer,
        nav: d.nav,
      });
      expect(blob, lang).not.toMatch(/Grenzpaket|pack frontière|pacchetto confine|border pack/i);
    }
  });
});


describe('border-route naming (T56/T59)', () => {
  const dicts = { en, fr, de, it: itDict, nl };
  it('drops Grenzpaket / pack frontière / pacchetto confine product coinages', () => {
    for (const [lang, d] of Object.entries(dicts)) {
      const blob = JSON.stringify(d);
      expect(blob, lang).not.toMatch(/Grenzpaket|Grenztage|Tagesschwellen/);
      expect(blob, lang).not.toMatch(/pack frontière|jours frontière/);
      expect(blob, lang).not.toMatch(/pacchetto confine|pacchetto di confine|pacchetto frontiera/);
      expect(blob, lang).not.toMatch(/border pack/i);
    }
    // The German and Italian leftovers the singular patterns above could not catch (#9, #10).
    expect(JSON.stringify(de)).not.toMatch(/\bPaket|-Paket|Grenzpendler/);
    expect(JSON.stringify(itDict)).not.toMatch(/pacchett[oi] (di )?(confine|frontiera)/);
    expect(en.company.pickBorder).toMatch(/route/i);
    expect(fr.company.pickBorder).toMatch(/itinéraire/i);
    expect(de.company.pickBorder).toMatch(/Grenzroute/);
    expect(itDict.company.pickBorder).toMatch(/situazione/i);
    expect(nl.company.pickBorder).toMatch(/grensroute/i);
  });
});

describe('terminology decisions (02-translations)', () => {
  const dicts = { en, fr, de, it: itDict };
  const blob = (d: unknown) => JSON.stringify(d);

  it('no colloquial nLPD / nDSG, and no calqued role names', () => {
    for (const [lang, d] of Object.entries(dicts)) {
      expect(blob(d.home), lang).not.toMatch(/nLPD|nDSG/);
    }
    for (const d of [fr, de, itDict]) expect(blob(d.company)).not.toMatch(/\bowners?\b/i);
    expect(blob(de)).not.toMatch(/Firmeneigentümer|Ausdrucksweise|Rahmenvereinbarung|Unternehmenkonto/);
    expect(blob(fr)).not.toMatch(/journalis|commerçant enregistré/);
  });

  it('German uses one word per concept', () => {
    const b = blob(de);
    expect(b).not.toMatch(/Tagestyp|Tracking-Tool|Dokumentationstool|Missionstag|Wohnsitzstaat|außerhalb/);
    expect(b).not.toMatch(/Firmenkonto|Firmenplan|Haftungsausschluss/);
    expect(de.counters.ch_fr_tax_missions_10).toMatch(/Temporäre Einsätze/);
  });

  it('Italian uses one word per concept and the formal voi on shared surfaces', () => {
    const b = blob(itDict);
    expect(b).not.toMatch(/tracciamento|pacchetto frontiera|pacchetto di confine|giorni di missione/);
    for (const s of [itDict.app.title, itDict.app.counters, itDict.auth.signUpTitle, itDict.faq.a2]) {
      expect(s).not.toMatch(/\b(tuo|tua|tuoi|tue)\b/);
    }
  });

  it('the 40% rule cites the additional protocol, not only the amicable agreement', () => {
    expect(en.counters.ch_fr_tax_note).toMatch(/additional protocol/);
    expect(fr.counters.ch_fr_tax_note).toMatch(/protocole additionnel/);
    expect(de.counters.ch_fr_tax_note).toMatch(/Zusatzprotokoll/);
    expect(itDict.counters.ch_fr_tax_note).toMatch(/Protocollo addizionale/);
  });

  it('the official collection is cited per language', () => {
    expect(en.counters.ch_it_tax_note).toMatch(/AS 2026 104/);
    expect(fr.counters.ch_it_tax_note).toMatch(/RO 2026 104/);
    expect(de.counters.ch_it_tax_note).toMatch(/AS 2026 104/);
    expect(itDict.counters.ch_it_tax_note).toMatch(/RU 2026 104/);
  });

  it('the third-State exclusion names both States', () => {
    expect(fr.counters.ss_framework_lu_note).toMatch(/autre que l’État de résidence/);
    expect(de.counters.ss_framework_lu_note).toMatch(/Staat des Arbeitgebersitzes/);
    expect(itDict.counters.ss_framework_lu_note).toMatch(/diverso dallo Stato di residenza/);
  });

  it('the waitlist strings and component are gone', () => {
    expect(blob(en)).not.toMatch(/"waitlist":/);
    expect(existsSync(join(__dirname, '../src/components/WaitlistForm.tsx'))).toBe(false);
  });
});

describe('Phase 2 rule copy, all five languages', () => {
  const dicts = { en, fr, de, it: itDict, nl };
  const all = Object.entries(dicts) as Array<[string, typeof en]>;
  const text = (d: typeof en) => d.counters as Record<string, string>;

  it('every key a pack points to exists', () => {
    for (const [lang, d] of all) {
      for (const pack of BORDER_PACKS) {
        if (pack.regionNoteKey) expect((d.borders as Record<string, string>)[pack.regionNoteKey], lang).toBeTruthy();
        if (pack.logHintKey) expect((d.dayTypes as Record<string, string>)[pack.logHintKey], lang).toBeTruthy();
        for (const k of Object.values(pack.dayHintKeys ?? {})) {
          expect((d.dayTypes as Record<string, string>)[k as string], lang).toBeTruthy();
        }
        for (const c of pack.counters) {
          for (const k of [c.labelKey, c.notesKey, c.pendingReasonKey, c.pendingValueKey, c.overKey, c.kind]) {
            if (k) expect(text(d)[k], `${lang} ${k}`).toBeTruthy();
          }
        }
      }
    }
  });

  it('every message and badge the engine can emit exists', () => {
    const src = readFileSync(join(__dirname, '../src/lib/counting.ts'), 'utf8');
    const keys = new Set(
      [...src.matchAll(/(?:key|statusLabelKey): '(\w+)'/g), ...src.matchAll(/'(status_\w+)'/g)].map((m) => m[1]),
    );
    expect(keys.size).toBeGreaterThan(15);
    for (const [lang, d] of all) {
      for (const k of keys) expect(text(d)[k], `${lang} ${k}`).toBeTruthy();
    }
  });

  it('template variables match English in every language', () => {
    const vars = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    for (const k of Object.keys(en.counters)) {
      for (const [lang, d] of all) expect(vars(text(d)[k]), `${lang} ${k}`).toEqual(vars(text(en)[k]));
    }
  });

  it('risk1Body and the framework notes name both 25% and 50%', () => {
    for (const [lang, d] of all) {
      for (const s of [d.home.risk1Body, d.counters.ss_framework_note, d.counters.ss_framework_lu_note]) {
        expect(s, lang).toMatch(/25\s?%/);
        expect(s, lang).toMatch(/50\s?%/);
        expect(s, lang).toMatch(/A1/);
      }
    }
  });

  it('the framework note lists the exclusions', () => {
    expect(en.counters.ss_framework_note).toMatch(/self-employed/);
    expect(fr.counters.ss_framework_note).toMatch(/indépendantes/);
    expect(de.counters.ss_framework_note).toMatch(/selbständig/);
    expect(itDict.counters.ss_framework_note).toMatch(/indipendente/);
    expect(nl.counters.ss_framework_note).toMatch(/zelfstandig/);
  });

  it('1983 copy says taxed in France and never the Geneva sentence', () => {
    expect(en.counters.ch_fr_1983_tax_note).toMatch(/taxed in France/);
    expect(fr.counters.ch_fr_1983_tax_note).toMatch(/imposés en France/);
    expect(de.counters.ch_fr_1983_tax_note).toMatch(/in Frankreich besteuert/);
    expect(itDict.counters.ch_fr_1983_tax_note).toMatch(/tassati in Francia/);
    expect(nl.counters.ch_fr_1983_tax_note).toMatch(/in Frankrijk belast/);
    for (const [, d] of all) {
      expect(d.counters.ch_fr_1983_nights_note).toMatch(/45/);
      expect('ch_fr_1983_note' in d.counters).toBe(false);
      expect('ch_fr_1983_value' in d.counters).toBe(false);
    }
    expect(en.counters.ch_fr_1983_tax_note).not.toMatch(/taxable in Switzerland/);
  });

  it('no pack label folds 1983 cantons into Geneva', () => {
    for (const [lang, d] of all) {
      const blob = JSON.stringify(d);
      expect(blob, lang).not.toMatch(/Romandi[ea]/);
      expect(d.borders.geneva_fr, lang).toMatch(/1983/);
      expect(d.borders.basel_fr, lang).toMatch(/1983/);
      expect(d.borders.ch_fr_1983_region, lang).toMatch(/Vaud|Waadt/);
      expect(d.borders.ch_fr_1983_region, lang).toMatch(/Neuch|Neuenburg/);
      expect(d.borders.ch_fr_1983_region, lang).toMatch(/Jura|Giura/);
    }
  });

  it('marketing no longer promises tax limits on every corridor', () => {
    expect(JSON.stringify(en)).not.toMatch(/five borders|official tax and social-security/);
    for (const [lang, d] of all) {
      for (const s of [d.meta.description, d.home.heroBody, d.home.inShort]) expect(s, lang).toMatch(/\b(seven|sept|sette|sieben|zeven)\b/i);
    }
  });

  it('rule jargon, unsourced wording and retired messages are gone', () => {
    for (const [lang, d] of all) {
      const blob = JSON.stringify(d);
      expect(blob, lang).not.toMatch(/Sit inside|that expression|Ausdrucksweise|cette expression|tale espressione/i);
      // Sourced for Germany–Luxembourg only (Circular 71; BMF 11 Jan 2024): nowhere else.
      const withoutNote = blob.replace(JSON.stringify(text(d).lu_de_tax_note).slice(1, -1), '');
      expect(withoutNote, lang).not.toMatch(/30-minute|30 minutes|30-Minuten|30 minuti/);
      expect(blob, lang).not.toMatch(/INAMI/);
      expect(blob, lang).not.toMatch(/UE\/EWR/);
      expect(blob, lang).not.toMatch(/\((?:DFI|EDI)|DFI \(|EDI \(/);
      expect(text(d).ruleBeingConfirmed, lang).toBeUndefined();
    }
  });

  it('Luxembourg and Belgium pending notes say the honest thing', () => {
    // Both Luxembourg counters run, so no pending note may survive for them (one said no counter runs).
    expect('pending_lu_de_tax' in en.counters).toBe(false);
    expect('pending_lu_be_tax' in en.counters).toBe(false);
    expect(en.counters.pending_be_fr_tax).toMatch(/No day tolerance found/);
    expect(en.counters.pending_be_fr_tax).toMatch(/first day/);
    expect(en.counters.pending_be_nl_tax).toMatch(/No home-working tolerance found on the Dutch tax authority page/);
    expect(en.counters.pending_be_nl_tax).toMatch(/check with an adviser/);
    expect(en.counters.lu_fr_tax_note).toMatch(/rounded down/);
    expect(en.dayTypes.logHint_luxembourg_fr).toMatch(/whole day/);
    expect(en.dayTypes.teleworkHint_ticino).toMatch(/your home/);
  });

  it('privacy, notice and HR copy disclose the new fields, and still no location', () => {
    expect(en.company.noticeBody).toMatch(/night away/);
    expect(en.company.noticeBody).toMatch(/A1/);
    expect(en.company.noticeBody).toMatch(/cannot see GPS/);
    expect(en.privacy.s1Body).toMatch(/night away/);
    expect(en.privacy.s2Body).toMatch(/No GPS/);
    expect(en.privacy.s2Body).toMatch(/A1/);
  });

  it('an out-of-scope section exists', () => {
    for (const [lang, d] of all) {
      expect(d.faq.q8, lang).toBeTruthy();
      expect(d.faq.a8.length, lang).toBeGreaterThan(100);
    }
  });
});


describe('NL locale is fully translated (no EN fallback body)', () => {
  function flat(obj: unknown, prefix = ''): Record<string, string> {
    const out: Record<string, string> = {};
    if (obj === null || typeof obj !== 'object') return out;
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const p = prefix ? `${prefix}.${k}` : k;
      if (typeof v === 'string') out[p] = v;
      else if (Array.isArray(v)) {
        v.forEach((item, i) => {
          if (typeof item === 'string') out[`${p}.${i}`] = item;
          else Object.assign(out, flat(item, `${p}.${i}`));
        });
      } else if (v && typeof v === 'object') Object.assign(out, flat(v, p));
    }
    return out;
  }

  /** Keys that intentionally stay identical across locales (proper nouns, cognates, templates). */
  const allowSame = new Set([
    'meta.siteName',
    'nav.home',
    'nav.app',
    'nav.faq',
    'nav.privacy',
    'nav.disclaimer',
    'nav.account',
    'nav.menu',
    'lang.en',
    'lang.fr',
    'lang.de',
    'lang.it',
    'lang.nl',
    'dayTypes.halfDayShort',
    'app.previewBadge',
    'app.calendarDay',
    'pricing.approxChf',
    'faq.title',
    'company.status',
    'terms.contact',
    'disclaimer.title',
    'accessibility.feedbackTitle',
    'dpa.contactTitle',
    'footer.rights',
    'privacy.tableRows.0.recipients',
    'privacy.tableRows.2.recipients',
    'privacy.tableRows.3.recipients',
  ]);

  it('public body leaves differ from EN except allowlisted cognates', () => {
    const e = flat(en);
    const n = flat(nl);
    const same: string[] = [];
    for (const k of Object.keys(e)) {
      if (allowSame.has(k)) continue;
      if (e[k] === n[k] && e[k].length > 2) same.push(k);
    }
    expect(same, same.join(', ')).toEqual([]);
  });

  it('Belgian tax authority wording uses FOD Financiën where Belgium is named', () => {
    expect(nl.counters.lu_be_over_34).toMatch(/FOD Financiën/);
    // A resident of France checks with their own tax authority (#35): no Belgian body here.
    expect(nl.counters.be_fr_pre2012_over).not.toMatch(/FOD Financiën/);
  });

  it('NL SEO pages are not EN clones for home/pricing/faq', () => {
    expect(PAGES[''].nl.summary).not.toEqual(PAGES[''].en.summary);
    expect(PAGES.pricing.nl.summary).not.toEqual(PAGES.pricing.en.summary);
    expect(PAGES.faq.nl.summary).not.toEqual(PAGES.faq.en.summary);
    expect(PAGES['for-individuals'].nl.h1).not.toMatch(/Log your own/);
  });
});

describe('language switcher path rewrite (5×5)', () => {
  const langs = ['en', 'fr', 'de', 'it', 'nl'] as const;
  function rewrite(pathname: string, next: string): string {
    const path = pathname.replace(/^\/(en|fr|de|it|nl)(?=\/|$)/, `/${next}`);
    return path.startsWith(`/${next}`) ? path : `/${next}/`;
  }

  it('rewrites every locale path to every other locale', () => {
    for (const from of langs) {
      for (const to of langs) {
        expect(rewrite(`/${from}/`, to)).toBe(`/${to}/`);
        expect(rewrite(`/${from}/pricing/`, to)).toBe(`/${to}/pricing/`);
        expect(rewrite(`/${from}/privacy`, to)).toBe(`/${to}/privacy`);
      }
    }
  });

  it('Layout.tsx replace regex includes nl', () => {
    const src = readFileSync(join(__dirname, '../src/components/Layout.tsx'), 'utf8');
    expect(src).toContain('(en|fr|de|it|nl)');
    expect(src).toContain('className="lang-switch"');
    const navEnd = src.indexOf('</nav>');
    const formStart = src.indexOf('className="lang-switch"');
    expect(formStart).toBeGreaterThan(navEnd);
  });
});

describe('A3-18 accessibility statement', () => {
  it('names the scan date and scope, and instant language switching', () => {
    for (const d of [en, fr, de, itDict, nl]) {
      expect(d.accessibility.statusBody).not.toContain(d.lang.apply);
      expect(d.accessibility.statusBody).toMatch(/axe/);
      expect(d.accessibility.statusBody).toMatch(/2026/);
      expect(JSON.stringify(d.accessibility)).not.toMatch(/\b31\.? (October|octobre|Oktober|ottobre|oktober)/);
    }
  });

  it('inline links are underlined, not colour-only', () => {
    const css = readFileSync(join(__dirname, '../src/styles/global.css'), 'utf8');
    expect(css).toMatch(/main p a:not\(\.btn\)[^{]*\{ text-decoration: underline; \}/);
  });
});

describe('header sizing (no wrap)', () => {
  const css = readFileSync(join(__dirname, '../src/styles/global.css'), 'utf8');
  const layout = readFileSync(join(__dirname, '../src/components/Layout.tsx'), 'utf8');

  it('scales logo and desktop header height, keeps nowrap on the desktop bar', () => {
    expect(css).toMatch(/\.brand img\s*\{[^}]*height:\s*58px/);
    expect(css).toMatch(/\.site-header \.inner\s*\{[^}]*flex-wrap:\s*nowrap/);
    expect(css).toMatch(/\.site-header \.inner\s*\{[^}]*min-height:\s*84px/);
    expect(css).toMatch(/\.nav a\s*\{[^}]*font-size:\s*0\.95rem/);
    expect(css).toMatch(/\.nav\s*\{[^}]*flex-wrap:\s*nowrap/);
    expect(css).toMatch(/\.lang-switch\s*\{[^}]*flex-wrap:\s*nowrap/);
    expect(layout).toMatch(/width=\{232\}\s+height=\{68\}/);
  });

  it('keeps the language control compact, switches instantly on change, and collapses below 1140px', () => {
    expect(css).toMatch(/@media \(max-width:\s*1139px\)/);
    expect(css).toMatch(/\.nav:not\(\.open\)\s*\{\s*display:\s*none/);
    expect(css).toMatch(/\.brand img\s*\{\s*height:\s*46px/);
    expect(css).toMatch(/\.site-header \.container\s*\{\s*width:\s*min\(1440px/);
    expect(css).toMatch(/\.lang-switch select\s*\{[^}]*max-width:\s*4\.25rem/);
    expect(css).toMatch(/\.nav a\s*\{[^}]*font-size:\s*0\.95rem/);
    // Instant language switch: select onChange rewrites the locale path (no Apply button).
    expect(layout).not.toContain('className="lang-apply"');
    expect(layout).toContain('l.toUpperCase()');
    expect(layout).toContain('window.location.assign');
    expect(layout).toContain('onChange={(e) =>');
    expect(css).not.toMatch(/\.lang-apply\s*\{/);
    expect(layout).toContain('{!auth.user && (');
  });
});

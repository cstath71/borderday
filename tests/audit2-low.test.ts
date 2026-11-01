import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { BORDER_PACKS, getBorderPack } from '../src/borders/packs';
import type { OfficialSource } from '../src/borders/types';
import { chFrMissionSplit } from '../src/lib/counting';
import de from '../src/i18n/de';
import en from '../src/i18n/en';
import fr from '../src/i18n/fr';
import itDict from '../src/i18n/it';
import nl from '../src/i18n/nl';
import { llmsTxt, PAGES } from '../scripts/seo.mjs';

const dicts = { en, fr, de, it: itDict, nl };
const packsSource = readFileSync(resolve(__dirname, '../src/borders/packs.ts'), 'utf8');

function allSources(): OfficialSource[] {
  return BORDER_PACKS.flatMap((p) => p.counters.flatMap((c) => c.sources ?? []));
}

describe('audit-2 low: rules', () => {
  it('L1: every source has its own date, with no shared stamp', () => {
    expect(packsSource).not.toMatch(/const CHECKED/);
    expect(packsSource).not.toMatch(/checked: [A-Z]/);
    for (const s of allSources()) expect(s.checked, s.url).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // Sources EUR-Lex would not serve keep their earlier date until someone re-reads them there.
    const unread = allSources().filter((s) => s.url.includes('eur-lex.europa.eu'));
    expect(unread.length).toBeGreaterThan(0);
    for (const s of unread) expect(s.checked, s.url).toBe('2026-10-31');
  });

  it('L2: BE–LU cites the 1 Mar 2024 note, the dates and the burden of proof, in every locale', () => {
    const sources = getBorderPack('luxembourg_be')!.counters.find((c) => c.id === 'lu_be_tax_34')!.sources!;
    expect(sources.map((s) => s.url)).toContain(
      'https://impotsdirects.public.lu/dam-assets/fr/conventions/conv/seuil-de-tolrance-b-01032024.pdf',
    );
    const proof = { en: /prove your days/, fr: /prouver vos jours/, de: /Tage belegen/, it: /provare i giorni/, nl: /dagen kunnen bewijzen/ };
    for (const [lang, d] of Object.entries(dicts)) {
      const note = d.counters.lu_be_tax_note;
      expect(note, lang).toMatch(/2022/);
      expect(note, lang).toMatch(/10 (Feb|févr|feb)|10\. Feb/);
      expect(note, lang).toMatch(/2024/);
      expect(note, lang).toMatch(proof[lang as keyof typeof proof]);
    }
  });

  it('L3: the AI summary lists Dutch and the Dutch landing page', () => {
    expect(llmsTxt()).toMatch(/Languages: English, French, German, Italian, Dutch/);
    expect(llmsTxt()).toMatch(/borderday\.com\/nl\//);
  });

  it('L4: the FAQ summary lists all seven tax corridors, including the 1983 cantons, in every locale', () => {
    const named = { en: /1983-agreement cantons/, fr: /cantons de l’accord de 1983/, de: /Kantone des Abkommens von 1983/, it: /cantoni dell’accordo del 1983/, nl: /1983-verdragskantons/ };
    for (const [lang, pattern] of Object.entries(named)) {
      const summary = (PAGES as Record<string, Record<string, { summary: string }>>).faq[lang].summary;
      expect(summary, lang).toMatch(pattern);
      expect(summary.match(/\(([^)]*)\)/)![1].split(',').length, lang).toBe(7);
    }
  });

  it('L5: France→Belgium says no day limit, and nothing says a tax counter is coming', () => {
    expect(getBorderPack('belgium_fr')!.noTaxChipKey).toBe('chipTaxNoDayLimit');
    expect(getBorderPack('belgium_nl')!.noTaxChipKey).toBeUndefined();
    expect(en.home.chipTaxNoDayLimit).toBe('Tax: no day limit');
    for (const [lang, d] of Object.entries(dicts)) {
      expect(d.home.chipTaxNoDayLimit, lang).toBeTruthy();
      expect(`${d.home.chipTaxNo} ${d.faq.a5}`, lang).not.toMatch(/not yet|\byet\b|pas encore|noch (nicht|kein)|non ancora|per ora|nog (niet|geen)/i);
    }
  });

  it('L6: the unused keys are gone from every locale', () => {
    for (const [lang, d] of Object.entries(dicts)) {
      for (const key of ['pending_lu_be_tax', 'pending_lu_de_tax', 'ch_fr_1983_value', 'ch_fr_1983_note']) {
        expect(key in d.counters, `${lang} ${key}`).toBe(false);
      }
    }
  });

  it('L7: a half-day mission that still fits inside the quota is counted', () => {
    const split = chFrMissionSplit({ telework: 95.5, missions: 0.5, annualWorkingDays: 240, quotaPercent: 40, capDays: 10 });
    expect(split).toMatchObject({ counted: 0.5, excess: 0, rateDays: 96 });
    const partly = chFrMissionSplit({ telework: 95.5, missions: 2, annualWorkingDays: 240, quotaPercent: 40, capDays: 10 });
    expect(partly).toMatchObject({ counted: 0.5, excess: 1.5 });
    // A sliver smaller than half a day still counts for nothing.
    expect(chFrMissionSplit({ telework: 88, missions: 1, annualWorkingDays: 221, quotaPercent: 40, capDays: 10 }).counted).toBe(0);
  });

  it('L8: the 1983 route has its own hint, resting on the 22 Dec 2022 agreement', () => {
    expect(getBorderPack('basel_fr')!.dayHintKeys?.telework).toBe('teleworkHint_ch_fr_1983');
    expect(getBorderPack('geneva_fr')!.dayHintKeys?.telework).toBe('teleworkHint_ch_fr');
    const urls = getBorderPack('basel_fr')!.counters.flatMap((c) => c.sources ?? []).map((s) => s.url);
    expect(urls.some((u) => u.endsWith('accord-amiable-frontaliers-83.pdf'))).toBe(true);
    for (const [lang, d] of Object.entries(dicts)) {
      const hint = d.dayTypes.teleworkHint_ch_fr_1983;
      expect(hint, lang).toMatch(/22/);
      expect(hint, lang).not.toMatch(/convention|Abkommen vom 27|verdragsregime/i);
    }
  });

  it('L9: the base hint labels 240 on Germany→Switzerland as an assumption', () => {
    const named = { en: /Germany–Switzerland/, fr: /Allemagne–Suisse/, de: /Deutschland–Schweiz/, it: /Germania–Svizzera/, nl: /Duitsland–Zwitserland/ };
    for (const [lang, d] of Object.entries(dicts)) {
      expect((d as typeof en).app.annualWorkingDaysHint, lang).toMatch(named[lang as keyof typeof named]);
    }
  });

  it('L10: the 1983 note carries the on-call rule of agreement §2', () => {
    const named = { en: /On-call time counts only/, fr: /astreinte ne compte/, de: /Bereitschaftsdienst zählt nur/, it: /reperibilità conta solo/, nl: /Wachtdienst telt alleen/ };
    for (const [lang, d] of Object.entries(dicts)) {
      expect(d.counters.ch_fr_1983_tax_note, lang).toMatch(named[lang as keyof typeof named]);
    }
  });
});

import { describe, expect, it } from 'vitest';
import { getBorderPack } from '../src/borders/packs';
import type { BorderPack, CounterResult, DayEntry, DayType, EmploymentProfile } from '../src/borders/types';
import { needsFilingNote, rowsToCsv, summarizeEmployee } from '../src/company/dashboardMath';
import { annualBaseFor, contractDaysLimit, evaluateCounter, evaluatePack } from '../src/lib/counting';
import de from '../src/i18n/de';
import en from '../src/i18n/en';
import fr from '../src/i18n/fr';
import itDict from '../src/i18n/it';
import nl from '../src/i18n/nl';

const dicts = { en, fr, de, it: itDict, nl };

function run(count: number, type: DayType, opts: Partial<DayEntry> = {}): DayEntry[] {
  return Array.from({ length: count }, (_, i) => ({
    date: `2026-${String(Math.floor(i / 28) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    type,
    ...opts,
  }));
}

const counter = (pack: BorderPack, id: string) => pack.counters.find((c) => c.id === id)!;
const keys = (r: CounterResult) => r.messages.map((m) => m.key);
const message = (r: CounterResult, key: string) => r.messages.find((m) => m.key === key);

describe('H1: employment % scales the percentage base', () => {
  const geneva = getBorderPack('geneva_fr')!;
  const profile = { employmentPercent: 50 };

  it('unset base: 240 × 50% = 120', () => {
    expect(annualBaseFor(geneva, null, profile)).toBe(120);
    expect(annualBaseFor(geneva, undefined, profile)).toBe(120);
    expect(annualBaseFor(geneva, null, {})).toBe(240);
    expect(annualBaseFor(geneva, 200, profile)).toBe(200);
    expect(annualBaseFor(getBorderPack('luxembourg_fr')!, null, { employmentPercent: 33 })).toBe(73); // 72.6
  });

  it('audit scenario: 50%, 50 telework days is over 40% and needs an A1, not "below limit"', () => {
    const results = evaluatePack(geneva, run(50, 'telework'), { year: 2026, profile });
    const tax = results.find((r) => r.counterId === 'geneva_tax_telework_40')!;
    expect(tax.annualWorkingDays).toBe(120);
    expect(tax.percentOfAnnual).toBeCloseTo(41.67, 2);
    expect(tax.allowedDays).toBe(48);
    expect(tax.status).toBe('over');
    const ss = results.find((r) => r.counterId === 'geneva_ss_50')!;
    expect(ss.statusLabelKey).toBe('status_a1_required');
  });

  it('audit scenario: Ticino 50%, 40 telework days is over the 25%', () => {
    const pack = getBorderPack('ticino_it')!;
    const r = evaluateCounter(pack, counter(pack, 'ticino_tax_telework_25'), run(40, 'telework'), { year: 2026, profile });
    expect(r.percentOfAnnual).toBeCloseTo(33.33, 2);
    expect(r.status).toBe('over');
  });

  it('shows the scaled base used, on every percentage counter of a part-timer', () => {
    const r = evaluateCounter(geneva, counter(geneva, 'geneva_tax_telework_40'), [], { year: 2026, profile });
    expect(message(r, 'base_scaled')).toEqual({ key: 'base_scaled', tone: 'info', vars: { annual: 120, full: 240, pct: 50 } });
  });

  it('warns when employment is below 100% and the base still equals the full-time default', () => {
    const r = evaluateCounter(geneva, counter(geneva, 'geneva_tax_telework_40'), [], {
      year: 2026,
      annualWorkingDays: 240,
      profile,
    });
    expect(message(r, 'base_full_time')).toEqual({
      key: 'base_full_time',
      tone: 'warn',
      vars: { annual: 240, pct: 50, scaled: 120 },
    });
    expect(keys(r)).not.toContain('base_scaled');
  });

  it('says nothing for full-time, for an unset percentage, or for a custom base', () => {
    const silent = (annualWorkingDays: number | null, p: EmploymentProfile) =>
      keys(evaluateCounter(geneva, counter(geneva, 'geneva_tax_telework_40'), [], { year: 2026, annualWorkingDays, profile: p }));
    for (const k of [silent(null, { employmentPercent: 100 }), silent(null, {}), silent(120, profile), silent(240, {})]) {
      expect(k).not.toContain('base_scaled');
      expect(k).not.toContain('base_full_time');
    }
  });

  it('reaches the HR dashboard and the CSV', () => {
    const row = summarizeEmployee({
      userId: 'u',
      displayName: 'E',
      email: 'e@x.test',
      borderPackId: 'geneva_fr',
      annualWorkingDays: null,
      profile,
      logs: [],
      year: 2026,
    });
    expect(row.annualWorkingDays).toBe(120);
    expect(row.storedAnnualWorkingDays).toBeNull();
    expect(row.counters.find((c) => c.counterId === 'geneva_tax_telework_40')!.annualWorkingDays).toBe(120);
    expect(rowsToCsv([row], 2026).split('\n')[2]).toContain(',120,50,');
  });
});

describe('H2: under-25% copy', () => {
  const pack = getBorderPack('basel_fr')!;

  it('keeps the band and its label, and the message is the reworded key', () => {
    const r = evaluateCounter(pack, counter(pack, 'basel_fr_ss_50'), run(10, 'telework'), { year: 2026 });
    expect(r.statusLabelKey).toBe('status_ss_under');
    expect(message(r, 'ss_band_under')).toMatchObject({ tone: 'info', vars: { from: 25 } });
  });

  it('every locale drops the A1 claim and states who decides, on the band and in both notes', () => {
    const words = {
      en: /framework does not apply.*employer’s state normally stays competent.*residence-state institution.*determines the legislation/,
      fr: /accord-cadre ne s’applique pas.*État de l’employeur reste normalement compétent.*institution de l’État de résidence.*détermine la législation/,
      de: /(Rahmenübereinkommen gilt nicht|gilt das Rahmenübereinkommen nicht).*[Ss]taat des Arbeitgebers bleibt in der Regel zuständig.*Stelle des Wohnstaats.*anwendbare Recht bestimmt/,
      it: /accordo quadro non si applica.*Stato del datore di lavoro resta normalmente competente.*istituzione dello Stato di residenza.*determina la legislazione/,
      nl: /(kaderakkoord is niet van toepassing|is het kaderakkoord niet van toepassing).*staat van de werkgever blijft normaal bevoegd.*instelling van de woonstaat.*toepasselijke wetgeving bepaalt/,
    };
    const banned = /no A1|pas d’A1|aucune attestation A1|keine A1|nessun[a]? A1|non è necessaria un’A1|geen A1/;
    for (const [lang, d] of Object.entries(dicts) as Array<[keyof typeof words, typeof en]>) {
      for (const text of [d.counters.ss_band_under, d.counters.ss_framework_note, d.counters.ss_framework_lu_note]) {
        expect(text, lang).toMatch(words[lang]);
        expect(text, lang).not.toMatch(banned);
      }
      expect(d.counters.ss_band_under, lang).toContain('{from}');
    }
  });
});

describe('H3: basel_de 60 days cut by contract days', () => {
  const pack = getBorderPack('basel_de')!;
  const c = counter(pack, 'basel_de_nonreturn_60');
  const at = (days: number, profile: EmploymentProfile) =>
    evaluateCounter(pack, c, run(days, 'third_country'), { year: 2026, profile });

  it('audit scenario: 2-day week, 100 contract days, limit 24, and 30 days is over', () => {
    const r = at(30, { contractDaysPerYear: 100 });
    expect(r.limit).toBe(24);
    expect(r.status).toBe('over');
    expect(message(r, 'contract_days_estimate')).toEqual({
      key: 'contract_days_estimate',
      tone: 'info',
      vars: { days: 100, base: 250, limit: 24, full: 60 },
    });
    expect(message(r, 'basel_de_over_60')?.vars).toEqual({ limit: 24 });
  });

  it('rounds down, never below 1 and never above the full limit', () => {
    expect(contractDaysLimit(60, 110, 250)).toBe(26); // 26.4
    expect(contractDaysLimit(60, 2, 250)).toBe(1);
    expect(contractDaysLimit(60, 250, 250)).toBe(60);
    expect(contractDaysLimit(60, 300, 250)).toBe(60);
  });

  it('does not reuse employment %: 40% with no contract days keeps 60 and warns', () => {
    const r = at(10, { employmentPercent: 40 });
    expect(r.limit).toBe(60);
    expect(message(r, 'contract_days_missing')?.tone).toBe('warn');
    expect(keys(at(10, {}))).not.toContain('contract_days_missing');
    expect(keys(at(10, { employmentPercent: 100 }))).not.toContain('contract_days_missing');
    expect(keys(at(10, { employmentPercent: 40, contractDaysPerYear: 250 }))).not.toContain('contract_days_missing');
  });

  it('applies to no other corridor', () => {
    const other = getBorderPack('ticino_it')!;
    const r = evaluateCounter(other, counter(other, 'ticino_tax_nonreturn_45'), [], { year: 2026, profile: { contractDaysPerYear: 100 } });
    expect(r.limit).toBe(45);
  });

  it('the note discloses the estimate and part-year, in every locale', () => {
    for (const [lang, d] of Object.entries(dicts)) {
      expect(d.counters.basel_de_nonreturn_note, lang).toMatch(/§9\(2\).*250.*300/);
      expect(d.counters.basel_de_nonreturn_note, lang).toMatch(/§10\(2\)/);
      expect(d.counters.basel_de_over_60, lang).toContain('{limit}');
    }
  });
});

describe('H4: belgium_fr pre-2012', () => {
  const pack = getBorderPack('belgium_fr')!;
  const c = counter(pack, 'be_fr_pre2012_30');
  const profile = { frontierBefore2012: true };

  it('a half-day counts as a whole day', () => {
    expect(c.fractionCountsAsFull).toBe(true);
    const r = evaluateCounter(pack, c, run(3, 'telework', { dayShare: 0.5 }), { year: 2026, profile });
    expect(r.used).toBe(3);
  });

  it('every locale states the first and the second breach, and the exclusions', () => {
    const breach = {
      en: /First breach.*for that year.*Second breach.*permanently/,
      fr: /Premier dépassement.*pour l’année.*Second dépassement.*définitivement/,
      de: /Erste Überschreitung.*für dieses Jahr.*Zweite Überschreitung.*endgültig/,
      it: /Primo superamento.*per quell’anno.*Secondo superamento.*definitivamente/,
      nl: /Eerste overschrijding.*voor dat jaar.*Tweede overschrijding.*definitief/,
    };
    for (const [lang, d] of Object.entries(dicts) as Array<[keyof typeof breach, typeof en]>) {
      expect(d.counters.be_fr_pre2012_note, lang).toMatch(breach[lang]);
      expect(d.counters.be_fr_pre2012_over, lang).toMatch(breach[lang]);
      expect(d.counters.be_fr_pre2012_note, lang).toMatch(/§130/);
      expect(d.counters.be_fr_pre2012_note, lang).toMatch(/\b5\b/);
    }
  });
});

describe('H5: luxembourg_de note', () => {
  it('every locale covers on-call at home and the 30-minute line', () => {
    const onCall = {
      en: /on-call.*no call-out.*telework/,
      fr: /astreinte.*sans intervention.*télétravail/,
      de: /Bereitschaftsdienst.*ohne Einsatz.*Telearbeit/,
      it: /reperibilità.*senza intervento.*telelavoro/,
      nl: /wachtdienst.*zonder oproep.*telewerk/,
    };
    for (const [lang, d] of Object.entries(dicts) as Array<[keyof typeof onCall, typeof en]>) {
      expect(d.counters.lu_de_tax_note, lang).toMatch(onCall[lang]);
      expect(d.counters.lu_de_tax_note, lang).toMatch(/30 (minutes|Minuten|minuti|minuten)/);
    }
  });

  it('on-call days logged as telework count', () => {
    const pack = getBorderPack('luxembourg_de')!;
    const r = evaluateCounter(pack, counter(pack, 'lu_de_tax_34'), run(35, 'telework'), { year: 2026 });
    expect(r.status).toBe('over');
  });
});

describe('H6: filing dates for Geneva and Jura', () => {
  const row = (borderPackId: 'geneva_fr' | 'basel_fr' | 'luxembourg_fr') =>
    summarizeEmployee({ userId: 'u', displayName: 'E', email: 'e@x.test', borderPackId, annualWorkingDays: null, logs: [], year: 2026 });

  it('shows only where a filing was verified', () => {
    expect(needsFilingNote([row('geneva_fr')])).toBe(true);
    expect(needsFilingNote([row('basel_fr')])).toBe(true);
    expect(needsFilingNote([row('luxembourg_fr')])).toBe(false);
    expect(needsFilingNote([])).toBe(false);
  });

  it('the CSV note carries the dates only then, and stays one comment line', () => {
    const lines = rowsToCsv([row('geneva_fr')], 2026).split('\n');
    expect(lines[0]).toMatch(/^# .*January 2027 for 2026 data.*Jura.*31 January.*Other cantons not verified/);
    expect(lines[1].startsWith('demo,')).toBe(true);
    expect(rowsToCsv([row('luxembourg_fr')], 2026).split('\n')[0]).not.toMatch(/2027|Jura/);
  });

  it('every locale cites Geneva and Jura, and keeps "working record, not a filing"', () => {
    const notFiling = {
      en: /working record, not a filing/,
      fr: /document de travail, pas une déclaration/,
      de: /Arbeitsunterlage, keine Meldung/,
      it: /documento di lavoro, non una dichiarazione/,
      nl: /werkdocument, geen aangifte/,
    };
    for (const [lang, d] of Object.entries(dicts) as Array<[keyof typeof notFiling, typeof en]>) {
      const note = d.company.filingNote;
      expect(note, lang).toMatch(/2027/);
      expect(note, lang).toMatch(/2026/);
      expect(note, lang).toMatch(/ge\.ch/);
      expect(note, lang).toMatch(/jura\.ch/);
      expect(note, lang).toMatch(/\b31\b/);
      expect(note, lang).toMatch(notFiling[lang]);
    }
  });
});

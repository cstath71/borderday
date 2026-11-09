import { describe, expect, it } from 'vitest';
import { BORDER_PACKS, getBorderPack } from '../src/borders/packs';
import type { BorderId, DayEntry } from '../src/borders/types';
import { aggregateStatus, summarizeEmployee } from '../src/company/dashboardMath';
import de from '../src/i18n/de';
import en from '../src/i18n/en';
import fr from '../src/i18n/fr';
import itDict from '../src/i18n/it';
import nl from '../src/i18n/nl';
import { evaluateCounter } from '../src/lib/counting';

const dicts = { en, fr, de, it: itDict, nl };

function counter(packId: BorderId, counterId: string) {
  const pack = getBorderPack(packId)!;
  return { pack, counter: pack.counters.find((c) => c.id === counterId)! };
}

function used(packId: BorderId, counterId: string, entries: DayEntry[]) {
  const { pack, counter: c } = counter(packId, counterId);
  return evaluateCounter(pack, c, entries, { year: 2026, today: '2026-11-01' }).used;
}

describe('M1: a night away is binary', () => {
  const halfNight: DayEntry = { date: '2026-03-02', type: 'onsite', dayShare: 0.5, overnightAway: true };

  it.each([
    ['basel_fr', 'basel_fr_tax_nights_45'],
    ['basel_de', 'basel_de_nonreturn_60'],
    ['ticino_it', 'ticino_tax_nonreturn_45'],
  ] as const)('%s: a half day flagged overnight is one night', (pack, id) => {
    expect(used(pack, id, [halfNight])).toBe(1);
    expect(used(pack, id, [{ ...halfNight, type: 'third_country' }])).toBe(1);
  });

  it('every counter that uses the overnight flag is covered', () => {
    const ids = BORDER_PACKS.flatMap((p) => p.counters.filter((c) => c.countsOvernight).map((c) => c.id));
    expect(ids.sort()).toEqual(['basel_de_nonreturn_60', 'basel_fr_tax_nights_45', 'ticino_tax_nonreturn_45']);
  });

  it('basel_de: a half-day third-state trip counts in full, flagged or not (§8(5))', () => {
    expect(used('basel_de', 'basel_de_nonreturn_60', [{ date: '2026-03-02', type: 'third_country', dayShare: 0.5 }])).toBe(1);
  });

  it('an unflagged half day still counts nothing on the night counters', () => {
    expect(used('ticino_it', 'ticino_tax_nonreturn_45', [{ date: '2026-03-02', type: 'onsite', dayShare: 0.5 }])).toBe(0);
    expect(used('basel_fr', 'basel_fr_tax_nights_45', [{ date: '2026-03-02', type: 'onsite', dayShare: 0.5 }])).toBe(0);
  });

  it('a flag on a half telework day is still not a work night away', () => {
    expect(used('ticino_it', 'ticino_tax_nonreturn_45', [{ ...halfNight, type: 'telework' }])).toBe(0);
  });

  it('basel_fr: a flagged half-day trip adds one night and never a negative excess', () => {
    const trip: DayEntry = { date: '2026-03-02', type: 'third_country', dayShare: 0.5, overnightAway: true };
    expect(used('basel_fr', 'basel_fr_tax_nights_45', [trip])).toBe(1);
    const trips = [0, 1, 2].map((i) => ({ ...trip, date: `2026-03-0${i + 2}` }));
    const telework = Array.from({ length: 96 }, (_, i) => ({
      date: new Date(Date.UTC(2026, 3, 1 + i)).toISOString().slice(0, 10),
      type: 'telework' as const,
    }));
    // All 1.5 mission days are excess, and all are flagged: three nights, not three plus the excess.
    expect(used('basel_fr', 'basel_fr_tax_nights_45', [...telework, ...trips])).toBe(3);
  });

  it('half days stay half on the percentage counters', () => {
    expect(
      evaluateCounter(getBorderPack('ticino_it')!, counter('ticino_it', 'ticino_tax_telework_25').counter,
        [{ date: '2026-03-02', type: 'telework', dayShare: 0.5, overnightAway: true }],
        { year: 2026, today: '2026-11-01' }).usedDays,
    ).toBe(0.5);
  });
});

describe('M5: the Basel-Stadt staff floor does not flag other employers', () => {
  it('a Zurich employer: "below minimum" on the floor leaves the dashboard status at the other counters', () => {
    const floor = { kind: 'employer_practice', enabled: true, status: 'warn' } as const;
    const tax = { kind: 'tax', enabled: true, status: 'ok' } as const;
    const ss = { kind: 'social_security', enabled: true, status: 'ok' } as const;
    expect(aggregateStatus([tax, floor, ss])).toBe('ok');
    expect(aggregateStatus([{ ...tax, status: 'critical' }, floor, ss])).toBe('critical');
  });

  it('employer_practice stays out of worstStatus; tax regular-return floor can warn with no onsite', () => {
    const row = summarizeEmployee({
      userId: 'u1',
      displayName: 'A',
      email: 'a@example.com',
      borderPackId: 'basel_de',
      annualWorkingDays: null,
      logs: [{ workDate: `${new Date().getUTCFullYear()}-01-05`, dayType: 'telework' }],
      year: new Date().getUTCFullYear(),
    });
    expect(row.counters.some((c) => c.counterId === 'basel_de_employer_practice')).toBe(true);
    const taxFloor = row.counters.find((c) => c.counterId === 'basel_de_regular_return_20')!;
    expect(taxFloor.kind).toBe('tax');
    // No on-site days mid-year → projected regular-return pace is low.
    expect(['warn', 'critical', 'ok']).toContain(taxFloor.status);
    expect(row.worstStatus).toBe(taxFloor.status === 'ok' ? 'ok' : taxFloor.status);
  });

  it('the floor still reports below minimum on its own card', () => {
    const { pack, counter: floor } = counter('basel_de', 'basel_de_employer_practice');
    const r = evaluateCounter(pack, floor, [{ date: '2026-01-05', type: 'telework' }], {
      year: 2026,
      referenceMonth: '2026-01',
      today: '2026-11-01',
    });
    expect(r.status).toBe('warn');
    expect(r.statusLabelKey).toBe('status_floor_below');
  });

  it('tax counters on the same pack still drive worstStatus', () => {
    const row = summarizeEmployee({
      userId: 'u1',
      displayName: 'A',
      email: 'a@example.com',
      borderPackId: 'basel_de',
      annualWorkingDays: null,
      logs: Array.from({ length: 61 }, (_, i) => ({
        workDate: new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10),
        dayType: 'third_country' as const,
      })),
      year: 2026,
    });
    expect(row.worstStatus).toBe('over');
  });
});

describe('M2, M4, M8: sources', () => {
  const allSources = BORDER_PACKS.flatMap((p) => p.counters.flatMap((c) => c.sources));

  it('M2: Circular 71 uses the path that resolves, freshly stamped', () => {
    const src = counter('luxembourg_de', 'lu_de_tax_34').counter.sources.find((s) => /Circulaire/.test(s.title))!;
    expect(src.url).toBe('https://impotsdirects.public.lu/dam-assets/fr/legislation/circulaires/circulaire-lg-conv-di-71-du-18-mars-2024.pdf');
    expect(src.checked).toBe('2026-11-01');
    expect(allSources.some((s) => s.url.includes('/legi24/'))).toBe(false);
  });

  it('M4: the 13 Feb 2026 release is SIF / EFD and leaves the 45-day counter', () => {
    const isRelease = (url: string) => url.includes('efd.admin.ch');
    const release = counter('ticino_it', 'ticino_tax_telework_25').counter.sources.find((s) => isRelease(s.url))!;
    expect(release.title).toMatch(/SIF \/ EFD/);
    expect(release.title).not.toMatch(/FSIO/);
    expect(release.url).toBe('https://www.efd.admin.ch/en/newnsb/KIyFJwwqspqaOcHDaT7u0');
    expect(counter('ticino_it', 'ticino_tax_nonreturn_45').counter.sources.some((s) => isRelease(s.url))).toBe(false);
  });

  it('Italy–Switzerland copy names SIF / EFD for 13 Feb 2026 and drops the unsourced limit sentence', () => {
    expect(en.counters.ch_it_tax_note).toMatch(/SIF \/ EFD/);
    expect(fr.counters.ch_it_tax_note).toMatch(/SFI \/ DFF/);
    expect(de.counters.ch_it_tax_note).toMatch(/SIF \/ EFD/);
    expect(itDict.counters.ch_it_tax_note).toMatch(/SFI \/ DFF/);
    expect(nl.counters.ch_it_tax_note).toMatch(/SIF \/ EFD/);
    for (const [lang, d] of Object.entries(dicts)) {
      for (const s of [d.counters.ch_it_tax_note, d.counters.ch_it_nonreturn_note, d.counters.ch_it_over]) {
        expect(s, lang).not.toMatch(/FSIO|OFAS|UFAS|\bBSV\b/);
        expect(s, lang).not.toMatch(/normal rules of the agreement|règles normales de l’accord|normalen Regeln des Abkommens|regole normali dell’accordo|normale regels van het akkoord/);
      }
    }
  });

  it('M8: the DE–CH instrument carries its signature dates, not the filename date', () => {
    for (const [lang, d] of Object.entries(dicts)) {
      expect(d.counters.basel_de_nonreturn_note, lang).not.toMatch(/\b26\b.{0,3}(July|juillet|Juli|luglio|juli)/);
      expect(d.counters.basel_de_nonreturn_note, lang).toMatch(/15.{1,7}18/);
    }
    const src = counter('basel_de', 'basel_de_nonreturn_60').counter.sources.find((s) => s.url.includes('kv-20220718'))!;
    expect(src.title).toMatch(/15 and 18 Jul 2022/);
    expect(src.title).not.toMatch(/26 Jul/);
  });
});

describe('M3, M6, M7: applicability, counting method, exceptions', () => {
  it('M3: Ticino states the residence and employment conditions in every language', () => {
    for (const [lang, d] of Object.entries(dicts)) {
      expect(d.borders.ticino_region, lang).toMatch(/20.?km/);
      expect(d.borders.ticino_region, lang).toMatch(/Art\. 2|art\. 2/);
    }
    expect(en.borders.ticino_region).toMatch(/employment in the frontier area/);
    expect(en.borders.ticino_region).toMatch(/ask your authority/);
  });

  it('M6: both CH–FR notes give the three methods and the uniform-staff rule', () => {
    for (const [lang, d] of Object.entries(dicts)) {
      for (const note of [d.counters.ch_fr_tax_note, d.counters.ch_fr_1983_tax_note]) {
        expect(note, lang).toMatch(/4 (hours|heures|Stunden|ore|uur)/);
        expect(note, lang).toMatch(/2 (hours|heures|Stunden|ore|uur)/);
      }
      expect((d.dayTypes as Record<string, string>).logHint_ch_fr, lang).toBeTruthy();
    }
    expect(getBorderPack('geneva_fr')!.logHintKey).toBe('logHint_ch_fr');
    expect(getBorderPack('basel_fr')!.logHintKey).toBe('logHint_ch_fr');
    expect(en.counters.ch_fr_tax_note).toMatch(/same one for all staff/);
    expect(en.counters.ch_fr_1983_tax_note).toMatch(/uniformly to all staff/);
  });

  it('M7: exceptions are disclosed per pack and attributed to their source', () => {
    for (const [lang, d] of Object.entries(dicts)) {
      expect(d.borders.geneva_region, lang).toMatch(/ge\.ch/);
      expect(d.borders.ch_fr_1983_region, lang).toMatch(/impots\.gouv\.fr/);
      expect(d.borders.ch_fr_1983_region, lang).toMatch(/45/);
      expect(d.borders.basel_region, lang).toMatch(/13/);
      expect(d.borders.basel_region, lang).toMatch(/883\/2004/);
    }
  });
});

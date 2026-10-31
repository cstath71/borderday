import { describe, expect, it } from 'vitest';
import { BORDER_PACKS, getBorderPack } from '../src/borders/packs';
import type { DayEntry } from '../src/borders/types';
import {
  allowedDaysForPercent,
  countType,
  evaluateCounter,
  evaluatePack,
} from '../src/lib/counting';

function days(specs: Array<[string, DayEntry['type']]>): DayEntry[] {
  return specs.map(([date, type]) => ({ date, type }));
}

describe('allowedDaysForPercent (ge.ch-style annual base)', () => {
  it('40% of 240 → 96 days', () => {
    expect(allowedDaysForPercent(40, 240)).toBe(96);
  });
  it('50% of 240 → 120 days', () => {
    expect(allowedDaysForPercent(50, 240)).toBe(120);
  });
  it('25% of 240 → 60 days', () => {
    expect(allowedDaysForPercent(25, 240)).toBe(60);
  });
  it('50% of 220 → 110 days', () => {
    expect(allowedDaysForPercent(50, 220)).toBe(110);
  });
});

describe('one telework day is never over-limit for any % counter', () => {
  const oneDay = days([['2026-01-05', 'telework']]);

  for (const pack of BORDER_PACKS) {
    const percentCounters = pack.counters.filter(
      (c) => c.enabled && c.unit === 'percent_of_working_time',
    );
    for (const counter of percentCounters) {
      it(`${pack.id} / ${counter.id}: 1 telework day stays within limit`, () => {
        const annual = pack.defaultAnnualWorkingDays;
        const r = evaluateCounter(pack, counter, oneDay, {
          year: 2026,
          annualWorkingDays: annual,
        });
        expect(r.enabled).toBe(true);
        expect(r.usedDays).toBe(1);
        expect(r.allowedDays).toBe(allowedDaysForPercent(counter.limit!, annual));
        expect(r.percentOfAnnual).toBeCloseTo((1 / annual) * 100, 2);
        expect(r.ratio).toBeLessThan(0.75);
        expect(r.status).toBe('ok');
        expect(r.status).not.toBe('over');
      });
    }
  }
});

describe('Geneva / Romandie–FR', () => {
  const pack = getBorderPack('geneva_fr')!;

  it('measures telework share against annual contractual days, not logged days', () => {
    const entries = days([
      ['2026-01-05', 'telework'],
      ['2026-01-06', 'telework'],
      ['2026-01-07', 'onsite'],
      ['2026-01-08', 'onsite'],
      ['2026-01-09', 'non_working'],
    ]);
    const tax = pack.counters.find((c) => c.id === 'geneva_tax_telework_40')!;
    const r = evaluateCounter(pack, tax, entries, { year: 2026, annualWorkingDays: 240 });
    expect(r.enabled).toBe(true);
    expect(r.usedDays).toBe(2);
    expect(r.allowedDays).toBe(96);
    expect(r.percentOfAnnual).toBeCloseTo((2 / 240) * 100, 2);
    expect(r.limit).toBe(40);
    expect(r.status).toBe('ok'); // 2/96 ≪ 0.75
  });

  it('warns at 75% of annual allowance (72 of 96 days)', () => {
    const entries: DayEntry[] = [];
    for (let i = 0; i < 72; i++) {
      const month = String(Math.floor(i / 28) + 1).padStart(2, '0');
      const day = String((i % 28) + 1).padStart(2, '0');
      entries.push({ date: `2026-${month}-${day}`, type: 'telework' });
    }
    const tax = pack.counters.find((c) => c.id === 'geneva_tax_telework_40')!;
    const r = evaluateCounter(pack, tax, entries, { year: 2026, annualWorkingDays: 240 });
    expect(r.usedDays).toBe(72);
    expect(r.ratio).toBeCloseTo(0.75, 5);
    expect(r.status).toBe('warn');
  });

  it('over limit only when usedDays >= allowedDays', () => {
    const entries: DayEntry[] = [];
    for (let i = 0; i < 96; i++) {
      const month = String(Math.floor(i / 28) + 1).padStart(2, '0');
      const day = String((i % 28) + 1).padStart(2, '0');
      entries.push({ date: `2026-${month}-${day}`, type: 'telework' });
    }
    const tax = pack.counters.find((c) => c.id === 'geneva_tax_telework_40')!;
    const r = evaluateCounter(pack, tax, entries, { year: 2026, annualWorkingDays: 240 });
    expect(r.usedDays).toBe(96);
    expect(r.status).toBe('over');
  });

  it('counts third_country toward mission 10-day cap and toward 40% annual share', () => {
    const entries = days([
      ['2026-02-02', 'third_country'],
      ['2026-02-03', 'third_country'],
      ['2026-02-04', 'onsite'],
    ]);
    const missions = pack.counters.find((c) => c.id === 'geneva_tax_missions_10')!;
    const tax40 = pack.counters.find((c) => c.id === 'geneva_tax_telework_40')!;
    const m = evaluateCounter(pack, missions, entries, { year: 2026 });
    const t = evaluateCounter(pack, tax40, entries, { year: 2026, annualWorkingDays: 240 });
    expect(m.used).toBe(2);
    expect(t.usedDays).toBe(2);
    expect(t.percentOfAnnual).toBeCloseTo((2 / 240) * 100, 2);
    expect(t.status).toBe('ok');
  });

  it('excludes non_working from telework % and missions', () => {
    const entries = days([
      ['2026-03-02', 'non_working'],
      ['2026-03-03', 'non_working'],
      ['2026-03-04', 'telework'],
    ]);
    const tax = pack.counters.find((c) => c.id === 'geneva_tax_telework_40')!;
    const r = evaluateCounter(pack, tax, entries, { year: 2026, annualWorkingDays: 240 });
    expect(r.usedDays).toBe(1);
    expect(r.percentOfAnnual).toBeCloseTo((1 / 240) * 100, 2);
    expect(r.status).toBe('ok');
    expect(countType(entries, 'non_working', 2026)).toBe(2);
  });

  it('social-security framework uses telework only toward annual %', () => {
    const entries = days([
      ['2026-04-01', 'telework'],
      ['2026-04-02', 'third_country'],
      ['2026-04-03', 'onsite'],
      ['2026-04-04', 'onsite'],
    ]);
    const ss = pack.counters.find((c) => c.id === 'geneva_ss_50')!;
    const r = evaluateCounter(pack, ss, entries, { year: 2026, annualWorkingDays: 240 });
    expect(r.usedDays).toBe(1); // third_country does not count toward SS %
    expect(r.allowedDays).toBe(120);
    expect(r.percentOfAnnual).toBeCloseTo((1 / 240) * 100, 2);
    expect(r.status).toBe('ok');
  });
});

describe('Luxembourg ← France', () => {
  const pack = getBorderPack('luxembourg_fr')!;

  it('counts telework and third_country toward 34-day tax tolerance', () => {
    const entries: DayEntry[] = [];
    for (let i = 1; i <= 30; i++) {
      entries.push({ date: `2026-05-${String(i).padStart(2, '0')}`, type: 'telework' });
    }
    entries.push({ date: '2026-06-01', type: 'third_country' });
    entries.push({ date: '2026-06-02', type: 'onsite' });
    entries.push({ date: '2026-06-03', type: 'non_working' });
    const tax = pack.counters.find((c) => c.id === 'lu_fr_tax_34')!;
    const r = evaluateCounter(pack, tax, entries, { year: 2026 });
    expect(r.used).toBe(31); // 30 telework + 1 third_country; onsite/non_working excluded
    expect(r.limit).toBe(34);
    expect(r.status).toBe('critical'); // 31/34 ≈ 0.91
  });

  it('SS 50% uses annual contractual days (220 default)', () => {
    const entries = days([['2026-01-05', 'telework']]);
    const ss = pack.counters.find((c) => c.id === 'lu_fr_ss_50')!;
    const r = evaluateCounter(pack, ss, entries, { year: 2026 });
    expect(r.usedDays).toBe(1);
    expect(r.allowedDays).toBe(110);
    expect(r.status).toBe('ok');
  });
});

describe('Ticino ← Italy', () => {
  const pack = getBorderPack('ticino_it')!;

  it('25% telework cap against annual days and 45 non-return days', () => {
    const entries = days([
      ['2026-07-01', 'telework'],
      ['2026-07-02', 'telework'],
      ['2026-07-03', 'onsite'],
      ['2026-07-04', 'onsite'],
      ['2026-07-05', 'onsite'],
      ['2026-07-06', 'onsite'],
      ['2026-07-07', 'onsite'],
      ['2026-07-08', 'onsite'],
      ['2026-07-09', 'third_country'],
      ['2026-07-10', 'non_working'],
    ]);
    const results = evaluatePack(pack, entries, { year: 2026, annualWorkingDays: 240 });
    const tele = results.find((r) => r.counterId === 'ticino_tax_telework_25')!;
    const nonret = results.find((r) => r.counterId === 'ticino_tax_nonreturn_45')!;
    expect(tele.usedDays).toBe(2);
    expect(tele.allowedDays).toBe(60);
    expect(tele.percentOfAnnual).toBeCloseTo((2 / 240) * 100, 2);
    expect(tele.status).toBe('ok');
    expect(nonret.used).toBe(1);
    expect(nonret.limit).toBe(45);
  });
});

describe('Disabled counters stay disabled', () => {
  it('Belgium FR tax is disabled', () => {
    const pack = getBorderPack('belgium_fr')!;
    const tax = pack.counters.find((c) => c.id === 'be_fr_tax')!;
    const r = evaluateCounter(pack, tax, [], { year: 2026 });
    expect(r.enabled).toBe(false);
    expect(r.status).toBe('disabled');
    expect(r.limit).toBeNull();
  });

  it('Basel DE tax is disabled; employer practice enabled', () => {
    const pack = getBorderPack('basel_de')!;
    const tax = pack.counters.find((c) => c.id === 'basel_de_tax')!;
    const emp = pack.counters.find((c) => c.id === 'basel_de_employer_practice')!;
    expect(tax.enabled).toBe(false);
    expect(emp.enabled).toBe(true);
    const entries = days([
      ['2026-08-03', 'onsite'],
      ['2026-08-04', 'onsite'],
      ['2026-08-05', 'onsite'],
      ['2026-08-06', 'onsite'],
      ['2026-08-07', 'onsite'],
      ['2026-08-10', 'telework'],
    ]);
    const r = evaluateCounter(pack, emp, entries, { year: 2026, referenceMonth: '2026-08' });
    expect(r.used).toBe(5);
  });

  it('Luxembourg BE/DE tax counters disabled', () => {
    expect(getBorderPack('luxembourg_be')!.counters.find((c) => c.id === 'lu_be_tax_34')!.enabled).toBe(false);
    expect(getBorderPack('luxembourg_de')!.counters.find((c) => c.id === 'lu_de_tax_34')!.enabled).toBe(false);
  });
});

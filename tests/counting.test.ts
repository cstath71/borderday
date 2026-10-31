import { describe, expect, it } from 'vitest';
import { getBorderPack } from '../src/borders/packs';
import type { DayEntry } from '../src/borders/types';
import { countType, evaluateCounter, evaluatePack } from '../src/lib/counting';

function days(specs: Array<[string, DayEntry['type']]>): DayEntry[] {
  return specs.map(([date, type]) => ({ date, type }));
}

describe('Geneva / Romandie–FR', () => {
  const pack = getBorderPack('geneva_fr')!;

  it('counts telework toward 40% tax share', () => {
    const entries = days([
      ['2026-01-05', 'telework'],
      ['2026-01-06', 'telework'],
      ['2026-01-07', 'onsite'],
      ['2026-01-08', 'onsite'],
      ['2026-01-09', 'non_working'],
    ]);
    const tax = pack.counters.find((c) => c.id === 'geneva_tax_telework_40')!;
    const r = evaluateCounter(pack, tax, entries, { year: 2026 });
    // 2 telework of 4 working days = 50%
    expect(r.enabled).toBe(true);
    expect(r.used).toBe(50);
    expect(r.limit).toBe(40);
    expect(r.status).toBe('over');
  });

  it('counts third_country toward mission 10-day cap and toward 40%', () => {
    const entries = days([
      ['2026-02-02', 'third_country'],
      ['2026-02-03', 'third_country'],
      ['2026-02-04', 'onsite'],
    ]);
    const missions = pack.counters.find((c) => c.id === 'geneva_tax_missions_10')!;
    const tax40 = pack.counters.find((c) => c.id === 'geneva_tax_telework_40')!;
    const m = evaluateCounter(pack, missions, entries, { year: 2026 });
    const t = evaluateCounter(pack, tax40, entries, { year: 2026 });
    expect(m.used).toBe(2);
    // Both third_country days count toward the 40% telework expression
    expect(t.used).toBeCloseTo((2 / 3) * 100, 1);
  });

  it('excludes non_working from telework % and missions', () => {
    const entries = days([
      ['2026-03-02', 'non_working'],
      ['2026-03-03', 'non_working'],
      ['2026-03-04', 'telework'],
    ]);
    const tax = pack.counters.find((c) => c.id === 'geneva_tax_telework_40')!;
    const r = evaluateCounter(pack, tax, entries, { year: 2026 });
    expect(r.used).toBe(100); // 1 of 1 working day
    expect(countType(entries, 'non_working', 2026)).toBe(2);
  });

  it('social-security framework uses telework only toward %', () => {
    const entries = days([
      ['2026-04-01', 'telework'],
      ['2026-04-02', 'third_country'],
      ['2026-04-03', 'onsite'],
      ['2026-04-04', 'onsite'],
    ]);
    const ss = pack.counters.find((c) => c.id === 'geneva_ss_50')!;
    const r = evaluateCounter(pack, ss, entries, { year: 2026 });
    expect(r.used).toBe(25); // 1 telework of 4 working
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
});

describe('Ticino ← Italy', () => {
  const pack = getBorderPack('ticino_it')!;

  it('25% telework cap and 45 non-return days', () => {
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
    const results = evaluatePack(pack, entries, { year: 2026 });
    const tele = results.find((r) => r.counterId === 'ticino_tax_telework_25')!;
    const nonret = results.find((r) => r.counterId === 'ticino_tax_nonreturn_45')!;
    // telework 2 of 9 working = 22.22%
    expect(tele.used).toBeCloseTo((2 / 9) * 100, 1);
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

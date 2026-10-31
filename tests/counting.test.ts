import { describe, expect, it } from 'vitest';
import { BORDER_PACKS, getBorderPack, hasTaxCounter } from '../src/borders/packs';
import type { BorderPack, DayEntry, DayType } from '../src/borders/types';
import {
  allowedDaysForPercent,
  chFrMissionSplit,
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

describe('Geneva and other non-1983 cantons ← FR', () => {
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

  it('"up to 40%": exactly the allowance is at limit, one more is over', () => {
    const entries: DayEntry[] = [];
    for (let i = 0; i < 96; i++) {
      const month = String(Math.floor(i / 28) + 1).padStart(2, '0');
      const day = String((i % 28) + 1).padStart(2, '0');
      entries.push({ date: `2026-${month}-${day}`, type: 'telework' });
    }
    const tax = pack.counters.find((c) => c.id === 'geneva_tax_telework_40')!;
    const r = evaluateCounter(pack, tax, entries, { year: 2026, annualWorkingDays: 240 });
    expect(r.usedDays).toBe(96);
    expect(r.status).toBe('at_limit');
    const over = evaluateCounter(pack, tax, [...entries, { date: '2026-12-01', type: 'telework' }], {
      year: 2026,
      annualWorkingDays: 240,
    });
    expect(over.status).toBe('over');
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
    expect(r.messages.map((m) => m.key)).toContain('prorate_missing');
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
    expect(nonret.used).toBe(0); // a same-day trip abroad is not a non-return day
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

  it('Luxembourg BE/DE tax counters enabled (34 days, no prorate)', () => {
    expect(getBorderPack('luxembourg_be')!.counters.find((c) => c.id === 'lu_be_tax_34')!.enabled).toBe(true);
    expect(getBorderPack('luxembourg_de')!.counters.find((c) => c.id === 'lu_de_tax_34')!.enabled).toBe(true);
  });
});

/** n distinct days from 1 Jan 2026 (or `start`), one type. Weekends are fine: the engine counts entries. */
function run(n: number, type: DayType, start = '2026-01-01', extra: Partial<DayEntry> = {}): DayEntry[] {
  const base = Date.parse(`${start}T12:00:00Z`);
  return Array.from({ length: n }, (_, i) => ({
    date: new Date(base + i * 864e5).toISOString().slice(0, 10),
    type,
    ...extra,
  }));
}
const counterOf = (pack: BorderPack, id: string) => pack.counters.find((c) => c.id === id)!;
const keysOf = (r: { messages: Array<{ key: string }> }) => r.messages.map((m) => m.key);
const TODAY = '2026-10-31';

describe('belgium_fr: Art. 11 pending + optional pre-2012 30-day counter', () => {
  const pack = getBorderPack('belgium_fr')!;

  it('keeps the general tax counter disabled and hasTaxCounter false', () => {
    expect(counterOf(pack, 'be_fr_tax').enabled).toBe(false);
    expect(hasTaxCounter(pack)).toBe(false);
  });

  it('hides the pre-2012 counter until the profile flag is set', () => {
    const c = counterOf(pack, 'be_fr_pre2012_30');
    expect(c.enabled).toBe(true);
    expect(c.requiresProfileFlag).toBe('frontierBefore2012');
    expect(c.limit).toBe(30);
    expect(c.inclusive).toBe(true);
    const off = evaluateCounter(pack, c, run(5, 'third_country'), { year: 2026 });
    expect(off.enabled).toBe(false);
    const on = evaluateCounter(pack, c, run(5, 'third_country'), {
      year: 2026,
      profile: { frontierBefore2012: true },
    });
    expect(on.enabled).toBe(true);
    expect(on.used).toBe(5);
    expect(on.limit).toBe(30);
    expect(on.status).toBe('ok');
  });

  it('counts only trip days toward the 30-day outside-zone proxy', () => {
    const c = counterOf(pack, 'be_fr_pre2012_30');
    const entries = [...run(3, 'telework'), ...run(4, 'third_country', '2026-02-01'), ...run(2, 'onsite', '2026-03-01')];
    const r = evaluateCounter(pack, c, entries, { year: 2026, profile: { frontierBefore2012: true } });
    expect(r.used).toBe(4);
  });

  it('goes over at 31 trip days and cites AN + BOFiP, not INAMI', () => {
    const c = counterOf(pack, 'be_fr_pre2012_30');
    const r = evaluateCounter(pack, c, run(31, 'third_country'), {
      year: 2026,
      profile: { frontierBefore2012: true },
    });
    expect(r.status).toBe('over');
    expect(keysOf(r)).toContain('be_fr_pre2012_over');
    const urls = pack.counters.flatMap((x) => x.sources.map((s) => s.url));
    expect(urls.some((u) => u.includes('assemblee-nationale'))).toBe(true);
    expect(urls.some((u) => u.toLowerCase().includes('bofip'))).toBe(true);
    expect(urls.every((u) => !u.toLowerCase().includes('inami'))).toBe(true);
  });
});

describe('C: A1 social-security bands (under 25%, 25% to under 50%, 50% or more)', () => {
  for (const pack of BORDER_PACKS) {
    const ss = pack.counters.find((c) => c.kind === 'social_security')!;
    const annual = 240;
    const evalAt = (days: number, profile = {}) =>
      evaluateCounter(pack, ss, run(days, 'telework'), { year: 2026, annualWorkingDays: annual, profile, today: TODAY });

    it(`${pack.id}: under 25% is fine with no A1, and says why`, () => {
      const r = evalAt(40); // 16.7%
      expect(r.status).toBe('ok');
      expect(r.statusLabelKey).toBe('status_ss_under');
      expect(keysOf(r)).toContain('ss_band_under');
    });

    it(`${pack.id}: approaching 25% warns before the band starts`, () => {
      const r = evalAt(50); // 20.8%
      expect(r.status).toBe('warn');
      expect(keysOf(r)).toContain('ss_band_approaching');
    });

    it(`${pack.id}: exactly 25% with no A1 is amber "A1 required", never "within limit"`, () => {
      const r = evalAt(60);
      expect(r.status).toBe('warn');
      expect(r.statusLabelKey).toBe('status_a1_required');
      expect(keysOf(r)).toContain('ss_band_a1_required');
    });

    it(`${pack.id}: 30% with a valid A1 turns ok and shows the date`, () => {
      const r = evalAt(72, { a1InPlace: true, a1ValidUntil: '2027-06-30' });
      expect(r.status).toBe('ok');
      expect(r.statusLabelKey).toBe('status_a1_recorded');
      const msg = r.messages.find((m) => m.key === 'ss_band_a1_recorded')!;
      expect(msg.vars).toEqual({ until: '2027-06-30' });
    });

    it(`${pack.id}: an expired A1 no longer counts`, () => {
      const r = evalAt(72, { a1InPlace: true, a1ValidUntil: '2026-01-31' });
      expect(r.status).toBe('warn');
      expect(r.statusLabelKey).toBe('status_a1_required');
      expect(keysOf(r)).toContain('ss_band_a1_expired');
    });

    it(`${pack.id}: 50% is the residence state even with an A1`, () => {
      const r = evalAt(120, { a1InPlace: true, a1ValidUntil: '2027-06-30' });
      expect(r.status).toBe('over');
      expect(r.statusLabelKey).toBe('status_ss_residence');
      expect(keysOf(r)).toContain('ss_band_residence');
    });
  }

  it('"less than 50%" stays strict on an odd base: 115 of 231 is under, 116 is over', () => {
    const pack = getBorderPack('geneva_fr')!;
    const ss = counterOf(pack, 'geneva_ss_50');
    const profile = { a1InPlace: true };
    const at = (n: number) =>
      evaluateCounter(pack, ss, run(n, 'telework'), { year: 2026, annualWorkingDays: 231, profile, today: TODAY });
    expect(at(115).status).not.toBe('over');
    expect(at(116).status).toBe('over');
  });

  it('warns on trip days without inventing a "habitual" threshold, and keeps them out of the %', () => {
    const pack = getBorderPack('geneva_fr')!;
    const r = evaluateCounter(pack, counterOf(pack, 'geneva_ss_50'), run(1, 'third_country'), {
      year: 2026,
      annualWorkingDays: 240,
    });
    expect(r.usedDays).toBe(0);
    expect(r.status).toBe('ok');
    expect(r.messages.find((m) => m.key === 'ss_third_country')).toMatchObject({ vars: { days: 1 }, tone: 'info' });
    const recurring = evaluateCounter(pack, counterOf(pack, 'geneva_ss_50'), run(2, 'third_country'), {
      year: 2026,
      annualWorkingDays: 240,
    });
    expect(recurring.messages.find((m) => m.key === 'ss_third_country')?.tone).toBe('warn');
    expect(recurring.status).toBe('ok');
  });
});

describe('C: basel_fr is the 1983 regime, not Geneva', () => {
  const pack = getBorderPack('basel_fr')!;

  it('runs 40% telework, 10 missions and 45 nights tax counters', () => {
    expect(counterOf(pack, 'basel_fr_tax_telework_40').enabled).toBe(true);
    expect(counterOf(pack, 'basel_fr_tax_missions_10').enabled).toBe(true);
    expect(counterOf(pack, 'basel_fr_tax_nights_45').enabled).toBe(true);
    expect(counterOf(pack, 'basel_fr_tax_telework_40').limit).toBe(40);
    expect(counterOf(pack, 'basel_fr_tax_missions_10').limit).toBe(10);
    expect(counterOf(pack, 'basel_fr_tax_nights_45').limit).toBe(45);
    expect(counterOf(pack, 'basel_fr_tax_nights_45').inclusive).toBe(true);
    expect(counterOf(pack, 'basel_fr_tax_nights_45').countsOvernight).toBe(true);
  });

  it('counts telework toward 40% and warns that excess FR missions end the regime', () => {
    const tele = run(90, 'telework'); // 90/240 = 37.5% under 40%
    const missions = run(15, 'third_country', '2026-06-01');
    const results = evaluatePack(pack, [...tele, ...missions], { year: 2026, annualWorkingDays: 240 });
    const share = results.find((r) => r.counterId === 'basel_fr_tax_telework_40')!;
    expect(share.enabled).toBe(true);
    expect(share.messages.some((m) => m.key === 'ch_fr_1983_mission_excess')).toBe(true);
    const miss = results.find((r) => r.counterId === 'basel_fr_tax_missions_10')!;
    expect(miss.used).toBe(15);
    expect(miss.status).toBe('over');
    expect(miss.messages.some((m) => m.key === 'ch_fr_1983_over_mission' || m.key === 'ch_fr_1983_mission_excess')).toBe(
      true,
    );
  });

  it('counts overnight work nights toward 45 and goes over at 46', () => {
    const nights = run(46, 'onsite', '2026-01-01', { overnightAway: true });
    const r = evaluatePack(pack, nights, { year: 2026, annualWorkingDays: 240 }).find(
      (x) => x.counterId === 'basel_fr_tax_nights_45',
    )!;
    expect(r.used).toBe(46);
    expect(r.status).toBe('over');
    expect(r.messages.some((m) => m.key === 'ch_fr_1983_over_45')).toBe(true);
  });

  it('cites the 1983 sources, and not the fiche titled "hors régime frontalier"', () => {
    const urls = pack.counters.filter((c) => c.kind === 'tax').flatMap((c) => c.sources.map((s) => s.url));
    expect(urls.some((u) => u.includes('accord_frontalier_1983'))).toBe(true);
    expect(urls.some((u) => u.includes('ai-1983') || u.includes('exemplare-ai-1983'))).toBe(true);
    expect(urls.some((u) => u.includes('jura.ch'))).toBe(true);
    expect(urls.some((u) => u.includes('accords-interpretatifs-10-jours-cdi'))).toBe(false);
    expect(pack.counters.some((c) => c.notesKey === 'ch_fr_tax_note')).toBe(false);
  });

  it('keeps the social-security counter', () => {
    expect(counterOf(pack, 'basel_fr_ss_50').enabled).toBe(true);
  });
});

describe('C: basel_de 5-day floor', () => {
  const pack = getBorderPack('basel_de')!;
  const floor = counterOf(pack, 'basel_de_employer_practice');
  const onsite = (dates: string[]): DayEntry[] => dates.map((date) => ({ date, type: 'onsite' }));
  const evalMonth = (entries: DayEntry[], referenceMonth: string, today = '2026-10-31') =>
    evaluateCounter(pack, floor, entries, { year: 2026, referenceMonth, today });

  it('is a floor, not a cap, and not a tax counter', () => {
    expect(floor.direction).toBe('floor');
    expect(floor.kind).toBe('employer_practice');
  });

  it('5 on-site days meets it: ok, never "over"', () => {
    const r = evalMonth(onsite(['2026-08-03', '2026-08-04', '2026-08-05', '2026-08-06', '2026-08-07']), '2026-08');
    expect(r.used).toBe(5);
    expect(r.status).toBe('ok');
    expect(r.statusLabelKey).toBe('status_floor_met');
  });

  it('well above the floor is still ok', () => {
    const r = evalMonth(run(20, 'onsite', '2026-08-03'), '2026-08');
    expect(r.status).toBe('ok');
    expect(r.ratio).toBe(1);
  });

  it('below it at month end warns; it is never "over"', () => {
    const r = evalMonth([...onsite(['2026-08-03', '2026-08-04']), ...run(10, 'telework', '2026-08-10')], '2026-08');
    expect(r.used).toBe(2);
    expect(r.status).toBe('warn');
    expect(r.statusLabelKey).toBe('status_floor_below');
    expect(keysOf(r)).toContain('floor_below_note');
  });

  it('zero on-site days with telework logged warns instead of showing green', () => {
    expect(evalMonth(run(10, 'telework', '2026-08-03'), '2026-08').status).toBe('warn');
  });

  it('a month in progress is not a failure yet', () => {
    const r = evalMonth(onsite(['2026-10-05']), '2026-10', '2026-10-20');
    expect(r.status).toBe('ok');
    expect(r.statusLabelKey).toBe('status_floor_progress');
  });

  it('a past month with nothing logged says so rather than warning', () => {
    const r = evalMonth([], '2026-08');
    expect(r.status).toBe('ok');
    expect(r.statusLabelKey).toBe('status_floor_no_data');
  });

  it('"mindestens an einem Tag pro Woche" also satisfies it: 4 days, one per week', () => {
    // Feb 2027 runs Monday 1st to Sunday 28th: exactly four full weeks.
    const r = evaluateCounter(pack, floor, onsite(['2027-02-01', '2027-02-09', '2027-02-17', '2027-02-25']), {
      year: 2027,
      referenceMonth: '2027-02',
      today: '2027-03-15',
    });
    expect(r.used).toBe(4);
    expect(r.status).toBe('ok');
    expect(r.statusLabelKey).toBe('status_floor_met');
    expect(keysOf(r)).toContain('floor_week_met');
  });

  it('4 days clustered in one week does not satisfy either test', () => {
    const r = evaluateCounter(pack, floor, onsite(['2027-02-01', '2027-02-02', '2027-02-03', '2027-02-04']), {
      year: 2027,
      referenceMonth: '2027-02',
      today: '2027-03-15',
    });
    expect(r.status).toBe('warn');
  });
});

describe('C: ticino_it 45 days measures days away, not trips', () => {
  const pack = getBorderPack('ticino_it')!;
  const nonReturn = counterOf(pack, 'ticino_tax_nonreturn_45');
  const used = (entries: DayEntry[]) => evaluateCounter(pack, nonReturn, entries, { year: 2026 });

  it('a same-day trip abroad does not count', () => {
    expect(used(run(50, 'third_country')).used).toBe(0);
  });

  it('flagged nights count on on-site and trip days', () => {
    expect(used(run(50, 'onsite', '2026-01-01', { overnightAway: true })).used).toBe(50);
    expect(used(run(3, 'third_country', '2026-01-01', { overnightAway: true })).used).toBe(3);
  });

  it('a flag on a telework or non-working day does not count (leave and sickness are excluded)', () => {
    expect(used(run(5, 'telework', '2026-01-01', { overnightAway: true })).used).toBe(0);
    expect(used(run(5, 'non_working', '2026-01-01', { overnightAway: true })).used).toBe(0);
  });

  it('"massimo di 45": 45 is at limit, 46 is over and says the consequence is not stated', () => {
    const flagged = (n: number) => run(n, 'onsite', '2026-01-01', { overnightAway: true });
    expect(used(flagged(45)).status).toBe('at_limit');
    const over = used(flagged(46));
    expect(over.status).toBe('over');
    expect(keysOf(over)).toContain('ch_it_over');
  });

  it('25% allowance never displays above 25%: 25% of 230 is 57 days, not 58', () => {
    const tele = counterOf(pack, 'ticino_tax_telework_25');
    const at = (n: number) => evaluateCounter(pack, tele, run(n, 'telework'), { year: 2026, annualWorkingDays: 230 });
    expect(at(57).allowedDays).toBe(57);
    expect(at(57).status).toBe('critical');
    expect(at(58).status).toBe('over');
  });
});

describe('C: luxembourg_fr 34 days part-time reduction', () => {
  const pack = getBorderPack('luxembourg_fr')!;
  const tax = counterOf(pack, 'lu_fr_tax_34');
  const at = (days: number, employmentPercent?: number) =>
    evaluateCounter(pack, tax, run(days, 'telework'), { year: 2026, profile: { employmentPercent } });

  it('rounds down ("le nombre inférieur de journées entières")', () => {
    expect(at(1, 100).limit).toBe(34);
    expect(at(1, 50).limit).toBe(17);
    expect(at(1, 80).limit).toBe(27); // 27.2
    expect(at(1, 33).limit).toBe(11); // 11.22
    expect(at(1, 85).limit).toBe(28); // 28.9: down, not to the nearest
  });

  it('audit scenario: 50% part-timer at 20 days is over, with the day-one consequence', () => {
    const r = at(20, 50);
    expect(r.status).toBe('over');
    expect(keysOf(r)).toContain('lu_over_34');
  });

  it('"n\'excédant pas": 34 is at limit for full-time, 35 is over', () => {
    expect(at(34, 100).status).toBe('at_limit');
    expect(at(35, 100).status).toBe('over');
  });

  it('with no percentage it keeps 34 but says that only holds for full-year full-time', () => {
    const r = at(5);
    expect(r.limit).toBe(34);
    expect(r.messages.find((m) => m.key === 'prorate_missing')?.vars).toEqual({ limit: 34 });
  });

  it('with a percentage the warning goes, and a part-timer is told the adjusted limit', () => {
    expect(keysOf(at(5, 100))).not.toContain('prorate_missing');
    expect(at(5, 50).messages.find((m) => m.key === 'prorate_applied')?.vars).toEqual({ pct: 50, limit: 17 });
  });

  it('ignores an impossible percentage rather than computing from it', () => {
    expect(at(1, 0).limit).toBe(34);
    expect(at(1, 250).limit).toBe(34);
  });
});

describe('C: luxembourg_be / luxembourg_de 34 days — no part-time reduction', () => {
  for (const [packId, counterId, overKey] of [
    ['luxembourg_be', 'lu_be_tax_34', 'lu_be_over_34'],
    ['luxembourg_de', 'lu_de_tax_34', 'lu_de_over_34'],
  ] as const) {
    describe(packId, () => {
      const pack = getBorderPack(packId)!;
      const tax = counterOf(pack, counterId);
      const at = (days: number, employmentPercent?: number) =>
        evaluateCounter(pack, tax, run(days, 'telework'), { year: 2026, profile: { employmentPercent } });

      it('keeps 34 even at 50% part-time (no FR-style prorate)', () => {
        expect(at(1, 100).limit).toBe(34);
        expect(at(1, 50).limit).toBe(34);
        expect(keysOf(at(5, 50))).not.toContain('prorate_applied');
        expect(keysOf(at(5))).not.toContain('prorate_missing');
      });

      it('"n\'excédant pas": 34 at limit, 35 over', () => {
        expect(at(34).status).toBe('at_limit');
        expect(at(35).status).toBe('over');
        expect(keysOf(at(35))).toContain(overKey);
      });

      it('counts telework and third_country, not onsite or non_working', () => {
        expect(tax.countsAs.telework).toBe('full');
        expect(tax.countsAs.third_country).toBe('full');
        expect(tax.countsAs.onsite).toBe('none');
        expect(tax.countsAs.non_working).toBe('none');
      });
    });
  }
});

describe('H: CH–FR mission formula against the impots.gouv.fr fiche (240-day base)', () => {
  const split = (telework: number, missions: number) =>
    chFrMissionSplit({ telework, missions, annualWorkingDays: 240, quotaPercent: 40, capDays: 10 });

  it('ex. 1: 43 telework + 31 missions → 10 count, 53 taxed in CH, 21 excess', () => {
    expect(split(43, 31)).toMatchObject({ counted: 10, rateDays: 53, excess: 21, regimeLost: false });
  });
  it('ex. 2: 53 telework + 43 missions → 10 count, 63 taxed in CH, 33 excess', () => {
    expect(split(53, 43)).toMatchObject({ counted: 10, rateDays: 63, excess: 33, regimeLost: false });
  });
  it('ex. 3: 91 telework + 10 missions → 5 count, 96 taxed in CH, 5 excess', () => {
    expect(split(91, 10)).toMatchObject({ counted: 5, rateDays: 96, excess: 5, regimeLost: false });
  });
  it('telework alone above the quota loses the regime and no mission counts', () => {
    expect(split(97, 4)).toMatchObject({ counted: 0, excess: 4, regimeLost: true });
  });

  const pack = getBorderPack('geneva_fr')!;
  const entries = (telework: number, missions: number) => [
    ...run(telework, 'telework', '2026-01-01'),
    ...run(missions, 'third_country', '2026-07-01'),
  ];
  const results = (telework: number, missions: number, employmentPercent?: number) => {
    const rs = evaluatePack(pack, entries(telework, missions), {
      year: 2026,
      annualWorkingDays: 240,
      profile: { employmentPercent },
    });
    return {
      share: rs.find((r) => r.counterId === 'geneva_tax_telework_40')!,
      missions: rs.find((r) => r.counterId === 'geneva_tax_missions_10')!,
    };
  };

  it('ex. 3 through the counters: 96/96 at limit, not the old false "over" at 101', () => {
    const { share, missions } = results(91, 10);
    expect(share.usedDays).toBe(96);
    expect(share.status).toBe('at_limit');
    expect(share.messages.find((m) => m.key === 'ch_fr_mission_excess')?.vars).toEqual({ counted: 5, excess: 5 });
    expect(missions.used).toBe(10);
    expect(missions.status).toBe('at_limit');
  });

  it('ex. 1 through the counters: share 53, missions over their cap', () => {
    const { share, missions } = results(43, 31);
    expect(share.usedDays).toBe(53);
    expect(share.status).toBe('ok');
    expect(missions.status).toBe('over');
    expect(keysOf(missions)).toContain('ch_fr_mission_excess');
  });

  it('missions squeezed out by the 40% warn even under their own cap', () => {
    const { missions } = results(95, 5); // 1 fits, 4 do not
    expect(missions.status).toBe('warn');
    expect(missions.messages.find((m) => m.key === 'ch_fr_mission_excess')?.vars).toEqual({ counted: 1, excess: 4 });
  });

  it('over 40% discloses the cliff: taxable in France from the first day', () => {
    const { share } = results(97, 0);
    expect(share.status).toBe('over');
    expect(keysOf(share)).toContain('ch_fr_over_40');
  });

  it('10-day cap prorated and rounded up, in the counter and in the 40% split', () => {
    expect(results(0, 1, 50).missions.limit).toBe(5);
    expect(results(0, 1, 33).missions.limit).toBe(4); // 3.3 rounds up
    const audit = results(0, 8, 50); // 50% part-timer, 8 missions: over, not "8 of 10"
    expect(audit.missions.limit).toBe(5);
    expect(audit.missions.status).toBe('over');
    expect(audit.share.usedDays).toBe(5);
  });
});

describe('H: basel_de 60 non-return days (KonsVerCHEV, Aargau)', () => {
  const pack = getBorderPack('basel_de')!;
  const c = counterOf(pack, 'basel_de_nonreturn_60');
  const at = (entries: DayEntry[]) => evaluateCounter(pack, c, entries, { year: 2026 });

  it('is a real tax counter, cited to the ordinance and the canton', () => {
    expect(c.kind).toBe('tax');
    expect(c.enabled).toBe(true);
    expect(c.sources.map((s) => s.url).join()).toMatch(/konsverchev/);
    expect(c.sources.map((s) => s.url).join()).toMatch(/ag\.ch/);
  });

  it('third-state days always count, flagged nights count, plain on-site and telework do not', () => {
    expect(at(run(2, 'third_country')).used).toBe(2);
    expect(at(run(2, 'onsite', '2026-01-01', { overnightAway: true })).used).toBe(2);
    expect(at(run(2, 'onsite')).used).toBe(0);
    expect(at(run(2, 'telework', '2026-01-01', { overnightAway: true })).used).toBe(0);
  });

  it('a flagged third-state day counts once', () => {
    expect(at(run(1, 'third_country', '2026-01-01', { overnightAway: true })).used).toBe(1);
  });

  it('"mehr als 60": 60 is at limit, 61 loses the status', () => {
    expect(at(run(60, 'third_country')).status).toBe('at_limit');
    const over = at(run(61, 'third_country'));
    expect(over.status).toBe('over');
    expect(keysOf(over)).toContain('basel_de_over_60');
  });

  it('does not invent a part-time figure: §9(2) sets no rounding and depends on day-wise work', () => {
    const r = evaluateCounter(pack, c, run(1, 'third_country'), { year: 2026, profile: { employmentPercent: 50 } });
    expect(r.limit).toBe(60);
  });
});

describe('M: current pace', () => {
  const pack = getBorderPack('geneva_fr')!;
  const tax = counterOf(pack, 'geneva_tax_telework_40');
  const ss = counterOf(pack, 'geneva_ss_50');
  const pace = (r: { messages: Array<{ key: string; tone: string; vars?: object }> }) =>
    r.messages.find((m) => m.key.startsWith('pace_'));
  const logged = (telework: number, onsite: number) => [
    ...run(telework, 'telework', '2026-01-01'),
    ...run(onsite, 'onsite', '2026-06-01'),
  ];
  const opts = { year: 2026, annualWorkingDays: 240, today: TODAY };

  it('one logged day is a neutral line, not an alarm', () => {
    const m = pace(evaluateCounter(pack, tax, logged(1, 0), opts))!;
    expect(m.key).toBe('pace_line');
    expect(m.tone).toBe('info');
  });

  it('warns on a real sample above the limit, without changing the status', () => {
    const r = evaluateCounter(pack, tax, logged(12, 8), opts); // 60% of 20
    expect(pace(r)).toMatchObject({ key: 'pace_above', tone: 'warn', vars: { pct: 60, days: 20, limit: 40 } });
    expect(r.status).toBe('ok');
  });

  it('on the framework counter, pace is measured against 25% until an A1 is in place', () => {
    const entries = logged(6, 14); // 30% of 20
    expect(pace(evaluateCounter(pack, ss, entries, opts))).toMatchObject({ key: 'pace_above', vars: { limit: 25 } });
    const withA1 = evaluateCounter(pack, ss, entries, { ...opts, profile: { a1InPlace: true } });
    expect(pace(withA1)).toMatchObject({ key: 'pace_line', vars: { limit: 50 } });
    const expired = { a1InPlace: true, a1ValidUntil: '2026-01-01' };
    expect(pace(evaluateCounter(pack, ss, entries, { ...opts, profile: expired }))?.key).toBe('pace_above');
  });

  it('no line when nothing counted', () => {
    expect(pace(evaluateCounter(pack, tax, logged(0, 5), opts))).toBeUndefined();
  });
});

describe('M: inclusive and strict limits', () => {
  it('every enabled cap is inclusive except the framework\'s "less than 50%"', () => {
    for (const pack of BORDER_PACKS) {
      for (const c of pack.counters.filter((x) => x.enabled && x.direction !== 'floor')) {
        expect(!!c.inclusive).toBe(c.kind !== 'social_security');
      }
    }
  });
});

describe('Honest coverage per corridor', () => {
  const taxOn = BORDER_PACKS.filter(hasTaxCounter).map((p) => p.id);

  it('tax counters run on exactly these seven', () => {
    expect(taxOn).toEqual([
      'geneva_fr',
      'basel_fr',
      'basel_de',
      'luxembourg_fr',
      'luxembourg_be',
      'luxembourg_de',
      'ticino_it',
    ]);
  });

  it('every corridor has a social-security counter', () => {
    for (const p of BORDER_PACKS) expect(p.counters.some((c) => c.kind === 'social_security' && c.enabled)).toBe(true);
  });

  it('every counter cites an official https source, and INAMI statistics are gone', () => {
    for (const p of BORDER_PACKS) {
      for (const c of p.counters) {
        expect(c.sources.length, c.id).toBeGreaterThan(0);
        for (const s of c.sources) {
          expect(s.url).toMatch(/^https:\/\//);
          expect(s.url).not.toMatch(/inami/);
        }
      }
    }
  });

  it('a disabled counter explains itself and shows no number', () => {
    for (const p of BORDER_PACKS) {
      for (const c of p.counters.filter((x) => !x.enabled)) {
        expect(c.pendingReasonKey, c.id).toBeTruthy();
        expect(c.pendingValueKey, c.id).toBeTruthy();
        expect(c.limit, c.id).toBeUndefined();
      }
    }
  });
});

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { rowsToCsv, summarizeEmployee } from '../src/company/dashboardMath';
import { CONSENT_VERSION, DPA_VERSION } from '../src/company/types';
import de from '../src/i18n/de';
import en from '../src/i18n/en';
import fr from '../src/i18n/fr';
import itDict from '../src/i18n/it';
import nl from '../src/i18n/nl';
import { buildInviteEmail } from '../supabase/functions/_shared/inviteEmail';

const dicts = { en, fr, de, it: itDict, nl };

/**
 * Every personal column HR can export must be named wherever HR-visible data is disclosed. A new column
 * fails the first test until it is added here, and the copy gets checked with it (audit-2 A3-12).
 */
const TERMS: Record<string, Record<keyof typeof dicts, RegExp>> = {
  employee_name: { en: /name/i, fr: /nom/i, de: /Name/, it: /nome/i, nl: /naam/i },
  employee_email: { en: /email/i, fr: /e-mail/i, de: /E-Mail/, it: /e-mail/i, nl: /e-mail/i },
  route: { en: /border route/i, fr: /itinéraire/i, de: /Grenzroute/, it: /situazione( di frontiera)?/i, nl: /grensroute/i },
  annual_working_days: { en: /working[- ]days/i, fr: /jours de travail/i, de: /Arbeitstage/, it: /giorni lavorativi/i, nl: /werkdagen/i },
  employment_percent: { en: /employment percentage/i, fr: /taux d[’']emploi/i, de: /Beschäftigungsgrad/, it: /percentuale d[’']impiego/i, nl: /tewerkstellingspercentage/i },
  contract_days_per_year: { en: /contract(ual)? (working )?days/i, fr: /jours (de travail )?contractuels/i, de: /vertragliche\w* Arbeitstage/, it: /giorni (lavorativi )?contrattuali/i, nl: /contractuele (werk)?dagen/i },
  a1_in_place: { en: /A1/, fr: /A1/, de: /A1/, it: /A1/, nl: /A1/ },
  a1_valid_until: { en: /A1/, fr: /A1/, de: /A1/, it: /A1/, nl: /A1/ },
  frontier_before_2012: { en: /France–Belgium/, fr: /France–Belgique/, de: /Frankreich–Belgien/, it: /Francia–Belgio/, nl: /Frankrijk–België/ },
};
const HALF_DAY: Record<keyof typeof dicts, RegExp> = {
  en: /half[- ]day/i, fr: /demi-journée/i, de: /halbe[rn]? Tag/i, it: /mezza giornata/i, nl: /halve dag/i,
};
/** Not personal data about the employee, or counter output the notice already describes as counters. */
const NOT_PERSONAL = new Set(['demo', 'counter_id', 'kind', 'status', 'used_days', 'allowed_days', 'percent_of_annual', 'telework_rate_pct_working_calc_not_afc', 'year']);

describe('A3-12 HR-visible data is disclosed', () => {
  it('every CSV column is mapped here, so a new one cannot ship undisclosed', () => {
    const row = summarizeEmployee({ userId: 'u', displayName: 'A', email: 'a@x.com', borderPackId: 'geneva_fr', annualWorkingDays: 240, logs: [], year: 2026 });
    const header = rowsToCsv([row], 2026).split('\n')[1].split(',');
    for (const col of header) {
      expect(TERMS[col] != null || NOT_PERSONAL.has(col), col).toBe(true);
    }
  });

  for (const [lang, d] of Object.entries(dicts) as Array<[keyof typeof dicts, typeof en]>) {
    const invite = buildInviteEmail({ lang, companyName: 'Acme', joinUrl: 'https://x/j', siteUrl: 'https://x' });
    const companyRow = d.privacy.tableRows.find((r) => /A1/.test(r.data) && /employer|employeur|Arbeitgeber|datore di lavoro|werkgever/i.test(r.purpose));
    const surfaces = {
      notice: d.company.noticeBody,
      privacyData: d.privacy.s1Body,
      privacyHr: d.privacy.s2Body,
      privacyTable: companyRow?.data ?? '',
      dpa: d.dpa.subjectBody,
      inviteEmail: invite.text,
    };
    it(`${lang}: each surface names every field HR can see`, () => {
      for (const [where, text] of Object.entries(surfaces)) {
        for (const [col, terms] of Object.entries(TERMS)) {
          if (where === 'privacyHr' && (col === 'employee_name' || col === 'employee_email' || col === 'route')) continue;
          expect(text, `${lang} ${where} ${col}`).toMatch(terms[lang]);
        }
        expect(text, `${lang} ${where} half day`).toMatch(HALF_DAY[lang]);
      }
    });
  }

  // AR3-17 / A2-28: lesser employee and HR strings must also name half days
  for (const [lang, d] of Object.entries(dicts) as Array<[keyof typeof dicts, typeof en]>) {
    it(`${lang}: savedToCompany, dashboardSubtitle and historySubtitle name half days`, () => {
      for (const [where, text] of [
        ['savedToCompany', d.app.savedToCompany],
        ['dashboardSubtitle', d.company.dashboardSubtitle],
        ['historySubtitle', d.company.historySubtitle],
      ] as const) {
        expect(text, `${lang} ${where}`).toMatch(HALF_DAY[lang]);
      }
    });
    it(`${lang}: refresh control has a translated accessible name`, () => {
      expect(d.company.refreshAria.length).toBeGreaterThan(3);
    });
  }

  it('the notice version moved with the copy', () => {
    expect(CONSENT_VERSION).toBe('2026-11-13-v7');
  });
});

describe('A3-13 DPA version on company creation', () => {
  it('the recorded version is the date the DPA page shows', () => {
    expect(DPA_VERSION).toBe('2026-11-13');
    expect(en.dpa.updated).toContain('13 Nov 2026');
    expect(en.company.dpaVersionNote).toContain('13 Nov 2026');
  });

  it('every language says the same version and only restates what the DPA page says', () => {
    for (const [lang, d] of Object.entries(dicts)) {
      expect(d.company.dpaVersionNote, lang).toMatch(/2026/);
      expect(d.company.dpaVersionNote, lang).not.toMatch(/authori[sz]|bind|represent|befugt|habilit|autorizz|bevoegd/i);
    }
  });

  it('the client creates companies through the recording function', () => {
    const api = readFileSync(join(__dirname, '../src/lib/companyApi.ts'), 'utf8');
    expect(api).toContain("rpc('bd_create_company_with_dpa', { company_name: name, dpa_version: DPA_VERSION })");
    expect(api).not.toContain("rpc('bd_create_company',");
  });
});

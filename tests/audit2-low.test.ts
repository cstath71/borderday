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

describe('audit-2 low: translations', () => {
  it('#39, #40: the CH–IT notes mirror the Fedlex wording and citation for their language', () => {
    expect(fr.counters.ch_it_nonreturn_note).toMatch(/jours de vacances ou de maladie/);
    expect(de.counters.ch_it_nonreturn_note).toMatch(/Ferien- und Krankheitstage/);
    expect(itDict.counters.ch_it_nonreturn_note).toMatch(/giorni di ferie e di malattia/);
    expect(fr.counters.ch_it_nonreturn_note).toMatch(/RO 2026 104/);
    expect(fr.counters.ch_it_nonreturn_note).not.toMatch(/RU 2026 104/);
    for (const d of [en, de, nl]) {
      expect(d.counters.ch_it_nonreturn_note).toMatch(/AS 2026 104/);
      expect(d.counters.ch_it_nonreturn_note).not.toMatch(/RU 2026 104/);
    }
    expect(itDict.counters.ch_it_nonreturn_note).toMatch(/RU 2026 104/);
  });

  it('#41: each locale names the Swiss federal tax administration its own way', () => {
    expect(JSON.stringify(en.counters)).not.toMatch(/ESTV/);
    expect(JSON.stringify(fr.counters)).not.toMatch(/ESTV/);
    expect(JSON.stringify(itDict.counters)).not.toMatch(/ESTV/);
    expect(JSON.stringify(de.counters)).not.toMatch(/Praxisblatt/);
  });

  it('#42, #43, #45, #50: single-term and grammar fixes', () => {
    expect(JSON.stringify(de)).not.toMatch(/Befristete Einsätze|Der Auftragsverarbeiter sitzt|die zur Nachweis|Gerätedstandort/);
    expect(JSON.stringify(itDict)).not.toMatch(/\b[Ii] Condizioni\b|\b[Ii] Termini\b|\ba assolvere\b|incluso eventuali/);
  });

  it('#44, #51: Italian keeps "datore di lavoro", one A1 form and the official canton name', () => {
    const it_ = JSON.stringify(itDict);
    expect(it_).not.toMatch(/\bdator[ei]\b(?! di lavoro)/);
    expect(it_).not.toMatch(/\bun A1\b/);
    expect(it_).not.toMatch(/Valais(?!-)/);
    expect(it_).not.toMatch(/\bavenant\b/);
  });

  it('#48: the AI summary uses the current day-type label', async () => {
    const { llmsFullTxt } = await import('../scripts/seo.mjs');
    expect(llmsFullTxt()).not.toMatch(/third country/);
    expect(llmsFullTxt()).toMatch(/third State/);
  });

  it('#49: no legal page intro is another page\'s intro, in any locale', () => {
    for (const [lang, d] of Object.entries(dicts)) {
      const intros = [d.privacy.intro, d.accessibility.intro, d.dpa.intro, d.disclaimer.intro];
      expect(new Set(intros).size, lang).toBe(intros.length);
    }
  });

  it('#49: retired product words and stale coverage numbers stay out', () => {
    for (const [lang, d] of Object.entries(dicts)) {
      const blob = JSON.stringify(d);
      expect(blob, lang).not.toMatch(/\bPaket|Grenzpendler|pacchett[oi] (di )?(confine|frontiera)|border pack/i);
      expect(blob, lang).not.toMatch(/(corridors?|couloirs?|fiscalité|Steuer|fisco|belastingtellers) (sur |auf |su |op )?(six|sechs|sei|zes)\b/);
    }
    const pages = PAGES as Record<string, Record<string, { description: string }>>;
    expect(pages[''].fr.description).toMatch(/sur sept/);
    expect(pages[''].de.description).toMatch(/auf sieben/);
    expect(pages[''].it.description).toMatch(/su sette/);
  });

  it('#52: frontier zones use each locale\'s own names', () => {
    expect(en.counters.ch_it_tax_note).toMatch(/Grisons, Ticino, Valais; IT: Lombardy, Piedmont/);
    expect(fr.counters.ch_it_tax_note).toMatch(/Grisons, Tessin, Valais ; IT : Lombardie, Piémont/);
    expect(de.counters.ch_it_tax_note).toMatch(/Graubünden, Tessin, Wallis; IT: Lombardei, Piemont/);
    expect(itDict.counters.ch_it_tax_note).toMatch(/Grigioni, Ticino, Vallese; IT: Lombardia, Piemonte/);
    expect(nl.counters.ch_it_tax_note).toMatch(/Graubünden, Ticino, Wallis; IT: Lombardije, Piëmont/);
  });

  it('#53–#56: Dutch uses home, the GDPR term and the official "gewoonlijk"', () => {
    const blob = JSON.stringify(nl);
    expect(blob).not.toMatch(/tellerwiskunde|medewerkerview|HR-only-score|getimed|arbeidsbodem|by design|op de woonplaats|op uw woonplaats/);
    expect(blob).not.toMatch(/\b([Hh]et|[Uu]w|[Mm]ijn) particulier abonnement/);
    // Staatscourant 2023, 20886 uses "gewoonlijk grensoverschrijdend telewerk"; the audit's "gewoon" was wrong.
    expect(nl.counters.ss_framework_note).toMatch(/gewoonlijk grensoverschrijdend telewerk/);
    expect(nl.nav.terms).toMatch(/wettelijke vermeldingen/);
  });

  it('#57: FR and IT cite BetrVG in their own style', () => {
    expect(fr.terms.s2Body).toMatch(/§ 87 al\. 1/);
    expect(itDict.terms.s2Body).toMatch(/§ 87 cpv\. 1/);
  });

  it('#58: the short trial notes say a card is required', () => {
    const word = { en: /card required/, fr: /carte requise/, de: /Karte erforderlich/, it: /carta richiesta/, nl: /kaart vereist/ };
    const pages = PAGES as Record<string, Record<string, { description: string }>>;
    for (const [lang, d] of Object.entries(dicts)) {
      expect(d.home.waitlistNote, lang).toMatch(word[lang as keyof typeof word]);
      expect(pages[''][lang].description, lang).toMatch(word[lang as keyof typeof word]);
    }
  });

  it('A3-37: pricing defines an active employee the way billing counts seats', () => {
    expect(en.pricing.activeEmployeeDef).toMatch(/employee role/);
    expect(en.pricing.activeEmployeeDef).toMatch(/not counted/);
    const sql = readFileSync(resolve(__dirname, '../supabase/migrations/20261031140000_bd_employer_first.sql'), 'utf8');
    expect(sql).toMatch(/m\.active and m\.role = 'employee'/);
  });
});

describe('audit-2 low: compliance', () => {
  it('A3-24: the build adds a CSP that allows no inline or third-party script, and Supabase only', async () => {
    const { contentSecurityPolicy } = await import('../vite.config');
    const csp = contentSecurityPolicy();
    expect(csp).toMatch(/script-src 'self'(;|$)/);
    expect(csp).toMatch(/connect-src 'self' https:\/\/\*\.supabase\.co wss:\/\/\*\.supabase\.co(;|$)/);
    expect(csp).toMatch(/object-src 'none'/);
    expect(csp).toMatch(/base-uri 'self'/);
    // Browsers ignore frame-ancestors in a meta tag, so it must not look as if it were enforced.
    expect(csp).not.toMatch(/frame-ancestors/);
    expect(contentSecurityPolicy('https://uufmlmwgvoqhhtqgrclu.supabase.co')).toBe(csp);
    expect(contentSecurityPolicy('https://db.example.com')).toMatch(/connect-src [^;]*https:\/\/db\.example\.com/);
    expect(readFileSync(resolve(__dirname, '../index.html'), 'utf8')).toMatch(/name="referrer" content="strict-origin-when-cross-origin"/);
    const security = readFileSync(resolve(__dirname, '../public/.well-known/security.txt'), 'utf8');
    expect(security).toMatch(/^Contact: mailto:/m);
    expect(new Date(security.match(/^Expires: (.+)$/m)![1]).getTime()).toBeGreaterThan(Date.now());
  });

  it('A3-25: browser origins are limited to the site and local development', async () => {
    const { corsHeaders } = await import('../supabase/functions/_shared/http');
    const origin = (o: string | null, site?: string) => corsHeaders(o, site)['Access-Control-Allow-Origin'];
    expect(origin('https://borderday.com')).toBe('https://borderday.com');
    expect(origin('https://www.borderday.com')).toBe('https://www.borderday.com');
    expect(origin('http://127.0.0.1:4173')).toBe('http://127.0.0.1:4173');
    expect(origin('http://localhost:5173')).toBe('http://localhost:5173');
    expect(origin('https://staging.example', 'https://staging.example/')).toBe('https://staging.example');
    for (const bad of ['https://evil.example', 'https://borderday.com.evil.example', 'http://localhost.evil.example', null]) {
      expect(origin(bad)).toBe('https://borderday.com');
    }
    expect(corsHeaders('https://borderday.com').Vary).toBe('Origin');
  });

  it('A3-25: no edge function returns raw error text or allows any origin', () => {
    for (const fn of ['bd-create-checkout', 'bd-customer-portal', 'bd-send-invite', 'bd-sync-company-billing', 'bd-contract-request', 'bd-stripe-webhook']) {
      const code = readFileSync(resolve(__dirname, `../supabase/functions/${fn}/index.ts`), 'utf8');
      expect(code, fn).not.toMatch(/e instanceof Error \? e\.message/);
      expect(code, fn).not.toMatch(/Access-Control-Allow-Origin": "\*"/);
    }
    expect(readFileSync(resolve(__dirname, '../supabase/functions/bd-send-invite/index.ts'), 'utf8')).not.toMatch(/dryRun: false, result/);
  });

  it('A3-33: the portal return link and Stripe Checkout know Dutch', () => {
    const portal = readFileSync(resolve(__dirname, '../supabase/functions/bd-customer-portal/index.ts'), 'utf8');
    expect(portal).toMatch(/body\.lang === "nl"/);
    const checkout = readFileSync(resolve(__dirname, '../supabase/functions/bd-create-checkout/index.ts'), 'utf8');
    expect(checkout).toMatch(/CHECKOUT_LOCALES = \["en", "fr", "de", "it", "nl"\]/);
    expect(checkout).toMatch(/locale: lang/);
  });

  it('A3-34: Privacy says what an individual plan really keeps on the device', () => {
    const device = { en: /The other fields stay on your device/, fr: /autres champs restent sur votre appareil/, de: /übrigen Felder bleiben auf Ihrem Gerät/, it: /altri campi restano sul vostro dispositivo/, nl: /overige velden blijven op uw apparaat/ };
    for (const [lang, d] of Object.entries(dicts)) {
      expect(d.privacy.s1Body, lang).toMatch(device[lang as keyof typeof device]);
    }
    // The client never sends a profile field for an individual plan. Notes do go to the account (E15).
    const api = readFileSync(resolve(__dirname, '../src/lib/companyApi.ts'), 'utf8');
    const write = api.slice(api.indexOf("from('bd_personal_day_logs')\n        .upsert"));
    expect(write.slice(0, 400)).not.toMatch(/employment_percent/);
  });

  it('A3-30: every locale explains the refused save', () => {
    for (const [lang, d] of Object.entries(dicts)) expect(d.app.dayLogOtherCompany, lang).toBeTruthy();
  });

  it('A3-31: the internal legal memo is no longer in the tracked tree', () => {
    expect(readFileSync(resolve(__dirname, '../.gitignore'), 'utf8')).toMatch(/^LEGAL_REVIEW\*\.md$/m);
  });
});

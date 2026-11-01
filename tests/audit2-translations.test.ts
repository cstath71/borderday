import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import de from '../src/i18n/de';
import en from '../src/i18n/en';
import fr from '../src/i18n/fr';
import itDict from '../src/i18n/it';
import nl from '../src/i18n/nl';
import { BORDER_PACKS, hasTaxCounter } from '../src/borders/packs';
import { FAQ, llmsFullTxt, llmsTxt, PAGES } from '../scripts/seo.mjs';

const dicts = { en, fr, de, it: itDict, nl };

describe('audit-2 translation findings', () => {
  it('#2: the privacy intro is not the accessibility intro in any language', () => {
    for (const d of Object.values(dicts)) expect(d.privacy.intro).not.toBe(d.accessibility.intro);
    expect(fr.privacy.intro).toMatch(/données personnelles/);
    expect(fr.privacy.intro).toMatch(/RGPD/);
  });

  it('#9: German border route is Grenzroute, never a package', () => {
    expect(de.borders.geneva_region).toMatch(/Grenzroute des Abkommens von 1983/);
    expect(de.borders.ch_fr_1983_region).toMatch(/andere Grenzroute Frankreich–Schweiz/);
    expect(de.dpa.subjectBody).toMatch(/Rolle, Grenzroute,/);
  });

  it('#10: Italian route is corridoio', () => {
    expect(itDict.pricing.include1).toBe('Tutti i corridoi del piano');
    expect(itDict.individuals.point2).toMatch(/^Stessi corridoi/);
  });

  it('#11-#13: Ticino notes mirror the Fedlex wording', () => {
    expect(itDict.counters.ch_it_tax_note).toContain('il 25 per cento della sua attività di lavoro dipendente in modalità di telelavoro presso il proprio domicilio');
    expect(fr.counters.ch_it_tax_note).toContain('activité lucrative dépendante en télétravail');
    expect(de.counters.ch_it_tax_note).toContain('unselbstständigen Erwerbstätigkeit in Form von Telearbeit zu Hause im Ansässigkeitsstaat');
    expect(de.counters.ch_it_tax_note).not.toMatch(/Wohnstaat/);
    expect(de.dayTypes.teleworkHint_ticino).toContain('«zu Hause im Ansässigkeitsstaat»');
  });

  it('#15, #24: pricing uses the defined term, no seat false friends', () => {
    expect(fr.pricing.companyPrice).toBe('5 € / collaborateur actif / mois');
    expect(fr.pricing.companyMin).toMatch(/par collaborateur actif\)/);
    expect(JSON.stringify(fr.pricing)).not.toMatch(/salarié·e|par poste/);
    expect(de.pricing.companyMin).not.toMatch(/Sitz/);
    expect(JSON.stringify(de)).not.toMatch(/Kopfzahl/);
    expect(nl.pricing.companyMin).toMatch(/per actieve medewerker/);
    expect(JSON.stringify(nl)).not.toMatch(/\bzetel\b/);
  });

  it('#16: Italian DPA names the account administrator, not a second titolare', () => {
    expect(itDict.dpa.instructionsBody).toMatch(/amministratori dell’account/);
    expect(itDict.dpa.instructionsBody).not.toMatch(/titolari dell/);
  });

  it('#17: imprint is mentions légales / note legali', () => {
    expect(fr.terms.legalNoticeNote).toMatch(/^Cette section constitue les mentions légales\./);
    expect(itDict.terms.legalNoticeNote).toMatch(/^Questa sezione costituisce le note legali\./);
    expect(fr.terms.legalNoticeNote).not.toMatch(/empreinte/);
    expect(itDict.terms.legalNoticeNote).not.toMatch(/impronta/);
  });

  it('#18: renewal copy names the footer link that exists', () => {
    for (const d of [fr, de, itDict]) {
      expect(d.pricing.yearlyRenewal).toContain(d.nav.cancel);
      expect(d.terms.s3YearlyBody).toContain(d.nav.cancel);
    }
    expect(JSON.stringify([fr, de, itDict].map((d) => d.terms.s3YearlyBody))).not.toMatch(/Abo kündigen|Résilier l’abonnement|Disdici abbonamento/);
  });

  it('#19: notes quote the real overnight label', () => {
    const notes = ['ch_it_nonreturn_note', 'ch_fr_1983_nights_note', 'basel_de_nonreturn_note'] as const;
    const quoted: Record<string, string> = {
      fr: 'Nuit hors du domicile pour le travail',
      de: 'Beruflich auswärts übernachtet',
      it: 'Notte fuori per lavoro',
    };
    for (const [lang, d] of Object.entries({ fr, de, it: itDict })) {
      expect(d.dayTypes.overnightAway.startsWith(quoted[lang])).toBe(true);
      for (const k of notes) expect(d.counters[k], `${lang} ${k}`).toContain(quoted[lang]);
    }
  });

  it('#20-#22: social-security authority and regulation terms', () => {
    expect(fr.counters.ss_framework_note).toContain('SPF Sécurité sociale');
    expect(de.counters.ss_framework_note).toContain('FÖD Soziale Sicherheit');
    expect(itDict.counters.ss_framework_note).toContain('SPF Sicurezza sociale');
    for (const d of [fr, de, itDict]) {
      for (const s of [d.counters.ss_framework_note, d.counters.ss_framework_lu_note]) expect(s).not.toMatch(/\bFPS\b/);
    }
    expect(nl.counters.ss_framework_note).toContain('substantieel gedeelte');
    expect(nl.counters.ss_framework_lu_note).toContain('Substantieel gedeelte');
    expect(de.counters.ss_framework_note).toContain('«wesentlicher Teil der Tätigkeit»');
    expect(de.counters.ss_framework_lu_note).toContain('Wesentlicher Teil der Tätigkeit');
  });

  it('#23: no calque for on-site in the Italian DE–LU note', () => {
    expect(itDict.counters.lu_de_tax_note).toContain('I giorni in sede in Lussemburgo');
  });

  it('#25: DPA data categories use the Privacy terms', () => {
    expect(fr.dpa.subjectBody).toMatch(/taux d’emploi/);
    expect(fr.dpa.subjectBody).not.toMatch(/taux d’activité|fiche A1|nuitée|instructées/);
    expect(itDict.dpa.subjectBody).toMatch(/percentuale d’impiego/);
    expect(itDict.dpa.subjectBody).not.toMatch(/percentuale di attività|scheda A1|cosa vedono le HR|istruite/);
    expect(de.dpa.subjectBody).toMatch(/Telearbeits- und Steuerzähler/);
    expect(de.dpa.subjectBody).toMatch(/Markierung auswärtiger Übernachtung/);
  });

  it('#26: French CCT means one thing, and no material calques', () => {
    expect(JSON.stringify(fr)).not.toMatch(/\bCCT\b/);
    expect(JSON.stringify(fr.dpa)).toMatch(/clauses contractuelles types/);
    expect(fr.terms.s2Body).toMatch(/conventions collectives de travail/);
    expect(JSON.stringify(fr.dpa)).not.toMatch(/violation matérielle|changements matériels/);
  });

  it('#27: AFC is an authority, not a canton', () => {
    for (const [lang, d] of Object.entries(dicts)) {
      expect(d.company.exportCsvNote, lang).toMatch(/(Geneva|Genève|Genf|Ginevra)[^)]*AFC/);
    }
  });

  it('#28: the 30 June 2023 instrument is an amicable agreement', () => {
    expect(JSON.stringify(en.counters)).not.toMatch(/interpretative agreement/);
    expect(en.counters.ch_fr_1983_tax_note).toMatch(/amicable agreement of 30 June 2023/);
    expect(JSON.stringify(nl.counters)).not.toMatch(/interpretatief akkoord/);
  });

  it('#29-#36: NL vocabulary, register and typos', () => {
    const b = JSON.stringify(nl);
    expect(b).not.toMatch(/nacht[- ]uit|nacht weg|grenscorridor|dagsoort|voorvertoning|daglogboek|A1-record|gegevensverwerkingsovereenkomst/i);
    expect(b).not.toMatch(/restitutie|het contract\b|\bconventie|vriendschappelijk|\bavenant\b|impressum|imprint|managing directors/i);
    expect(b).not.toMatch(/Dagggeschiedenis|Doeinde|steekproefgegevens|restitutiegantie/);
    expect(nl.auth.signIn).toBe('Inloggen');
    expect(nl.auth.signUp).toBe('Registreren');
    expect(nl.home.risk1Body).toMatch(/doorgaans de sociale zekerheid/);
    expect(nl.company.demoBanner).toMatch(/voorbeeldgegevens/);
    expect(nl.counters.be_fr_pre2012_over).not.toMatch(/FOD Financiën/);
    expect(nl.terms.providerBody).toMatch(/zaakvoerders zoals daar ingeschreven/);
    expect(nl.terms.title).toBe('Voorwaarden & wettelijke vermeldingen');
    // The invitation email and the prerender speak the same Dutch.
    const mail = readFileSync(join(__dirname, '../supabase/functions/_shared/inviteEmail.ts'), 'utf8');
    expect(mail).not.toMatch(/nacht-uit|grenscorridor|dagsoort/);
    expect(JSON.stringify(PAGES.privacy.nl)).not.toMatch(/dagsoort|overnachting weg|dagboek/);
  });

  it('#37: prerendered and hydrated accessibility pages name the same WCAG version', () => {
    const version = /WCAG 2\.\d/;
    for (const [lang, d] of Object.entries(dicts)) {
      const hydrated = d.accessibility.intro.match(version)?.[0];
      expect(hydrated, lang).toBe('WCAG 2.1');
      const page = (PAGES.accessibility as Record<string, unknown>)[lang];
      for (const m of JSON.stringify(page).matchAll(/WCAG 2\.\d/g)) expect(m[0], lang).toBe(hydrated);
    }
  });

  it('#38: llms lists Dutch and a /nl/ link', () => {
    expect(llmsTxt()).toContain('- Languages: English, French, German, Italian, Dutch');
    expect(llmsTxt()).toContain('https://borderday.com/nl/ — Dutch landing');
    expect(llmsFullTxt()).toContain('Dutch');
  });

  it('#3: FAQ, JSON-LD source and llms name Stripe as merchant of record, as the Terms do', () => {
    for (const d of Object.values(dicts)) {
      expect(d.terms.s4Body).toMatch(/Stripe/);
      expect(d.terms.s4Body).not.toMatch(/Link (is|est|ist|è) (the |le |der |il |de )?(merchant|marchand)/i);
    }
    const blob = JSON.stringify(FAQ) + llmsFullTxt();
    expect(blob).not.toMatch(/Link (is|est|ist|è) (the |le |der |il |de )?(merchant|marchand)/i);
    for (const [lang, entries] of Object.entries(FAQ) as Array<[string, Array<[string, string]>]>) {
      const answers = entries.filter(([, a]) => a.includes('Stripe Managed Payments'));
      expect(answers.length, lang).toBe(1);
      // Terms wording: Stripe provides MoR functions; customer may see Link as MoR (not "Stripe is the MoR").
      expect(answers[0][1], lang).toMatch(/merchant.of.record|marchand officiel|Merchant of Record/i);
      expect(answers[0][1], lang).not.toMatch(/Stripe (is|est|ist|è)( the| le| der| il| de)? (merchant|marchand)/i);
    }
  });

  it('#4: the FR notice ends with the tracking-tool sentence, no splice', () => {
    expect(fr.company.noticeBody).not.toMatch(/Outil de suivi, L/);
    expect(fr.company.noticeBody).toMatch(/L’art\. 328b CO limite .* contrat de travail\. Ceci est un outil de suivi, pas un conseil fiscal ou juridique\.$/);
  });

  it('#5: the home meta description states the tax-corridor count in every language', () => {
    const count = BORDER_PACKS.filter(hasTaxCounter).length;
    expect(count).toBe(7);
    const words: Record<string, RegExp> = {
      fr: /fiscalité sur sept\./,
      de: /Steuer auf sieben\./,
      it: /fisco su sette\./,
    };
    const home = PAGES[''] as Record<string, { description: string }>;
    for (const [lang, word] of Object.entries(words)) expect(home[lang].description).toMatch(word);
    expect(JSON.stringify(home)).not.toMatch(/fiscalité sur six|Steuer auf sechs|fisco su sei/);
  });

  it('#6: NL retention help says there is no timed deletion, not that deletion is late', () => {
    expect(nl.company.retentionHelp).toContain('worden niet automatisch na een termijn gewist');
    expect(nl.company.retentionHelp).not.toContain('op tijd');
  });

  it('#7: NL yearly renewal keeps "at any time" in Pricing and Terms', () => {
    for (const text of [nl.pricing.yearlyRenewal, nl.terms.s3YearlyBody]) {
      expect(text).toContain('na de verlenging op elk moment kosteloos beëindigen');
    }
  });

  it('#8: DE Terms point to the page by its real name', () => {
    for (const text of [de.terms.s5Body, de.terms.s5EffectsBody]) {
      expect(text).toContain('«Vertrag widerrufen»');
      expect(text).not.toMatch(/zurücktreten/);
    }
    expect(de.withdrawal.title).toBe('Vertrag widerrufen');
  });
});

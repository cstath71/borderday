import { describe, expect, it } from 'vitest';
import de from '../src/i18n/de';
import en from '../src/i18n/en';
import fr from '../src/i18n/fr';
import itDict from '../src/i18n/it';
import nl from '../src/i18n/nl';
import { BORDER_PACKS, hasTaxCounter } from '../src/borders/packs';
import { FAQ, llmsFullTxt, PAGES } from '../scripts/seo.mjs';

const dicts = { en, fr, de, it: itDict, nl };

describe('audit-2 translation findings', () => {
  it('#2: the privacy intro is not the accessibility intro in any language', () => {
    for (const d of Object.values(dicts)) expect(d.privacy.intro).not.toBe(d.accessibility.intro);
    expect(fr.privacy.intro).toMatch(/données personnelles/);
    expect(fr.privacy.intro).toMatch(/RGPD/);
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
      expect(answers[0][1], lang).toMatch(/Stripe (is|est|ist|è)( the| le| der| il| de)? (merchant|marchand)/i);
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

// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FAQ, LANGS, PAGES, llmsFullTxt, llmsTxt, softwareApplicationLd } from '../scripts/seo.mjs';
import Seo from '../src/components/Seo';
import { getDict, type Lang } from '../src/i18n';

const auth = vi.hoisted(() => ({
  value: { ready: true, configured: true, user: null as null | { id: string; email: string }, signOut: vi.fn() },
}));
vi.mock('../src/lib/auth', () => ({ useAuth: () => auth.value, AuthProvider: ({ children }: any) => children }));
vi.mock('../src/lib/companyApi', async (original) => ({
  ...(await original<typeof import('../src/lib/companyApi')>()),
  listMyCompanies: vi.fn(async () => []),
}));

import App from '../src/App';

const LANG_LIST = LANGS as Lang[];
const dicts = LANG_LIST.map((l) => [l, getDict(l)] as const);
const flat = (v: unknown): string => JSON.stringify(v);

/** Each language's words for "on day 8, automatically, renewing until you cancel". */
const DISCLOSURE: Record<Lang, RegExp[]> = {
  en: [/day 8/, /automatically/, /renewing until you cancel/],
  fr: [/8e jour/, /automatiquement|automatique/, /jusqu’à (votre )?résiliation/],
  de: [/8\. Tag/, /automatisch/, /bis zu(r| Ihrer) Kündigung/],
  it: [/8° giorno/, /automaticamente|automatico/, /fino alla disdetta/],
};

function expectDisclosure(lang: Lang, text: string, where: string) {
  for (const re of DISCLOSURE[lang]) expect(text, `${lang} ${where}`).toMatch(re);
}

function open(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  auth.value.user = null;
});
afterEach(cleanup);

describe('C1 Privacy content', () => {
  it.each(dicts)('%s: every purpose has all six columns filled', (_lang, d) => {
    expect(d.privacy.tableRows.length).toBeGreaterThanOrEqual(8);
    for (const row of d.privacy.tableRows) {
      for (const col of Object.keys(d.privacy.tableCols) as Array<keyof typeof row>) {
        expect(row[col].length, col).toBeGreaterThan(3);
      }
    }
  });

  it('lists all six rights in each language', () => {
    expect(getDict('en').privacy.rights.join(' ')).toMatch(/Access.*Rectification.*Erasure.*Restriction.*Objection.*Portability/s);
    expect(getDict('fr').privacy.rights.join(' ')).toMatch(/Accès.*Rectification.*Effacement.*Limitation.*Opposition.*Portabilité/s);
    expect(getDict('de').privacy.rights.join(' ')).toMatch(/Auskunft.*Berichtigung.*Löschung.*Einschränkung.*Widerspruch.*Datenübertragbarkeit/s);
    expect(getDict('it').privacy.rights.join(' ')).toMatch(/Accesso.*Rettifica.*Cancellazione.*Limitazione.*Opposizione.*Portabilità/s);
  });

  it('names the Swiss authority and the local EU authority', () => {
    const names: Record<Lang, RegExp> = { en: /FDPIC/, fr: /PFPDT/, de: /EDÖB/, it: /IFPDT/ };
    for (const [lang, d] of dicts) {
      expect(d.privacy.complaintBody).toMatch(names[lang]);
      expect(d.privacy.complaintBody).toMatch(/edoeb\.admin\.ch/);
      expect(d.privacy.complaintBody).toMatch(/EU\/|UE\//);
    }
  });

  it('is honest about US transfers and points to the public DPA (not a separately signed one)', () => {
    for (const [, d] of dicts) {
      const blob = flat(d.privacy);
      expect(d.privacy.transfersBody).toMatch(/Data Privacy Framework/);
      expect(blob).toMatch(/eu-central-1/);
      expect(blob).not.toMatch(/signed (DPA|data)|DPA signé|unterzeichnete/i);
    }
    expect(getDict('en').privacy.rolesBody).toMatch(/public data processing agreement.*\/dpa\//);
    expect(getDict('fr').privacy.rolesBody).toMatch(/accord public de traitement.*\/dpa\//);
    expect(getDict('de').privacy.rolesBody).toMatch(/öffentliche Auftragsverarbeitungsvertrag.*\/dpa\//);
    expect(getDict('it').privacy.rolesBody).toMatch(/accordo pubblico sul trattamento.*\/dpa\//);
  });

  it('H6: names every recipient and Stripe/Link as independent controllers', () => {
    for (const [lang, d] of dicts) {
      const list = d.privacy.recipients.join(' ');
      for (const name of ['Supabase', 'Resend', 'Stripe', 'Link', 'GitHub Pages', 'Zoho', 'Google']) {
        expect(list, `${lang} ${name}`).toContain(name);
      }
    }
    expect(getDict('en').privacy.recipients.join(' ')).toMatch(/Stripe and Link.*independent controllers/);
    expect(getDict('fr').privacy.recipients.join(' ')).toMatch(/Stripe et Link.*responsables du traitement indépendants/);
    expect(getDict('de').privacy.recipients.join(' ')).toMatch(/Stripe und Link.*unabhängige Verantwortliche/);
    expect(getDict('it').privacy.recipients.join(' ')).toMatch(/Stripe e Link.*titolari autonomi/);
  });

  it('H6: drops the claim that emails are used only for auth and invites', () => {
    for (const [, d] of dicts) expect((d.privacy as Record<string, unknown>).s3Body).toBeUndefined();
    expect(flat(getDict('en').privacy)).not.toMatch(/authentication and company invites only/);
  });

  it('H3: states the scheduled purge and the 1–120 month company window', () => {
    const purge: Record<Lang, RegExp> = {
      en: /daily scheduled job deletes company day logs/,
      fr: /job quotidien planifié supprime les journaux entreprise/,
      de: /täglich geplanter Job löscht Unternehmens-Tagesprotokolle/,
      it: /job giornaliero programmato cancella i registri aziendali/,
    };
    for (const [lang, d] of dicts) {
      expect(d.privacy.s6Body).toMatch(purge[lang]);
      expect(flat(d)).not.toMatch(/deleted or anonymised|suppression ou anonymisation|Löschung oder Anonymisierung|cancellazione o anonimizzazione/);
      expect(d.privacy.s6Body).toMatch(/1–120/);
      expect(d.privacy.s6Body).not.toMatch(/not in place yet|pas encore en place|noch nicht eingerichtet|non è ancora attiva/);
    }
  });

  it('H5: says what HR sees, in place of "never location"', () => {
    expect(getDict('en').privacy.s2Body).toContain(
      'No GPS or device location. HR sees day type (and overnight-away yes/no) per date — country category, never coordinates. Notes are private to the employee.',
    );
    expect(getDict('fr').faq.a4).toMatch(/jamais des coordonnées/);
    expect(getDict('de').faq.a4).toMatch(/nie Koordinaten/);
    expect(getDict('it').faq.a4).toMatch(/mai coordinate/);
    for (const [lang] of dicts) {
      expect(flat(FAQ[lang])).not.toMatch(/never location|jamais la localisation|nie den Standort|mai la posizione/);
    }
  });

  it('L1: explains storage on the device', () => {
    for (const [, d] of dicts) {
      expect(d.privacy.storageBody).toMatch(/IndexedDB/);
      expect(d.privacy.storageBody).toMatch(/localStorage/);
      expect(d.privacy.storageBody).toMatch(/service.worker/i);
    }
  });

  it('renders a real table with headers, and the page keeps the controller on it', async () => {
    open('/en/privacy');
    const table = await screen.findByRole('table');
    expect(within(table).getAllByRole('columnheader')).toHaveLength(6);
    expect(within(table).getAllByRole('rowheader')).toHaveLength(getDict('en').privacy.tableRows.length);
    expect(document.body.textContent).toContain('PrimeLogic Advisory Sàrl');
  });
});

describe('C4 notice, not consent', () => {
  it('names the step a notice and never asks for consent', () => {
    expect(getDict('en').company.noticeTitle).toBe('Notice — what HR can see');
    expect(getDict('de').company.noticeTitle).toMatch(/^Hinweis/);
    expect(getDict('fr').company.noticeTitle).toMatch(/^Avis/);
    expect(getDict('it').company.noticeTitle).toMatch(/^Avviso/);
    for (const [, d] of dicts) {
      expect(d.company.joinSubtitle).not.toMatch(/consent|Einwilligung|consenso/i);
      expect(d.company.noticeAck).not.toMatch(/accept|akzeptier|accett/i);
      expect(flat(d.home)).not.toMatch(/consent|Einwilligung|consenso/i);
      expect((d.company as Record<string, string>).consentBody).toBeUndefined();
    }
    expect(getDict('en').company.noticeBody).toMatch(/not a request for consent/);
    expect(getDict('de').company.noticeBody).toMatch(/keine Bitte um Einwilligung/);
    expect(getDict('fr').company.noticeBody).toMatch(/pas une demande de consentement/);
    expect(getDict('it').company.noticeBody).toMatch(/non una richiesta di consenso/);
  });

  it('says company day-log retention is automated within 1–120 months', () => {
    for (const [, d] of dicts) expect(d.company.noticeBody).toMatch(/1–120/);
    expect(getDict('en').company.noticeBody).toMatch(/deleted automatically each day/);
  });
});

describe('C6 withdrawal wording', () => {
  it('drops the digital-content formula in every language', () => {
    const all = dicts.map(([, d]) => flat(d.terms)).join(' ');
    expect(all).not.toMatch(/once performance has begun|une fois l’exécution commencée|mit Leistungsbeginn erlischt|una volta iniziata l’esecuzione/);
  });

  it('states full performance and proportionate payment', () => {
    const fullPerformance: Record<Lang, RegExp> = {
      en: /fully performed/,
      fr: /pleinement exécuté/,
      de: /vollständiger Vertragserfüllung/,
      it: /completa esecuzione del contratto/,
    };
    const proportionate: Record<Lang, RegExp> = { en: /in proportion/, fr: /proportionnel/, de: /im Verhältnis/, it: /proporzionale/ };
    for (const [lang, d] of dicts) {
      expect(d.terms.s5EffectsBody).toMatch(fullPerformance[lang]);
      expect(d.terms.s5EffectsBody).toMatch(proportionate[lang]);
      expect(d.terms.s5Body).toMatch(/\b14\b/);
    }
    expect(getDict('en').terms.s5Body).toMatch(/the day you receive access/);
  });

  it('carries the Annex I(B) fields', () => {
    expect(getDict('en').terms.s5Form).toMatch(/Ordered on \/ received on.*Name of consumer.*Address of consumer.*Signature.*Date/s);
    expect(getDict('fr').terms.s5Form).toMatch(/Commandé le \/ reçu le.*Nom du consommateur.*Adresse du consommateur.*Signature.*Date/s);
    expect(getDict('de').terms.s5Form).toMatch(/Bestellt am \/ erhalten am.*Name des Verbrauchers.*Anschrift des Verbrauchers.*Unterschrift.*Datum/s);
    expect(getDict('it').terms.s5Form).toMatch(/Ordinato il \/ ricevuto il.*Nome del consumatore.*Indirizzo del consumatore.*Firma.*Data/s);
  });

  it('H12: says a renewed yearly plan can be cancelled at any time after the first year, and promises no invented refund', () => {
    expect(getDict('en').terms.s3YearlyBody).toMatch(/After the first year you can cancel a renewed yearly plan at any time/);
    expect(getDict('de').terms.s3YearlyBody).toMatch(/Nach dem ersten Jahr/);
    expect(getDict('fr').terms.s3YearlyBody).toMatch(/Après la première année/);
    expect(getDict('it').terms.s3YearlyBody).toMatch(/Dopo il primo anno/);
    for (const [, d] of dicts) expect(d.terms.s3YearlyBody).not.toMatch(/\d/);
  });
});

describe('C7 / M5 trial and price disclosure on every surface', () => {
  it.each(dicts)('%s: locale surfaces', (lang, d) => {
    for (const [where, text] of Object.entries({
      trialCompany: d.pricing.trialCompany,
      trialIndividual: d.pricing.trialIndividual,
      inShort: d.home.inShort,
      waitlistNote: d.home.waitlistNote,
      faq: d.faq.a7,
      signUp: d.auth.signUpTerms,
    })) {
      expectDisclosure(lang, text, where);
    }
    expect(d.terms.s3Body).toMatch(/\b7\b/);
  });

  it('terms state the conversion in each language', () => {
    expect(getDict('en').terms.s3Body).toMatch(/becomes paid at the stated price.*charged automatically on day 8.*renews/s);
    expect(getDict('fr').terms.s3Body).toMatch(/devient payante au prix indiqué.*débitée automatiquement le 8e jour/s);
    expect(getDict('de').terms.s3Body).toMatch(/zum angegebenen Preis kostenpflichtig.*am 8\. Tag automatisch/s);
    expect(getDict('it').terms.s3Body).toMatch(/diventa a pagamento al prezzo indicato.*addebitata automaticamente l’8° giorno/s);
  });

  it.each(LANG_LIST)('%s: prerendered SEO pages and FAQ', (lang) => {
    for (const path of ['', 'pricing', 'for-individuals', 'company/signup', 'faq']) {
      expectDisclosure(lang, PAGES[path][lang].summary, `summary ${path}`);
    }
    for (const path of ['', 'pricing', 'for-individuals']) {
      expect(PAGES[path][lang].description).toMatch(DISCLOSURE[lang][0]);
    }
    expect(PAGES.terms[lang].summary).toMatch(DISCLOSURE[lang][0]);
    expectDisclosure(lang, flat(FAQ[lang]), 'faq json-ld');
  });

  it('llms and JSON-LD disclose the conversion and the VAT treatment', () => {
    expect(llmsTxt()).toMatch(/charged automatically on day 8 and renewing until cancelled/);
    expect(llmsFullTxt()).not.toMatch(/for audit/);
    for (const offer of softwareApplicationLd().offers) {
      expect(offer.description).toMatch(/day 8/);
      expect(offer.description).toMatch(/VAT/);
    }
  });

  it('the client JSON-LD carries the same offer wording as the prerender', async () => {
    render(<Seo lang="en" title="x" description="y" path="" />);
    const graph = JSON.parse(document.getElementById('bd-jsonld')!.textContent!)['@graph'];
    const client = graph.find((n: { '@type': string }) => n['@type'] === 'SoftwareApplication').offers;
    const descriptions = (list: Array<{ name: string; description: string }>) =>
      list.map((o) => [o.name, o.description]).sort();
    expect(descriptions(client)).toEqual(descriptions(softwareApplicationLd().offers));
  });

  it('labels VAT in every price sentence, keeps yearly as a minimum, and drops the comparison claim', () => {
    const vat: Record<Lang, RegExp> = {
      en: /excl\. VAT.*incl\. VAT/s,
      fr: /hors TVA.*TVA incluse/s,
      de: /zzgl\. MWST.*inkl\. MWST/s,
      it: /IVA esclusa.*IVA inclusa/s,
    };
    const yearly: Record<Lang, RegExp> = { en: /minimum €390/, fr: /minimum 390 €/, de: /mindestens 390 €/, it: /minimo 390 €/ };
    for (const [lang, d] of dicts) {
      expect(d.home.inShort).toMatch(vat[lang]);
      expect(d.pricing.trialCompany).toMatch(yearly[lang]);
      expect((d.pricing as Record<string, string>).compareNote).toBeUndefined();
      expect(flat(PAGES.pricing[lang])).toMatch(/390/);
      expect(flat(PAGES.pricing[lang])).toMatch(/minimum|Minimum|mindestens|minimo/);
    }
    expect(flat(PAGES) + flat(FAQ)).not.toMatch(/TTC/);
  });
});

describe('H13 / M1 links before buying', () => {
  it('Pricing shows the trial terms and Terms, Privacy links above each buy button', async () => {
    open('/en/pricing');
    const d = getDict('en');
    const buttons = await screen.findAllByRole('button', { name: d.pricing.subscribeMonthly });
    expect(buttons).toHaveLength(2);
    for (const button of buttons) {
      const card = button.closest('article')!;
      const links = within(card).getAllByRole('link').map((a) => a.getAttribute('href'));
      expect(links).toContain('/en/terms');
      expect(links).toContain('/en/privacy');
      const terms = within(card).getByRole('link', { name: d.nav.terms });
      expect(terms.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
    expect(document.body.textContent).toContain(d.pricing.trialCompany);
    expect(document.body.textContent).toContain(d.pricing.trialIndividual);
  });

  it.each(['/en/auth/sign-up', '/en/company/signup'])('%s shows trial terms and legal links', async (path) => {
    open(path);
    const d = getDict('en');
    await screen.findByText(new RegExp(d.auth.signUpTerms.slice(0, 40)));
    expect(screen.getAllByRole('link', { name: d.nav.terms }).length).toBeGreaterThanOrEqual(2);
  });

  it('labels the footer link as a legal notice in each language', () => {
    expect(getDict('en').nav.terms).toBe('Terms & legal notice');
    expect(getDict('de').nav.terms).toBe('Nutzungsbedingungen & Impressum');
    expect(getDict('fr').nav.terms).toBe('CGU et mentions légales');
    expect(getDict('it').nav.terms).toBe('Condizioni e note legali');
  });

  it('the Terms page opens with the legal notice', async () => {
    open('/de/terms');
    const d = getDict('de');
    const heading = await screen.findByRole('heading', { name: d.terms.providerTitle });
    expect(heading.nextElementSibling?.textContent).toContain('PrimeLogic Advisory Sàrl');
    expect(document.body.textContent).toContain(d.terms.legalNoticeNote);
  });
});

describe('C5 Withdrawal page', () => {
  it.each(LANG_LIST)('%s: labelled, linked from the footer, and free of the controller name', async (lang) => {
    open(`/${lang}/withdrawal`);
    const d = getDict(lang);
    await screen.findByRole('heading', { level: 1, name: d.withdrawal.title });
    expect(within(document.querySelector('footer')!).getByRole('link', { name: d.nav.withdraw }).getAttribute('href')).toBe(`/${lang}/withdrawal`);
    expect(document.body.textContent).not.toMatch(/PrimeLogic|CHE-312/);
    expect(d.withdrawal.linkNote.length).toBeGreaterThan(40);
  });

  it('asks for name, email and order, then needs a confirm step before the email opens', async () => {
    open('/en/withdrawal');
    const d = getDict('en');
    expect(screen.queryByRole('link', { name: d.withdrawal.confirm })).toBeNull();
    fireEvent.change(await screen.findByLabelText(d.mailForm.name), { target: { value: 'Ana Test' } });
    fireEvent.change(screen.getByLabelText(d.mailForm.email), { target: { value: 'ana@example.test' } });
    fireEvent.change(screen.getByLabelText(new RegExp(d.mailForm.reference)), { target: { value: 'ORD-1' } });
    fireEvent.change(screen.getByLabelText(d.withdrawal.orderedOn), { target: { value: '2026-10-20' } });
    fireEvent.click(screen.getByRole('button', { name: d.withdrawal.submit }));
    const href = screen.getByRole('link', { name: d.withdrawal.confirm }).getAttribute('href')!;
    expect(href.startsWith('mailto:privacy@borderday.com?')).toBe(true);
    const params = new URLSearchParams(href.split('?')[1]);
    expect(params.get('subject')).toBe(d.withdrawal.mailSubject);
    const body = params.get('body')!;
    for (const part of ['withdraw from my contract', 'Ana Test', 'ana@example.test', 'ORD-1', '2026-10-20']) expect(body).toContain(part);
  });

  it('prefills the account email when signed in', async () => {
    auth.value.user = { id: 'u1', email: 'me@example.test' };
    open('/fr/withdrawal');
    const d = getDict('fr');
    expect((await screen.findByLabelText(d.mailForm.email) as HTMLInputElement).value).toBe('me@example.test');
  });
});

describe('H10 Join links to Privacy', () => {
  it('the notice and privacy link keys exist in each language', () => {
    for (const [, d] of dicts) {
      expect(d.company.noticePrivacyLink.length).toBeGreaterThan(3);
      expect(d.company.noticeBody).toMatch(/privacy@borderday\.com/);
    }
  });
});

describe('seo.mjs stays in sync with the locale files (finding 39)', () => {
  it.each(dicts)('%s: H1 and summaries match what hydrates', (lang, d) => {
    expect(PAGES[''][lang].h1).toBe(d.home.heroTitle);
    expect(PAGES[''][lang].summary).toBe(d.home.inShort);
    expect(PAGES.pricing[lang].h1).toBe(d.pricing.title);
    expect(PAGES.faq[lang].h1).toBe(d.faq.title);
    expect(PAGES.privacy[lang].h1).toBe(d.privacy.title);
    expect(PAGES.terms[lang].h1).toBe(d.terms.title);
    expect(PAGES.disclaimer[lang].h1).toBe(d.disclaimer.title);
    expect(PAGES.withdrawal[lang].h1).toBe(d.withdrawal.title);
    expect(PAGES['for-individuals'][lang].h1).toBe(d.individuals.heroTitle);
  });

  it('never calls employees self-employed, and keeps the German register formal', () => {
    expect(flat(PAGES['for-individuals'].fr)).not.toMatch(/indépendants/);
    expect(flat(FAQ.de) + flat(PAGES)).not.toMatch(/\b(Erfasst ihr|deckt ihr)\b/);
    expect(flat(PAGES)).not.toMatch(/verkauf über Link|transfrontalier/);
  });
});

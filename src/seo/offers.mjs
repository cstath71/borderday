/** Localized Offer names and descriptions. Prices and trial rules match the published pricing page. */

export const ORG_SAME_AS = ['https://www.linkedin.com/company/borderday/'];

const TRIAL_EN =
  '7-day free trial, then charged automatically on day 8 and renewing until you cancel; card required.';
const TRIAL_FR =
  'Essai gratuit de 7 jours, puis débit automatique le 8e jour et renouvellement jusqu’à résiliation ; carte requise.';
const TRIAL_DE =
  '7 Tage kostenlos testen, danach automatische Abbuchung am 8. Tag und Verlängerung bis zur Kündigung; Karte erforderlich.';
const TRIAL_IT =
  'Prova gratuita di 7 giorni, poi addebito automatico l’8° giorno e rinnovo fino alla disdetta; carta richiesta.';
const TRIAL_NL =
  '7 dagen gratis proberen, daarna automatisch geïncasseerd op dag 8 en verlengd tot u opzegt; kaart vereist.';

function offer(name, price, description, unitText, unitEntity, url) {
  const row = {
    '@type': 'Offer',
    name,
    price,
    priceCurrency: 'EUR',
    description,
    availability: 'https://schema.org/InStock',
    url,
  };
  if (unitText) {
    row.priceSpecification = {
      '@type': 'UnitPriceSpecification',
      price,
      priceCurrency: 'EUR',
      unitText,
      referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitText: unitEntity },
    };
  }
  return row;
}

const COPY = {
  en: {
    unit: 'active employee / month',
    entity: 'employee',
    names: [
      'Company monthly (per active employee)',
      'Company yearly minimum',
      'Individual monthly',
      'Individual yearly',
    ],
    descriptions: [
      `Minimum €39 / month. Prices exclude VAT. ${TRIAL_EN}`,
      `Yearly company billing: 2 months free (€390 / year minimum). Prices exclude VAT. ${TRIAL_EN}`,
      `Includes VAT. ${TRIAL_EN}`,
      `Includes VAT. About two months free vs monthly. ${TRIAL_EN}`,
    ],
  },
  fr: {
    unit: 'collaborateur actif / mois',
    entity: 'collaborateur',
    names: [
      'Mensuel entreprise (par collaborateur actif)',
      'Minimum annuel entreprise',
      'Mensuel particulier',
      'Annuel particulier',
    ],
    descriptions: [
      `Minimum 39 € / mois. Prix hors TVA. ${TRIAL_FR}`,
      `Facturation annuelle entreprise : 2 mois offerts (minimum 390 € / an). Prix hors TVA. ${TRIAL_FR}`,
      `TVA incluse. ${TRIAL_FR}`,
      `TVA incluse. Environ deux mois offerts par rapport au mensuel. ${TRIAL_FR}`,
    ],
  },
  de: {
    unit: 'aktive mitarbeitende Person / Monat',
    entity: 'mitarbeitende Person',
    names: [
      'Monatlich Unternehmen (je aktive mitarbeitende Person)',
      'Jährliches Unternehmensminimum',
      'Monatlich Einzelperson',
      'Jährlich Einzelperson',
    ],
    descriptions: [
      `Minimum 39 € / Monat. Preise zzgl. MWST. ${TRIAL_DE}`,
      `Jährliche Unternehmensabrechnung: 2 Monate gratis (Minimum 390 € / Jahr). Preise zzgl. MWST. ${TRIAL_DE}`,
      `Inkl. MWST. ${TRIAL_DE}`,
      `Inkl. MWST. Etwa zwei Monate gratis gegenüber monatlich. ${TRIAL_DE}`,
    ],
  },
  it: {
    unit: 'dipendente attivo / mese',
    entity: 'dipendente',
    names: [
      'Mensile azienda (per dipendente attivo)',
      'Minimo annuale azienda',
      'Mensile individuale',
      'Annuale individuale',
    ],
    descriptions: [
      `Minimo 39 € / mese. Prezzi IVA esclusa. ${TRIAL_IT}`,
      `Fatturazione annuale azienda: 2 mesi gratis (minimo 390 € / anno). Prezzi IVA esclusa. ${TRIAL_IT}`,
      `IVA inclusa. ${TRIAL_IT}`,
      `IVA inclusa. Circa due mesi gratis rispetto al mensile. ${TRIAL_IT}`,
    ],
  },
  nl: {
    unit: 'actieve medewerker / maand',
    entity: 'medewerker',
    names: [
      'Maandelijks bedrijf (per actieve medewerker)',
      'Jaarlijks bedrijfsminimum',
      'Maandelijks particulier',
      'Jaarlijks particulier',
    ],
    descriptions: [
      `Minimum €39 / maand. Prijzen excl. btw. ${TRIAL_NL}`,
      `Jaarlijkse bedrijfsfacturatie: 2 maanden gratis (minimum €390 / jaar). Prijzen excl. btw. ${TRIAL_NL}`,
      `Incl. btw. ${TRIAL_NL}`,
      `Incl. btw. Ongeveer twee maanden gratis tegenover maandelijks. ${TRIAL_NL}`,
    ],
  },
};

const PRICES = ['5.00', '390.00', '4.99', '49.00'];

export function offersFor(lang, pricingUrl) {
  const copy = COPY[lang] || COPY.en;
  return PRICES.map((price, i) =>
    offer(
      copy.names[i],
      price,
      copy.descriptions[i],
      i === 0 ? copy.unit : '',
      copy.entity,
      pricingUrl,
    ),
  );
}

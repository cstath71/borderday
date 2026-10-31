/**
 * SEO + AEO helpers for BorderDay (same pattern as CoachBadge / ShopBot Index).
 * Public IndexNow key is served at /<key>.txt by design.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const CFG = JSON.parse(readFileSync(join(ROOT, 'config/site.json'), 'utf8'));
export const BASE = CFG.base_url.replace(/\/$/, '');
export const BRAND = CFG.brand;
export const INDEXNOW_KEY = CFG.indexnow_key;
export const LANGS = ['en', 'fr', 'de', 'it'];
export const LASTMOD = CFG.lastmod;

export const IN_SHORT_LABEL = {
  en: 'In short',
  fr: 'En bref',
  de: 'Kurz gesagt',
  it: 'In breve',
};

export const AI_BOTS = [
  'Googlebot',
  'Bingbot',
  'DuckDuckBot',
  'Applebot',
  'Applebot-Extended',
  'Google-Extended',
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'CCBot',
  'Amazonbot',
  'meta-externalagent',
  'MistralAI-User',
  'YandexBot',
];

/** Public, indexable marketing routes (path segment after /:lang/). Empty string = home. */
export const PUBLIC_PATHS = [
  '',
  'pricing',
  'faq',
  'for-individuals',
  'privacy',
  'disclaimer',
  'terms',
  'company/signup',
];

/** SPA shells that must exist for GitHub Pages but stay noindex. */
export const NOINDEX_PATHS = [
  'app',
  'auth/sign-in',
  'auth/sign-up',
  'auth/callback',
  'company/dashboard',
];

export function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function absUrl(lang, path) {
  const suffix = path ? `/${path}` : '/';
  return `${BASE}/${lang}${suffix === '/' ? '/' : suffix}`;
}

export function pageFile(lang, path) {
  if (!path) return `${lang}/index.html`;
  return `${lang}/${path}/index.html`;
}

/** Localized SEO copy. Facts only from the live product / existing site copy — no invented thresholds. */
export const PAGES = {
  '': {
    en: {
      title: 'BorderDay — Cross-border day limits for HR and employees',
      description:
        'Employer-first day counting for tax and social-security thresholds across Geneva, Basel, Ticino, Luxembourg and Belgium. Company from €5/employee/mo (min €39). 7-day trial.',
      h1: 'One place for every border your people work across',
      summary:
        'BorderDay helps HR track telework, on-site and travel days per employee against official tax and social-security day limits on five borders. Company plan: €5 per active employee per month (€39 minimum); individuals €4.99/month or €49/year. 7-day trial with card required. A tracking tool — not tax or legal advice.',
      crumbs: [['Home', '']],
    },
    fr: {
      title: 'BorderDay — Limites de jours transfrontaliers pour les RH',
      description:
        'Comptage des jours pour les seuils fiscaux et de sécurité sociale (Genève, Bâle, Tessin, Luxembourg, Belgique). Entreprise dès 5 €/collaborateur/mois (min. 39 €). Essai 7 jours.',
      h1: 'Un seul endroit pour chaque frontière de vos équipes',
      summary:
        'BorderDay aide les RH à suivre télétravail, jours sur site et déplacements par collaborateur au regard des seuils officiels fiscaux et de sécurité sociale sur cinq frontières. Offre entreprise : 5 € par collaborateur actif et par mois (minimum 39 €) ; particuliers 4,99 €/mois ou 49 €/an. Essai de 7 jours avec carte requise. Outil de suivi — pas un conseil fiscal ou juridique.',
      crumbs: [['Accueil', '']],
    },
    de: {
      title: 'BorderDay — Grenzüberschreitende Tagesschwellen für HR',
      description:
        'Tageszählung für Steuer- und Sozialversicherungsschwellen (Genf, Basel, Tessin, Luxemburg, Belgien). Unternehmen ab 5 €/Mitarbeitende/Monat (min. 39 €). 7-Tage-Test.',
      h1: 'Ein Ort für jede Grenze Ihrer Mitarbeitenden',
      summary:
        'BorderDay hilft HR, Telearbeit, Vor-Ort- und Reisetage je Mitarbeitenden an offiziellen Steuer- und Sozialversicherungsschwellen auf fünf Grenzen zu messen. Unternehmensplan: 5 € je aktive Mitarbeitende und Monat (Minimum 39 €); Einzelpersonen 4,99 €/Monat oder 49 €/Jahr. 7-Tage-Test mit Karte. Tracking-Tool — keine Steuer- oder Rechtsberatung.',
      crumbs: [['Start', '']],
    },
    it: {
      title: 'BorderDay — Soglie di giorni transfrontalieri per HR',
      description:
        'Conteggio giorni per soglie fiscali e di sicurezza sociale (Ginevra, Basilea, Ticino, Lussemburgo, Belgio). Azienda da 5 €/collaboratore/mese (min. 39 €). Prova 7 giorni.',
      h1: 'Un solo posto per ogni frontiera dei vostri team',
      summary:
        'BorderDay aiuta HR a registrare telelavoro, giorni in sede e missioni per collaboratore rispetto alle soglie ufficiali fiscali e di sicurezza sociale su cinque frontiere. Piano aziendale: 5 € per collaboratore attivo al mese (minimo 39 €); individuali 4,99 €/mese o 49 €/anno. Prova di 7 giorni con carta richiesta. Strumento di tracciamento — non consulenza fiscale o legale.',
      crumbs: [['Home', '']],
    },
  },
  pricing: {
    en: {
      title: 'Pricing — BorderDay',
      description:
        'Company: €5 per active employee per month, €39 minimum, yearly €390 (2 months free). Individual: €4.99/month or €49/year. 7-day trial, card required.',
      h1: 'Pricing',
      summary:
        'Company / HR: €5 per active employee per month with a €39 monthly minimum (covers up to 7 active employees); yearly billing is €390 minimum (2 months free). Individual: €4.99 per month or €49 per year (about two months free). Company prices exclude VAT; individual prices include VAT. 7-day free trial — card required at signup. Checkout via Stripe Managed Payments (sold through Link).',
      crumbs: [
        ['Home', ''],
        ['Pricing', 'pricing'],
      ],
    },
    fr: {
      title: 'Tarifs — BorderDay',
      description:
        'Entreprise : 5 € / collaborateur actif / mois, minimum 39 €, annuel 390 €. Particulier : 4,99 €/mois ou 49 €/an. Essai 7 jours, carte requise.',
      h1: 'Tarifs',
      summary:
        'Entreprise / RH : 5 € par collaborateur actif et par mois, minimum 39 € / mois (jusqu’à 7 collaborateurs actifs) ; annuel 390 € minimum (2 mois offerts). Particulier : 4,99 € / mois ou 49 € / an. Prix entreprise hors TVA ; prix particulier TTC. Essai gratuit de 7 jours — carte requise. Paiement via Stripe Managed Payments (vendu via Link).',
      crumbs: [
        ['Accueil', ''],
        ['Tarifs', 'pricing'],
      ],
    },
    de: {
      title: 'Preise — BorderDay',
      description:
        'Unternehmen: 5 € je aktive Mitarbeitende / Monat, Minimum 39 €, jährlich 390 €. Einzelperson: 4,99 €/Monat oder 49 €/Jahr. 7-Tage-Test.',
      h1: 'Preise',
      summary:
        'Unternehmen / HR: 5 € je aktive Mitarbeitende und Monat, Minimum 39 € / Monat (bis 7 aktive Mitarbeitende); jährlich Minimum 390 € (2 Monate gratis). Einzelperson: 4,99 € / Monat oder 49 € / Jahr. Unternehmenspreise zzgl. MwSt.; Einzelpreise inkl. MwSt. 7-Tage-Test — Karte erforderlich. Checkout über Stripe Managed Payments (verkauf über Link).',
      crumbs: [
        ['Start', ''],
        ['Preise', 'pricing'],
      ],
    },
    it: {
      title: 'Prezzi — BorderDay',
      description:
        'Azienda: 5 € per collaboratore attivo / mese, minimo 39 €, annuale 390 €. Individuale: 4,99 €/mese o 49 €/anno. Prova 7 giorni.',
      h1: 'Prezzi',
      summary:
        'Azienda / HR: 5 € per collaboratore attivo al mese, minimo 39 € / mese (fino a 7 collaboratori attivi); annuale minimo 390 € (2 mesi gratis). Individuale: 4,99 € / mese o 49 € / anno. Prezzi azienda IVA esclusa; individuali IVA inclusa. Prova gratuita di 7 giorni — carta richiesta. Checkout tramite Stripe Managed Payments (venduto tramite Link).',
      crumbs: [
        ['Home', ''],
        ['Prezzi', 'pricing'],
      ],
    },
  },
  faq: {
    en: {
      title: 'FAQ — BorderDay',
      description:
        'Is BorderDay tax advice? Where is the day log stored? Which borders are covered? How do payments and the 7-day trial work?',
      h1: 'FAQ',
      summary:
        'BorderDay is a record-keeping and reminder tool, not tax or legal advice. Day logs stay on the device in version 1; HR sees day types and counts only, never location. Borders in v1: Geneva/Romandie–France, Basel–France/Germany, Luxembourg–FR/BE/DE, Belgium←FR/NL, Ticino–Italy. Checkout uses Stripe Managed Payments with a 7-day trial (card required).',
      crumbs: [
        ['Home', ''],
        ['FAQ', 'faq'],
      ],
    },
    fr: {
      title: 'FAQ — BorderDay',
      description:
        'BorderDay est-il un conseil fiscal ? Où est le journal ? Quelles frontières ? Comment marchent le paiement et l’essai de 7 jours ?',
      h1: 'FAQ',
      summary:
        'BorderDay est un outil de suivi et de rappel, pas un conseil fiscal ou juridique. Le journal reste sur l’appareil en v1 ; les RH voient types de jours et compteurs uniquement, jamais la localisation. Frontières v1 : Genève/Romandie–France, Bâle–France/Allemagne, Luxembourg–FR/BE/DE, Belgique←FR/NL, Tessin–Italie. Paiement via Stripe Managed Payments avec essai de 7 jours (carte requise).',
      crumbs: [
        ['Accueil', ''],
        ['FAQ', 'faq'],
      ],
    },
    de: {
      title: 'FAQ — BorderDay',
      description:
        'Ist BorderDay Steuerberatung? Wo liegt das Tagebuch? Welche Grenzen? Wie funktionieren Zahlung und 7-Tage-Test?',
      h1: 'FAQ',
      summary:
        'BorderDay ist ein Erfassungs- und Erinnerungstool, keine Steuer- oder Rechtsberatung. Das Tagebuch bleibt in v1 auf dem Gerät; HR sieht nur Tagesarten und Zähler, nie den Standort. Grenzen v1: Genf/Romandie–Frankreich, Basel–FR/DE, Luxemburg–FR/BE/DE, Belgien←FR/NL, Tessin–Italien. Checkout über Stripe Managed Payments mit 7-Tage-Test (Karte nötig).',
      crumbs: [
        ['Start', ''],
        ['FAQ', 'faq'],
      ],
    },
    it: {
      title: 'FAQ — BorderDay',
      description:
        'BorderDay è consulenza fiscale? Dove è il diario? Quali frontiere? Come funzionano pagamenti e prova di 7 giorni?',
      h1: 'FAQ',
      summary:
        'BorderDay è uno strumento di registrazione e promemoria, non consulenza fiscale o legale. Il diario resta sul dispositivo in v1; HR vede solo tipi di giorno e contatori, mai la posizione. Frontiere v1: Ginevra/Romandia–Francia, Basilea–FR/DE, Lussemburgo–FR/BE/DE, Belgio←FR/NL, Ticino–Italia. Checkout con Stripe Managed Payments e prova di 7 giorni (carta richiesta).',
      crumbs: [
        ['Home', ''],
        ['FAQ', 'faq'],
      ],
    },
  },
  'for-individuals': {
    en: {
      title: 'For individuals — BorderDay',
      description:
        'Log your own telework and border days on your device against official tax and social-security limits. €4.99/month or €49/year. Join via employer invite when they use BorderDay.',
      h1: 'BorderDay for individuals',
      summary:
        'Employees and self-trackers can log telework, on-site, trip and non-working days against official limits. Individual plan: €4.99/month or €49/year (incl. VAT), 7-day trial with card required. If your employer uses BorderDay, join via their invite link to share the same counters with HR.',
      crumbs: [
        ['Home', ''],
        ['For individuals', 'for-individuals'],
      ],
    },
    fr: {
      title: 'Pour les particuliers — BorderDay',
      description:
        'Journalisez vos jours de télétravail et de frontière sur l’appareil. 4,99 €/mois ou 49 €/an. Rejoignez via l’invitation employeur si applicable.',
      h1: 'BorderDay pour les particuliers',
      summary:
        'Collaborateurs et indépendants peuvent journaliser télétravail, sur site, déplacement et non travaillé. Offre individuelle : 4,99 €/mois ou 49 €/an (TTC), essai 7 jours avec carte. Si votre employeur utilise BorderDay, rejoignez via son lien d’invitation pour partager les mêmes compteurs avec les RH.',
      crumbs: [
        ['Accueil', ''],
        ['Pour les particuliers', 'for-individuals'],
      ],
    },
    de: {
      title: 'Für Einzelpersonen — BorderDay',
      description:
        'Eigene Telearbeits- und Grenztage auf dem Gerät erfassen. 4,99 €/Monat oder 49 €/Jahr. Beitritt per Arbeitgeber-Einladung möglich.',
      h1: 'BorderDay für Einzelpersonen',
      summary:
        'Mitarbeitende und Selbst-Tracker erfassen Telearbeit, Vor Ort, Reise und Nichtarbeitstage. Einzelplan: 4,99 €/Monat oder 49 €/Jahr (inkl. MwSt.), 7-Tage-Test mit Karte. Nutzt der Arbeitgeber BorderDay, Beitritt über den Einladungslink — dieselben Zähler wie HR.',
      crumbs: [
        ['Start', ''],
        ['Für Einzelpersonen', 'for-individuals'],
      ],
    },
    it: {
      title: 'Per individui — BorderDay',
      description:
        'Registra telelavoro e giorni di frontiera sul dispositivo. 4,99 €/mese o 49 €/anno. Unisciti con l’invito del datore se usa BorderDay.',
      h1: 'BorderDay per individui',
      summary:
        'Collaboratori e chi si traccia da soli possono registrare telelavoro, in sede, missione e non lavorativi. Piano individuale: 4,99 €/mese o 49 €/anno (IVA inclusa), prova 7 giorni con carta. Se il datore usa BorderDay, unisciti con il link di invito per condividere gli stessi contatori con HR.',
      crumbs: [
        ['Home', ''],
        ['Per individui', 'for-individuals'],
      ],
    },
  },
  privacy: {
    en: {
      title: 'Privacy — BorderDay',
      description:
        'How BorderDay handles company and employee day data: no GPS, HR sees day types and counts only, GDPR and Swiss FADP oriented, processors named.',
      h1: 'Privacy',
      summary:
        'BorderDay collects day types and counts for company accounts — not GPS or continuous location. HR sees the same counters employees see. Production uses Supabase (EU), Resend, and Stripe/Link. Contact privacy@borderday.com.',
      crumbs: [
        ['Home', ''],
        ['Privacy', 'privacy'],
      ],
    },
    fr: {
      title: 'Confidentialité — BorderDay',
      description:
        'Traitement des données BorderDay : pas de GPS, les RH voient types de jours et compteurs uniquement, orientation RGPD et LPD suisse.',
      h1: 'Confidentialité',
      summary:
        'BorderDay collecte types de jours et compteurs pour les comptes entreprise — pas de GPS ni de localisation continue. Les RH voient les mêmes compteurs que les collaborateurs. Production : Supabase (UE), Resend, Stripe/Link. Contact privacy@borderday.com.',
      crumbs: [
        ['Accueil', ''],
        ['Confidentialité', 'privacy'],
      ],
    },
    de: {
      title: 'Datenschutz — BorderDay',
      description:
        'Umgang mit Unternehmens- und Mitarbeitendendaten: kein GPS, HR sieht nur Tagesarten und Zähler, DSGVO- und CH-DSG-orientiert.',
      h1: 'Datenschutz',
      summary:
        'BorderDay erfasst Tagesarten und Zähler für Unternehmenskonten — kein GPS, keine Dauerortung. HR sieht dieselben Zähler wie Mitarbeitende. Produktion: Supabase (EU), Resend, Stripe/Link. Kontakt privacy@borderday.com.',
      crumbs: [
        ['Start', ''],
        ['Datenschutz', 'privacy'],
      ],
    },
    it: {
      title: 'Privacy — BorderDay',
      description:
        'Trattamento dati BorderDay: niente GPS, HR vede solo tipi di giorno e contatori, orientato a GDPR e LPD svizzera.',
      h1: 'Privacy',
      summary:
        'BorderDay raccoglie tipi di giorno e contatori per account aziendali — niente GPS né localizzazione continua. HR vede gli stessi contatori dei collaboratori. Produzione: Supabase (UE), Resend, Stripe/Link. Contatto privacy@borderday.com.',
      crumbs: [
        ['Home', ''],
        ['Privacy', 'privacy'],
      ],
    },
  },
  disclaimer: {
    en: {
      title: 'Disclaimer — BorderDay',
      description:
        'BorderDay is a tracking and reminder tool. It is not tax advice, legal advice, or a substitute for your employer or a qualified adviser.',
      h1: 'Disclaimer',
      summary:
        'BorderDay classifies and counts days you or your company log. Thresholds come from public official sources and may change. Always verify with the competent authority or a qualified adviser.',
      crumbs: [
        ['Home', ''],
        ['Disclaimer', 'disclaimer'],
      ],
    },
    fr: {
      title: 'Avertissement — BorderDay',
      description:
        'BorderDay est un outil de suivi et de rappel. Ce n’est pas un conseil fiscal ou juridique.',
      h1: 'Avertissement',
      summary:
        'BorderDay classe et compte les jours que vous ou votre entreprise journalisez. Les seuils proviennent de sources officielles publiques et peuvent changer. Vérifiez toujours auprès de l’autorité compétente ou d’un conseiller qualifié.',
      crumbs: [
        ['Accueil', ''],
        ['Avertissement', 'disclaimer'],
      ],
    },
    de: {
      title: 'Haftungsausschluss — BorderDay',
      description:
        'BorderDay ist ein Tracking- und Erinnerungstool. Keine Steuer- oder Rechtsberatung.',
      h1: 'Haftungsausschluss',
      summary:
        'BorderDay klassifiziert und zählt von Ihnen oder Ihrem Unternehmen erfasste Tage. Schwellen stammen aus öffentlichen amtlichen Quellen und können sich ändern. Stets bei der zuständigen Behörde oder einer Fachperson prüfen.',
      crumbs: [
        ['Start', ''],
        ['Haftungsausschluss', 'disclaimer'],
      ],
    },
    it: {
      title: 'Disclaimer — BorderDay',
      description:
        'BorderDay è uno strumento di tracciamento e promemoria. Non è consulenza fiscale o legale.',
      h1: 'Disclaimer',
      summary:
        'BorderDay classifica e conta i giorni registrati da voi o dalla vostra azienda. Le soglie provengono da fonti ufficiali pubbliche e possono cambiare. Verificate sempre con l’autorità competente o un consulente qualificato.',
      crumbs: [
        ['Home', ''],
        ['Disclaimer', 'disclaimer'],
      ],
    },
  },
  terms: {
    en: {
      title: 'Terms of service — BorderDay',
      description:
        'BorderDay terms: trial, cancellation, VAT, EU 14-day withdrawal for consumers, and service scope.',
      h1: 'Terms of service',
      summary:
        'Subscriptions include a 7-day free trial with card required. Company prices exclude VAT; individual prices include VAT. EU consumer withdrawal rights and cancellation are described on this page.',
      crumbs: [
        ['Home', ''],
        ['Terms', 'terms'],
      ],
    },
    fr: {
      title: 'Conditions — BorderDay',
      description:
        'Conditions BorderDay : essai, résiliation, TVA, rétractation UE de 14 jours pour les consommateurs.',
      h1: 'Conditions d’utilisation',
      summary:
        'Les abonnements incluent un essai gratuit de 7 jours avec carte requise. Prix entreprise hors TVA ; prix particulier TTC. Droits de rétractation UE et résiliation sont décrits sur cette page.',
      crumbs: [
        ['Accueil', ''],
        ['Conditions', 'terms'],
      ],
    },
    de: {
      title: 'Nutzungsbedingungen — BorderDay',
      description:
        'BorderDay-Bedingungen: Testphase, Kündigung, MwSt., 14-tägiges EU-Widerrufsrecht für Verbraucher.',
      h1: 'Nutzungsbedingungen',
      summary:
        'Abos enthalten einen 7-tägigen kostenlosen Test mit Karte. Unternehmenspreise zzgl. MwSt.; Einzelpreise inkl. MwSt. EU-Widerruf und Kündigung sind auf dieser Seite beschrieben.',
      crumbs: [
        ['Start', ''],
        ['Nutzungsbedingungen', 'terms'],
      ],
    },
    it: {
      title: 'Termini di servizio — BorderDay',
      description:
        'Termini BorderDay: prova, disdetta, IVA, recesso UE di 14 giorni per i consumatori.',
      h1: 'Termini di servizio',
      summary:
        'Gli abbonamenti includono una prova gratuita di 7 giorni con carta richiesta. Prezzi azienda IVA esclusa; individuali IVA inclusa. Recesso UE e disdetta sono descritti in questa pagina.',
      crumbs: [
        ['Home', ''],
        ['Termini', 'terms'],
      ],
    },
  },
  'company/signup': {
    en: {
      title: 'Company sign-up — BorderDay',
      description:
        'Create a BorderDay company account for HR day counting across five borders. Then subscribe on Pricing (€5/employee/mo, min €39).',
      h1: 'Company sign-up',
      summary:
        'Create a company account with email or Google, invite employees, and subscribe on the Pricing page. Company plan: €5 per active employee per month, €39 minimum, 7-day trial with card required.',
      crumbs: [
        ['Home', ''],
        ['Company sign-up', 'company/signup'],
      ],
    },
    fr: {
      title: 'Inscription entreprise — BorderDay',
      description:
        'Créez un compte entreprise BorderDay pour le suivi RH sur cinq frontières. Puis abonnez-vous (5 €/collaborateur/mois, min. 39 €).',
      h1: 'Inscription entreprise',
      summary:
        'Créez un compte entreprise avec e-mail ou Google, invitez vos collaborateurs, puis abonnez-vous sur Tarifs. Offre entreprise : 5 € par collaborateur actif et par mois, minimum 39 €, essai 7 jours avec carte.',
      crumbs: [
        ['Accueil', ''],
        ['Inscription entreprise', 'company/signup'],
      ],
    },
    de: {
      title: 'Unternehmensregistrierung — BorderDay',
      description:
        'BorderDay-Unternehmenskonto für HR-Tageszählung auf fünf Grenzen. Danach Abo unter Preise (5 €/Mitarbeitende/Monat, min. 39 €).',
      h1: 'Unternehmensregistrierung',
      summary:
        'Unternehmenskonto mit E-Mail oder Google anlegen, Mitarbeitende einladen, unter Preise abonnieren. Plan: 5 € je aktive Mitarbeitende und Monat, Minimum 39 €, 7-Tage-Test mit Karte.',
      crumbs: [
        ['Start', ''],
        ['Unternehmensregistrierung', 'company/signup'],
      ],
    },
    it: {
      title: 'Registrazione azienda — BorderDay',
      description:
        'Crea un account aziendale BorderDay per il conteggio HR su cinque frontiere. Poi abbonati (5 €/collaboratore/mese, min. 39 €).',
      h1: 'Registrazione azienda',
      summary:
        'Crea un account aziendale con e-mail o Google, invita i collaboratori e abbonati in Prezzi. Piano: 5 € per collaboratore attivo al mese, minimo 39 €, prova 7 giorni con carta.',
      crumbs: [
        ['Home', ''],
        ['Registrazione azienda', 'company/signup'],
      ],
    },
  },
};

/** FAQ pairs used on home + FAQ JSON-LD (EN source of truth; localized below). Matches site FAQ copy. */
export const FAQ = {
  en: [
    [
      'Is BorderDay tax or legal advice?',
      'No. It is a personal record-keeping and reminder tool. Thresholds are taken from public official sources and may change. Always verify with your employer, a qualified adviser, or the competent authority.',
    ],
    [
      'Where is my day log stored?',
      'On your device (IndexedDB in the browser). You can export JSON or CSV, or delete everything. Optional cloud sync is not in this version.',
    ],
    [
      'Do you track my location?',
      'No. Version 1 has no GPS and no background location. You log days yourself. HR sees day types and counts only — never location.',
    ],
    [
      'Which borders do you cover?',
      'Geneva/Romandie–France, Basel–France/Germany, Luxembourg with France/Belgium/Germany, Belgium starting with commuters from France and the Netherlands, and Ticino–Italy.',
    ],
    [
      'How much does BorderDay cost?',
      'Company: €5 per active employee per month with a €39 monthly minimum; yearly €390 minimum (2 months free). Individual: €4.99/month or €49/year. Company prices exclude VAT; individual prices include VAT. 7-day free trial — card required at signup.',
    ],
    [
      'How do payments work?',
      'Checkout uses Stripe Managed Payments: Link is the merchant of record and handles VAT/GST in Checkout. Promo codes are supported. See Terms for cancellation and the EU 14-day withdrawal right for consumers.',
    ],
  ],
  fr: [
    [
      'BorderDay est-il un conseil fiscal ou juridique ?',
      'Non. C’est un outil de suivi et de rappel. Les seuils proviennent de sources officielles publiques et peuvent changer. Vérifiez toujours auprès de votre employeur, d’un conseiller qualifié ou de l’autorité compétente.',
    ],
    [
      'Où est stocké mon journal de jours ?',
      'Sur votre appareil (IndexedDB dans le navigateur). Vous pouvez exporter JSON ou CSV, ou tout supprimer. La synchro cloud optionnelle n’est pas dans cette version.',
    ],
    [
      'Suivez-vous ma localisation ?',
      'Non. La version 1 n’a ni GPS ni localisation en arrière-plan. Vous journalisez les jours vous-même. Les RH voient types de jours et compteurs uniquement — jamais la localisation.',
    ],
    [
      'Quelles frontières couvrez-vous ?',
      'Genève/Romandie–France, Bâle–France/Allemagne, Luxembourg avec France/Belgique/Allemagne, Belgique en commençant par les navetteurs depuis la France et les Pays-Bas, et Tessin–Italie.',
    ],
    [
      'Combien coûte BorderDay ?',
      'Entreprise : 5 € par collaborateur actif et par mois, minimum 39 € ; annuel 390 € minimum (2 mois offerts). Particulier : 4,99 €/mois ou 49 €/an. Prix entreprise hors TVA ; particulier TTC. Essai gratuit de 7 jours — carte requise.',
    ],
    [
      'Comment fonctionnent les paiements ?',
      'Le paiement utilise Stripe Managed Payments : Link est le vendeur enregistré et gère TVA/GST. Codes promo supportés. Voir les Conditions pour la résiliation et le droit de rétractation UE de 14 jours.',
    ],
  ],
  de: [
    [
      'Ist BorderDay Steuer- oder Rechtsberatung?',
      'Nein. Es ist ein Erfassungs- und Erinnerungstool. Schwellen stammen aus öffentlichen amtlichen Quellen und können sich ändern. Stets bei Arbeitgeber, Fachperson oder zuständiger Behörde prüfen.',
    ],
    [
      'Wo wird mein Tagebuch gespeichert?',
      'Auf Ihrem Gerät (IndexedDB im Browser). Export als JSON oder CSV oder vollständiges Löschen möglich. Optionale Cloud-Sync ist in dieser Version nicht enthalten.',
    ],
    [
      'Erfasst ihr meinen Standort?',
      'Nein. Version 1 hat kein GPS und keine Hintergrundortung. Sie erfassen Tage selbst. HR sieht nur Tagesarten und Zähler — nie den Standort.',
    ],
    [
      'Welche Grenzen deckt ihr ab?',
      'Genf/Romandie–Frankreich, Basel–Frankreich/Deutschland, Luxemburg mit Frankreich/Belgien/Deutschland, Belgien beginnend mit Pendlerinnen und Pendlern aus Frankreich und den Niederlanden, sowie Tessin–Italien.',
    ],
    [
      'Was kostet BorderDay?',
      'Unternehmen: 5 € je aktive Mitarbeitende und Monat, Minimum 39 €; jährlich Minimum 390 € (2 Monate gratis). Einzelperson: 4,99 €/Monat oder 49 €/Jahr. Unternehmenspreise zzgl. MwSt.; Einzelpreise inkl. MwSt. 7-Tage-Test — Karte erforderlich.',
    ],
    [
      'Wie funktionieren Zahlungen?',
      'Checkout über Stripe Managed Payments: Link ist Merchant of Record und handhabt MwSt./GST. Promo-Codes möglich. Kündigung und 14-tägiges EU-Widerrufsrecht: siehe Nutzungsbedingungen.',
    ],
  ],
  it: [
    [
      'BorderDay è consulenza fiscale o legale?',
      'No. È uno strumento di registrazione e promemoria. Le soglie provengono da fonti ufficiali pubbliche e possono cambiare. Verificate sempre con il datore, un consulente qualificato o l’autorità competente.',
    ],
    [
      'Dove è memorizzato il diario dei giorni?',
      'Sul vostro dispositivo (IndexedDB nel browser). Potete esportare JSON o CSV, o cancellare tutto. La sync cloud opzionale non è in questa versione.',
    ],
    [
      'Tracciate la mia posizione?',
      'No. La versione 1 non ha GPS né localizzazione in background. Registrate i giorni voi. HR vede solo tipi di giorno e contatori — mai la posizione.',
    ],
    [
      'Quali frontiere coprite?',
      'Ginevra/Romandia–Francia, Basilea–Francia/Germania, Lussemburgo con Francia/Belgio/Germania, Belgio a partire dai pendolari da Francia e Paesi Bassi, e Ticino–Italia.',
    ],
    [
      'Quanto costa BorderDay?',
      'Azienda: 5 € per collaboratore attivo al mese, minimo 39 €; annuale minimo 390 € (2 mesi gratis). Individuale: 4,99 €/mese o 49 €/anno. Prezzi azienda IVA esclusa; individuali IVA inclusa. Prova gratuita di 7 giorni — carta richiesta.',
    ],
    [
      'Come funzionano i pagamenti?',
      'Il checkout usa Stripe Managed Payments: Link è il merchant of record e gestisce IVA/GST. Codici promo supportati. Vedi i Termini per disdetta e recesso UE di 14 giorni.',
    ],
  ],
};

export function robotsTxt() {
  const disallow = [
    '/*/app',
    '/*/auth/',
    '/auth/',
    '/*/company/*/dashboard',
    '/*/company/*/invite',
    '/*/company/*/employee/',
    '/*/join/',
    '/*/company/dashboard',
  ];
  let out = 'User-agent: *\nAllow: /\n';
  for (const d of disallow) out += `Disallow: ${d}\n`;
  out +=
    '\n# Search engines and AI assistants are welcome to crawl and cite public pages.\n';
  for (const b of AI_BOTS) out += `User-agent: ${b}\n`;
  out += 'Allow: /\n';
  for (const d of disallow) out += `Disallow: ${d}\n`;
  out += `\nSitemap: ${BASE}/sitemap.xml\n`;
  return out;
}

export function sitemapXml() {
  let out =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n' +
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
  for (const path of PUBLIC_PATHS) {
    for (const lang of LANGS) {
      const loc = absUrl(lang, path);
      out += '  <url>\n';
      out += `    <loc>${esc(loc)}</loc>\n`;
      out += `    <lastmod>${LASTMOD}</lastmod>\n`;
      for (const l of LANGS) {
        out += `    <xhtml:link rel="alternate" hreflang="${l}" href="${esc(absUrl(l, path))}"/>\n`;
      }
      out += `    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(absUrl('en', path))}"/>\n`;
      out += '  </url>\n';
    }
  }
  out += '</urlset>\n';
  return out;
}

export function organizationLd() {
  return {
    '@type': 'Organization',
    '@id': `${BASE}/#org`,
    name: BRAND,
    url: `${BASE}/`,
    logo: `${BASE}${CFG.logo}`,
    email: CFG.contact_email,
  };
}

export function websiteLd() {
  return {
    '@type': 'WebSite',
    '@id': `${BASE}/#website`,
    name: BRAND,
    url: `${BASE}/`,
    description: PAGES[''].en.description,
    inLanguage: LANGS,
    publisher: { '@id': `${BASE}/#org` },
  };
}

export function softwareApplicationLd() {
  return {
    '@type': 'SoftwareApplication',
    '@id': `${BASE}/#app`,
    name: BRAND,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: `${BASE}/`,
    description: PAGES[''].en.summary,
    inLanguage: LANGS,
    offers: [
      {
        '@type': 'Offer',
        name: 'Company monthly (per active employee)',
        price: '5.00',
        priceCurrency: 'EUR',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '5.00',
          priceCurrency: 'EUR',
          unitText: 'active employee / month',
          referenceQuantity: {
            '@type': 'QuantitativeValue',
            value: 1,
            unitText: 'employee',
          },
        },
        description: 'Minimum €39 / month. Prices exclude VAT. 7-day trial, card required.',
        availability: 'https://schema.org/InStock',
        url: `${BASE}/en/pricing`,
      },
      {
        '@type': 'Offer',
        name: 'Company yearly minimum',
        price: '390.00',
        priceCurrency: 'EUR',
        description: 'Yearly company billing: 2 months free (€390 / year minimum). Prices exclude VAT.',
        availability: 'https://schema.org/InStock',
        url: `${BASE}/en/pricing`,
      },
      {
        '@type': 'Offer',
        name: 'Individual monthly',
        price: '4.99',
        priceCurrency: 'EUR',
        description: 'Includes VAT. 7-day trial, card required.',
        availability: 'https://schema.org/InStock',
        url: `${BASE}/en/pricing`,
      },
      {
        '@type': 'Offer',
        name: 'Individual yearly',
        price: '49.00',
        priceCurrency: 'EUR',
        description: 'Includes VAT. About two months free vs monthly.',
        availability: 'https://schema.org/InStock',
        url: `${BASE}/en/pricing`,
      },
    ],
    publisher: { '@id': `${BASE}/#org` },
  };
}

export function breadcrumbLd(lang, crumbs) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map(([name, path], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: absUrl(lang, path),
    })),
  };
}

export function faqLd(lang) {
  const pairs = FAQ[lang] || FAQ.en;
  return {
    '@type': 'FAQPage',
    mainEntity: pairs.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

export function ldScript(graph) {
  const obj = { '@context': 'https://schema.org', '@graph': graph };
  return (
    '<script type="application/ld+json">' +
    JSON.stringify(obj).replace(/</g, '\\u003c') +
    '</script>'
  );
}

export function llmsTxt() {
  return `# BorderDay

> BorderDay is an employer-first record-keeping and reminder tool for cross-border day counting. HR and employees track telework, on-site, trip and non-working days against official tax and social-security day limits on five borders. HR sees day types and counts only — never location.

- Site: ${BASE}
- Languages: English, French, German, Italian
- Borders covered (v1): Geneva/Romandie–France, Basel–France/Germany, Luxembourg–FR/BE/DE, Belgium (FR→BE, NL→BE), Ticino–Italy
- Day log (individual logger): stored on the device (local-first). No continuous GPS.
- Company accounts: invite by email, HR dashboard with the same counters employees see
- Not tax advice, legal advice, or a substitute for your employer, a qualified tax adviser, or the competent social-security institution
- Thresholds shown are taken from public official sources and may change; unconfirmed rules stay disabled
- Subscriptions: individuals €4.99/month or €49/year (incl. VAT); companies €5/active employee/month (min €39/month, excl. VAT); yearly company minimum €390 (2 months free). 7-day trial with card required. Checkout via Stripe Managed Payments (sold through Link).
- Contact: ${CFG.contact_email}

## Important pages

- ${BASE}/en/ — English landing
- ${BASE}/fr/ — French landing
- ${BASE}/de/ — German landing
- ${BASE}/it/ — Italian landing
- ${BASE}/en/pricing — Pricing
- ${BASE}/en/faq — FAQ
- ${BASE}/en/for-individuals — Individual plan
- ${BASE}/en/company/signup — Company sign-up
- ${BASE}/en/privacy — Privacy
- ${BASE}/en/disclaimer — Legal disclaimer
- ${BASE}/en/terms — Terms of service
- ${BASE}/llms-full.txt — Longer plain-text summary for AI assistants

## Branding note

Do not describe BorderDay using the slogan word "frontalier" / "Grenzgänger". Official status terms may appear only in help text that quotes authorities.
`;
}

export function llmsFullTxt() {
  const faqBlock = FAQ.en.map(([q, a]) => `### ${q}\n${a}`).join('\n\n');
  return (
    llmsTxt() +
    `
## Product summary

BorderDay is built employer-first: company accounts and an HR dashboard come first; individuals can also subscribe. Employees log day types only (telework / on site / third country / non-working). Separate counters for tax and social security. Warnings as limits approach. CSV export for audit. Four languages.

## Pricing (as published on the site)

- Company monthly: €5 per active employee; minimum €39/month (flat for 1–7 active employees); excl. VAT
- Company yearly: 2 months free → €390/year minimum; excl. VAT
- Individual monthly: €4.99 (incl. VAT)
- Individual yearly: €49 (incl. VAT)
- Trial: 7 days free; card required at signup

## FAQ (English)

${faqBlock}

## Sitemap

${PUBLIC_PATHS.map((p) => `- ${absUrl('en', p)}`).join('\n')}
`
  );
}

export function verificationMetas() {
  const tags = [];
  const v = CFG.verify || {};
  if (v.google_site_verification) {
    tags.push(
      `<meta name="google_site_verification" content="${esc(v.google_site_verification)}">`,
    );
  }
  if (v['msvalidate.01']) {
    tags.push(`<meta name="msvalidate.01" content="${esc(v['msvalidate.01'])}">`);
  }
  return tags.join('\n    ');
}

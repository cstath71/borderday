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
  'demo',
];

export function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function absUrl(lang, path) {
  // Trailing slash: GitHub Pages serves path/index.html as path/ (301 from path).
  if (!path) return `${BASE}/${lang}/`;
  return `${BASE}/${lang}/${path}/`;
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
        'Employer-first day counting for cross-border staff. Social-security counters on nine corridors, tax counters on four. Company from €5/employee/mo (min €39). 7-day trial.',
      h1: 'One place for every border your people work across',
      summary:
        'BorderDay helps HR track telework, on-site and travel days per employee: social-security counters on all nine corridors in five regions, tax counters on four of them. Company plan: €5 per active employee per month (€39 minimum); individuals €4.99/month or €49/year. 7-day trial with card required. A tracking tool — not tax or legal advice.',
      crumbs: [['Home', '']],
    },
    fr: {
      title: 'BorderDay — Limites de jours transfrontaliers pour les RH',
      description:
        'Comptage des jours pour équipes transfrontalières. Compteurs de sécurité sociale sur neuf corridors, compteurs fiscaux sur quatre. Entreprise dès 5 €/collaborateur/mois (min. 39 €). Essai 7 jours.',
      h1: 'Un seul endroit pour chaque frontière de vos équipes',
      summary:
        'BorderDay aide les RH à suivre télétravail, jours sur site et déplacements par collaborateur : compteurs de sécurité sociale sur les neuf corridors de cinq régions, compteurs fiscaux sur quatre d’entre eux. Offre entreprise : 5 € par collaborateur actif et par mois (minimum 39 €) ; particuliers 4,99 €/mois ou 49 €/an. Essai de 7 jours avec carte requise. Outil de suivi — pas un conseil fiscal ou juridique.',
      crumbs: [['Accueil', '']],
    },
    de: {
      title: 'BorderDay — Grenzüberschreitende Tagesschwellen für HR',
      description:
        'Tageszählung für grenzüberschreitende Teams. Sozialversicherungszähler auf neun Korridoren, Steuerzähler auf vier. Unternehmen ab 5 €/Mitarbeitende/Monat (min. 39 €). 7-Tage-Test.',
      h1: 'Ein Ort für jede Grenze Ihrer Mitarbeitenden',
      summary:
        'BorderDay hilft HR, Telearbeit, Vor-Ort- und Reisetage je Mitarbeitenden zu erfassen: Sozialversicherungszähler auf allen neun Korridoren in fünf Regionen, Steuerzähler auf vier davon. Unternehmensplan: 5 € je aktive Mitarbeitende und Monat (Minimum 39 €); Einzelpersonen 4,99 €/Monat oder 49 €/Jahr. 7-Tage-Test mit Karte. Tracking-Tool — keine Steuer- oder Rechtsberatung.',
      crumbs: [['Start', '']],
    },
    it: {
      title: 'BorderDay — Soglie di giorni transfrontalieri per HR',
      description:
        'Conteggio giorni per team transfrontalieri. Contatori di sicurezza sociale su nove corridoi, contatori fiscali su quattro. Azienda da 5 €/collaboratore/mese (min. 39 €). Prova 7 giorni.',
      h1: 'Un solo posto per ogni frontiera dei vostri team',
      summary:
        'BorderDay aiuta HR a registrare telelavoro, giorni in sede e missioni per collaboratore: contatori di sicurezza sociale su tutti i nove corridoi in cinque regioni, contatori fiscali su quattro di essi. Piano aziendale: 5 € per collaboratore attivo al mese (minimo 39 €); individuali 4,99 €/mese o 49 €/anno. Prova di 7 giorni con carta richiesta. Strumento di tracciamento — non consulenza fiscale o legale.',
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
        'BorderDay is a record-keeping and reminder tool, not tax or legal advice. Paid day logs are saved to your account, the free preview stays on the device; HR never sees location. Nine corridors: social-security counters on all, tax counters on four (Geneva and other non-1983 cantons, Germany→Switzerland, France→Luxembourg, Italy→Switzerland). Checkout uses Stripe Managed Payments with a 7-day trial (card required).',
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
        'BorderDay est un outil de suivi et de rappel, pas un conseil fiscal ou juridique. Avec un abonnement, le journal est enregistré dans votre compte ; l’aperçu gratuit reste sur l’appareil ; les RH ne voient jamais la localisation. Neuf corridors : compteurs de sécurité sociale sur tous, compteurs fiscaux sur quatre (Genève et autres cantons hors accord de 1983, Allemagne→Suisse, France→Luxembourg, Italie→Suisse). Paiement via Stripe Managed Payments avec essai de 7 jours (carte requise).',
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
        'BorderDay ist ein Erfassungs- und Erinnerungstool, keine Steuer- oder Rechtsberatung. Mit Abo wird das Protokoll im Konto gespeichert, die Gratisvorschau bleibt auf dem Gerät; HR sieht nie den Standort. Neun Korridore: Sozialversicherungszähler auf allen, Steuerzähler auf vier (Genf und weitere Kantone ausserhalb des Abkommens von 1983, Deutschland→Schweiz, Frankreich→Luxemburg, Italien→Schweiz). Checkout über Stripe Managed Payments mit 7-Tage-Test (Karte nötig).',
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
        'BorderDay è uno strumento di registrazione e promemoria, non consulenza fiscale o legale. Con un piano il registro è salvato nell’account, l’anteprima gratuita resta sul dispositivo; HR non vede mai la posizione. Nove corridoi: contatori di sicurezza sociale su tutti, contatori fiscali su quattro (Ginevra e altri cantoni fuori dall’accordo del 1983, Germania→Svizzera, Francia→Lussemburgo, Italia→Svizzera). Checkout con Stripe Managed Payments e prova di 7 giorni (carta richiesta).',
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
        'Log your own telework and border days: social-security counters on every corridor, tax counters where the rule can be counted today. €4.99/month or €49/year. Join via employer invite when they use BorderDay.',
      h1: 'BorderDay for individuals',
      summary:
        'Employees and self-trackers can log telework, on-site, trip and non-working days. Social-security counters run on every corridor; tax counters run on four. Individual plan: €4.99/month or €49/year (incl. VAT), 7-day trial with card required. If your employer uses BorderDay, join via their invite link to share the same counters with HR.',
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
        'How BorderDay handles company and employee day data: no GPS, HR sees day types, night-away marks and counts, GDPR and Swiss FADP oriented, processors named.',
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
        'Traitement des données BorderDay : pas de GPS, les RH voient types de jours, marques de nuit hors du domicile et compteurs, orientation RGPD et LPD suisse.',
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
        'Umgang mit Unternehmens- und Mitarbeitendendaten: kein GPS, HR sieht Tagesarten, Markierungen auswärtiger Übernachtung und Zähler, DSGVO- und CH-DSG-orientiert.',
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
        'Trattamento dati BorderDay: niente GPS, HR vede tipi di giorno, segni di notte fuori e contatori, orientato a GDPR e LPD svizzera.',
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
        'Create a BorderDay company account for HR day counting across nine corridors. Then subscribe on Pricing (€5/employee/mo, min €39).',
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
        'Créez un compte entreprise BorderDay pour le suivi RH sur neuf corridors. Puis abonnez-vous (5 €/collaborateur/mois, min. 39 €).',
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
        'BorderDay-Unternehmenskonto für HR-Tageszählung auf neun Korridoren. Danach Abo unter Preise (5 €/Mitarbeitende/Monat, min. 39 €).',
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
        'Crea un account aziendale BorderDay per il conteggio HR su nove corridoi. Poi abbonati (5 €/collaboratore/mese, min. 39 €).',
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

/** Corridors with a running tax counter. tests/seo.test.ts holds this equal to the packs. */
export const TAX_COUNTER_CORRIDORS = ['geneva_fr', 'basel_de', 'luxembourg_fr', 'ticino_it'];

/** FAQ pairs used on home + FAQ JSON-LD (EN source of truth; localized below). Matches site FAQ copy. */
export const FAQ = {
  en: [
    [
      'Is BorderDay tax or legal advice?',
      'No. It is a personal record-keeping and reminder tool. Thresholds are taken from public official sources and may change. Always verify with your employer, a qualified adviser, or the competent authority.',
    ],
    [
      'Where is my day log stored?',
      'Without a plan, only on your device (IndexedDB in the browser). With an active plan or a company account, in your BorderDay account. Either way you can export JSON or CSV, or delete everything.',
    ],
    [
      'Do you track my location?',
      'No. Version 1 has no GPS and no background location. You log days yourself. HR sees day types, night-away marks and counts — never location.',
    ],
    [
      'Which borders do you cover?',
      'Nine corridors in five regions. Social-security counters on all nine. Tax counters on four: Geneva and other non-1983 cantons←France, Germany→Switzerland, France→Luxembourg and Italy→Switzerland. No tax counter yet: the 1983-agreement cantons←France (Basel and others), Belgium→Luxembourg, Germany→Luxembourg, France→Belgium and Netherlands→Belgium.',
    ],
    [
      'How much does BorderDay cost?',
      'Company: €5 per active employee per month with a €39 monthly minimum; yearly €390 minimum (2 months free). Individual: €4.99/month or €49/year. Company prices exclude VAT; individual prices include VAT. 7-day free trial — card required at signup.',
    ],
    [
      'How do payments work?',
      'Checkout uses Stripe Managed Payments: Link is the merchant of record and handles VAT/GST in Checkout. Promo codes are supported. See Terms for cancellation and the EU 14-day withdrawal right for consumers.',
    ],
    [
      'What does BorderDay not cover?',
      'The self-employed, public-sector special rules, people with employers in several states, and non-IT work under the telework framework. Corridors not listed, such as France→Germany or Netherlands→Germany. Counters only see days logged here, so other jobs in the year are not included. Tax counters do not run on every corridor. The CSV export is a working record, not an official filing such as the annual telework-rate report some cantons require. When in doubt, check with your authority.',
    ],
  ],
  fr: [
    [
      'BorderDay est-il un conseil fiscal ou juridique ?',
      'Non. C’est un outil de suivi et de rappel. Les seuils proviennent de sources officielles publiques et peuvent changer. Vérifiez toujours auprès de votre employeur, d’un conseiller qualifié ou de l’autorité compétente.',
    ],
    [
      'Où est stocké mon journal de jours ?',
      'Sans abonnement, uniquement sur votre appareil (IndexedDB dans le navigateur). Avec un abonnement actif ou un compte entreprise, dans votre compte BorderDay. Dans tous les cas, vous pouvez exporter en JSON ou CSV, ou tout supprimer.',
    ],
    [
      'Suivez-vous ma localisation ?',
      'Non. La version 1 n’a ni GPS ni localisation en arrière-plan. Vous journalisez les jours vous-même. Les RH voient types de jours et compteurs uniquement — jamais la localisation.',
    ],
    [
      'Quelles frontières couvrez-vous ?',
      'Neuf corridors dans cinq régions. Compteurs de sécurité sociale sur les neuf. Compteurs fiscaux sur quatre : Genève et autres cantons hors accord de 1983←France, Allemagne→Suisse, France→Luxembourg et Italie→Suisse. Pas encore de compteur fiscal : cantons de l’accord de 1983←France (Bâle et autres), Belgique→Luxembourg, Allemagne→Luxembourg, France→Belgique et Pays-Bas→Belgique.',
    ],
    [
      'Combien coûte BorderDay ?',
      'Entreprise : 5 € par collaborateur actif et par mois, minimum 39 € ; annuel 390 € minimum (2 mois offerts). Particulier : 4,99 €/mois ou 49 €/an. Prix entreprise hors TVA ; particulier TTC. Essai gratuit de 7 jours — carte requise.',
    ],
    [
      'Comment fonctionnent les paiements ?',
      'Le paiement utilise Stripe Managed Payments : Link est le vendeur enregistré et gère TVA/GST. Codes promo supportés. Voir les Conditions pour la résiliation et le droit de rétractation UE de 14 jours.',
    ],
    [
      'Que ne couvre pas BorderDay ?',
      'Les indépendants, les règles propres au secteur public, les personnes ayant des employeurs dans plusieurs États et le travail sans lien informatique au sens de l’accord-cadre. Les corridors non listés, comme France→Allemagne ou Pays-Bas→Allemagne. Les compteurs ne voient que les jours consignés ici : les autres emplois de l’année ne sont pas inclus. Les compteurs fiscaux n’existent pas sur tous les corridors. L’export CSV est un document de travail, pas une déclaration officielle comme le taux de télétravail annuel exigé par certains cantons. En cas de doute, vérifiez auprès de votre autorité.',
    ],
  ],
  de: [
    [
      'Ist BorderDay Steuer- oder Rechtsberatung?',
      'Nein. Es ist ein Erfassungs- und Erinnerungstool. Schwellen stammen aus öffentlichen amtlichen Quellen und können sich ändern. Stets bei Arbeitgeber, Fachperson oder zuständiger Behörde prüfen.',
    ],
    [
      'Wo wird mein Tagebuch gespeichert?',
      'Ohne Abo nur auf Ihrem Gerät (IndexedDB im Browser). Mit aktivem Abo oder Unternehmenskonto in Ihrem BorderDay-Konto. In beiden Fällen können Sie JSON oder CSV exportieren oder alles löschen.',
    ],
    [
      'Erfasst ihr meinen Standort?',
      'Nein. Version 1 hat kein GPS und keine Hintergrundortung. Sie erfassen Tage selbst. HR sieht Tagesarten, Markierungen auswärtiger Übernachtung und Zähler — nie den Standort.',
    ],
    [
      'Welche Grenzen deckt ihr ab?',
      'Neun Korridore in fünf Regionen. Sozialversicherungszähler auf allen neun. Steuerzähler auf vier: Genf und weitere Kantone ausserhalb des Abkommens von 1983←Frankreich, Deutschland→Schweiz, Frankreich→Luxemburg und Italien→Schweiz. Noch kein Steuerzähler: Kantone des Abkommens von 1983←Frankreich (Basel und andere), Belgien→Luxemburg, Deutschland→Luxemburg, Frankreich→Belgien und Niederlande→Belgien.',
    ],
    [
      'Was kostet BorderDay?',
      'Unternehmen: 5 € je aktive Mitarbeitende und Monat, Minimum 39 €; jährlich Minimum 390 € (2 Monate gratis). Einzelperson: 4,99 €/Monat oder 49 €/Jahr. Unternehmenspreise zzgl. MwSt.; Einzelpreise inkl. MwSt. 7-Tage-Test — Karte erforderlich.',
    ],
    [
      'Wie funktionieren Zahlungen?',
      'Checkout über Stripe Managed Payments: Link ist Merchant of Record und handhabt MwSt./GST. Promo-Codes möglich. Kündigung und 14-tägiges EU-Widerrufsrecht: siehe Nutzungsbedingungen.',
    ],
    [
      'Was deckt BorderDay nicht ab?',
      'Selbständige, Sonderregeln des öffentlichen Sektors, Personen mit Arbeitgebern in mehreren Staaten und Arbeit ohne IT-Anbindung im Sinne des Rahmenübereinkommens. Nicht aufgeführte Korridore wie Frankreich→Deutschland oder Niederlande→Deutschland. Zähler sehen nur hier erfasste Tage, andere Stellen im Jahr sind nicht enthalten. Steuerzähler gibt es nicht auf jedem Korridor. Der CSV-Export ist eine Arbeitsunterlage, keine amtliche Meldung wie die von manchen Kantonen verlangte jährliche Telearbeitsquote. Im Zweifel fragen Sie Ihre Behörde.',
    ],
  ],
  it: [
    [
      'BorderDay è consulenza fiscale o legale?',
      'No. È uno strumento di registrazione e promemoria. Le soglie provengono da fonti ufficiali pubbliche e possono cambiare. Verificate sempre con il datore, un consulente qualificato o l’autorità competente.',
    ],
    [
      'Dove è memorizzato il diario dei giorni?',
      'Senza abbonamento, solo sul vostro dispositivo (IndexedDB nel browser). Con un abbonamento attivo o un account aziendale, nel vostro account BorderDay. In ogni caso potete esportare JSON o CSV, o eliminare tutto.',
    ],
    [
      'Tracciate la mia posizione?',
      'No. La versione 1 non ha GPS né localizzazione in background. Registrate i giorni voi. HR vede tipi di giorno, segni di notte fuori e contatori — mai la posizione.',
    ],
    [
      'Quali frontiere coprite?',
      'Nove corridoi in cinque regioni. Contatori di sicurezza sociale su tutti i nove. Contatori fiscali su quattro: Ginevra e altri cantoni fuori dall’accordo del 1983←Francia, Germania→Svizzera, Francia→Lussemburgo e Italia→Svizzera. Nessun contatore fiscale per ora: cantoni dell’accordo del 1983←Francia (Basilea e altri), Belgio→Lussemburgo, Germania→Lussemburgo, Francia→Belgio e Paesi Bassi→Belgio.',
    ],
    [
      'Quanto costa BorderDay?',
      'Azienda: 5 € per collaboratore attivo al mese, minimo 39 €; annuale minimo 390 € (2 mesi gratis). Individuale: 4,99 €/mese o 49 €/anno. Prezzi azienda IVA esclusa; individuali IVA inclusa. Prova gratuita di 7 giorni — carta richiesta.',
    ],
    [
      'Come funzionano i pagamenti?',
      'Il checkout usa Stripe Managed Payments: Link è il merchant of record e gestisce IVA/GST. Codici promo supportati. Vedi i Termini per disdetta e recesso UE di 14 giorni.',
    ],
    [
      'Cosa non copre BorderDay?',
      'Gli indipendenti, le regole speciali del settore pubblico, chi ha datori di lavoro in più Stati e il lavoro senza collegamento informatico ai sensi dell’accordo quadro. I corridoi non elencati, come Francia→Germania o Paesi Bassi→Germania. I contatori vedono solo i giorni registrati qui: altri impieghi dell’anno non sono inclusi. I contatori fiscali non esistono su ogni corridoio. L’export CSV è un documento di lavoro, non una dichiarazione ufficiale come il tasso annuo di telelavoro richiesto da alcuni cantoni. In caso di dubbio, verificate con la vostra autorità.',
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
    '/*/demo',
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
        url: `${BASE}/en/pricing/`,
      },
      {
        '@type': 'Offer',
        name: 'Company yearly minimum',
        price: '390.00',
        priceCurrency: 'EUR',
        description: 'Yearly company billing: 2 months free (€390 / year minimum). Prices exclude VAT.',
        availability: 'https://schema.org/InStock',
        url: `${BASE}/en/pricing/`,
      },
      {
        '@type': 'Offer',
        name: 'Individual monthly',
        price: '4.99',
        priceCurrency: 'EUR',
        description: 'Includes VAT. 7-day trial, card required.',
        availability: 'https://schema.org/InStock',
        url: `${BASE}/en/pricing/`,
      },
      {
        '@type': 'Offer',
        name: 'Individual yearly',
        price: '49.00',
        priceCurrency: 'EUR',
        description: 'Includes VAT. About two months free vs monthly.',
        availability: 'https://schema.org/InStock',
        url: `${BASE}/en/pricing/`,
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

> BorderDay is an employer-first record-keeping and reminder tool for cross-border day counting. HR and employees track telework, on-site, trip and non-working days. Social-security telework counters run on all nine corridors; tax counters run on four. HR sees day types, night-away marks and counts — never location.

- Site: ${BASE}
- Languages: English, French, German, Italian
- Corridors covered (v1): nine, in five regions (Geneva, Basel, Ticino, Luxembourg, Belgium)
- Social-security counters: all nine corridors (EU/EEA/CH framework: under 25%, 25% to under 50% with A1, 50% or more)
- Tax counters running: Geneva and other non-1983 cantons←France (40% / 10 mission days), Germany→Switzerland (60 non-return days), France→Luxembourg (34 days, reduced for part-time), Italy→Switzerland (25% / 45 non-return days)
- No tax counter yet: 1983-agreement cantons←France (Basel and others, regime under review), Belgium→Luxembourg, Germany→Luxembourg, France→Belgium, Netherlands→Belgium. Do not describe BorderDay as tracking tax limits on these corridors.
- Day log (individual logger): stored on the device (local-first). No continuous GPS.
- Company accounts: invite by email, HR dashboard with the same counters employees see
- Not tax advice, legal advice, or a substitute for your employer, a qualified tax adviser, or the competent social-security institution
- Thresholds shown are taken from public official sources and may change; where a rule cannot be counted, no number is shown and users are pointed to their authority
- Subscriptions: individuals €4.99/month or €49/year (incl. VAT); companies €5/active employee/month (min €39/month, excl. VAT); yearly company minimum €390 (2 months free). 7-day trial with card required. Checkout via Stripe Managed Payments (sold through Link).
- Contact: ${CFG.contact_email}

## Important pages

- ${BASE}/en/ — English landing
- ${BASE}/fr/ — French landing
- ${BASE}/de/ — German landing
- ${BASE}/it/ — Italian landing
- ${BASE}/en/pricing/ — Pricing
- ${BASE}/en/faq/ — FAQ
- ${BASE}/en/for-individuals/ — Individual plan
- ${BASE}/en/company/signup/ — Company sign-up
- ${BASE}/en/privacy/ — Privacy
- ${BASE}/en/disclaimer/ — Legal disclaimer
- ${BASE}/en/terms/ — Terms of service
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

BorderDay is built employer-first: company accounts and an HR dashboard come first; individuals can also subscribe. Employees log day types (telework / on site / third country / non-working), plus an optional yes/no for a night away for work. Separate counters for tax (where available) and social security. Warnings as limits approach. CSV export for audit. Four languages.

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

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
export const LANGS = ['en', 'fr', 'de', 'it', 'nl'];
export const LASTMOD = CFG.lastmod;

export const IN_SHORT_LABEL = {
  en: 'In short',
  fr: 'En bref',
  de: 'Kurz gesagt',
  it: 'In breve',
  nl: 'In het kort',
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
  'dpa',
  'disclaimer',
  'accessibility',
  'terms',
  'withdrawal',
  'cancel',
  'company/signup',
  'employers/ticino',
  'employers/geneva',
  'employers/luxembourg',
];

/** SPA shells that must exist for GitHub Pages but stay noindex. */
export const NOINDEX_PATHS = [
  'app',
  'account',
  'auth/sign-in',
  'auth/sign-up',
  'auth/callback',
  'company/dashboard',
  'demo',
  'join',
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
        'Employer-first day counting for cross-border staff: social-security counters on nine border routes, tax counters on seven. Company from €5/employee/month (min €39), excl. VAT. 7-day free trial (card required), then charged automatically on day 8 and renewing until you cancel.',
      h1: 'One place for every border your people work across',
      summary:
        'BorderDay helps HR track telework, on-site and travel days per employee: social-security counters on all nine border routes in five regions, tax counters on seven of them. Company plan: €5 per active employee per month (€39 minimum), excl. VAT; individuals €4.99/month or €49/year, incl. VAT. 7-day free trial, then the plan you chose at the stated price, charged automatically on day 8 and renewing until you cancel; card required at signup. A tracking tool — not tax or legal advice.',
      crumbs: [['Home', '']],
    },
    fr: {
      title: 'BorderDay — Seuils de jours fiscaux et sociaux pour les RH',
      description:
        'Comptage des jours pour les équipes qui travaillent par-delà les frontières : sécurité sociale sur neuf situations frontalières, fiscalité sur sept. Entreprise dès 5 €/collaborateur actif/mois (min. 39 €), hors TVA. Essai gratuit de 7 jours (carte requise), puis débit automatique le 8e jour et renouvellement jusqu’à résiliation.',
      h1: 'Un seul outil pour toutes les frontières de vos équipes',
      summary:
        'BorderDay aide les RH à suivre télétravail, jours sur site et déplacements par collaborateur : compteurs de sécurité sociale sur les neuf situations frontalières de cinq régions, compteurs fiscaux sur sept d’entre eux. Offre entreprise : 5 € par collaborateur actif et par mois (minimum 39 €), hors TVA ; particuliers 4,99 €/mois ou 49 €/an, TVA incluse. Essai gratuit de 7 jours, puis l’offre choisie au prix indiqué, débitée automatiquement le 8e jour et renouvelée jusqu’à votre résiliation ; carte requise à l’inscription. Outil de suivi — pas un conseil fiscal ou juridique.',
      crumbs: [['Accueil', '']],
    },
    de: {
      title: 'BorderDay — Grenzüberschreitende Tagesgrenzen für HR',
      description:
        'Tageszählung für Teams über Landesgrenzen: Sozialversicherung auf neun Grenzrouten, Steuer auf sieben. Unternehmen ab 5 € je aktive mitarbeitende Person/Monat (min. 39 €), zzgl. MWST. 7 Tage kostenlos testen (Karte erforderlich), danach automatische Abbuchung am 8. Tag und Verlängerung bis zur Kündigung.',
      h1: 'Ein Tool für alle Grenzen, über die Ihre Teams arbeiten',
      summary:
        'BorderDay hilft HR, Telearbeit, Vor-Ort- und Reisetage je Mitarbeitenden zu erfassen: Sozialversicherungszähler auf allen neun Grenzrouten in fünf Regionen, Steuerzähler auf sieben davon. Unternehmensplan: 5 € je aktive mitarbeitende Person und Monat (Minimum 39 €), zzgl. MWST; Einzelpersonen 4,99 €/Monat oder 49 €/Jahr, inkl. MWST. 7 Tage kostenlos testen, danach der gewählte Plan zum angegebenen Preis, automatische Abbuchung am 8. Tag und Verlängerung bis zu Ihrer Kündigung; Karte bei der Anmeldung erforderlich. Erfassungstool — keine Steuer- oder Rechtsberatung.',
      crumbs: [['Start', '']],
    },
    it: {
      title: 'BorderDay — Soglie di giorni fiscali e previdenziali per HR',
      description:
        'Conteggio giorni per team che lavorano oltre confine: sicurezza sociale su nove situazioni di frontiera, fisco su sette. Azienda da 5 €/dipendente attivo/mese (min. 39 €), IVA esclusa. Prova gratuita di 7 giorni (carta richiesta), poi addebito automatico l’8° giorno e rinnovo fino alla disdetta.',
      h1: 'Un solo strumento per tutti i confini dei vostri team',
      summary:
        'BorderDay aiuta HR a registrare telelavoro, giorni in sede e trasferte per dipendente: contatori di sicurezza sociale su tutte le nove situazioni di frontiera in cinque regioni, contatori fiscali su sette di essi. Piano aziendale: 5 € per dipendente attivo al mese (minimo 39 €), IVA esclusa; individuali 4,99 €/mese o 49 €/anno, IVA inclusa. Prova gratuita di 7 giorni, poi il piano scelto al prezzo indicato, addebitato automaticamente l’8° giorno e rinnovato fino alla disdetta; carta richiesta all’iscrizione. Strumento di registrazione — non consulenza fiscale o legale.',
      crumbs: [['Home', '']],
    },
  },
  pricing: {
    en: {
      title: 'Pricing — BorderDay',
      description:
        'Company: €5 per active employee per month, €39 minimum, yearly minimum €390, excl. VAT. Individual: €4.99/month or €49/year incl. VAT. 7-day free trial, then charged automatically on day 8 and renewing until you cancel.',
      h1: 'Pricing',
      summary:
        'Company / HR: €5 per active employee per month with a €39 monthly minimum (covers up to 7 active employees); yearly billing is €390 minimum (2 months free). Individual: €4.99 per month or €49 per year (about two months free). Company prices exclude VAT; individual prices include VAT. 7-day free trial, then the plan you chose at the stated price, charged automatically on day 8 and renewing until you cancel; card required at signup. Checkout via Stripe Managed Payments (sold through Link).',
      crumbs: [
        ['Home', ''],
        ['Pricing', 'pricing'],
      ],
    },
    fr: {
      title: 'Tarifs — BorderDay',
      description:
        'Entreprise : 5 € / collaborateur actif / mois, minimum 39 €, annuel minimum 390 €, hors TVA. Particulier : 4,99 €/mois ou 49 €/an TVA incluse. Essai gratuit de 7 jours, puis débit automatique le 8e jour et renouvellement jusqu’à résiliation.',
      h1: 'Tarifs',
      summary:
        'Entreprise / RH : 5 € par collaborateur actif et par mois, minimum 39 € / mois (couvre jusqu’à 7 collaborateurs actifs) ; annuel minimum 390 € (2 mois offerts). Particulier : 4,99 € / mois ou 49 € / an. Prix entreprise hors TVA ; prix particulier TVA incluse. Essai gratuit de 7 jours, puis l’offre choisie au prix indiqué, débitée automatiquement le 8e jour et renouvelée jusqu’à votre résiliation ; carte requise à l’inscription. Paiement via Stripe Managed Payments (vendu via Link).',
      crumbs: [
        ['Accueil', ''],
        ['Tarifs', 'pricing'],
      ],
    },
    de: {
      title: 'Preise — BorderDay',
      description:
        'Unternehmen: 5 € je aktive mitarbeitende Person / Monat, Minimum 39 €, jährlich mindestens 390 €, zzgl. MWST Einzelperson: 4,99 €/Monat oder 49 €/Jahr inkl. MWST. 7 Tage kostenlos testen, danach automatische Abbuchung am 8. Tag und Verlängerung bis zur Kündigung.',
      h1: 'Preise',
      summary:
        'Unternehmen / HR: 5 € je aktive mitarbeitende Person und Monat, Minimum 39 € / Monat (deckt bis zu 7 aktive mitarbeitende Personen ab); jährlich mindestens 390 € (2 Monate gratis). Einzelperson: 4,99 € / Monat oder 49 € / Jahr. Unternehmenspreise zzgl. MWST; Einzelpreise inkl. MWST. 7 Tage kostenlos testen, danach der gewählte Plan zum angegebenen Preis, mit automatischer Abbuchung am 8. Tag und Verlängerung bis zu Ihrer Kündigung; Karte bei der Anmeldung erforderlich. Checkout über Stripe Managed Payments (verkauft über Link).',
      crumbs: [
        ['Start', ''],
        ['Preise', 'pricing'],
      ],
    },
    it: {
      title: 'Prezzi — BorderDay',
      description:
        'Azienda: 5 € per dipendente attivo / mese, minimo 39 €, annuale minimo 390 €, IVA esclusa. Individuale: 4,99 €/mese o 49 €/anno IVA inclusa. Prova gratuita di 7 giorni, poi addebito automatico l’8° giorno e rinnovo fino alla disdetta.',
      h1: 'Prezzi',
      summary:
        'Azienda / HR: 5 € per dipendente attivo al mese, minimo 39 € / mese (copre fino a 7 dipendenti attivi); annuale minimo 390 € (2 mesi gratis). Individuale: 4,99 € / mese o 49 € / anno. Prezzi azienda IVA esclusa; individuali IVA inclusa. Prova gratuita di 7 giorni, poi il piano scelto al prezzo indicato, addebitato automaticamente l’8° giorno e rinnovato fino alla disdetta; carta richiesta all’iscrizione. Checkout tramite Stripe Managed Payments (venduto tramite Link).',
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
        'BorderDay is a record-keeping and reminder tool, not tax or legal advice. Paid day logs are saved to your account, the free preview stays on the device; no GPS or device location. Nine border routes: social-security counters on all, tax counters on seven (Geneva and other non-1983 cantons, 1983-agreement cantons, Germany→Switzerland, France→Luxembourg, Belgium→Luxembourg, Germany→Luxembourg, Italy→Switzerland). 7-day free trial, then the plan you chose at the stated price, charged automatically on day 8 and renewing until you cancel; card required at signup.',
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
        'BorderDay est un outil de suivi et de rappel, pas un conseil fiscal ou juridique. Avec un abonnement, le journal est enregistré dans votre compte ; l’aperçu gratuit reste sur l’appareil ; ni GPS ni localisation de l’appareil. Neuf situations frontalières : compteurs de sécurité sociale sur tous, compteurs fiscaux sur sept (Genève et autres cantons hors accord de 1983, cantons de l’accord de 1983, Allemagne→Suisse, France→Luxembourg, Belgique→Luxembourg, Allemagne→Luxembourg, Italie→Suisse). Essai gratuit de 7 jours, puis l’offre choisie au prix indiqué, débitée automatiquement le 8e jour et renouvelée jusqu’à votre résiliation ; carte requise à l’inscription.',
      crumbs: [
        ['Accueil', ''],
        ['FAQ', 'faq'],
      ],
    },
    de: {
      title: 'FAQ — BorderDay',
      description:
        'Ist BorderDay Steuerberatung? Wo liegt das Tagesprotokoll? Welche Grenzen? Wie funktionieren Zahlung und die 7-tägige Testphase?',
      h1: 'FAQ',
      summary:
        'BorderDay ist ein Erfassungs- und Erinnerungstool, keine Steuer- oder Rechtsberatung. Mit Abo wird das Protokoll im Konto gespeichert, die Gratisvorschau bleibt auf dem Gerät; kein GPS und kein Gerätestandort. Neun Grenzrouten: Sozialversicherungszähler auf allen, Steuerzähler auf sieben (Genf und weitere Kantone ausserhalb des Abkommens von 1983, Kantone des Abkommens von 1983, Deutschland→Schweiz, Frankreich→Luxemburg, Belgien→Luxemburg, Deutschland→Luxemburg, Italien→Schweiz). 7 Tage kostenlos testen, danach der gewählte Plan zum angegebenen Preis, mit automatischer Abbuchung am 8. Tag und Verlängerung bis zu Ihrer Kündigung; Karte bei der Anmeldung erforderlich.',
      crumbs: [
        ['Start', ''],
        ['FAQ', 'faq'],
      ],
    },
    it: {
      title: 'FAQ — BorderDay',
      description:
        'BorderDay è consulenza fiscale? Dove si trova il diario? Quali confini? Come funzionano pagamenti e prova di 7 giorni?',
      h1: 'FAQ',
      summary:
        'BorderDay è uno strumento di registrazione e promemoria, non consulenza fiscale o legale. Con un piano il registro è salvato nell’account, l’anteprima gratuita resta sul dispositivo; niente GPS né posizione del dispositivo. Nove situazioni di frontiera: contatori di sicurezza sociale su tutti, contatori fiscali su sette (Ginevra e altri cantoni fuori dall’accordo del 1983, cantoni dell’accordo del 1983, Germania→Svizzera, Francia→Lussemburgo, Belgio→Lussemburgo, Germania→Lussemburgo, Italia→Svizzera). Prova gratuita di 7 giorni, poi il piano scelto al prezzo indicato, addebitato automaticamente l’8° giorno e rinnovato fino alla disdetta; carta richiesta all’iscrizione.',
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
        'Log your own telework and border days: social-security counters on every border route, tax counters where the rule can be counted today. €4.99/month or €49/year incl. VAT. 7-day free trial, then charged automatically on day 8 and renewing until you cancel.',
      h1: 'Log your own border days',
      summary:
        'Employees and individual users can log telework, on-site, trip and non-working days. Social-security counters run on every border route; tax counters run on seven. Individual plan: €4.99/month or €49/year (incl. VAT). 7-day free trial, then the plan you chose at the stated price, charged automatically on day 8 and renewing until you cancel; card required at signup. If your employer uses BorderDay, join via their invite link to share the same counters with HR.',
      crumbs: [
        ['Home', ''],
        ['For individuals', 'for-individuals'],
      ],
    },
    fr: {
      title: 'Pour les particuliers — BorderDay',
      description:
        'Enregistrez vos jours de télétravail et de déplacement. 4,99 €/mois ou 49 €/an TVA incluse. Essai gratuit de 7 jours, puis débit automatique le 8e jour et renouvellement jusqu’à résiliation.',
      h1: 'Enregistrez vos propres jours de travail',
      summary:
        'Salariés et utilisateurs individuels peuvent enregistrer télétravail, jours sur site, déplacements et jours non travaillés. Compteurs de sécurité sociale sur chaque situation frontalière, compteurs fiscaux sur sept. Offre individuelle : 4,99 €/mois ou 49 €/an (TVA incluse). Essai gratuit de 7 jours, puis l’offre choisie au prix indiqué, débitée automatiquement le 8e jour et renouvelée jusqu’à votre résiliation ; carte requise à l’inscription. Si votre employeur utilise BorderDay, rejoignez-le via son lien d’invitation pour partager les mêmes compteurs avec les RH.',
      crumbs: [
        ['Accueil', ''],
        ['Pour les particuliers', 'for-individuals'],
      ],
    },
    de: {
      title: 'Für Einzelpersonen — BorderDay',
      description:
        'Eigene Telearbeits- und Reisetage erfassen. 4,99 €/Monat oder 49 €/Jahr inkl. MWST. 7 Tage kostenlos testen, danach automatische Abbuchung am 8. Tag und Verlängerung bis zur Kündigung.',
      h1: 'Eigene Arbeitstage über die Grenze erfassen',
      summary:
        'Mitarbeitende erfassen Telearbeit, Vor-Ort-, Reise- und arbeitsfreie Tage selbst. Sozialversicherungszähler auf jeder Grenzroute, Steuerzähler auf sieben. Einzelplan: 4,99 €/Monat oder 49 €/Jahr (inkl. MWST). 7 Tage kostenlos testen, danach der gewählte Plan zum angegebenen Preis, mit automatischer Abbuchung am 8. Tag und Verlängerung bis zu Ihrer Kündigung; Karte bei der Anmeldung erforderlich. Nutzt der Arbeitgeber BorderDay, Beitritt über den Einladungslink: dieselben Zähler wie HR.',
      crumbs: [
        ['Start', ''],
        ['Für Einzelpersonen', 'for-individuals'],
      ],
    },
    it: {
      title: 'Per i privati — BorderDay',
      description:
        'Registrate telelavoro e giorni sulla situazione di frontiera. 4,99 €/mese o 49 €/anno IVA inclusa. Prova gratuita di 7 giorni, poi addebito automatico l’8° giorno e rinnovo fino alla disdetta.',
      h1: 'Registrate i vostri giorni sulla situazione di frontiera',
      summary:
        'Dipendenti e utenti individuali possono inserire telelavoro, giorni in sede, trasferte e giorni non lavorati. Contatori di sicurezza sociale su ogni situazione di frontiera, contatori fiscali su sette. Piano individuale: 4,99 €/mese o 49 €/anno (IVA inclusa). Prova gratuita di 7 giorni, poi il piano scelto al prezzo indicato, addebitato automaticamente l’8° giorno e rinnovato fino alla disdetta; carta richiesta all’iscrizione. Se il datore di lavoro usa BorderDay, entrate con il link di invito per condividere gli stessi contatori con HR.',
      crumbs: [
        ['Home', ''],
        ['Per i privati', 'for-individuals'],
      ],
    },
  },
  privacy: {
    en: {
      title: 'Privacy — BorderDay',
      description:
        'How BorderDay handles personal data: purposes, legal bases, recipients, transfers, retention and your rights under the GDPR and Swiss FADP. No GPS or device location.',
      h1: 'Privacy',
      summary:
        'No GPS or device location: HR sees the day type and overnight-away yes/no per date, a country category, never coordinates. The employer is controller of employee day logs. Recipients: Supabase (EU hosting), Resend, GitHub Pages, Zoho, Google if chosen, and Stripe/Link as independent controllers. Contact privacy@borderday.com.',
      crumbs: [
        ['Home', ''],
        ['Privacy', 'privacy'],
      ],
    },
    fr: {
      title: 'Confidentialité — BorderDay',
      description:
        'Comment BorderDay traite les données personnelles : finalités, bases légales, destinataires, transferts, conservation et vos droits (RGPD et LPD suisse). Ni GPS ni localisation de l’appareil.',
      h1: 'Confidentialité',
      summary:
        'Ni GPS ni localisation de l’appareil : les RH voient par date le type de jour et la nuit hors du domicile (oui ou non), une catégorie de pays, jamais des coordonnées. L’employeur est responsable du traitement des journaux des collaborateurs. Destinataires : Supabase (hébergement UE), Resend, GitHub Pages, Zoho, Google si choisi, et Stripe/Link en tant que responsables indépendants. Contact privacy@borderday.com.',
      crumbs: [
        ['Accueil', ''],
        ['Confidentialité', 'privacy'],
      ],
    },
    de: {
      title: 'Datenschutz — BorderDay',
      description:
        'Wie BorderDay Personendaten bearbeitet: Zwecke, Rechtsgrundlagen, Empfänger, Übermittlungen, Aufbewahrung und Ihre Rechte (DSGVO und Schweizer DSG). Kein GPS und kein Gerätestandort.',
      h1: 'Datenschutz',
      summary:
        'Kein GPS und kein Gerätestandort: HR sieht je Datum die Tagesart, halber Tag und auswärtige Übernachtung ja/nein, eine Länderkategorie, nie Koordinaten. Der Arbeitgeber ist Verantwortlicher für die Tagesprotokolle der Mitarbeitenden. Empfänger: Supabase (Hosting in der EU), Resend, GitHub Pages, Zoho, Google falls gewählt, sowie Stripe/Link als unabhängige Verantwortliche. Kontakt privacy@borderday.com.',
      crumbs: [
        ['Start', ''],
        ['Datenschutz', 'privacy'],
      ],
    },
    it: {
      title: 'Privacy — BorderDay',
      description:
        'Come BorderDay tratta i dati personali: finalità, basi giuridiche, destinatari, trasferimenti, conservazione e vostri diritti (GDPR e LPD svizzera). Nessuna localizzazione GPS né posizione del dispositivo.',
      h1: 'Privacy',
      summary:
        'Nessuna localizzazione GPS né posizione del dispositivo: l’HR vede per data il tipo di giorno, la mezza giornata e la notte fuori sì/no, una categoria di paese, mai coordinate. Il datore di lavoro è titolare dei registri dei dipendenti. Destinatari: Supabase (hosting UE), Resend, GitHub Pages, Zoho, Google se scelto, e Stripe/Link come titolari autonomi. Contatto privacy@borderday.com.',
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
        'BorderDay classe et compte les jours que vous ou votre entreprise enregistrez. Les seuils proviennent de sources officielles publiques et peuvent changer. Vérifiez toujours auprès de l’autorité compétente ou d’un conseiller qualifié.',
      crumbs: [
        ['Accueil', ''],
        ['Avertissement', 'disclaimer'],
      ],
    },
    de: {
      title: 'Rechtlicher Hinweis — BorderDay',
      description:
        'BorderDay ist ein Erfassungs- und Erinnerungstool. Keine Steuer- oder Rechtsberatung und kein Ersatz für Arbeitgeber oder Fachperson.',
      h1: 'Rechtlicher Hinweis',
      summary:
        'BorderDay klassifiziert und zählt von Ihnen oder Ihrem Unternehmen erfasste Tage. Schwellen stammen aus öffentlichen amtlichen Quellen und können sich ändern. Stets bei der zuständigen Behörde oder einer Fachperson prüfen.',
      crumbs: [
        ['Start', ''],
        ['Rechtlicher Hinweis', 'disclaimer'],
      ],
    },
    it: {
      title: 'Avvertenza — BorderDay',
      description:
        'BorderDay è uno strumento di registrazione e promemoria. Non è consulenza fiscale o legale né sostituisce il datore di lavoro o un consulente.',
      h1: 'Avvertenza',
      summary:
        'BorderDay classifica e conta i giorni registrati da voi o dalla vostra azienda. Le soglie provengono da fonti ufficiali pubbliche e possono cambiare. Verificate sempre con l’autorità competente o un consulente qualificato.',
      crumbs: [
        ['Home', ''],
        ['Avvertenza', 'disclaimer'],
      ],
    },
  },

  dpa: {
    en: {
      title: 'Data processing agreement — BorderDay',
      description:
        'Public data processing agreement for BorderDay company accounts under GDPR Art. 28 and the Swiss FADP: roles, security, sub-processors and transfers.',
      h1: 'Data processing agreement',
      summary:
        'When an employer uses a BorderDay company account, BorderDay processes employee day logs as a processor under GDPR Art. 28 and the Swiss FADP. This page is the public DPA for that processing. Sub-processors include Supabase (eu-central-1), Resend, GitHub Pages and optional Google sign-in; Stripe/Link are independent controllers for payment.',
      crumbs: [
        ['Home', ''],
        ['Data processing agreement', 'dpa'],
      ],
    },
    fr: {
      title: 'Accord de traitement des données — BorderDay',
      description:
        'Accord public de traitement des données pour les comptes entreprise BorderDay (art. 28 RGPD et LPD suisse) : rôles, sécurité, sous-traitants et transferts.',
      h1: 'Accord de traitement des données',
      summary:
        'Lorsqu’un employeur utilise un compte entreprise BorderDay, BorderDay traite les journaux de jours des collaborateurs en tant que sous-traitant (art. 28 RGPD et LPD). Cette page est l’ATD public pour ce traitement. Sous-traitants : Supabase (eu-central-1), Resend, GitHub Pages et Google optionnel ; Stripe/Link sont responsables indépendants pour le paiement.',
      crumbs: [
        ['Accueil', ''],
        ['Accord de traitement des données', 'dpa'],
      ],
    },
    de: {
      title: 'Auftragsverarbeitungsvertrag — BorderDay',
      description:
        'Öffentlicher Auftragsverarbeitungsvertrag für BorderDay-Unternehmenskonten (Art. 28 DSGVO und schweizerisches DSG): Rollen, Sicherheit, Unterauftragsbearbeiter und Übermittlungen.',
      h1: 'Auftragsverarbeitungsvertrag',
      summary:
        'Nutzt ein Arbeitgeber ein BorderDay-Unternehmenskonto, verarbeitet BorderDay Tagesprotokolle der Mitarbeitenden als Auftragsbearbeiter nach Art. 28 DSGVO und dem DSG. Diese Seite ist der öffentliche AVV. Unterauftragsbearbeiter: Supabase (eu-central-1), Resend, GitHub Pages und optionales Google; Stripe/Link sind unabhängige Verantwortliche für die Zahlung.',
      crumbs: [
        ['Home', ''],
        ['Auftragsverarbeitungsvertrag', 'dpa'],
      ],
    },
    it: {
      title: 'Accordo sul trattamento dei dati — BorderDay',
      description:
        'Accordo pubblico sul trattamento dei dati per gli account aziendali BorderDay (art. 28 GDPR e LPD svizzera): ruoli, sicurezza, sub-responsabili e trasferimenti.',
      h1: 'Accordo sul trattamento dei dati',
      summary:
        'Quando un datore di lavoro usa un account aziendale BorderDay, BorderDay tratta i registri dei giorni dei dipendenti come responsabile del trattamento ai sensi dell’art. 28 GDPR e della LPD. Questa pagina è l’ATD pubblico. Sub-responsabili: Supabase (eu-central-1), Resend, GitHub Pages e Google opzionale; Stripe/Link sono titolari indipendenti per il pagamento.',
      crumbs: [
        ['Home', ''],
        ['Accordo sul trattamento dei dati', 'dpa'],
      ],
    },
  },
  accessibility: {
    en: {
      title: 'Accessibility — BorderDay',
      description:
        'BorderDay accessibility statement: scope, current status and how to report barriers. Feedback: hello@borderday.com.',
      h1: 'Accessibility',
      summary:
        'We aim for WCAG 2.1 Level AA. Automated axe scans of the public pages and the demo reported no violations on 1 November 2026; manual gaps remain and are listed on this page.',
      crumbs: [
        ['Home', ''],
        ['Accessibility', 'accessibility'],
      ],
    },
    fr: {
      title: 'Accessibilité — BorderDay',
      description:
        'Déclaration d’accessibilité BorderDay : périmètre, état actuel et comment signaler un obstacle. Contact : hello@borderday.com.',
      h1: 'Accessibilité',
      summary:
        'Nous visons le niveau AA des WCAG 2.1. Les scans axe des pages publiques et de la démo n’ont signalé aucune violation le 1er novembre 2026 ; des écarts manuels restent listés sur cette page.',
      crumbs: [
        ['Accueil', ''],
        ['Accessibilité', 'accessibility'],
      ],
    },
    de: {
      title: 'Barrierefreiheit — BorderDay',
      description:
        'BorderDay-Erklärung zur Barrierefreiheit: Geltungsbereich, aktueller Stand und Rückmeldung. Kontakt: hello@borderday.com.',
      h1: 'Barrierefreiheit',
      summary:
        'Wir orientieren uns an WCAG 2.1 Stufe AA. Automatisierte axe-Scans der öffentlichen Seiten und der Demo meldeten am 1. November 2026 keine Verstösse; manuelle Lücken stehen auf dieser Seite.',
      crumbs: [
        ['Home', ''],
        ['Barrierefreiheit', 'accessibility'],
      ],
    },
    it: {
      title: 'Accessibilità — BorderDay',
      description:
        'Dichiarazione di accessibilità BorderDay: ambito, stato attuale e come segnalare una barriera. Contatto: hello@borderday.com.',
      h1: 'Accessibilità',
      summary:
        'Miriamo al livello AA delle WCAG 2.1. Gli scan axe delle pagine pubbliche e della demo non hanno segnalato violazioni il 1° novembre 2026; le lacune manuali sono elencate in questa pagina.',
      crumbs: [
        ['Home', ''],
        ['Accessibilità', 'accessibility'],
      ],
    },
  },

  terms: {
    en: {
      title: 'Terms & legal notice — BorderDay',
      description:
        'BorderDay terms and legal notice: trial and automatic renewal, cancellation, VAT, EU 14-day withdrawal for consumers, and service scope.',
      h1: 'Terms & legal notice',
      summary:
        'Subscriptions start with a 7-day free trial: the plan then becomes paid at the stated price, charged automatically on day 8 and renewing until you cancel. Company prices exclude VAT; individual prices include VAT. EU consumer withdrawal rights and cancellation are described on this page.',
      crumbs: [
        ['Home', ''],
        ['Terms', 'terms'],
      ],
    },
    fr: {
      title: 'Conditions d’utilisation et mentions légales — BorderDay',
      description:
        'CGU et mentions légales BorderDay : essai et renouvellement automatique, résiliation, TVA, rétractation UE de 14 jours pour les consommateurs.',
      h1: 'Conditions d’utilisation et mentions légales',
      summary:
        'Les abonnements commencent par un essai gratuit de 7 jours : l’offre devient ensuite payante au prix indiqué, débitée automatiquement le 8e jour et renouvelée jusqu’à votre résiliation. Prix entreprise hors TVA ; prix particulier TVA incluse. Droit de rétractation UE et résiliation sont décrits sur cette page.',
      crumbs: [
        ['Accueil', ''],
        ['Conditions', 'terms'],
      ],
    },
    de: {
      title: 'Nutzungsbedingungen & Impressum — BorderDay',
      description:
        'Nutzungsbedingungen und Impressum von BorderDay: Testphase und automatische Verlängerung, Kündigung, MWST, 14-tägiges EU-Widerrufsrecht für Verbraucher.',
      h1: 'Nutzungsbedingungen & Impressum',
      summary:
        'Abos beginnen mit einer 7-tägigen kostenlosen Testphase: Danach wird der Plan zum angegebenen Preis kostenpflichtig, mit automatischer Abbuchung am 8. Tag und Verlängerung bis zu Ihrer Kündigung. Unternehmenspreise zzgl. MWST; Einzelpreise inkl. MWST EU-Widerruf und Kündigung sind auf dieser Seite beschrieben.',
      crumbs: [
        ['Start', ''],
        ['Nutzungsbedingungen', 'terms'],
      ],
    },
    it: {
      title: 'Condizioni di servizio e note legali — BorderDay',
      description:
        'Condizioni e note legali BorderDay: prova e rinnovo automatico, disdetta, IVA, recesso UE di 14 giorni per i consumatori.',
      h1: 'Condizioni di servizio e note legali',
      summary:
        'Gli abbonamenti iniziano con una prova gratuita di 7 giorni: il piano diventa poi a pagamento al prezzo indicato, addebitato automaticamente l’8° giorno e rinnovato fino alla disdetta. Prezzi azienda IVA esclusa; individuali IVA inclusa. Recesso UE e disdetta sono descritti in questa pagina.',
      crumbs: [
        ['Home', ''],
        ['Condizioni', 'terms'],
      ],
    },
  },
  withdrawal: {
    en: {
      title: 'Withdraw from contract — BorderDay',
      description: 'How EU/EEA consumers withdraw from a BorderDay individual plan within 14 days of receiving access, without giving a reason.',
      h1: 'Withdraw from contract',
      summary: 'EU/EEA consumers who bought an individual plan can withdraw within 14 days of receiving access, without giving a reason. This page records the withdrawal and shows the time of receipt; privacy@borderday.com and Link support can also be contacted for the Order.',
      crumbs: [
        ['Home', ''],
        ['Withdraw from contract', 'withdrawal'],
      ],
    },
    fr: {
      title: 'Se rétracter du contrat — BorderDay',
      description: 'Comment les consommateurs UE/EEE se rétractent d’une offre individuelle BorderDay dans les 14 jours suivant la réception de l’accès, sans motif.',
      h1: 'Se rétracter du contrat',
      summary: 'Les consommateurs UE/EEE ayant acheté une offre individuelle peuvent se rétracter dans les 14 jours suivant la réception de l’accès, sans motif. Cette page enregistre la rétractation et affiche l’heure de réception ; privacy@borderday.com et le support Link peuvent aussi être contactés pour la commande.',
      crumbs: [
        ['Accueil', ''],
        ['Se rétracter du contrat', 'withdrawal'],
      ],
    },
    de: {
      title: 'Vertrag widerrufen — BorderDay',
      description: 'So widerrufen Verbraucher in der EU/im EWR einen BorderDay-Einzelplan innerhalb von 14 Tagen ab Erhalt des Zugangs ohne Angabe von Gründen.',
      h1: 'Vertrag widerrufen',
      summary: 'Verbraucher in der EU/im EWR mit Einzelplan können innerhalb von 14 Tagen ab Erhalt des Zugangs ohne Angabe von Gründen widerrufen. Diese Seite erfasst den Widerruf und zeigt die Uhrzeit des Eingangs an; auch privacy@borderday.com und der Link-Support können zur Bestellung kontaktiert werden.',
      crumbs: [
        ['Start', ''],
        ['Vertrag widerrufen', 'withdrawal'],
      ],
    },
    it: {
      title: 'Recedere dal contratto — BorderDay',
      description: 'Come i consumatori UE/SEE recedono da un piano individuale BorderDay entro 14 giorni dalla ricezione dell’accesso, senza indicare il motivo.',
      h1: 'Recedere dal contratto',
      summary: 'I consumatori UE/SEE con un piano individuale possono recedere entro 14 giorni dalla ricezione dell’accesso, senza indicare il motivo. Questa pagina registra il recesso e mostra l’ora di ricezione; si possono anche contattare privacy@borderday.com e il supporto Link per l’ordine.',
      crumbs: [
        ['Home', ''],
        ['Recedere dal contratto', 'withdrawal'],
      ],
    },
  },
  cancel: {
    en: {
      title: 'Cancel subscription — BorderDay',
      description: 'Cancel a BorderDay subscription: from your account, through Link, or with the form without signing in. Cancellation stops future renewals.',
      h1: 'Cancel subscription',
      summary: 'Cancel your BorderDay subscription here. Cancellation stops future renewals. If you cancel before day 8 of your trial, nothing is charged.',
      crumbs: [
        ['Home', ''],
        ['Cancel subscription', 'cancel'],
      ],
    },
    fr: {
      title: 'Résilier votre contrat — BorderDay',
      description: 'Résilier un abonnement BorderDay : depuis votre compte, via Link, ou avec le formulaire sans vous connecter. La résiliation arrête les renouvellements futurs.',
      h1: 'Résilier votre contrat',
      summary: 'Résiliez ici votre abonnement BorderDay. La résiliation arrête les renouvellements futurs. Si vous résiliez avant le 8e jour de l’essai, rien n’est débité.',
      crumbs: [
        ['Accueil', ''],
        ['Résilier votre contrat', 'cancel'],
      ],
    },
    de: {
      title: 'Verträge hier kündigen — BorderDay',
      description: 'BorderDay-Abo kündigen: aus Ihrem Konto, über Link oder mit dem Formular ohne Anmeldung. Die Kündigung stoppt künftige Verlängerungen.',
      h1: 'Verträge hier kündigen',
      summary: 'Kündigen Sie hier Ihr BorderDay-Abo. Die Kündigung stoppt künftige Verlängerungen. Kündigen Sie vor dem 8. Tag der Testphase, wird nichts abgebucht.',
      crumbs: [
        ['Start', ''],
        ['Verträge hier kündigen', 'cancel'],
      ],
    },
    it: {
      title: 'Disdire il contratto — BorderDay',
      description: 'Disdire un abbonamento BorderDay: dall’account, tramite Link o con il modulo senza accedere. La disdetta interrompe i rinnovi futuri.',
      h1: 'Disdire il contratto',
      summary: 'Disdite qui il vostro abbonamento BorderDay. La disdetta interrompe i rinnovi futuri. Con la disdetta prima dell’8° giorno di prova non viene addebitato nulla.',
      crumbs: [
        ['Home', ''],
        ['Disdire il contratto', 'cancel'],
      ],
    },
  },
  'company/signup': {
    en: {
      title: 'Company sign-up — BorderDay',
      description:
        'Create a BorderDay company account for HR day counting across nine border routes. Then subscribe on Pricing (€5/active employee/month, min €39, excl. VAT).',
      h1: 'Company sign-up',
      summary:
        'Create a company account with email or Google, invite employees, and subscribe on the Pricing page. Company plan: €5 per active employee per month, €39 minimum, excl. VAT. 7-day free trial, then the plan you chose at the stated price, charged automatically on day 8 and renewing until you cancel; card required at signup.',
      crumbs: [
        ['Home', ''],
        ['Company sign-up', 'company/signup'],
      ],
    },
    fr: {
      title: 'Inscription entreprise — BorderDay',
      description:
        'Créez un compte entreprise BorderDay pour le suivi RH sur neuf situations frontalières. Puis abonnez-vous (5 €/collaborateur actif/mois, min. 39 €, hors TVA).',
      h1: 'Inscription entreprise',
      summary:
        'Créez un compte entreprise avec e-mail ou Google, invitez vos collaborateurs, puis abonnez-vous sur Tarifs. Offre entreprise : 5 € par collaborateur actif et par mois, minimum 39 €, hors TVA. Essai gratuit de 7 jours, puis l’offre choisie au prix indiqué, débitée automatiquement le 8e jour et renouvelée jusqu’à votre résiliation ; carte requise à l’inscription.',
      crumbs: [
        ['Accueil', ''],
        ['Inscription entreprise', 'company/signup'],
      ],
    },
    de: {
      title: 'Unternehmensregistrierung — BorderDay',
      description:
        'BorderDay-Unternehmenskonto für HR-Tageszählung auf neun Grenzrouten. Danach Abo unter Preise (5 € je aktive mitarbeitende Person/Monat, min. 39 €, zzgl. MWST).',
      h1: 'Unternehmensregistrierung',
      summary:
        'Unternehmenskonto mit E-Mail oder Google anlegen, Mitarbeitende einladen, unter Preise abonnieren. Plan: 5 € je aktive mitarbeitende Person und Monat, Minimum 39 €, zzgl. MWST. 7 Tage kostenlos testen, danach der gewählte Plan zum angegebenen Preis, mit automatischer Abbuchung am 8. Tag und Verlängerung bis zu Ihrer Kündigung; Karte bei der Anmeldung erforderlich.',
      crumbs: [
        ['Start', ''],
        ['Unternehmensregistrierung', 'company/signup'],
      ],
    },
    it: {
      title: 'Registrazione azienda — BorderDay',
      description:
        'Create un account aziendale BorderDay per il conteggio HR su nove situazioni di frontiera. Poi abbonatevi (5 €/dipendente attivo/mese, min. 39 €, IVA esclusa).',
      h1: 'Registrazione azienda',
      summary:
        'Create un account aziendale con e-mail o Google, invitate i dipendenti e abbonatevi in Prezzi. Piano: 5 € per dipendente attivo al mese, minimo 39 €, IVA esclusa. Prova gratuita di 7 giorni, poi il piano scelto al prezzo indicato, addebitato automaticamente l’8° giorno e rinnovato fino alla disdetta; carta richiesta all’iscrizione.',
      crumbs: [
        ['Home', ''],
        ['Registrazione azienda', 'company/signup'],
      ],
    },
  },

  'employers/ticino': {
    en: {
      title: 'Ticino employers — telework day tracking (IT→CH) — BorderDay',
      description:
        'For Ticino HR: track telework days for staff living in Italy. Tax counters for the 25% telework share and 45 non-return days under the Italy–Switzerland agreement, plus the EU/EEA/CH social-security framework under 50%. Day types only — no GPS. Company from €5/seat (min €39).',
      h1: 'Ticino employers: telework days for staff living in Italy',
      summary:
        'BorderDay helps Ticino employers log telework, on-site and overnight-away days for people who live in Italy and work in Switzerland under the Italy–Switzerland frontier-worker agreement (Accordo Art. 2 zones, as amended for telework). Tax: at most 25% telework at domicile and up to 45 non-return days per year (protocol Fedlex RU 2026 104; in force 9 Feb 2026, applying from 1 Jan 2024). Social security: EU/EEA/CH framework bands under 25%, 25% to under 50% (A1), and 50% or more. Not tax or legal advice.',
      crumbs: [
        ['Home', ''],
        ['Employers Ticino', 'employers/ticino'],
      ],
    },
    fr: {
      title: 'Employeurs Tessin — suivi télétravail (IT→CH) — BorderDay',
      description:
        'Pour les RH tessinoises: suivre les jours de télétravail du personnel résidant en Italie. Compteurs fiscaux 25% télétravail et 45 jours de non-retour selon l’accord Italie–Suisse, plus le cadre de sécurité sociale UE/EEE/CH sous 50%. Types de jours uniquement — pas de GPS. Entreprise dès 5 €/siège (min. 39 €).',
      h1: 'Employeurs au Tessin: jours de télétravail pour le personnel résidant en Italie',
      summary:
        'BorderDay aide les employeurs tessinois à enregistrer télétravail, jours sur site et nuits hors domicile pour les personnes qui résident en Italie et travaillent en Suisse selon l’accord Italie–Suisse (Accordo Art. 2, tel que modifié pour le télétravail). Fiscalité: au plus 25% de télétravail au domicile et jusqu’à 45 jours de non-retour par an (protocole Fedlex RU 2026 104; en vigueur le 9 février 2026, applicable dès le 1er janvier 2024). Sécurité sociale: bandes du cadre UE/EEE/CH sous 25%, 25% à moins de 50% (A1), et 50% ou plus. Pas un conseil fiscal ou juridique.',
      crumbs: [
        ['Accueil', ''],
        ['Employeurs Tessin', 'employers/ticino'],
      ],
    },
    de: {
      title: 'Arbeitgeber Tessin — Telearbeitstage (IT→CH) — BorderDay',
      description:
        'Für HR im Tessin: Telearbeitstage von Mitarbeitenden mit Wohnsitz in Italien erfassen. Steuerzähler 25% Telearbeit und 45 Nicht-Rückkehrtage laut Abkommen Italien–Schweiz, plus EU/EWR/CH-Sozialversicherungsrahmen unter 50%. Nur Tagesarten — kein GPS. Unternehmen ab 5 € je aktive mitarbeitende Person (Minimum 39 €).',
      h1: 'Arbeitgeber im Tessin: Telearbeitstage für Mitarbeitende mit Wohnsitz in Italien',
      summary:
        'BorderDay hilft Tessiner Arbeitgebern, Telearbeit, Vor-Ort-Tage und Übernachtungen auswärts für Personen zu erfassen, die in Italien wohnen und in der Schweiz arbeiten — gemäss dem Abkommen Italien–Schweiz (Accordo Art. 2, geändert für Telearbeit). Steuer: höchstens 25% Telearbeit am Wohnsitz und bis 45 Nicht-Rückkehrtage pro Jahr (Protokoll Fedlex RU 2026 104; in Kraft 9. Feb 2026, anwendbar ab 1. Jan 2024). Sozialversicherung: Rahmen-Bänder unter 25%, 25% bis unter 50% (A1) und 50% oder mehr. Keine Steuer- oder Rechtsberatung.',
      crumbs: [
        ['Start', ''],
        ['Arbeitgeber Tessin', 'employers/ticino'],
      ],
    },
    it: {
      title: 'Datori di lavoro Ticino — giorni di telelavoro (IT→CH) — BorderDay',
      description:
        'Per le HR in Ticino: registrare i giorni di telelavoro del personale residente in Italia. Contatori fiscali 25% telelavoro e 45 giorni di non rientro dell’accordo Italia–Svizzera, più il quadro previdenziale UE/SEE/CH sotto il 50%. Solo tipologie di giorno — niente GPS. Azienda da 5 €/posto (min. 39 €).',
      h1: 'Datori di lavoro in Ticino: giorni di telelavoro per il personale residente in Italia',
      summary:
        'BorderDay aiuta i datori di lavoro in Ticino a registrare telelavoro, giorni in sede e notti fuori casa per chi risiede in Italia e lavora in Svizzera secondo l’accordo Italia–Svizzera (Accordo Art. 2, come modificato per il telelavoro). Fisco: al massimo il 25% di telelavoro al domicilio e fino a 45 giorni di non rientro all’anno (protocollo Fedlex RU 2026 104; in vigore dal 9 febbraio 2026, con effetto dal 1° gennaio 2024). Previdenza: fasce del quadro UE/SEE/CH sotto il 25%, dal 25% a meno del 50% (A1) e 50% o più. Non è consulenza fiscale o legale.',
      crumbs: [
        ['Home', ''],
        ['Datori di lavoro Ticino', 'employers/ticino'],
      ],
    },
    nl: {
      title: 'Werkgevers Ticino — telewerkdagen (IT→CH) — BorderDay',
      description:
        'Voor HR in Ticino: telewerkdagen bijhouden van medewerkers die in Italië wonen. Belastingstellers 25% telewerk en 45 niet-terugkeerdagen volgens het akkoord Italië–Zwitserland, plus EU/EER/CH-socialezekerheidskader onder 50%. Alleen dagtypes — geen GPS. Bedrijf vanaf €5/plaats (min. €39).',
      h1: 'Werkgevers in Ticino: telewerkdagen voor medewerkers die in Italië wonen',
      summary:
        'BorderDay helpt Ticinese werkgevers telewerk-, ter-plaatse- en overnachtingsdagen elders te registreren voor mensen die in Italië wonen en in Zwitserland werken volgens het grenswerkersakkoord Italië–Zwitserland (Accordo Art. 2, gewijzigd voor telewerk). Fiscaal: hoogstens 25% telewerk aan de woonplaats en tot 45 niet-terugkeerdagen per jaar (protocol Fedlex RU 2026 104; in werking 9 feb 2026, toepasselijk vanaf 1 jan 2024). Sociale zekerheid: kaderbanden onder 25%, 25% tot onder 50% (A1) en 50% of meer. Geen belasting- of juridisch advies.',
      crumbs: [
        ['Home', ''],
        ['Werkgevers Ticino', 'employers/ticino'],
      ],
    },
  },
  'employers/geneva': {
    en: {
      title: 'Geneva employers — telework day tracking (FR→CH) — BorderDay',
      description:
        'For Geneva HR: track telework days for staff living in France. Tax counters for the 40% telework share and 10 mission days, plus the EU/EEA/CH social-security framework under 50%. Day types only — no GPS. Company from €5/seat (min €39).',
      h1: 'Geneva employers: telework days for staff living in France',
      summary:
        'BorderDay helps Geneva employers log telework, on-site and trip days for people who live in France and work in Switzerland. Tax: up to 40% telework and 10 temporary mission days (ge.ch / ESTV). Social security: framework bands under 25%, 25% to under 50% (A1), and 50% or more. Employer telework-rate duty: first AFC transmission planned for January 2027 for 2026 data. Not tax or legal advice.',
      crumbs: [
        ['Home', ''],
        ['Employers Geneva', 'employers/geneva'],
      ],
    },
    fr: {
      title: 'Employeurs Genève — suivi télétravail (FR→CH) — BorderDay',
      description:
        'Pour les RH genevoises: suivre les jours de télétravail du personnel résidant en France. Compteurs fiscaux 40% / 10 jours de mission et cadre de sécurité sociale UE/EEE/CH sous 50%. Types de jours uniquement — pas de GPS. Entreprise dès 5 €/siège (min. 39 €).',
      h1: 'Employeurs à Genève: jours de télétravail pour le personnel résidant en France',
      summary:
        'BorderDay aide les employeurs genevois à enregistrer télétravail, jours sur site et déplacements pour les personnes qui résident en France et travaillent en Suisse. Fiscalité: jusqu’à 40% de télétravail et 10 jours de missions (ge.ch / AFC). Sécurité sociale: bandes sous 25%, 25% à moins de 50% (A1), et 50% ou plus. Obligation employeur: première transmission AFC prévue en janvier 2027 pour 2026. Pas un conseil fiscal ou juridique.',
      crumbs: [
        ['Accueil', ''],
        ['Employeurs Genève', 'employers/geneva'],
      ],
    },
    de: {
      title: 'Arbeitgeber Genf — Telearbeitstage (FR→CH) — BorderDay',
      description:
        'Für HR in Genf: Telearbeitstage von Mitarbeitenden mit Wohnsitz in Frankreich erfassen. Steuerzähler 40% / 10 temporäre Einsatztage und EU/EWR/CH-Sozialversicherungsrahmen unter 50%. Nur Tagesarten — kein GPS. Unternehmen ab 5 € je aktive mitarbeitende Person (Minimum 39 €).',
      h1: 'Arbeitgeber in Genf: Telearbeitstage für Mitarbeitende mit Wohnsitz in Frankreich',
      summary:
        'BorderDay hilft Genfer Arbeitgebern, Telearbeit, Vor-Ort- und Reisetage für Personen zu erfassen, die in Frankreich wohnen und in der Schweiz arbeiten. Steuer: bis 40% Telearbeit und 10 temporäre Einsatztage (ge.ch / ESTV). Sozialversicherung: Rahmen-Bänder unter 25%, 25% bis unter 50% (A1) und 50% oder mehr. Arbeitgeberpflicht: erste AFC-Übermittlung laut ge.ch für Januar 2027 (Daten 2026). Keine Steuer- oder Rechtsberatung.',
      crumbs: [
        ['Start', ''],
        ['Arbeitgeber Genf', 'employers/geneva'],
      ],
    },
    it: {
      title: 'Datori di lavoro Ginevra — giorni di telelavoro (FR→CH) — BorderDay',
      description:
        'Per HR a Ginevra: registrare i giorni di telelavoro del personale residente in Francia. Contatori fiscali 40% / 10 giorni di impiego temporaneo e quadro previdenziale UE/SEE/CH sotto il 50%. Solo tipologie di giorno — niente GPS. Azienda da 5 €/posto (min. 39 €).',
      h1: 'Datori di lavoro a Ginevra: giorni di telelavoro per il personale residente in Francia',
      summary:
        'BorderDay aiuta i datori di lavoro ginevrini a registrare telelavoro, giorni in sede e trasferte per chi risiede in Francia e lavora in Svizzera. Fisco: fino al 40% di telelavoro e 10 giorni di missioni (ge.ch / AFC). Previdenza: fasce sotto il 25%, dal 25% a meno del 50% (A1) e 50% o più. Obbligo del datore di lavoro: prima trasmissione AFC a gennaio 2027 per il 2026. Non è consulenza fiscale o legale.',
      crumbs: [
        ['Home', ''],
        ['Datori di lavoro Ginevra', 'employers/geneva'],
      ],
    },
    nl: {
      title: 'Werkgevers Genève — telewerkdagen (FR→CH) — BorderDay',
      description:
        'Voor HR in Genève: telewerkdagen bijhouden van medewerkers die in Frankrijk wonen. Belastingstellers 40% / 10 missiedagen en EU/EER/CH-socialezekerheidskader onder 50%. Alleen dagtypes — geen GPS. Bedrijf vanaf €5/plaats (min. €39).',
      h1: 'Werkgevers in Genève: telewerkdagen voor medewerkers die in Frankrijk wonen',
      summary:
        'BorderDay helpt Geneefse werkgevers telewerk-, ter-plaatse- en reisdagen te registreren voor mensen die in Frankrijk wonen en in Zwitserland werken. Fiscaal: tot 40% telewerk en 10 missiedagen (ge.ch / ESTV). Sociale zekerheid: kaderbanden onder 25%, 25% tot onder 50% (A1) en 50% of meer. Werkgeversplicht: eerste AFC-indiening in januari 2027 voor 2026. Geen belasting- of juridisch advies.',
      crumbs: [
        ['Home', ''],
        ['Werkgevers Genève', 'employers/geneva'],
      ],
    },
  },
  'employers/luxembourg': {
    en: {
      title: 'Luxembourg employers — FR/BE/DE telework days — BorderDay',
      description:
        'One employer page for France→LU, Belgium→LU and Germany→LU: 34-day tax tolerance and the EU/EEA/CH social-security framework under 50%. Day types only — no GPS. Company from €5/seat (min €39).',
      h1: 'Luxembourg employers: telework days for staff living in France, Belgium or Germany',
      summary:
        'BorderDay covers all three Luxembourg residence routes in one company account: France→LU, Belgium→LU and Germany→LU. Each has a 34-day tax tolerance counter (with pack-specific part-time rules) plus the shared social-security framework under 50%. Day types only — no location tracking. Not tax or legal advice.',
      crumbs: [
        ['Home', ''],
        ['Employers Luxembourg', 'employers/luxembourg'],
      ],
    },
    fr: {
      title: 'Employeurs Luxembourg — télétravail FR/BE/DE — BorderDay',
      description:
        'Une page employeur pour France→LU, Belgique→LU et Allemagne→LU: tolérance fiscale de 34 jours et cadre de sécurité sociale UE/EEE/CH sous 50%. Types de jours uniquement — pas de GPS. Entreprise dès 5 €/siège (min. 39 €).',
      h1: 'Employeurs au Luxembourg: jours de télétravail pour le personnel résidant en France, Belgique ou Allemagne',
      summary:
        'BorderDay couvre les trois situations frontalières de résidence vers le Luxembourg dans un seul compte entreprise: France→LU, Belgique→LU et Allemagne→LU. Chacun a un compteur fiscal de 34 jours (règles de temps partiel propres au pack) et le cadre de sécurité sociale sous 50%. Types de jours uniquement. Pas un conseil fiscal ou juridique.',
      crumbs: [
        ['Accueil', ''],
        ['Employeurs Luxembourg', 'employers/luxembourg'],
      ],
    },
    de: {
      title: 'Arbeitgeber Luxemburg — Telearbeit FR/BE/DE — BorderDay',
      description:
        'Eine Arbeitgeberseite für Frankreich→LU, Belgien→LU und Deutschland→LU: steuerliche 34-Tage-Toleranz und EU/EWR/CH-Sozialversicherungsrahmen unter 50%. Nur Tagesarten — kein GPS. Unternehmen ab 5 € je aktive mitarbeitende Person (Minimum 39 €).',
      h1: 'Arbeitgeber in Luxemburg: Telearbeitstage für Mitarbeitende mit Wohnsitz in Frankreich, Belgien oder Deutschland',
      summary:
        'BorderDay deckt alle drei Wohnsitzrouten nach Luxemburg in einem Unternehmenskonto ab: Frankreich→LU, Belgien→LU und Deutschland→LU. Jede hat einen 34-Tage-Steuerzähler (packspezifische Teilzeitregeln) plus den Sozialversicherungsrahmen unter 50%. Nur Tagesarten. Keine Steuer- oder Rechtsberatung.',
      crumbs: [
        ['Start', ''],
        ['Arbeitgeber Luxemburg', 'employers/luxembourg'],
      ],
    },
    it: {
      title: 'Datori di lavoro Lussemburgo — telelavoro FR/BE/DE — BorderDay',
      description:
        'Una pagina datore di lavoro per Francia→LU, Belgio→LU e Germania→LU: tolleranza fiscale di 34 giorni e quadro previdenziale UE/SEE/CH sotto il 50%. Solo tipologie di giorno — niente GPS. Azienda da 5 €/posto (min. 39 €).',
      h1: 'Datori di lavoro in Lussemburgo: giorni di telelavoro per personale residente in Francia, Belgio o Germania',
      summary:
        'BorderDay copre le tre situazioni di frontiera di residenza verso il Lussemburgo in un unico account aziendale: Francia→LU, Belgio→LU e Germania→LU. Ognuno ha un contatore fiscale di 34 giorni (regole part-time del pack) e il quadro previdenziale sotto il 50%. Solo tipologie di giorno. Non è consulenza fiscale o legale.',
      crumbs: [
        ['Home', ''],
        ['Datori di lavoro Lussemburgo', 'employers/luxembourg'],
      ],
    },
    nl: {
      title: 'Werkgevers Luxemburg — telewerk FR/BE/DE — BorderDay',
      description:
        'Eén werkgevers pagina voor Frankrijk→LU, België→LU en Duitsland→LU: fiscale tolerantie van 34 dagen en EU/EER/CH-socialezekerheidskader onder 50%. Alleen dagtypes — geen GPS. Bedrijf vanaf €5/plaats (min. €39).',
      h1: 'Werkgevers in Luxemburg: telewerkdagen voor medewerkers die in Frankrijk, België of Duitsland wonen',
      summary:
        'BorderDay dekt alle drie de woonroutes naar Luxemburg in één bedrijfsaccount: Frankrijk→LU, België→LU en Duitsland→LU. Elk heeft een fiscale 34-dagen-teller (pack-specifieke deeltijdregels) plus het socialezekerheidskader onder 50%. Alleen dagtypes. Geen belasting- of juridisch advies.',
      crumbs: [
        ['Home', ''],
        ['Werkgevers Luxemburg', 'employers/luxembourg'],
      ],
    },
  },
};

// Dutch legal locale: clone EN SEO for every path, then override legal pages.
for (const path of Object.keys(PAGES)) {
  if (!PAGES[path].nl) PAGES[path].nl = { ...PAGES[path].en };
}
PAGES.privacy.nl = {
  title: 'BorderDay — Privacyverklaring',
  description:
    'Wat BorderDay verwerkt, waarom, wie ontvangt, waar gegevens naartoe gaan en hoe lang ze worden bewaard. AVG en Zwitserse DSG. Geen GPS of apparaatlocatie.',
  h1: 'Privacyverklaring',
  summary: 'Geen GPS of apparaatlocatie: HR ziet per datum het dagtype, halve dag en overnachting elders ja/nee, een landcategorie, nooit coördinaten. De werkgever is verwerkingsverantwoordelijke voor de dagregistraties van medewerkers. Contact privacy@borderday.com.',
  crumbs: [
    ['Home', ''],
    ['Privacyverklaring', 'privacy'],
  ],
};
PAGES.terms.nl = {
  title: 'BorderDay — Voorwaarden & wettelijke vermeldingen',
  description:
    'Voorwaarden, wettelijke vermeldingen en herroepingsrecht. Abonnementen via Stripe Managed Payments (Link). 7 dagen gratis proberen, daarna automatisch geïncasseerd op dag 8 en verlengd tot u opzegt.',
  h1: 'Voorwaarden & wettelijke vermeldingen',
  summary:
    'Abonnementen starten met 7 dagen gratis proberen: daarna wordt het abonnement betaald tegen de vermelde prijs, met automatische incasso op dag 8 en verlenging tot u opzegt. Bedrijfsprijzen excl. btw; particulier incl. btw. EU-herroeping en opzegging staan op deze pagina beschreven.',
  crumbs: [
    ['Home', ''],
    ['Voorwaarden', 'terms'],
  ],
};
PAGES.dpa.nl = {
  title: 'BorderDay — Verwerkersovereenkomst',
  description:
    'Verwerkersovereenkomst (art. 28 AVG / Zwitserse DSG) voor BorderDay-bedrijfsaccounts. Rollen werkgever/verwerker voor medewerker-dagregistraties.',
  h1: 'Verwerkersovereenkomst (bedrijfsaccounts)',
  summary: 'DPA voor medewerker-dagregistraties wanneer de werkgever een bedrijfsaccount gebruikt.',
  crumbs: [
    ['Home', ''],
    ['Verwerkersovereenkomst', 'dpa'],
  ],
};
PAGES.disclaimer.nl = {
  title: 'BorderDay — Disclaimer',
  description: 'BorderDay is een registratie- en herinneringstool — geen belasting- of juridisch advies.',
  h1: 'Disclaimer',
  summary: 'Geen belasting- of juridisch advies; drempels uit openbare bronnen.',
};
PAGES.withdrawal.nl = {
  title: 'BorderDay — Herroeping',
  description: 'Herroepingsrecht van 14 dagen voor consumenten in de EU/EER op individuele abonnementen.',
  h1: 'Herroeping van de overeenkomst',
  summary: 'EU/EER-consumentenherroeping voor individuele BorderDay-abonnementen.',
};
PAGES.accessibility.nl = {
  title: 'BorderDay — Toegankelijkheid',
  description: 'Toegankelijkheidsverklaring voor borderday.com (richting WCAG 2.1 AA).',
  h1: 'Toegankelijkheid',
  summary: 'Korte openbare toegankelijkheidsverklaring voor BorderDay.',
};
PAGES[''].nl = {
  title: 'BorderDay — Grensoverschrijdende daglimieten voor HR en medewerkers',
  description:
    'Dagtelling voor werkgevers van grensoverschrijdend personeel: socialezekerheidstellers op negen grensroutes, belastingtellers op zeven. Bedrijf vanaf €5/medewerker/maand (min. €39), excl. btw. 7 dagen gratis proberen (kaart vereist), daarna automatisch geïncasseerd op dag 8 en verlengd tot u opzegt.',
  h1: 'Eén plek voor elke grens waarover uw mensen werken',
  summary:
    'BorderDay helpt HR telewerk-, ter-plaatse- en reisdagen per medewerker bij te houden: socialezekerheidstellers op alle negen grensroutes in vijf regio’s, belastingtellers op zeven daarvan. Bedrijfsabonnement: €5 per actieve medewerker per maand (minimum €39), excl. btw; particulieren €4,99/maand of €49/jaar, incl. btw. 7 dagen gratis proberen, daarna het gekozen abonnement tegen de vermelde prijs, automatisch geïncasseerd op dag 8 en verlengd tot u opzegt; kaart vereist bij registratie. Een registratietool — geen belasting- of juridisch advies.',
  crumbs: [['Home', '']],
};
PAGES.pricing.nl = {
  title: 'BorderDay — Prijzen',
  description:
    'Bedrijf: €5 per actieve medewerker per maand, minimum €39; jaarlijks minimum €390. Particulier: €4,99/maand of €49/jaar. Bedrijfsprijzen excl. btw; particulier incl. btw. 7 dagen gratis proberen, daarna automatisch geïncasseerd op dag 8 en verlengd tot u opzegt.',
  h1: 'Prijzen',
  summary:
    'Bedrijf / HR: €5 per actieve medewerker per maand, minimum €39/maand (dekt tot 7 actieve medewerkers); jaarlijks minimum €390 (2 maanden gratis). Particulier: €4,99/maand of €49/jaar. Bedrijfsprijzen excl. btw; particulier incl. btw. 7 dagen gratis proberen, daarna het gekozen abonnement tegen de vermelde prijs, automatisch geïncasseerd op dag 8 en verlengd tot u opzegt; kaart vereist bij registratie. Checkout via Stripe Managed Payments (verkocht via Link).',
  crumbs: [['Home', ''], ['Prijzen', 'pricing']],
};
PAGES.faq.nl = {
  title: 'BorderDay — FAQ',
  description:
    'Veelgestelde vragen over BorderDay: opslag, locatie, grensroutes, prijzen, betalingen en wat de tool niet dekt.',
  h1: 'FAQ',
  summary:
    'BorderDay is een registratie- en herinneringstool, geen belasting- of juridisch advies. Met abonnement wordt het logboek in het account bewaard, de gratis preview blijft op het apparaat; geen GPS en geen apparaatlocatie. Negen grensroutes: socialezekerheidstellers op alle, belastingtellers op zeven (Genève en andere niet-1983-kantons, 1983-verdragskantons, Duitsland→Zwitserland, Frankrijk→Luxemburg, België→Luxemburg, Duitsland→Luxemburg, Italië→Zwitserland). 7 dagen gratis proberen, daarna het gekozen abonnement tegen de vermelde prijs, automatisch geïncasseerd op dag 8 en verlengd tot u opzegt; kaart vereist bij registratie.',
  crumbs: [['Home', ''], ['FAQ', 'faq']],
};
PAGES['for-individuals'].nl = {
  title: 'BorderDay — Voor particulieren',
  description:
    'Registreer zelf telewerk- en reisdagen. €4,99/maand of €49/jaar incl. btw. 7 dagen gratis proberen, daarna automatisch geïncasseerd op dag 8 en verlengd tot u opzegt.',
  h1: 'Registreer uw eigen grensdagen',
  summary:
    'Medewerkers registreren zelf telewerk-, ter-plaatse-, reis- en niet-werkdagen. Socialezekerheidstellers op elke grensroute, belastingtellers op zeven. Particulier abonnement: €4,99/maand of €49/jaar (incl. btw). 7 dagen gratis proberen, daarna het gekozen abonnement tegen de vermelde prijs, automatisch geïncasseerd op dag 8 en verlengd tot u opzegt; kaart vereist bij registratie. Gebruikt de werkgever BorderDay, aansluiten via de uitnodigingslink: dezelfde tellers als HR.',
  crumbs: [['Home', ''], ['Particulieren', 'for-individuals']],
};
PAGES.cancel.nl = {
  title: 'BorderDay — Abonnement opzeggen',
  description:
    'Zeg uw BorderDay-abonnement op via het klantenportaal, Link of het formulier. Opzegging vóór dag 8 van de proefperiode: niets wordt aangerekend.',
  h1: 'Abonnement opzeggen',
  summary:
    'Opzegging stopt toekomstige verlengingen. Tijdens de proefperiode vóór dag 8 wordt niets aangerekend. Gebruik het klantenportaal, Link-ordertools of het formulier.',
  crumbs: [['Home', ''], ['Abonnement opzeggen', 'cancel']],
};
PAGES['company/signup'].nl = {
  title: 'BorderDay — Bedrijfsaccount aanmaken',
  description:
    'Maak een bedrijfsaccount met e-mail of Google, nodig medewerkers uit, abonneer u onder Prijzen. Abonnement: €5 per actieve medewerker per maand, minimum €39, excl. btw.',
  h1: 'Bedrijfsaccount aanmaken',
  summary:
    'Bedrijfsaccount met e-mail of Google aanmaken, medewerkers uitnodigen, onder Prijzen abonneren. Abonnement: €5 per actieve medewerker per maand, minimum €39, excl. btw. 7 dagen gratis proberen, daarna het gekozen abonnement tegen de vermelde prijs, automatisch geïncasseerd op dag 8 en verlengd tot u opzegt; kaart vereist bij registratie.',
  crumbs: [['Home', ''], ['Bedrijfsaccount', 'company/signup']],
};


/** Corridors with a running tax counter. tests/seo.test.ts holds this equal to the packs. */
export const TAX_COUNTER_CORRIDORS = ['geneva_fr', 'basel_fr', 'basel_de', 'luxembourg_fr', 'luxembourg_be', 'luxembourg_de', 'ticino_it'];

/** FAQ pairs used on home + FAQ JSON-LD (EN source of truth; localized below). Matches site FAQ copy. */
export const FAQ = {
  en: [
    [
      'Is BorderDay tax or legal advice?',
      'No. It is a record-keeping and reminder tool for employers and employees. Thresholds are taken from public official sources and may change. Always verify with your employer, a qualified adviser, or the competent authority.',
    ],
    [
      'Where is my day log stored?',
      'Without a plan, only on your device (IndexedDB in the browser). With an active plan or a company account, in your BorderDay account. You can export JSON or CSV anytime. On a free or individual plan you can delete your log; in a company account, clearing your copy leaves the employer’s records under their retention setting.',
    ],
    [
      'Do you track my location?',
      'No. You log days yourself. No GPS or device location. HR sees day type (and half day and overnight-away yes/no) per date — country category, never coordinates. Notes are private to the employee.',
    ],
    [
      'Which borders do you cover?',
      'Nine border routes in five regions. Social-security counters on all nine. Tax counters on seven: Geneva and other non-1983 cantons←France, 1983-agreement cantons←France (40%/10 missions/45 nights), Germany→Switzerland, France→Luxembourg, Belgium→Luxembourg, Germany→Luxembourg and Italy→Switzerland. No general tax counter: France→Belgium has no day limit, and no tolerance was found for Netherlands→Belgium.',
    ],
    [
      'How much does BorderDay cost?',
      'Company: €5 per active employee per month with a €39 monthly minimum; yearly €390 minimum (2 months free). Individual: €4.99/month or €49/year. Company prices exclude VAT; individual prices include VAT. 7-day free trial, then the plan you chose at the stated price, charged automatically on day 8 and renewing until you cancel; card required at signup.',
    ],
    [
      'How do payments work?',
      'Checkout uses Stripe Managed Payments: Stripe provides merchant-of-record functions and handles VAT/GST in Checkout; the customer may see Link as the merchant of record. The free trial is once per person and once per company. Promo codes are supported. See Terms for cancellation and the EU 14-day withdrawal right for consumers.',
    ],
    [
      'What does BorderDay not cover?',
      'The self-employed, public-sector special rules, people with employers in several states, and non-IT work under the telework framework. Border routes not listed, such as France→Germany or Netherlands→Germany. Counters only see days logged here, so other jobs in the year are not included. Tax counters do not run on every border route. The CSV export is a working record, not an official filing such as the annual telework-rate attestation all Swiss employers of France residents must file (including at 0%). When in doubt, check with your authority.',
    ],
  ],
  fr: [
    [
      'BorderDay est-il un conseil fiscal ou juridique ?',
      'Non. C’est un outil de suivi et de rappel. Les seuils proviennent de sources officielles publiques et peuvent changer. Vérifiez toujours auprès de votre employeur, d’un conseiller qualifié ou de l’autorité compétente.',
    ],
    [
      'Où est stocké mon journal de jours ?',
      'Sans abonnement, uniquement sur votre appareil (IndexedDB dans le navigateur). Avec un abonnement actif ou un compte entreprise, dans votre compte BorderDay. Vous pouvez exporter en JSON ou CSV à tout moment. Sur un plan gratuit ou individuel, vous pouvez supprimer votre journal ; dans un compte entreprise, effacer votre copie laisse les dossiers de l’employeur selon sa durée de conservation.',
    ],
    [
      'Suivez-vous ma localisation ?',
      'Non. Vous enregistrez les jours vous-même. Ni GPS ni localisation de l’appareil. Les RH voient par date le type de jour (et la demi-journée et la nuit hors du domicile, oui ou non) : une catégorie de pays, jamais des coordonnées. Les notes restent privées pour le collaborateur.',
    ],
    [
      'Quelles frontières couvrez-vous ?',
      'Neuf situations frontalières dans cinq régions. Compteurs de sécurité sociale sur les neuf. Compteurs fiscaux sur sept : Genève et autres cantons hors accord de 1983←France, cantons de l’accord de 1983←France (40 % / 10 missions / 45 nuits), Allemagne→Suisse, France→Luxembourg, Belgique→Luxembourg, Allemagne→Luxembourg et Italie→Suisse. Pas de compteur fiscal général : France→Belgique n’a pas de limite en jours, et aucune tolérance n’a été trouvée pour Pays-Bas→Belgique.',
    ],
    [
      'Combien coûte BorderDay ?',
      'Entreprise : 5 € par collaborateur actif et par mois, minimum 39 € ; annuel 390 € minimum (2 mois offerts). Particulier : 4,99 €/mois ou 49 €/an. Prix entreprise hors TVA ; particulier TVA incluse. Essai gratuit de 7 jours, puis l’offre choisie au prix indiqué, débitée automatiquement le 8e jour et renouvelée jusqu’à votre résiliation ; carte requise à l’inscription.',
    ],
    [
      'Comment fonctionnent les paiements ?',
      'Le paiement utilise Stripe Managed Payments : Stripe assure les fonctions de marchand officiel (merchant of record) et gère la TVA/GST au checkout ; le client peut voir Link comme marchand officiel. L’essai gratuit est offert une fois par personne et une fois par entreprise. Codes promo acceptés. Voir les CGU pour la résiliation et le droit de rétractation UE de 14 jours.',
    ],
    [
      'Que ne couvre pas BorderDay ?',
      'Les indépendants, les règles propres au secteur public, les personnes ayant des employeurs dans plusieurs États et le travail sans lien informatique au sens de l’accord-cadre. Les situations frontalières non listés, comme France→Allemagne ou Pays-Bas→Allemagne. Les compteurs ne voient que les jours consignés ici : les autres emplois de l’année ne sont pas inclus. Les compteurs fiscaux n’existent pas sur toutes les situations frontalières. L’export CSV est un document de travail, pas une déclaration officielle comme l’attestation annuelle du taux de télétravail que tous les employeurs suisses de résidents fiscaux français doivent transmettre (y compris à 0 %). En cas de doute, vérifiez auprès de votre autorité.',
    ],
  ],
  de: [
    [
      'Ist BorderDay Steuer- oder Rechtsberatung?',
      'Nein. Es ist ein Erfassungs- und Erinnerungstool. Grenzwerte stammen aus öffentlichen amtlichen Quellen und können sich ändern. Stets bei Arbeitgeber, Fachperson oder zuständiger Behörde prüfen.',
    ],
    [
      'Wo wird mein Tagesprotokoll gespeichert?',
      'Ohne Abo nur auf Ihrem Gerät (IndexedDB im Browser). Mit aktivem Abo oder Unternehmenskonto in Ihrem BorderDay-Konto. Sie können jederzeit JSON oder CSV exportieren. Im kostenlosen oder Einzelabo können Sie Ihr Protokoll löschen; in einem Unternehmenskonto belässt das Löschen Ihrer Kopie die Unterlagen des Arbeitgebers gemäss seiner Aufbewahrungsfrist.',
    ],
    [
      'Erfassen Sie meinen Standort?',
      'Nein. Sie erfassen die Tage selbst. Kein GPS und kein Gerätestandort. HR sieht je Datum die Tagesart (und auswärtige Übernachtung ja/nein): eine Länderkategorie, nie Koordinaten. Notizen bleiben für die mitarbeitende Person privat.',
    ],
    [
      'Welche Grenzen decken Sie ab?',
      'Neun Grenzrouten in fünf Regionen. Sozialversicherungszähler auf allen neun. Steuerzähler auf sieben: Genf und weitere Kantone ausserhalb des Abkommens von 1983←Frankreich, Kantone des Abkommens von 1983←Frankreich (40 %/10 Einsätze/45 Nächte), Deutschland→Schweiz, Frankreich→Luxemburg, Belgien→Luxemburg, Deutschland→Luxemburg und Italien→Schweiz. Kein allgemeiner Steuerzähler: Frankreich→Belgien hat keine Tagesgrenze, und für Niederlande→Belgien wurde keine Toleranz gefunden.',
    ],
    [
      'Was kostet BorderDay?',
      'Unternehmen: 5 € je aktive mitarbeitende Person und Monat, Minimum 39 €; jährlich mindestens 390 € (2 Monate gratis). Einzelperson: 4,99 €/Monat oder 49 €/Jahr. Unternehmenspreise zzgl. MWST; Einzelpreise inkl. MWST. 7 Tage kostenlos testen, danach der gewählte Plan zum angegebenen Preis, mit automatischer Abbuchung am 8. Tag und Verlängerung bis zu Ihrer Kündigung; Karte bei der Anmeldung erforderlich.',
    ],
    [
      'Wie funktionieren Zahlungen?',
      'Checkout über Stripe Managed Payments: Stripe stellt Merchant-of-Record-Funktionen bereit und übernimmt MWST/GST im Checkout; Kundinnen und Kunden können Link als Merchant of Record sehen. Die kostenlose Testphase gibt es einmal pro Person und einmal pro Unternehmen. Promo-Codes möglich. Kündigung und 14-tägiges EU-Widerrufsrecht: siehe Nutzungsbedingungen.',
    ],
    [
      'Was deckt BorderDay nicht ab?',
      'Selbständige, Sonderregeln des öffentlichen Sektors, Personen mit Arbeitgebern in mehreren Staaten und Arbeit ohne IT-Anbindung im Sinne des Rahmenübereinkommens. Nicht aufgeführte Grenzrouten wie Frankreich→Deutschland oder Niederlande→Deutschland. Zähler sehen nur hier erfasste Tage, andere Stellen im Jahr sind nicht enthalten. Steuerzähler gibt es nicht auf jeder Grenzroute. Der CSV-Export ist eine Arbeitsunterlage, keine amtliche Meldung wie die jährliche Telearbeitsquoten-Bescheinigung, die alle Schweizer Arbeitgeber von in Frankreich ansässigen Personen einreichen müssen (auch bei 0 %). Im Zweifel fragen Sie Ihre Behörde.',
    ],
  ],
  it: [
    [
      'BorderDay è consulenza fiscale o legale?',
      'No. È uno strumento di registrazione e promemoria. Le soglie provengono da fonti ufficiali pubbliche e possono cambiare. Verificate sempre con il datore di lavoro, un consulente qualificato o l’autorità competente.',
    ],
    [
      'Dove è memorizzato il diario dei giorni?',
      'Senza un piano, solo sul vostro dispositivo (IndexedDB nel browser). Con un piano attivo o un account aziendale, nel vostro account BorderDay. Potete esportare JSON o CSV in qualsiasi momento. Con un piano gratuito o individuale potete cancellare il diario; in un account aziendale, cancellare la vostra copia lascia i documenti del datore di lavoro secondo la sua conservazione.',
    ],
    [
      'Tracciate la mia posizione?',
      'No. Registrate voi i giorni. Nessuna localizzazione GPS né posizione del dispositivo. L’HR vede per ogni data il tipo di giorno (e notte fuori sì/no): una categoria di paese, mai coordinate. Le note restano private per il dipendente.',
    ],
    [
      'Quali confini coprite?',
      'Nove situazioni di frontiera in cinque regioni. Contatori di sicurezza sociale su tutte e nove. Contatori fiscali su sette: Ginevra e altri cantoni fuori dall’accordo del 1983←Francia, cantoni dell’accordo del 1983←Francia (40%/10 impieghi temporanei/45 notti), Germania→Svizzera, Francia→Lussemburgo, Belgio→Lussemburgo, Germania→Lussemburgo e Italia→Svizzera. Nessun contatore fiscale generale: Francia→Belgio non ha un limite di giorni, e per Paesi Bassi→Belgio non è stata trovata alcuna tolleranza.',
    ],
    [
      'Quanto costa BorderDay?',
      'Azienda: 5 € per dipendente attivo al mese, minimo 39 €; annuale minimo 390 € (2 mesi gratis). Individuale: 4,99 €/mese o 49 €/anno. Prezzi azienda IVA esclusa; individuali IVA inclusa. Prova gratuita di 7 giorni, poi il piano scelto al prezzo indicato, addebitato automaticamente l’8° giorno e rinnovato fino alla disdetta; carta richiesta all’iscrizione.',
    ],
    [
      'Come funzionano i pagamenti?',
      'Il checkout usa Stripe Managed Payments: Stripe fornisce funzioni di merchant of record e gestisce IVA/GST nel checkout; il cliente può vedere Link come merchant of record. La prova gratuita è offerta una volta per persona e una volta per azienda. Codici promo supportati. Vedete le Condizioni per disdetta e recesso UE di 14 giorni.',
    ],
    [
      'Cosa non copre BorderDay?',
      'Gli indipendenti, le regole speciali del settore pubblico, chi ha datori di lavoro in più Stati e il lavoro senza collegamento informatico ai sensi dell’accordo quadro. Le situazioni di frontiera non elencate, come Francia→Germania o Paesi Bassi→Germania. I contatori vedono solo i giorni registrati qui: altri impieghi dell’anno non sono inclusi. I contatori fiscali non esistono su ogni situazione di frontiera. L’export CSV è un documento di lavoro, non una dichiarazione ufficiale come l’attestazione annuale del tasso di telelavoro che tutti i datori di lavoro svizzeri di residenti fiscali in Francia devono trasmettere (anche allo 0 %). In caso di dubbio, verificate con la vostra autorità.',
    ],
  ],
};
FAQ.nl = [
  [
    'Is BorderDay belasting- of juridisch advies?',
    'Nee. Het is een registratie- en herinneringstool voor werkgevers en medewerkers. Drempels komen uit openbare officiële bronnen en kunnen wijzigen. Verifieer altijd bij uw werkgever, een gekwalificeerde adviseur of de bevoegde autoriteit.',
  ],
  [
    'Waar wordt mijn daglogboek bewaard?',
    "Zonder abonnement alleen op uw apparaat (IndexedDB in de browser). Met een actief abonnement of bedrijfsaccount in uw BorderDay-account. U kunt altijd JSON of CSV exporteren. Op een gratis of individueel abonnement kunt u uw logboek wissen; in een bedrijfsaccount laat het wissen van uw kopie de dossiers van de werkgever bestaan volgens zijn bewaartermijn.",
  ],
  [
    'Volgt u mijn locatie?',
    'Nee. U registreert dagen zelf. Geen GPS of apparaatlocatie. HR ziet dagtype (en overnacht elders ja/nee) per datum — landcategorie, nooit coördinaten. Notities zijn privé voor de medewerker.',
  ],
  [
    'Welke grenzen dekt u?',
    'Negen grensroutes in vijf regio’s. Socialezekerheidstellers op alle negen. Belastingtellers op zeven: Genève en andere niet-1983-kantons←Frankrijk, 1983-verdragskantons←Frankrijk (40%/10 missies/45 nachten), Duitsland→Zwitserland, Frankrijk→Luxemburg, België→Luxemburg, Duitsland→Luxemburg en Italië→Zwitserland. Geen algemene belastingteller: Frankrijk→België heeft geen daglimiet, en voor Nederland→België is geen tolerantie gevonden.',
  ],
  [
    'Wat kost BorderDay?',
    'Bedrijf: €5 per actieve medewerker per maand met een maandelijks minimum van €39; jaarlijks minimum €390 (2 maanden gratis). Particulier: €4,99/maand of €49/jaar. Bedrijfsprijzen excl. btw; particulier incl. btw. 7 dagen gratis proberen, daarna het gekozen abonnement tegen de vermelde prijs, automatisch geïncasseerd op dag 8 en verlengd tot u opzegt; kaart vereist bij registratie.',
  ],
  [
    'Hoe werken betalingen?',
    'Checkout gebruikt Stripe Managed Payments: Stripe verricht merchant-of-record-functies en behandelt btw/GST in Checkout; de klant kan Link als merchant of record zien. De gratis proefperiode geldt eenmaal per persoon en eenmaal per bedrijf. Promocodes worden ondersteund. Zie de Voorwaarden voor opzegging en het herroepingsrecht van 14 dagen voor consumenten in de EU.',
  ],
  [
    'Wat dekt BorderDay niet?',
    'Zelfstandigen, bijzondere regels voor de openbare sector, personen met werkgevers in meerdere staten, en niet-IT-werk onder het telewerkkader. Niet vermelde grensroutes, zoals Frankrijk→Duitsland of Nederland→Duitsland. Tellers zien alleen hier geregistreerde dagen, dus andere jobs in het jaar zijn niet inbegrepen. Belastingtellers lopen niet op elke grensroute. De CSV-export is een werkdocument, geen officiële aangifte zoals de jaarlijkse telewerkpercentage-attestatie die alle Zwitserse werkgevers van fiscale inwoners van Frankrijk moeten indienen (ook bij 0%). Twijfelt u, controleer bij uw autoriteit.',
  ],
];


export function robotsTxt() {
  const disallow = [
    '/*/app',
    '/*/account',
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
        description: 'Minimum €39 / month. Prices exclude VAT. 7-day free trial, then charged automatically on day 8 and renewing until you cancel; card required.',
        availability: 'https://schema.org/InStock',
        url: `${BASE}/en/pricing/`,
      },
      {
        '@type': 'Offer',
        name: 'Company yearly minimum',
        price: '390.00',
        priceCurrency: 'EUR',
        description: 'Yearly company billing: 2 months free (€390 / year minimum). Prices exclude VAT. 7-day free trial, then charged automatically on day 8 and renewing until you cancel; card required.',
        availability: 'https://schema.org/InStock',
        url: `${BASE}/en/pricing/`,
      },
      {
        '@type': 'Offer',
        name: 'Individual monthly',
        price: '4.99',
        priceCurrency: 'EUR',
        description: 'Includes VAT. 7-day free trial, then charged automatically on day 8 and renewing until you cancel; card required.',
        availability: 'https://schema.org/InStock',
        url: `${BASE}/en/pricing/`,
      },
      {
        '@type': 'Offer',
        name: 'Individual yearly',
        price: '49.00',
        priceCurrency: 'EUR',
        description: 'Includes VAT. About two months free vs monthly. 7-day free trial, then charged automatically on day 8 and renewing until you cancel; card required.',
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

/** Optional page-specific FAQ pairs for employer SEO pages (and future landing pages). */
export const PAGE_FAQS = {
  'employers/ticino': {
    en: [
      ['Which border route should Ticino staff living in Italy pick?', 'The Ticino ← Italy pack (ticino_it): 25% telework at domicile, 45 non-return days, and the shared social-security framework counter — when Accordo Art. 2 zone and residence/workplace conditions fit.'],
      ['Does the 45-day rule count same-day trips?', 'BorderDay counts only days marked “stayed away overnight for work”. A same-day trip does not increment the non-return counter. Leave and sickness are excluded per the protocol note in the pack.'],
      ['Do you track employee location?', 'No. Employees log a day type and optional overnight-away yes/no. HR never sees GPS or device coordinates.'],
      ['What does the social-security 50% counter mean?', 'Under the framework agreement, telework in the residence state of 50% or more of working time generally means residence-state social security; between 25% and under 50% an A1 is normally needed. BorderDay shows those bands separately from tax.'],
      ['Is this tax or legal advice?', 'No. It is a tracking tool with counters based on public sources linked on this page and in the app. Confirm with your adviser or authority.'],
    ],
    fr: [
      ['Quelle situation frontalière choisir pour un collaborateur au Tessin résidant en Italie?', 'Le pack Tessin ← Italie (ticino_it): 25% de télétravail au domicile, 45 jours de non-retour et le compteur de sécurité sociale partagé — lorsque les zones et conditions de l’Accordo Art. 2 sont remplies.'],
      ['La règle des 45 jours compte-t-elle les déplacements d’une journée?', 'BorderDay ne compte que les jours marqués «nuit hors domicile pour le travail». Un aller-retour le même jour n’incrémente pas le compteur de non-retour. Congés et maladie sont exclus selon la note du protocole dans le pack.'],
      ['Suivez-vous la localisation des collaborateurs?', 'Non. Uniquement le type de jour et éventuellement nuit hors domicile oui/non. Jamais de GPS.'],
      ['Que signifie le compteur sécurité sociale à 50%?', 'Selon le cadre, un télétravail dans l’État de résidence de 50% ou plus du temps de travail conduit en principe à l’affiliation de résidence; entre 25% et moins de 50%, un A1 est en principe nécessaire. BorderDay affiche ces bandes séparément de la fiscalité.'],
      ['Est-ce un conseil fiscal ou juridique?', 'Non. C’est un outil de suivi dont les compteurs s’appuient sur des sources publiques liées ici et dans l’app. Confirmez auprès de votre conseiller ou de l’autorité.'],
    ],
    de: [
      ['Welche Route für Mitarbeitende im Tessin mit Wohnsitz in Italien?', 'Das Pack Tessin ← Italien (ticino_it): 25% Telearbeit am Wohnsitz, 45 Nicht-Rückkehrtage und der gemeinsame Sozialversicherungszähler — wenn Zonen und Bedingungen von Accordo Art. 2 passen.'],
      ['Zählt die 45-Tage-Regel Same-Day-Reisen?', 'BorderDay zählt nur Tage mit Markierung «Übernachtung auswärts für die Arbeit». Eine Hin- und Rückfahrt am selben Tag erhöht den Nicht-Rückkehrzähler nicht. Urlaub und Krankheit sind laut Protokollnotiz im Pack ausgeschlossen.'],
      ['Erfasst ihr den Standort der Mitarbeitenden?', 'Nein. Nur Tagesart und optional Übernachtung auswärts ja/nein. Nie GPS.'],
      ['Was bedeutet der Sozialversicherungszähler bei 50%?', 'Laut Rahmen führt Telearbeit im Wohnstaat von 50% oder mehr der Arbeitszeit in der Regel zur Wohnsitz-Affiliation; zwischen 25% und unter 50% ist in der Regel ein A1 nötig. BorderDay zeigt diese Bänder getrennt von der Steuer.'],
      ['Ist das Steuer- oder Rechtsberatung?', 'Nein. Es ist ein Erfassungstool mit Zählern auf Basis öffentlicher Quellen, die hier und in der App verlinkt sind. Mit Berater oder Behörde bestätigen.'],
    ],
    it: [
      ['Quale situazione di frontiera devono scegliere i collaboratori in Ticino residenti in Italia?', 'Il pack Ticino ← Italia (ticino_it): 25% di telelavoro al domicilio, 45 giorni di non rientro e il contatore previdenziale condiviso — quando le zone e le condizioni dell’Accordo Art. 2 sono soddisfatte.'],
      ['La regola dei 45 giorni conta le trasferte di sola giornata?', 'BorderDay conta solo i giorni segnati «notte fuori casa per lavoro». Una trasferta di andata e ritorno nello stesso giorno non incrementa il contatore di non rientro. Ferie e malattia sono escluse secondo la nota del protocollo nel pack.'],
      ['Tracciate la posizione dei collaboratori?', 'No. I collaboratori registrano una tipologia di giorno e, opzionale, notte fuori casa sì/no. Le HR non vedono mai GPS né coordinate del dispositivo.'],
      ['Cosa significa il contatore previdenziale al 50%?', 'Secondo il quadro, il telelavoro nello Stato di residenza pari o superiore al 50% del tempo di lavoro porta in genere all’affiliazione di residenza; tra 25% e meno del 50% di norma serve un A1. BorderDay mostra queste fasce separate dal fisco.'],
      ['È consulenza fiscale o legale?', 'No. È uno strumento di tracking con contatori basati su fonti pubbliche collegate qui e nell’app. Confermate con il vostro consulente o l’autorità.'],
    ],
    nl: [
      ['Welke route voor medewerkers in Ticino die in Italië wonen?', 'Het pack Ticino ← Italië (ticino_it): 25% telewerk aan de woonplaats, 45 niet-terugkeerdagen en de gedeelde socialezekerheidsteller — wanneer zones en voorwaarden van Accordo Art. 2 passen.'],
      ['Telt de 45-dagenregel same-day-reizen?', 'BorderDay telt alleen dagen gemarkeerd «overnachting elders voor werk». Een heen-en-weer-reis op dezelfde dag verhoogt de niet-terugkeerteller niet. Verlof en ziekte zijn uitgesloten volgens de protocolnota in het pack.'],
      ['Volgen jullie de locatie van medewerkers?', 'Nee. Alleen dagtype en optioneel overnachting elders ja/nee. Nooit GPS.'],
      ['Wat betekent de socialezekerheidsteller bij 50%?', 'Volgens het kader leidt telewerk in de woonstaat van 50% of meer van de werktijd doorgaans tot woonstaat-aansluiting; tussen 25% en onder 50% is doorgaans een A1 nodig. BorderDay toont die banden los van fiscaliteit.'],
      ['Is dit belasting- of juridisch advies?', 'Nee. Het is een trackingtool met tellers op basis van openbare bronnen die hier en in de app zijn gelinkt. Bevestig bij uw adviseur of autoriteit.'],
    ],
  },
  'employers/geneva': {
    en: [
      ['Does BorderDay replace the AFC telework-rate filing?', 'No. It keeps a working day log so HR can prepare figures. The annual attestation remains the employer’s filing under ge.ch rules.'],
      ['Which border route should Geneva staff living in France pick?', 'The Geneva / non-1983 cantons←France pack (geneva_fr): 40% telework, 10 mission days, and the shared social-security framework counter.'],
      ['Do you track employee location?', 'No. Employees log a day type and optional overnight-away yes/no. HR never sees GPS or device coordinates.'],
      ['What does the social-security 50% counter mean?', 'Under the framework agreement, telework in the residence state of 50% or more of working time generally means residence-state social security; between 25% and under 50% an A1 is normally needed. BorderDay shows those bands separately from tax.'],
      ['Is this tax or legal advice?', 'No. It is a tracking tool with counters based on public sources linked on this page and in the app. Confirm with your adviser or authority.'],
    ],
    fr: [
      ['BorderDay remplace-t-il la déclaration de taux AFC?', 'Non. Il tient un journal de jours pour préparer les chiffres. L’attestation annuelle reste le dépôt de l’employeur selon ge.ch.'],
      ['Quelle situation frontalière choisir pour un collaborateur résidant en France?', 'Le pack Genève / cantons hors accord 1983←France (geneva_fr): 40% télétravail, 10 jours de mission, et le compteur de sécurité sociale du cadre.'],
      ['Suivez-vous la localisation des collaborateurs?', 'Non. Uniquement le type de jour et éventuellement nuit hors domicile oui/non. Jamais de GPS.'],
      ['Que signifie le compteur sécurité sociale à 50%?', 'Selon le cadre, un télétravail dans l’État de résidence de 50% ou plus du temps de travail conduit en principe à l’affiliation de résidence; entre 25% et moins de 50%, un A1 est en principe nécessaire. BorderDay affiche ces bandes séparément de la fiscalité.'],
      ['Est-ce un conseil fiscal ou juridique?', 'Non. C’est un outil de suivi dont les compteurs s’appuient sur des sources publiques liées ici et dans l’app. Confirmez auprès de votre conseiller ou de l’autorité.'],
    ],
    de: [
      ['Ersetzt BorderDay die AFC-Meldung der Telearbeitsquote?', 'Nein. Es führt ein Arbeitstagebuch zur Vorbereitung. Die jährliche Bescheinigung bleibt die Meldung des Arbeitgebers nach ge.ch.'],
      ['Welche Route für Mitarbeitende mit Wohnsitz in Frankreich?', 'Das Pack Genf / Nicht-1983-Kantone←Frankreich (geneva_fr): 40% Telearbeit, 10 temporäre Einsatztage und der Sozialversicherungszähler des Rahmens.'],
      ['Erfasst ihr den Standort der Mitarbeitenden?', 'Nein. Nur Tagesart und optional Übernachtung auswärts ja/nein. Nie GPS.'],
      ['Was bedeutet der Sozialversicherungszähler bei 50%?', 'Laut Rahmen führt Telearbeit im Wohnstaat von 50% oder mehr der Arbeitszeit in der Regel zur Wohnsitz-Affiliation; zwischen 25% und unter 50% ist in der Regel ein A1 nötig. BorderDay zeigt diese Bänder getrennt von der Steuer.'],
      ['Ist das Steuer- oder Rechtsberatung?', 'Nein. Es ist ein Erfassungstool mit Zählern auf Basis öffentlicher Quellen, die hier und in der App verlinkt sind. Mit Berater oder Behörde bestätigen.'],
    ],
    it: [
      ['BorderDay sostituisce la dichiarazione AFC del tasso?', 'No. Tiene un diario dei giorni per preparare le cifre. L’attestazione annuale resta il deposito del datore di lavoro secondo ge.ch.'],
      ['Quale situazione di frontiera per un collaboratore residente in Francia?', 'Il pack Ginevra / cantoni fuori accordo 1983←Francia (geneva_fr): 40% telelavoro, 10 giorni di impiego temporaneo e il contatore previdenziale del quadro.'],
      ['Tracciate la posizione dei collaboratori?', 'No. Solo tipologia di giorno e, opzionale, notte fuori casa sì/no. Mai GPS.'],
      ['Cosa significa il contatore previdenziale al 50%?', 'Secondo il quadro, il telelavoro nello Stato di residenza pari o superiore al 50% del tempo di lavoro porta in genere all’affiliazione di residenza; tra 25% e meno del 50% di norma serve un certificato A1. BorderDay mostra queste fasce separate dal fisco.'],
      ['È consulenza fiscale o legale?', 'No. È uno strumento di tracking con contatori basati su fonti pubbliche collegate qui e nell’app. Confermate con il vostro consulente o l’autorità.'],
    ],
    nl: [
      ['Vervangt BorderDay de AFC-aangifte van het telewerkpercentage?', 'Nee. Het houdt een werkdagboek bij om cijfers voor te bereiden. De jaarlijkse attestatie blijft de indiening van de werkgever volgens ge.ch.'],
      ['Welke route voor medewerkers die in Frankrijk wonen?', 'Het pack Genève / niet-1983-kantons←Frankrijk (geneva_fr): 40% telewerk, 10 missiedagen en de socialezekerheidsteller van het kader.'],
      ['Volgen jullie de locatie van medewerkers?', 'Nee. Alleen dagtype en optioneel overnachting elders ja/nee. Nooit GPS.'],
      ['Wat betekent de socialezekerheidsteller bij 50%?', 'Volgens het kader leidt telewerk in de woonstaat van 50% of meer van de werktijd doorgaans tot woonstaat-aansluiting; tussen 25% en onder 50% is doorgaans een A1 nodig. BorderDay toont die banden los van fiscaliteit.'],
      ['Is dit belasting- of juridisch advies?', 'Nee. Het is een trackingtool met tellers op basis van openbare bronnen die hier en in de app zijn gelinkt. Bevestig bij uw adviseur of autoriteit.'],
    ],
  },
  'employers/luxembourg': {
    en: [
      ['Can one company account cover staff from France, Belgium and Germany?', 'Yes. Each employee picks France→LU, Belgium→LU or Germany→LU. HR sees all three on the same dashboard.'],
      ['Is the 34-day limit the same on every route?', 'The headline tolerance is 34 days on all three. Part-time reduction applies on France→LU only; Belgium→LU and Germany→LU keep 34 days without that reduction, per the cited official notes.'],
      ['What about social security versus tax?', 'They are separate counters. Tax uses the 34-day tolerance; social security uses the framework percentage bands (25% / under 50% / 50%+), including CCSS Luxembourg guidance for employers.'],
      ['Do you use GPS?', 'No. Only day types and an optional overnight-away mark. Never device coordinates.'],
      ['Is BorderDay legal or tax advice?', 'No. It tracks days against public thresholds linked here and in the app. Confirm filings with your adviser or the competent administration.'],
    ],
    fr: [
      ['Un seul compte peut-il couvrir FR, BE et DE?', 'Oui. Chaque collaborateur choisit France→LU, Belgique→LU ou Allemagne→LU. Les RH voient les trois sur le même tableau de bord.'],
      ['Les 34 jours sont-ils identiques sur chaque situation frontalière?', 'La tolérance affichée est de 34 jours sur les trois. La réduction pour temps partiel s’applique seulement France→LU; BE→LU et DE→LU gardent 34 jours sans cette réduction, selon les notes officielles citées.'],
      ['Sécurité sociale versus fiscalité?', 'Compteurs séparés. La fiscalité utilise la tolérance de 34 jours; la sécurité sociale utilise les bandes en pourcentage du cadre (25% / sous 50% / 50%+), y compris les indications CCSS pour les employeurs.'],
      ['Utilisez-vous le GPS?', 'Non. Uniquement des types de jours et une marque optionnelle de nuit hors domicile. Jamais de coordonnées.'],
      ['BorderDay est-il un conseil juridique ou fiscal?', 'Non. Il suit les jours par rapport à des seuils publics liés ici et dans l’app. Confirmez les dépôts avec votre conseiller ou l’administration compétente.'],
    ],
    de: [
      ['Kann ein Konto Mitarbeitende aus FR, BE und DE abdecken?', 'Ja. Jede Person wählt Frankreich→LU, Belgien→LU oder Deutschland→LU. HR sieht alle drei im selben Dashboard.'],
      ['Sind die 34 Tage auf jeder Route gleich?', 'Die Toleranz beträgt auf allen dreien 34 Tage. Die Teilzeitreduktion gilt nur Frankreich→LU; BE→LU und DE→LU behalten 34 Tage ohne diese Reduktion laut zitierten amtlichen Hinweisen.'],
      ['Sozialversicherung versus Steuer?', 'Getrennte Zähler. Die Steuer nutzt die 34-Tage-Toleranz; die Sozialversicherung die Prozentbänder des Rahmens (25% / unter 50% / 50%+), einschliesslich CCSS-Hinweisen für Arbeitgeber.'],
      ['Nutzt ihr GPS?', 'Nein. Nur Tagesarten und optional Übernachtung auswärts. Nie Gerätekoordinaten.'],
      ['Ist BorderDay Rechts- oder Steuerberatung?', 'Nein. Es trackt Tage gegen öffentliche Schwellen, die hier und in der App verlinkt sind. Meldungen mit Berater oder zuständiger Verwaltung bestätigen.'],
    ],
    it: [
      ['Un solo account può coprire FR, BE e DE?', 'Sì. Ciascun collaboratore sceglie Francia→LU, Belgio→LU o Germania→LU. Le HR vedono tutti e tre sullo stesso cruscotto.'],
      ['I 34 giorni sono uguali su ogni situazione di frontiera?', 'La tolleranza è di 34 giorni su tutti e tre. La riduzione part-time vale solo Francia→LU; BE→LU e DE→LU restano a 34 senza quella riduzione, secondo le note ufficiali citate.'],
      ['Previdenza versus fisco?', 'Contatori separati. Il fisco usa la tolleranza di 34 giorni; la previdenza le fasce percentuali del quadro (25% / sotto 50% / 50%+), incluse le indicazioni CCSS per i datori di lavoro.'],
      ['Usate il GPS?', 'No. Solo tipologie di giorno e un segno opzionale di notte fuori casa. Mai coordinate del dispositivo.'],
      ['BorderDay è consulenza legale o fiscale?', 'No. Traccia i giorni rispetto a soglie pubbliche collegate qui e nell’app. Confermate i depositi con il consulente o l’amministrazione competente.'],
    ],
    nl: [
      ['Kan één account medewerkers uit FR, BE en DE dekken?', 'Ja. Elke medewerker kiest Frankrijk→LU, België→LU of Duitsland→LU. HR ziet alle drie op hetzelfde dashboard.'],
      ['Zijn de 34 dagen op elke route hetzelfde?', 'De tolerantie is op alle drie 34 dagen. De deeltijdreductie geldt alleen Frankrijk→LU; BE→LU en DE→LU houden 34 dagen zonder die reductie, volgens de geciteerde officiële nota’s.'],
      ['Sociale zekerheid versus fiscaliteit?', 'Aparte tellers. Fiscaliteit gebruikt de 34-dagen-tolerantie; sociale zekerheid de percentagebanden van het kader (25% / onder 50% / 50%+), inclusief CCSS-richtlijnen voor werkgevers.'],
      ['Gebruiken jullie GPS?', 'Nee. Alleen dagtypes en optioneel een markering overnachting elders. Nooit apparaatcoördinaten.'],
      ['Is BorderDay juridisch of fiscaal advies?', 'Nee. Het volgt dagen af tegen openbare drempels die hier en in de app zijn gelinkt. Bevestig indieningen bij uw adviseur of de bevoegde administratie.'],
    ],
  },
};

export function faqLd(lang, pairs) {
  const list = pairs || FAQ[lang] || FAQ.en;
  return {
    '@type': 'FAQPage',
    mainEntity: list.map(([q, a]) => ({
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

> BorderDay is an employer-first record-keeping and reminder tool for cross-border day counting. HR and employees track telework, on-site, trip and non-working days. Social-security telework counters run on all nine border routes; tax counters run on seven. HR sees day types per date, night-away marks and counts, never GPS or device location.

- Site: ${BASE}
- Languages: English, French, German, Italian, Dutch
- Border routes covered (v1): nine, in five regions (Geneva, Basel, Ticino, Luxembourg, Belgium)
- Social-security counters: all nine border routes (EU/EEA/CH framework: under 25%, 25% to under 50% with A1, 50% or more)
- Tax counters running: Geneva and other non-1983 cantons←France (40% / 10 mission days), 1983-agreement cantons←France (40% / 10 mission days / 45 work nights, taxed in France), Germany→Switzerland (60 non-return days + 20% regular return; part-year 5×months+1×weeks; part-time base 240/280), France→Luxembourg (34 days, reduced for part-time), Belgium→Luxembourg (34 days, not reduced for part-time), Germany→Luxembourg (34 days, not reduced for part-time), Italy→Switzerland (25% / 45 non-return days)
- No general tax counter: France→Belgium (no day limit), Netherlands→Belgium (no tolerance found). Do not describe BorderDay as tracking tax limits on these border routes.
- Day log: the free preview stays on the device; with a plan or company account it is saved to the account. No GPS or device location.
- Company accounts: invite by email, HR dashboard with the same counters employees see
- Not tax advice, legal advice, or a substitute for your employer, a qualified tax adviser, or the competent social-security institution
- Thresholds shown are taken from public official sources and may change; where a rule cannot be counted, no number is shown and users are pointed to their authority
- Subscriptions: individuals €4.99/month or €49/year (incl. VAT); companies €5/active employee/month (min €39/month, excl. VAT); yearly company minimum €390, excl. VAT (2 months free). 7-day free trial, then the plan chosen at the stated price, charged automatically on day 8 and renewing until cancelled; card required at signup. Checkout via Stripe Managed Payments (sold through Link).
- Contact: ${CFG.contact_email}

## Important pages

- ${BASE}/en/ — English landing
- ${BASE}/fr/ — French landing
- ${BASE}/de/ — German landing
- ${BASE}/it/ — Italian landing
- ${BASE}/nl/ — Dutch landing
- ${BASE}/en/pricing/ — Pricing
- ${BASE}/en/faq/ — FAQ
- ${BASE}/en/for-individuals/ — Individual plan
- ${BASE}/en/company/signup/ — Company sign-up
- ${BASE}/en/employers/ticino/ — Ticino employers (IT→CH, 25% telework + 45 non-return days)
- ${BASE}/en/employers/geneva/ — Geneva employers (FR→CH telework days)
- ${BASE}/en/employers/luxembourg/ — Luxembourg employers (FR/BE/DE→LU, 34-day tax + SS framework)
- ${BASE}/en/privacy/ — Privacy
- ${BASE}/en/dpa/ — Data processing agreement (company accounts)
- ${BASE}/en/disclaimer/ — Legal disclaimer
- ${BASE}/en/accessibility/ — Accessibility
- ${BASE}/en/terms/ — Terms and legal notice
- ${BASE}/en/withdrawal/ — Withdraw from contract (EU/EEA consumers)
- ${BASE}/en/cancel/ — Cancel subscription
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

BorderDay is built employer-first: company accounts and an HR dashboard come first; individuals can also subscribe. Employees log day types (telework / on site / work trip or third State / non-working), plus an optional yes/no for a night away for work. Separate counters for tax (where available) and social security. Warnings as limits approach. CSV export. Five languages.

## Pricing (as published on the site)

- Company monthly: €5 per active employee; minimum €39/month (flat for 1–7 active employees); excl. VAT
- Company yearly: 2 months free → €390/year minimum; excl. VAT
- Individual monthly: €4.99 (incl. VAT)
- Individual yearly: €49 (incl. VAT)
- Trial: 7 days free, then the plan chosen at the stated price, charged automatically on day 8 and renewing until cancelled; card required at signup

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

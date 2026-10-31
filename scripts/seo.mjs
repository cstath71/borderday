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
  'accessibility',
  'terms',
  'withdrawal',
  'cancel',
  'company/signup',
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
        'Employer-first day counting for cross-border staff: social-security counters on nine corridors, tax counters on four. Company from €5/employee/month (min €39), excl. VAT. 7-day free trial, then charged automatically on day 8 and renewing until you cancel.',
      h1: 'One place for every border your people work across',
      summary:
        'BorderDay helps HR track telework, on-site and travel days per employee: social-security counters on all nine corridors in five regions, tax counters on four of them. Company plan: €5 per active employee per month (€39 minimum), excl. VAT; individuals €4.99/month or €49/year, incl. VAT. 7-day free trial, then the plan you chose at the stated price, charged automatically on day 8 and renewing until you cancel; card required at signup. A tracking tool — not tax or legal advice.',
      crumbs: [['Home', '']],
    },
    fr: {
      title: 'BorderDay — Seuils de jours fiscaux et sociaux pour les RH',
      description:
        'Comptage des jours pour les équipes qui travaillent par-delà les frontières : sécurité sociale sur neuf corridors, fiscalité sur quatre. Entreprise dès 5 €/collaborateur actif/mois (min. 39 €), hors TVA. Essai gratuit de 7 jours, puis débit automatique le 8e jour et renouvellement jusqu’à résiliation.',
      h1: 'Un seul outil pour toutes les frontières de vos équipes',
      summary:
        'BorderDay aide les RH à suivre télétravail, jours sur site et déplacements par collaborateur : compteurs de sécurité sociale sur les neuf corridors de cinq régions, compteurs fiscaux sur quatre d’entre eux. Offre entreprise : 5 € par collaborateur actif et par mois (minimum 39 €), hors TVA ; particuliers 4,99 €/mois ou 49 €/an, TVA incluse. Essai gratuit de 7 jours, puis l’offre choisie au prix indiqué, débitée automatiquement le 8e jour et renouvelée jusqu’à votre résiliation ; carte requise à l’inscription. Outil de suivi — pas un conseil fiscal ou juridique.',
      crumbs: [['Accueil', '']],
    },
    de: {
      title: 'BorderDay — Grenzüberschreitende Tagesgrenzen für HR',
      description:
        'Tageszählung für Teams über Landesgrenzen: Sozialversicherung auf neun Korridoren, Steuer auf vier. Unternehmen ab 5 € je aktive mitarbeitende Person/Monat (min. 39 €), zzgl. MwSt. 7 Tage kostenlos testen, danach automatische Abbuchung am 8. Tag und Verlängerung bis zur Kündigung.',
      h1: 'Ein Tool für alle Grenzen, über die Ihre Teams arbeiten',
      summary:
        'BorderDay hilft HR, Telearbeit, Vor-Ort- und Reisetage je Mitarbeitenden zu erfassen: Sozialversicherungszähler auf allen neun Korridoren in fünf Regionen, Steuerzähler auf vier davon. Unternehmensplan: 5 € je aktive mitarbeitende Person und Monat (Minimum 39 €), zzgl. MwSt.; Einzelpersonen 4,99 €/Monat oder 49 €/Jahr, inkl. MwSt. 7 Tage kostenlos testen, danach der gewählte Plan zum angegebenen Preis, automatische Abbuchung am 8. Tag und Verlängerung bis zu Ihrer Kündigung; Karte bei der Anmeldung erforderlich. Erfassungstool — keine Steuer- oder Rechtsberatung.',
      crumbs: [['Start', '']],
    },
    it: {
      title: 'BorderDay — Soglie di giorni fiscali e previdenziali per HR',
      description:
        'Conteggio giorni per team che lavorano oltre confine: sicurezza sociale su nove corridoi, fisco su quattro. Azienda da 5 €/collaboratore attivo/mese (min. 39 €), IVA esclusa. Prova gratuita di 7 giorni, poi addebito automatico l’8° giorno e rinnovo fino alla disdetta.',
      h1: 'Un solo strumento per tutti i confini dei vostri team',
      summary:
        'BorderDay aiuta HR a registrare telelavoro, giorni in sede e trasferte per collaboratore: contatori di sicurezza sociale su tutti i nove corridoi in cinque regioni, contatori fiscali su quattro di essi. Piano aziendale: 5 € per collaboratore attivo al mese (minimo 39 €), IVA esclusa; individuali 4,99 €/mese o 49 €/anno, IVA inclusa. Prova gratuita di 7 giorni, poi il piano scelto al prezzo indicato, addebitato automaticamente l’8° giorno e rinnovato fino alla disdetta; carta richiesta all’iscrizione. Strumento di registrazione — non consulenza fiscale o legale.',
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
        'Unternehmen: 5 € je aktive mitarbeitende Person / Monat, Minimum 39 €, jährlich mindestens 390 €, zzgl. MwSt. Einzelperson: 4,99 €/Monat oder 49 €/Jahr inkl. MwSt. 7 Tage kostenlos testen, danach automatische Abbuchung am 8. Tag und Verlängerung bis zur Kündigung.',
      h1: 'Preise',
      summary:
        'Unternehmen / HR: 5 € je aktive mitarbeitende Person und Monat, Minimum 39 € / Monat (deckt bis zu 7 aktive mitarbeitende Personen ab); jährlich mindestens 390 € (2 Monate gratis). Einzelperson: 4,99 € / Monat oder 49 € / Jahr. Unternehmenspreise zzgl. MwSt.; Einzelpreise inkl. MwSt. 7 Tage kostenlos testen, danach der gewählte Plan zum angegebenen Preis, mit automatischer Abbuchung am 8. Tag und Verlängerung bis zu Ihrer Kündigung; Karte bei der Anmeldung erforderlich. Checkout über Stripe Managed Payments (verkauft über Link).',
      crumbs: [
        ['Start', ''],
        ['Preise', 'pricing'],
      ],
    },
    it: {
      title: 'Prezzi — BorderDay',
      description:
        'Azienda: 5 € per collaboratore attivo / mese, minimo 39 €, annuale minimo 390 €, IVA esclusa. Individuale: 4,99 €/mese o 49 €/anno IVA inclusa. Prova gratuita di 7 giorni, poi addebito automatico l’8° giorno e rinnovo fino alla disdetta.',
      h1: 'Prezzi',
      summary:
        'Azienda / HR: 5 € per collaboratore attivo al mese, minimo 39 € / mese (copre fino a 7 collaboratori attivi); annuale minimo 390 € (2 mesi gratis). Individuale: 4,99 € / mese o 49 € / anno. Prezzi azienda IVA esclusa; individuali IVA inclusa. Prova gratuita di 7 giorni, poi il piano scelto al prezzo indicato, addebitato automaticamente l’8° giorno e rinnovato fino alla disdetta; carta richiesta all’iscrizione. Checkout tramite Stripe Managed Payments (venduto tramite Link).',
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
        'BorderDay is a record-keeping and reminder tool, not tax or legal advice. Paid day logs are saved to your account, the free preview stays on the device; no GPS or device location. Nine corridors: social-security counters on all, tax counters on four (Geneva and other non-1983 cantons, Germany→Switzerland, France→Luxembourg, Italy→Switzerland). 7-day free trial, then the plan you chose at the stated price, charged automatically on day 8 and renewing until you cancel; card required at signup.',
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
        'BorderDay est un outil de suivi et de rappel, pas un conseil fiscal ou juridique. Avec un abonnement, le journal est enregistré dans votre compte ; l’aperçu gratuit reste sur l’appareil ; ni GPS ni localisation de l’appareil. Neuf corridors : compteurs de sécurité sociale sur tous, compteurs fiscaux sur quatre (Genève et autres cantons hors accord de 1983, Allemagne→Suisse, France→Luxembourg, Italie→Suisse). Essai gratuit de 7 jours, puis l’offre choisie au prix indiqué, débitée automatiquement le 8e jour et renouvelée jusqu’à votre résiliation ; carte requise à l’inscription.',
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
        'BorderDay ist ein Erfassungs- und Erinnerungstool, keine Steuer- oder Rechtsberatung. Mit Abo wird das Protokoll im Konto gespeichert, die Gratisvorschau bleibt auf dem Gerät; kein GPS und kein Gerätestandort. Neun Korridore: Sozialversicherungszähler auf allen, Steuerzähler auf vier (Genf und weitere Kantone ausserhalb des Abkommens von 1983, Deutschland→Schweiz, Frankreich→Luxemburg, Italien→Schweiz). 7 Tage kostenlos testen, danach der gewählte Plan zum angegebenen Preis, mit automatischer Abbuchung am 8. Tag und Verlängerung bis zu Ihrer Kündigung; Karte bei der Anmeldung erforderlich.',
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
        'BorderDay è uno strumento di registrazione e promemoria, non consulenza fiscale o legale. Con un piano il registro è salvato nell’account, l’anteprima gratuita resta sul dispositivo; niente GPS né posizione del dispositivo. Nove corridoi: contatori di sicurezza sociale su tutti, contatori fiscali su quattro (Ginevra e altri cantoni fuori dall’accordo del 1983, Germania→Svizzera, Francia→Lussemburgo, Italia→Svizzera). Prova gratuita di 7 giorni, poi il piano scelto al prezzo indicato, addebitato automaticamente l’8° giorno e rinnovato fino alla disdetta; carta richiesta all’iscrizione.',
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
        'Log your own telework and border days: social-security counters on every corridor, tax counters where the rule can be counted today. €4.99/month or €49/year incl. VAT. 7-day free trial, then charged automatically on day 8 and renewing until you cancel.',
      h1: 'Log your own border days',
      summary:
        'Employees and self-trackers can log telework, on-site, trip and non-working days. Social-security counters run on every corridor; tax counters run on four. Individual plan: €4.99/month or €49/year (incl. VAT). 7-day free trial, then the plan you chose at the stated price, charged automatically on day 8 and renewing until you cancel; card required at signup. If your employer uses BorderDay, join via their invite link to share the same counters with HR.',
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
        'Salariés et utilisateurs individuels peuvent enregistrer télétravail, jours sur site, déplacements et jours non travaillés. Compteurs de sécurité sociale sur chaque corridor, compteurs fiscaux sur quatre. Offre individuelle : 4,99 €/mois ou 49 €/an (TVA incluse). Essai gratuit de 7 jours, puis l’offre choisie au prix indiqué, débitée automatiquement le 8e jour et renouvelée jusqu’à votre résiliation ; carte requise à l’inscription. Si votre employeur utilise BorderDay, rejoignez-le via son lien d’invitation pour partager les mêmes compteurs avec les RH.',
      crumbs: [
        ['Accueil', ''],
        ['Pour les particuliers', 'for-individuals'],
      ],
    },
    de: {
      title: 'Für Einzelpersonen — BorderDay',
      description:
        'Eigene Telearbeits- und Reisetage erfassen. 4,99 €/Monat oder 49 €/Jahr inkl. MwSt. 7 Tage kostenlos testen, danach automatische Abbuchung am 8. Tag und Verlängerung bis zur Kündigung.',
      h1: 'Eigene Arbeitstage über die Grenze erfassen',
      summary:
        'Mitarbeitende erfassen Telearbeit, Vor-Ort-, Reise- und arbeitsfreie Tage selbst. Sozialversicherungszähler auf jedem Korridor, Steuerzähler auf vier. Einzelplan: 4,99 €/Monat oder 49 €/Jahr (inkl. MwSt.). 7 Tage kostenlos testen, danach der gewählte Plan zum angegebenen Preis, mit automatischer Abbuchung am 8. Tag und Verlängerung bis zu Ihrer Kündigung; Karte bei der Anmeldung erforderlich. Nutzt der Arbeitgeber BorderDay, Beitritt über den Einladungslink: dieselben Zähler wie HR.',
      crumbs: [
        ['Start', ''],
        ['Für Einzelpersonen', 'for-individuals'],
      ],
    },
    it: {
      title: 'Per i privati — BorderDay',
      description:
        'Registrate telelavoro e giorni di confine. 4,99 €/mese o 49 €/anno IVA inclusa. Prova gratuita di 7 giorni, poi addebito automatico l’8° giorno e rinnovo fino alla disdetta.',
      h1: 'Registrate i vostri giorni di confine',
      summary:
        'Dipendenti e chi tiene il proprio registro possono inserire telelavoro, giorni in sede, trasferte e giorni non lavorati. Contatori di sicurezza sociale su ogni corridoio, contatori fiscali su quattro. Piano individuale: 4,99 €/mese o 49 €/anno (IVA inclusa). Prova gratuita di 7 giorni, poi il piano scelto al prezzo indicato, addebitato automaticamente l’8° giorno e rinnovato fino alla disdetta; carta richiesta all’iscrizione. Se il datore di lavoro usa BorderDay, entrate con il link di invito per condividere gli stessi contatori con HR.',
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
        'Kein GPS und kein Gerätestandort: HR sieht je Datum die Tagesart und auswärtige Übernachtung ja/nein, eine Länderkategorie, nie Koordinaten. Der Arbeitgeber ist Verantwortlicher für die Tagesprotokolle der Mitarbeitenden. Empfänger: Supabase (Hosting in der EU), Resend, GitHub Pages, Zoho, Google falls gewählt, sowie Stripe/Link als unabhängige Verantwortliche. Kontakt privacy@borderday.com.',
      crumbs: [
        ['Start', ''],
        ['Datenschutz', 'privacy'],
      ],
    },
    it: {
      title: 'Privacy — BorderDay',
      description:
        'Come BorderDay tratta i dati personali: finalità, basi giuridiche, destinatari, trasferimenti, conservazione e vostri diritti (GDPR e LPD svizzera). Niente GPS né posizione del dispositivo.',
      h1: 'Privacy',
      summary:
        'Niente GPS né posizione del dispositivo: l’HR vede per data il tipo di giorno e la notte fuori sì/no, una categoria di paese, mai coordinate. Il datore di lavoro è titolare dei registri dei dipendenti. Destinatari: Supabase (hosting UE), Resend, GitHub Pages, Zoho, Google se scelto, e Stripe/Link come titolari autonomi. Contatto privacy@borderday.com.',
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
  accessibility: {
    en: {
      title: 'Accessibility — BorderDay',
      description:
        'BorderDay accessibility statement: scope, current status and how to report barriers. Feedback: hello@borderday.com.',
      h1: 'Accessibility',
      summary:
        'We aim for WCAG 2.2 Level AA. Automated axe scans of the main screens reported no violations on 31 October 2026; manual gaps remain and are listed on this page.',
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
        'Nous visons le niveau AA des WCAG 2.2. Les scans axe des écrans principaux n’ont signalé aucune violation le 31 octobre 2026 ; des écarts manuels restent listés sur cette page.',
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
        'Wir orientieren uns an WCAG 2.2 Stufe AA. Automatisierte axe-Scans meldeten am 31. Oktober 2026 keine Verstösse; manuelle Lücken stehen auf dieser Seite.',
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
        'Miriamo al livello AA delle WCAG 2.2. Gli scan axe delle schermate principali non hanno segnalato violazioni il 31 ottobre 2026; le lacune manuali sono elencate in questa pagina.',
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
      title: 'AGB & Impressum — BorderDay',
      description:
        'AGB und Impressum von BorderDay: Testphase und automatische Verlängerung, Kündigung, MwSt., 14-tägiges EU-Widerrufsrecht für Verbraucher.',
      h1: 'AGB & Impressum',
      summary:
        'Abos beginnen mit einer 7-tägigen kostenlosen Testphase: Danach wird der Plan zum angegebenen Preis kostenpflichtig, mit automatischer Abbuchung am 8. Tag und Verlängerung bis zu Ihrer Kündigung. Unternehmenspreise zzgl. MwSt.; Einzelpreise inkl. MwSt. EU-Widerruf und Kündigung sind auf dieser Seite beschrieben.',
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
      summary: 'EU/EEA consumers who bought an individual plan can withdraw within 14 days of receiving access, without giving a reason. This page prepares the message to privacy@borderday.com; Link support can also be contacted for the Order.',
      crumbs: [
        ['Home', ''],
        ['Withdraw from contract', 'withdrawal'],
      ],
    },
    fr: {
      title: 'Se rétracter du contrat — BorderDay',
      description: 'Comment les consommateurs UE/EEE se rétractent d’une offre individuelle BorderDay dans les 14 jours suivant la réception de l’accès, sans motif.',
      h1: 'Se rétracter du contrat',
      summary: 'Les consommateurs UE/EEE ayant acheté une offre individuelle peuvent se rétracter dans les 14 jours suivant la réception de l’accès, sans motif. Cette page prépare le message à privacy@borderday.com ; le support Link peut aussi être contacté pour la commande.',
      crumbs: [
        ['Accueil', ''],
        ['Se rétracter du contrat', 'withdrawal'],
      ],
    },
    de: {
      title: 'Vertrag widerrufen — BorderDay',
      description: 'So widerrufen Verbraucher in der EU/im EWR einen BorderDay-Einzelplan innerhalb von 14 Tagen ab Erhalt des Zugangs ohne Angabe von Gründen.',
      h1: 'Vertrag widerrufen',
      summary: 'Verbraucher in der EU/im EWR mit Einzelplan können innerhalb von 14 Tagen ab Erhalt des Zugangs ohne Angabe von Gründen widerrufen. Diese Seite bereitet die Nachricht an privacy@borderday.com vor; auch der Link-Support kann zur Bestellung kontaktiert werden.',
      crumbs: [
        ['Start', ''],
        ['Vertrag widerrufen', 'withdrawal'],
      ],
    },
    it: {
      title: 'Recedere dal contratto — BorderDay',
      description: 'Come i consumatori UE/SEE recedono da un piano individuale BorderDay entro 14 giorni dalla ricezione dell’accesso, senza indicare il motivo.',
      h1: 'Recedere dal contratto',
      summary: 'I consumatori UE/SEE con un piano individuale possono recedere entro 14 giorni dalla ricezione dell’accesso, senza indicare il motivo. Questa pagina prepara il messaggio a privacy@borderday.com; si può anche contattare il supporto Link per l’ordine.',
      crumbs: [
        ['Home', ''],
        ['Recedere dal contratto', 'withdrawal'],
      ],
    },
  },
  cancel: {
    en: {
      title: 'Cancel subscription — BorderDay',
      description: 'Cancel a BorderDay subscription: from your account, through Link, or by email without signing in. Cancellation stops future renewals.',
      h1: 'Cancel subscription',
      summary: 'Cancel your BorderDay subscription here. Cancellation stops future renewals. If you cancel before day 8 of your trial, nothing is charged.',
      crumbs: [
        ['Home', ''],
        ['Cancel subscription', 'cancel'],
      ],
    },
    fr: {
      title: 'Résilier votre contrat — BorderDay',
      description: 'Résilier un abonnement BorderDay : depuis votre compte, via Link, ou par e-mail sans vous connecter. La résiliation arrête les renouvellements futurs.',
      h1: 'Résilier votre contrat',
      summary: 'Résiliez ici votre abonnement BorderDay. La résiliation arrête les renouvellements futurs. Si vous résiliez avant le 8e jour de l’essai, rien n’est débité.',
      crumbs: [
        ['Accueil', ''],
        ['Résilier votre contrat', 'cancel'],
      ],
    },
    de: {
      title: 'Verträge hier kündigen — BorderDay',
      description: 'BorderDay-Abo kündigen: aus Ihrem Konto, über Link oder per E-Mail ohne Anmeldung. Die Kündigung stoppt künftige Verlängerungen.',
      h1: 'Verträge hier kündigen',
      summary: 'Kündigen Sie hier Ihr BorderDay-Abo. Die Kündigung stoppt künftige Verlängerungen. Kündigen Sie vor dem 8. Tag der Testphase, wird nichts abgebucht.',
      crumbs: [
        ['Start', ''],
        ['Verträge hier kündigen', 'cancel'],
      ],
    },
    it: {
      title: 'Disdire il contratto — BorderDay',
      description: 'Disdire un abbonamento BorderDay: dall’account, tramite Link o via e-mail senza accedere. La disdetta interrompe i rinnovi futuri.',
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
        'Create a BorderDay company account for HR day counting across nine corridors. Then subscribe on Pricing (€5/active employee/month, min €39, excl. VAT).',
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
        'Créez un compte entreprise BorderDay pour le suivi RH sur neuf corridors. Puis abonnez-vous (5 €/collaborateur actif/mois, min. 39 €, hors TVA).',
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
        'BorderDay-Unternehmenskonto für HR-Tageszählung auf neun Korridoren. Danach Abo unter Preise (5 € je aktive mitarbeitende Person/Monat, min. 39 €, zzgl. MwSt.).',
      h1: 'Unternehmensregistrierung',
      summary:
        'Unternehmenskonto mit E-Mail oder Google anlegen, Mitarbeitende einladen, unter Preise abonnieren. Plan: 5 € je aktive mitarbeitende Person und Monat, Minimum 39 €, zzgl. MwSt. 7 Tage kostenlos testen, danach der gewählte Plan zum angegebenen Preis, mit automatischer Abbuchung am 8. Tag und Verlängerung bis zu Ihrer Kündigung; Karte bei der Anmeldung erforderlich.',
      crumbs: [
        ['Start', ''],
        ['Unternehmensregistrierung', 'company/signup'],
      ],
    },
    it: {
      title: 'Registrazione azienda — BorderDay',
      description:
        'Create un account aziendale BorderDay per il conteggio HR su nove corridoi. Poi abbonatevi (5 €/collaboratore attivo/mese, min. 39 €, IVA esclusa).',
      h1: 'Registrazione azienda',
      summary:
        'Create un account aziendale con e-mail o Google, invitate i collaboratori e abbonatevi in Prezzi. Piano: 5 € per collaboratore attivo al mese, minimo 39 €, IVA esclusa. Prova gratuita di 7 giorni, poi il piano scelto al prezzo indicato, addebitato automaticamente l’8° giorno e rinnovato fino alla disdetta; carta richiesta all’iscrizione.',
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
      'No. It is a record-keeping and reminder tool for employers and employees. Thresholds are taken from public official sources and may change. Always verify with your employer, a qualified adviser, or the competent authority.',
    ],
    [
      'Where is my day log stored?',
      'Without a plan, only on your device (IndexedDB in the browser). With an active plan or a company account, in your BorderDay account. Either way you can export JSON or CSV, or delete everything.',
    ],
    [
      'Do you track my location?',
      'No. You log days yourself. No GPS or device location. HR sees day type (and overnight-away yes/no) per date — country category, never coordinates. Notes are private to the employee.',
    ],
    [
      'Which borders do you cover?',
      'Nine corridors in five regions. Social-security counters on all nine. Tax counters on four: Geneva and other non-1983 cantons←France, Germany→Switzerland, France→Luxembourg and Italy→Switzerland. No tax counter yet: the 1983-agreement cantons←France (Basel and others), Belgium→Luxembourg, Germany→Luxembourg, France→Belgium and Netherlands→Belgium.',
    ],
    [
      'How much does BorderDay cost?',
      'Company: €5 per active employee per month with a €39 monthly minimum; yearly €390 minimum (2 months free). Individual: €4.99/month or €49/year. Company prices exclude VAT; individual prices include VAT. 7-day free trial, then the plan you chose at the stated price, charged automatically on day 8 and renewing until you cancel; card required at signup.',
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
      'Non. Vous enregistrez les jours vous-même. Ni GPS ni localisation de l’appareil. Les RH voient par date le type de jour (et la nuit hors du domicile, oui ou non) : une catégorie de pays, jamais des coordonnées. Les notes restent privées pour le collaborateur.',
    ],
    [
      'Quelles frontières couvrez-vous ?',
      'Neuf corridors dans cinq régions. Compteurs de sécurité sociale sur les neuf. Compteurs fiscaux sur quatre : Genève et autres cantons hors accord de 1983←France, Allemagne→Suisse, France→Luxembourg et Italie→Suisse. Pas encore de compteur fiscal : cantons de l’accord de 1983←France (Bâle et autres), Belgique→Luxembourg, Allemagne→Luxembourg, France→Belgique et Pays-Bas→Belgique.',
    ],
    [
      'Combien coûte BorderDay ?',
      'Entreprise : 5 € par collaborateur actif et par mois, minimum 39 € ; annuel 390 € minimum (2 mois offerts). Particulier : 4,99 €/mois ou 49 €/an. Prix entreprise hors TVA ; particulier TVA incluse. Essai gratuit de 7 jours, puis l’offre choisie au prix indiqué, débitée automatiquement le 8e jour et renouvelée jusqu’à votre résiliation ; carte requise à l’inscription.',
    ],
    [
      'Comment fonctionnent les paiements ?',
      'Le paiement utilise Stripe Managed Payments : Link est le marchand officiel (merchant of record) et gère TVA/GST. Codes promo acceptés. Voir les CGU pour la résiliation et le droit de rétractation UE de 14 jours.',
    ],
    [
      'Que ne couvre pas BorderDay ?',
      'Les indépendants, les règles propres au secteur public, les personnes ayant des employeurs dans plusieurs États et le travail sans lien informatique au sens de l’accord-cadre. Les corridors non listés, comme France→Allemagne ou Pays-Bas→Allemagne. Les compteurs ne voient que les jours consignés ici : les autres emplois de l’année ne sont pas inclus. Les compteurs fiscaux n’existent pas sur tous les corridors. L’export CSV est un document de travail, pas une déclaration officielle comme le taux de télétravail annuel exigé par certains cantons. En cas de doute, vérifiez auprès de votre autorité.',
    ],
  ],
  de: [
    [
      'Ist BorderDay Steuer- oder Rechtsberatung?',
      'Nein. Es ist ein Erfassungs- und Erinnerungstool. Grenzwerte stammen aus öffentlichen amtlichen Quellen und können sich ändern. Stets bei Arbeitgeber, Fachperson oder zuständiger Behörde prüfen.',
    ],
    [
      'Wo wird mein Tagesprotokoll gespeichert?',
      'Ohne Abo nur auf Ihrem Gerät (IndexedDB im Browser). Mit aktivem Abo oder Unternehmenskonto in Ihrem BorderDay-Konto. In beiden Fällen können Sie JSON oder CSV exportieren oder alles löschen.',
    ],
    [
      'Erfassen Sie meinen Standort?',
      'Nein. Sie erfassen die Tage selbst. Kein GPS und kein Gerätestandort. HR sieht je Datum die Tagesart (und auswärtige Übernachtung ja/nein): eine Länderkategorie, nie Koordinaten. Notizen bleiben für die mitarbeitende Person privat.',
    ],
    [
      'Welche Grenzen decken Sie ab?',
      'Neun Korridore in fünf Regionen. Sozialversicherungszähler auf allen neun. Steuerzähler auf vier: Genf und weitere Kantone ausserhalb des Abkommens von 1983←Frankreich, Deutschland→Schweiz, Frankreich→Luxemburg und Italien→Schweiz. Noch kein Steuerzähler: Kantone des Abkommens von 1983←Frankreich (Basel und andere), Belgien→Luxemburg, Deutschland→Luxemburg, Frankreich→Belgien und Niederlande→Belgien.',
    ],
    [
      'Was kostet BorderDay?',
      'Unternehmen: 5 € je aktive mitarbeitende Person und Monat, Minimum 39 €; jährlich mindestens 390 € (2 Monate gratis). Einzelperson: 4,99 €/Monat oder 49 €/Jahr. Unternehmenspreise zzgl. MwSt.; Einzelpreise inkl. MwSt. 7 Tage kostenlos testen, danach der gewählte Plan zum angegebenen Preis, mit automatischer Abbuchung am 8. Tag und Verlängerung bis zu Ihrer Kündigung; Karte bei der Anmeldung erforderlich.',
    ],
    [
      'Wie funktionieren Zahlungen?',
      'Checkout über Stripe Managed Payments: Link ist Merchant of Record und handhabt MwSt./GST. Promo-Codes möglich. Kündigung und 14-tägiges EU-Widerrufsrecht: siehe AGB.',
    ],
    [
      'Was deckt BorderDay nicht ab?',
      'Selbständige, Sonderregeln des öffentlichen Sektors, Personen mit Arbeitgebern in mehreren Staaten und Arbeit ohne IT-Anbindung im Sinne des Rahmenübereinkommens. Nicht aufgeführte Korridore wie Frankreich→Deutschland oder Niederlande→Deutschland. Zähler sehen nur hier erfasste Tage, andere Stellen im Jahr sind nicht enthalten. Steuerzähler gibt es nicht auf jedem Korridor. Der CSV-Export ist eine Arbeitsunterlage, keine amtliche Meldung wie die von manchen Kantonen verlangte jährliche Telearbeitsquote. Im Zweifel fragen Sie Ihre Behörde.',
    ],
  ],
  it: [
    [
      'BorderDay è consulenza fiscale o legale?',
      'No. È uno strumento di registrazione e promemoria. Le soglie provengono da fonti ufficiali pubbliche e possono cambiare. Verificate sempre con il datore di lavoro, un consulente qualificato o l’autorità competente.',
    ],
    [
      'Dove è memorizzato il diario dei giorni?',
      'Senza abbonamento, solo sul vostro dispositivo (IndexedDB nel browser). Con un abbonamento attivo o un account aziendale, nel vostro account BorderDay. In ogni caso potete esportare JSON o CSV, o eliminare tutto.',
    ],
    [
      'Tracciate la mia posizione?',
      'No. Registrate voi i giorni. Niente GPS né posizione del dispositivo. L’HR vede per ogni data il tipo di giorno (e notte fuori sì/no): una categoria di paese, mai coordinate. Le note restano private per il dipendente.',
    ],
    [
      'Quali confini coprite?',
      'Nove corridoi in cinque regioni. Contatori di sicurezza sociale su tutti i nove. Contatori fiscali su quattro: Ginevra e altri cantoni fuori dall’accordo del 1983←Francia, Germania→Svizzera, Francia→Lussemburgo e Italia→Svizzera. Nessun contatore fiscale per ora: cantoni dell’accordo del 1983←Francia (Basilea e altri), Belgio→Lussemburgo, Germania→Lussemburgo, Francia→Belgio e Paesi Bassi→Belgio.',
    ],
    [
      'Quanto costa BorderDay?',
      'Azienda: 5 € per collaboratore attivo al mese, minimo 39 €; annuale minimo 390 € (2 mesi gratis). Individuale: 4,99 €/mese o 49 €/anno. Prezzi azienda IVA esclusa; individuali IVA inclusa. Prova gratuita di 7 giorni, poi il piano scelto al prezzo indicato, addebitato automaticamente l’8° giorno e rinnovato fino alla disdetta; carta richiesta all’iscrizione.',
    ],
    [
      'Come funzionano i pagamenti?',
      'Il checkout usa Stripe Managed Payments: Link è il merchant of record e gestisce IVA/GST. Codici promo supportati. Vedete le Condizioni per disdetta e recesso UE di 14 giorni.',
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

> BorderDay is an employer-first record-keeping and reminder tool for cross-border day counting. HR and employees track telework, on-site, trip and non-working days. Social-security telework counters run on all nine corridors; tax counters run on four. HR sees day types per date, night-away marks and counts, never GPS or device location.

- Site: ${BASE}
- Languages: English, French, German, Italian
- Corridors covered (v1): nine, in five regions (Geneva, Basel, Ticino, Luxembourg, Belgium)
- Social-security counters: all nine corridors (EU/EEA/CH framework: under 25%, 25% to under 50% with A1, 50% or more)
- Tax counters running: Geneva and other non-1983 cantons←France (40% / 10 mission days), Germany→Switzerland (60 non-return days), France→Luxembourg (34 days, reduced for part-time), Italy→Switzerland (25% / 45 non-return days)
- No tax counter yet: 1983-agreement cantons←France (Basel and others, regime under review), Belgium→Luxembourg, Germany→Luxembourg, France→Belgium, Netherlands→Belgium. Do not describe BorderDay as tracking tax limits on these corridors.
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
- ${BASE}/en/pricing/ — Pricing
- ${BASE}/en/faq/ — FAQ
- ${BASE}/en/for-individuals/ — Individual plan
- ${BASE}/en/company/signup/ — Company sign-up
- ${BASE}/en/privacy/ — Privacy
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

BorderDay is built employer-first: company accounts and an HR dashboard come first; individuals can also subscribe. Employees log day types (telework / on site / third country / non-working), plus an optional yes/no for a night away for work. Separate counters for tax (where available) and social security. Warnings as limits approach. CSV export. Four languages.

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

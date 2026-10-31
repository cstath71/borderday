import type { Dict } from './en';

const de: Dict = {
  meta: {
    siteName: 'BorderDay',
    tagline: 'Arbeitstage über Grenzen hinweg im Blick — vor den Schwellen.',
    description:
      'BorderDay hilft Ihnen, Telearbeit, Vor-Ort-Tage und Dienstreisen gegen amtliche steuerliche und sozialversicherungsrechtliche Schwellen europäischer Grenzen zu erfassen. Persönliches Dokumentationstool — keine Steuerberatung.',
  },
  nav: {
    home: 'Start',
    app: 'App',
    pricing: 'Preise',
    faq: 'FAQ',
    privacy: 'Datenschutz',
    disclaimer: 'Haftungsausschluss',
    openApp: 'App öffnen',
    joinWaitlist: 'Warteliste beitreten',
  },
  lang: {
    en: 'English',
    fr: 'Français',
    de: 'Deutsch',
    it: 'Italiano',
    label: 'Sprache',
  },
  home: {
    heroTitle: 'Wissen, wo Sie bei Ihren Grenztag-Schwellen stehen',
    heroBody:
      'Erfassen Sie jeden Arbeitstag als Telearbeit zu Hause, vor Ort, Dienstreise oder arbeitsfreien Tag. BorderDay zählt sie gegen die amtlichen Steuer- und Sozialversicherungsregeln Ihrer Grenze — und warnt, bevor Sie nah herankommen.',
    ctaPrimary: 'Loslegen (kostenlos auf Ihrem Gerät)',
    ctaSecondary: 'Preise ansehen',
    feature1Title: 'Vier Tagesarten',
    feature1Body:
      'Telearbeit zu Hause, vor Ort am Arbeitsplatz, Drittstaat / Dienstreise und arbeitsfreie Tage — jeweils so gezählt, wie es die Regeln Ihrer Grenze vorsehen.',
    feature2Title: 'Steuer und Sozialversicherung getrennt',
    feature2Body:
      'Die Schwellen sind unabhängige Systeme. BorderDay führt für jede einen Zähler mit amtlichem Grenzwert und Quellenlink.',
    feature3Title: 'Lokal zuerst — Datenschutz',
    feature3Body:
      'Ihr Tagesprotokoll bleibt auf Ihrem Gerät. Jederzeit exportieren oder löschen. Kein fortlaufendes Standort-Tracking.',
    bordersTitle: 'Abgedeckte Grenzen in Version 1',
    bordersIntro:
      'Regeln stammen aus öffentlichen amtlichen Quellen. Zähler, die noch bestätigt werden, zeigen „Regel wird bestätigt“ und bleiben deaktiviert.',
    howTitle: 'So funktioniert es',
    how1: 'Wählen Sie Ihre Grenze (Wohnsitzstaat → Staat des Arbeitsorts).',
    how2: 'Erfassen Sie jeden Tag mit wenigen Tippen.',
    how3: 'Beobachten Sie Steuer- und Sozialversicherungszähler. Warnungen bei 75 %, 90 % und 100 %.',
    waitlistTitle: 'Zahlungen demnächst',
    waitlistBody:
      'Der Checkout ist noch nicht aktiv. Hinterlassen Sie Ihre E-Mail, und wir benachrichtigen Sie, wenn Einzel- und Firmenabonnements starten. Bis dahin können Sie den Tageslogger kostenlos auf Ihrem Gerät nutzen.',
    waitlistPlaceholder: 'sie@beispiel.com',
    waitlistButton: 'Benachrichtigen',
    waitlistNote: 'Nur gespeichert, wenn Sie absenden. Kein Spam.',
    disclaimerShort:
      'BorderDay ist ein persönliches Dokumentations- und Erinnerungstool. Es ist keine Steuer- oder Rechtsberatung.',
  },
  borders: {
    geneva_fr: 'Genf / Romandie ← Frankreich',
    basel_fr: 'Basel ← Frankreich',
    basel_de: 'Basel ← Deutschland',
    luxembourg_fr: 'Luxemburg ← Frankreich',
    luxembourg_be: 'Luxemburg ← Belgien',
    luxembourg_de: 'Luxemburg ← Deutschland',
    belgium_fr: 'Belgien ← Frankreich',
    belgium_nl: 'Belgien ← Niederlande',
    ticino_it: 'Tessin ← Italien',
    geneva_region: 'Kantone, die unter den französisch-schweizerischen Steueravenant zur Telearbeit fallen (ab 1. Jan. 2026).',
    basel_region: 'Nordwestschweiz / Region Basel.',
    ticino_region: 'Abkommen Italien–Schweiz zu Grenzgängern, geändert für Telearbeit.',
  },
  dayTypes: {
    telework: 'Telearbeit zu Hause',
    onsite: 'Vor Ort am Arbeitsplatz',
    third_country: 'Drittstaat / Dienstreise',
    non_working: 'Arbeitsfreier Tag',
    teleworkHint: 'Arbeitstag im Wohnsitzstaat (Zuhause oder lokales Coworking).',
    onsiteHint: 'Arbeitstag in den Räumen des Arbeitgebers im Staat des Arbeitsorts.',
    third_countryHint: 'Dienstreise, Schulung, Kundenbesuch oder vorübergehende Mission außerhalb des Staats des Arbeitsorts.',
    non_workingHint: 'Urlaub, nicht gearbeiteter Feiertag, Krankheit oder Ruhetag.',
  },
  counters: {
    tax: 'Steuer',
    social_security: 'Sozialversicherung',
    ch_fr_tax_telework_40: 'Telearbeitsanteil (max. 40 % der jährlichen Arbeitszeit)',
    ch_fr_tax_missions_10: 'Vorübergehende Missionen außerhalb der Schweiz (max. 10 Tage/Jahr)',
    ch_fr_tax_note:
      'Nach der französisch-schweizerischen Verständigungsvereinbarung kann Telearbeit aus Frankreich bis zu 40 % der jährlichen Arbeitszeit in der Schweiz steuerpflichtig bleiben. Vorübergehende Missionen (bis 10 Tage/Jahr, anteilig) liegen innerhalb dieser Ausdrucksweise. Quelle: ge.ch / ESTV.',
    ch_fr_missions_note:
      'Bis zu 10 Tage pro Jahr vorübergehende Missionen in Frankreich oder einem Drittstaat können innerhalb der Telearbeits-Ausdrucksweise behandelt werden, vorbehaltlich der 40-%-Grenze. Teiljahr / Teilzeit: Grenze anteilig, aufgerundet. Quelle: ESTV-Verständigungsvereinbarung.',
    lu_tax_tolerance_34: 'Tage außerhalb Luxemburgs (Toleranzschwelle: 34 Tage)',
    lu_tax_tolerance_pending: 'Tage außerhalb Luxemburgs (steuerliche Toleranz)',
    lu_fr_tax_note:
      'Für in Frankreich ansässige Beschäftigte in Luxemburg: 34 Tage je Besteuerungszeitraum physisch in Frankreich und/oder einem Drittstaat zur Ausübung der Beschäftigung, ohne die luxemburgische Besteuerung für den gesamten Zeitraum zu verlieren. Jeder Bruchteil eines Tages zählt als voller Tag. Urlaub, Wochenruhe, Feiertage (ohne Arbeitspflicht), Krankheit und höhere Gewalt sind ausgenommen. Quelle: Verständigungsvereinbarung impots.gouv.fr.',
    ss_framework_under_50: 'Grenzüberschreitende Telearbeit (Rahmenvereinbarung: unter 50 %)',
    ss_framework_note:
      'Nach der Rahmenvereinbarung EU/EWR/CH zur grenzüberschreitenden Telearbeit kann gewöhnliche Telearbeit im Wohnsitzstaat unter 50 % der gesamten Arbeitszeit die Sozialversicherung des Arbeitgeberstaats belassen, wenn beide Staaten unterzeichnet haben und eine A1-Bescheinigung beantragt wird. Quelle: FÖD Soziale Sicherheit Belgien (Verwahrer); CLEISS.',
    ss_framework_lu_note:
      'CCSS Luxemburg: Telearbeit ausschließlich im Wohnsitzstaat, zwischen 25 % und unter 50 % der gesamten Arbeitszeit, beide Staaten unterzeichnet → Arbeitgeber kann A1 beantragen, damit luxemburgischer Schutz fortbesteht. Gewöhnliche Nicht-Telearbeit im Wohnsitzstaat oder Arbeit in einem anderen Mitgliedstaat kann aus dem Rahmen fallen. Quelle: CCSS.',
    ch_it_tax_telework_25: 'Telearbeit am Wohnsitz (max. 25 % der unselbständigen Tätigkeit)',
    ch_it_tax_nonreturn_45: 'Tage ohne tägliche Rückkehr nach Hause (max. 45 Tage/Jahr)',
    ch_it_tax_note:
      'Nach dem Änderungsprotokoll zum Abkommen Italien–Schweiz darf ein Grenzgänger höchstens 25 % der unselbständigen Tätigkeit in einem Kalenderjahr als Telearbeit am Wohnsitz im Wohnsitzstaat ausüben, ohne Status oder steuerliche Behandlung dieser Telearbeit zu ändern. Quelle: Fedlex RU 2026 104; EDI (SIF).',
    ch_it_nonreturn_note:
      'Grundsätzlich bis zu 45 Tage in einem Kalenderjahr ohne tägliche Rückkehr nach Hause aus beruflichen Gründen (Urlaubs- und Krankheitstage zählen nicht zu diesen 45). Quelle: Fedlex-Änderungsprotokoll.',
    basel_de_tax_pending: 'Steuerliche Tagesregeln Deutschland–Schweiz',
    basel_de_employer_commute: 'Arbeitgeberpraxis (Basel-Stadt): Vor-Ort-Tage diesen Monat (Untergrenze ≈ 5)',
    basel_de_employer_note:
      'HR-Vorgaben Basel-Stadt (Stand 1. Jan. 2026): Homeoffice nur, wenn die Beschäftigten mindestens 1 Tag pro Woche oder mindestens 5 Tage pro Monat an den Schweizer Arbeitsplatz pendeln. Arbeitgeberpraxis, kein veröffentlichter bundessteuerlicher Tageszähler. Quelle: Finanzdepartement Kanton Basel-Stadt.',
    be_tax_pending: 'Steuerliche Tagesregeln für belgische Korridore',
    ruleBeingConfirmed: 'Regel wird bestätigt',
    pending_bmf:
      'Die genauen steuerlichen Tages-/Nicht-Rückkehr-Regeln Deutschland–Schweiz für diesen Korridor werden anhand der BMF-Konsultationstexte bestätigt. Dieser Zähler bleibt bis dahin deaktiviert.',
    pending_lu_be_tax:
      'Die luxemburgische Steuertoleranz für in Belgien Ansässige wird oft als 34 Tage beschrieben, aber die primären ACD-/SPF-Finances-Seiten wurden für diese Version nicht bestätigt. Zähler deaktiviert.',
    pending_lu_de_tax:
      'Die luxemburgische Steuertoleranz für in Deutschland Ansässige (einschließlich einer möglichen 30-Minuten-Regel) wird anhand der ACD-/BMF-Primärseiten bestätigt. Zähler deaktiviert.',
    pending_be_tax:
      'Keine einfache öffentliche Tagestoleranz für FR→BE oder NL→BE wurde auf SPF Finances für diese Version verifiziert. Steuerzähler deaktiviert; der Rahmenvereinbarungs-Zähler der Sozialversicherung bleibt verfügbar.',
    usedOf: '{used} von {limit}',
    percentUsed: '{used} % von {limit} %',
    status_ok: 'Innerhalb der Grenze',
    status_warn: 'Grenze nähert sich',
    status_critical: 'Nahe der Grenze',
    status_over: 'Über der Grenze',
    status_disabled: 'Noch nicht verfügbar',
    sourceLink: 'Amtliche Quelle',
    checkedOn: 'Geprüft am {date}',
  },
  app: {
    title: 'Ihr Tagesprotokoll',
    pickBorder: 'Ihre Grenze',
    pickBorderHint: 'Wohnsitz → Arbeitsort',
    today: 'Heute',
    logDay: 'Diesen Tag erfassen',
    changeDay: 'Ändern',
    calendar: 'Kalender',
    counters: 'Ihre Zähler',
    noBorder: 'Wählen Sie ein Grenzpaket, um Zähler zu sehen.',
    exportJson: 'JSON exportieren',
    exportCsv: 'CSV exportieren',
    deleteAll: 'Alle Tage löschen',
    deleteAllConfirm: 'Alle Tage auf diesem Gerät löschen? Das kann nicht rückgängig gemacht werden.',
    deleted: 'Alle Tage gelöscht.',
    annualWorkingDays: 'Vertragliche Arbeitstage / Jahr',
    annualWorkingDaysHint:
      'Wird verwendet, um Tageszahlen in Prozente umzurechnen. Der Standard hängt von Ihrem Grenzpaket ab.',
    installHint: 'Fügen Sie BorderDay zum Startbildschirm hinzu für eine App mit einem Tippen.',
    emptyMonth: 'Diesen Monat noch keine Tage erfasst.',
    weekdays: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
    disclaimerBanner:
      'Nur Dokumentationstool — keine Steuer- oder Rechtsberatung. Schwellen bei der zuständigen Behörde prüfen.',
  },
  pricing: {
    title: 'Preise',
    subtitle: 'Nur Abonnements. Checkout noch nicht aktiv — Warteliste beitreten.',
    individual: 'Privat',
    company: 'Unternehmen / HR',
    monthly: '4,99 € / Monat',
    yearly: '49 € / Jahr',
    yearlyNote: 'Etwa zwei Monate gratis gegenüber monatlich.',
    companyPrice: '5 € / aktiver Mitarbeitender / Monat',
    companyMin: 'Mindestens 39 € / Monat',
    companyYearly: 'Jahresabrechnung: 2 Monate gratis',
    includes: 'Enthalten',
    include1: 'Alle Grenzpakete Ihres Tarifs',
    include2: 'Getrennte Steuer- und Sozialversicherungszähler',
    include3: 'Warnungen bei Annäherung an die Schwellen',
    include4: 'Daten jederzeit exportieren und löschen',
    include5: 'Englisch, Französisch, Deutsch, Italienisch',
    include6: 'Installierbare PWA',
    companyInclude1: 'Multi-Mitarbeitenden-Dashboard (mit Checkout)',
    companyInclude2: 'Geteilte Grenzpakete und Export',
    comingSoon: 'Demnächst',
    waitlistCta: 'Warteliste beitreten',
    compareNote: 'Preise an vergleichbaren Tools ausgerichtet, geprüft am 31. Okt. 2026 (Europe/Zurich).',
  },
  faq: {
    title: 'FAQ',
    q1: 'Ist BorderDay Steuer- oder Rechtsberatung?',
    a1: 'Nein. Es ist ein persönliches Dokumentations- und Erinnerungstool. Schwellen stammen aus öffentlichen amtlichen Quellen und können sich ändern. Prüfen Sie stets bei Arbeitgeber, qualifizierter Beratung oder zuständiger Behörde.',
    q2: 'Wo wird mein Tagesprotokoll gespeichert?',
    a2: 'Auf Ihrem Gerät (IndexedDB im Browser). Sie können JSON oder CSV exportieren oder alles löschen. Optionale Cloud-Synchronisation ist in dieser Version nicht enthalten.',
    q3: 'Warum sind manche Zähler deaktiviert?',
    a3: 'Wir zeigen eine Zahl nur, wenn sie auf einer amtlichen Seite bestätigt ist. Sonst zeigt der Zähler „Regel wird bestätigt“ und erfindet keinen Wert.',
    q4: 'Erfassen Sie meinen Standort?',
    a4: 'Nein. Version 1 hat kein GPS und keine Hintergrund-Standortbestimmung. Sie erfassen Tage selbst.',
    q5: 'Welche Grenzen decken Sie ab?',
    a5: 'Genf/Romandie–Frankreich, Basel–Frankreich/Deutschland, Luxemburg mit Frankreich/Belgien/Deutschland, Belgien beginnend mit Pendlern aus Frankreich und den Niederlanden, und Tessin–Italien.',
    q6: 'Und der App Store?',
    a6: 'Version 1 ist eine installierbare Progressive Web App (Startbildschirm). Eine native iOS-App kann später folgen.',
    q7: 'Wie funktionieren Zahlungen?',
    a7: 'Checkout ist noch nicht aktiv. Geplant: Stripe Managed Payments (Merchant of Record, MwSt.). Warteliste für die Benachrichtigung bei Öffnung.',
  },
  privacy: {
    title: 'Datenschutz',
    updated: 'Zuletzt aktualisiert: 31. Okt. 2026 (Europe/Zurich)',
    s1Title: 'Was wir in dieser Version erheben',
    s1Body:
      'Der Logger speichert auf Ihrem Gerät: das gewählte Grenzpaket, den Typ jedes Tages (Telearbeit, vor Ort, Drittstaat, arbeitsfrei), optionale Notizen und optionale Einstellungen wie vertragliche Arbeitstage pro Jahr. Diese Daten verlassen Ihr Gerät nur, wenn Sie sie exportieren.',
    s2Title: 'Was wir nicht tun',
    s2Body:
      'Kein fortlaufendes GPS. Keine Werbe-Tracker. Kein Verkauf personenbezogener Daten. Für den lokalen Logger ist kein Konto nötig.',
    s3Title: 'Wartelisten-E-Mail',
    s3Body:
      'Wenn Sie eine E-Mail über das Wartelistenformular senden, dient sie nur der Benachrichtigung bei Öffnung der Abonnements. Entfernung jederzeit auf Anfrage.',
    s4Title: 'Ihre Rechte',
    s4Body:
      'Exportieren oder löschen Sie Ihr lokales Tagesprotokoll jederzeit in der App. Für Wartelisten-E-Mails kontaktieren Sie uns zur Löschung Ihrer Adresse.',
    s5Title: 'Auftragsverarbeiter (künftig)',
    s5Body:
      'Wenn Konten und Checkout starten, werden Auftragsverarbeiter (Hosting, E-Mail, Zahlungen) hier mit ihren Rollen aufgeführt. Bevorzugt Datenresidenz in der EU, soweit verfügbar.',
    contact: 'Datenschutz-Kontakt: privacy@borderday.com',
  },
  disclaimer: {
    title: 'Haftungsausschluss',
    body:
      'BorderDay ist ein persönliches Dokumentations- und Erinnerungstool. Es ist keine Steuerberatung, keine Rechtsberatung und kein Ersatz für Ihren Arbeitgeber, eine qualifizierte steuerliche Beratung oder die zuständige Sozialversicherungsstelle. Angezeigte Schwellen stammen aus öffentlichen amtlichen Quellen und können sich ändern; prüfen Sie stets bei der für Sie zuständigen Behörde. Sie sind für die Richtigkeit der erfassten Tage verantwortlich.',
  },
  footer: {
    tagline: 'Persönliche Tageserfassung für grenzüberschreitende Arbeit.',
    rights: '© {year} BorderDay',
  },
  waitlist: {
    thanks: 'Danke — wir schreiben Ihnen, wenn der Checkout öffnet.',
    invalid: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    localOnly:
      'In dieser Vorschau bleibt die Adresse nur auf Ihrem Gerät, damit die Bestätigung angezeigt werden kann. Die echte Wartelisten-Speicherung wird angebunden, sobald der E-Mail-Versand freigegeben ist.',
  },
};

export default de;

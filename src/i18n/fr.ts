import type { Dict } from './en';

const fr: Dict = {
  meta: {
    siteName: 'BorderDay',
    tagline: 'Suivez vos jours de travail transfrontaliers — avant les seuils.',
    description:
      'BorderDay vous aide à enregistrer le télétravail, les jours sur site et les déplacements au regard des seuils officiels fiscaux et de sécurité sociale pour les frontières européennes. Outil de suivi personnel — pas un conseil fiscal.',
  },
  nav: {
    home: 'Accueil',
    app: 'Application',
    pricing: 'Tarifs',
    faq: 'FAQ',
    privacy: 'Confidentialité',
    disclaimer: 'Avertissement',
    openApp: 'Ouvrir l’application',
    joinWaitlist: 'Rejoindre la liste d’attente',
  },
  lang: {
    en: 'English',
    fr: 'Français',
    de: 'Deutsch',
    it: 'Italiano',
    label: 'Langue',
  },
  home: {
    heroTitle: 'Sachez où vous en êtes par rapport à vos seuils de jours',
    heroBody:
      'Enregistrez chaque jour de travail comme télétravail à domicile, sur site, déplacement professionnel, ou jour non travaillé. BorderDay les compte au regard des règles fiscales et de sécurité sociale officielles pour votre frontière — et vous prévient avant d’approcher les seuils.',
    ctaPrimary: 'Commencer (gratuit sur votre appareil)',
    ctaSecondary: 'Voir les tarifs',
    feature1Title: 'Quatre types de jours',
    feature1Body:
      'Télétravail à domicile, sur site sur le lieu de travail, pays tiers / déplacement professionnel, et jours non travaillés — chacun compté selon les règles de votre frontière.',
    feature2Title: 'Fiscalité et sécurité sociale, séparément',
    feature2Body:
      'Les seuils sont des systèmes indépendants. BorderDay tient un compteur pour chacun, avec le seuil officiel et un lien vers la source.',
    feature3Title: 'Confidentialité d’abord locale',
    feature3Body:
      'Votre journal de jours reste sur votre appareil. Exportez ou supprimez à tout moment. Pas de suivi continu de localisation.',
    bordersTitle: 'Frontières couvertes en version 1',
    bordersIntro:
      'Les règles sont tirées de sources officielles publiques. Les compteurs encore en cours de confirmation s’affichent comme « règle en cours de confirmation » et restent désactivés.',
    howTitle: 'Comment ça marche',
    how1: 'Choisissez votre frontière (pays de résidence → pays du lieu de travail).',
    how2: 'Enregistrez chaque jour en quelques gestes.',
    how3: 'Suivez les compteurs fiscaux et de sécurité sociale. Alertes à 75 %, 90 % et 100 %.',
    waitlistTitle: 'Paiements bientôt disponibles',
    waitlistBody:
      'Le paiement n’est pas encore actif. Laissez votre e-mail et nous vous préviendrons à l’ouverture des abonnements individuels et entreprise. En attendant, le journal de jours fonctionne gratuitement sur votre appareil.',
    waitlistPlaceholder: 'vous@exemple.com',
    waitlistButton: 'Prévenez-moi',
    waitlistNote: 'Conservé seulement si vous envoyez le formulaire. Pas de spam.',
    disclaimerShort:
      'BorderDay est un outil personnel de suivi et de rappel. Ce n’est ni un conseil fiscal ni un conseil juridique.',
  },
  borders: {
    geneva_fr: 'Genève / Romandie ← France',
    basel_fr: 'Bâle ← France',
    basel_de: 'Bâle ← Allemagne',
    luxembourg_fr: 'Luxembourg ← France',
    luxembourg_be: 'Luxembourg ← Belgique',
    luxembourg_de: 'Luxembourg ← Allemagne',
    belgium_fr: 'Belgique ← France',
    belgium_nl: 'Belgique ← Pays-Bas',
    ticino_it: 'Tessin ← Italie',
    geneva_region: 'Cantons couverts par l’avenant fiscal franco-suisse sur le télétravail (dès le 1er janv. 2026).',
    basel_region: 'Nord-ouest de la Suisse / région de Bâle.',
    ticino_region: 'Accord Italie–Suisse relatif aux travailleurs frontaliers, tel que modifié pour le télétravail.',
  },
  dayTypes: {
    telework: 'Télétravail à domicile',
    onsite: 'Sur site sur le lieu de travail',
    third_country: 'Pays tiers / déplacement professionnel',
    non_working: 'Jour non travaillé',
    teleworkHint: 'Jour de travail effectué dans le pays de résidence (domicile ou espace de coworking local).',
    onsiteHint: 'Jour de travail dans les locaux de l’employeur dans le pays du lieu de travail.',
    third_countryHint: 'Déplacement professionnel, formation, visite client ou mission temporaire hors du pays du lieu de travail.',
    non_workingHint: 'Congé, jour férié non travaillé, maladie ou jour de repos.',
  },
  counters: {
    tax: 'Fiscalité',
    social_security: 'Sécurité sociale',
    ch_fr_tax_telework_40: 'Part de télétravail (max. 40 % du temps de travail annuel)',
    ch_fr_tax_missions_10: 'Missions temporaires hors de Suisse (max. 10 jours/an)',
    ch_fr_tax_note:
      'Selon l’accord amiable franco-suisse, le télétravail depuis la France jusqu’à 40 % du temps de travail annuel peut rester imposable en Suisse. Les missions temporaires (jusqu’à 10 jours/an, au prorata) s’inscrivent dans cette expression. Source : ge.ch / AFC (ESTV).',
    ch_fr_missions_note:
      'Jusqu’à 10 jours par an de missions temporaires en France ou dans un pays tiers peuvent être traités dans l’expression du télétravail, sous réserve du plafond de 40 %. Année partielle / temps partiel : plafond proratisé, arrondi au supérieur. Source : accord amiable ESTV.',
    lu_tax_tolerance_34: 'Jours hors du Luxembourg (seuil de tolérance : 34 jours)',
    lu_tax_tolerance_pending: 'Jours hors du Luxembourg (seuil de tolérance fiscale)',
    lu_fr_tax_note:
      'Pour les résidents de France employés au Luxembourg : 34 jours par période d’imposition physiquement présents en France et/ou dans un État tiers pour exercer l’emploi, sans perdre l’imposition luxembourgeoise pour toute la période. Toute fraction de jour compte pour un jour entier. Congés, repos hebdomadaire, jours fériés (lorsqu’il n’y a pas d’obligation de travailler), maladie et force majeure sont exclus. Source : accord amiable impots.gouv.fr.',
    ss_framework_under_50: 'Télétravail transfrontalier (accord-cadre : moins de 50 %)',
    ss_framework_note:
      'Selon l’accord-cadre UE/EEE/CH sur le télétravail transfrontalier, un télétravail habituel dans l’État de résidence inférieur à 50 % du temps de travail total peut permettre de conserver la sécurité sociale de l’État de l’employeur si les deux États ont signé et qu’un document portable A1 est demandé. Source : SPF Sécurité sociale belge (dépositaire) ; CLEISS.',
    ss_framework_lu_note:
      'CCSS Luxembourg : télétravail exclusivement dans l’État de résidence, entre 25 % et moins de 50 % du temps de travail total, les deux États ont signé → l’employeur peut demander un A1 pour maintenir la couverture luxembourgeoise. Une activité habituelle non télétravail dans l’État de résidence ou un travail dans un autre État membre peut sortir du cadre. Source : CCSS.',
    ch_it_tax_telework_25: 'Télétravail au domicile (max. 25 % de l’activité salariée)',
    ch_it_tax_nonreturn_45: 'Jours sans retour quotidien au domicile (max. 45 jours/an)',
    ch_it_tax_note:
      'Selon le protocole modificatif de l’accord Italie–Suisse, un travailleur frontalier peut exercer au plus 25 % de l’activité salariée en télétravail au domicile dans l’État de résidence sur une année civile sans modifier le statut ni le traitement fiscal de ce télétravail. Source : Fedlex RU 2026 104 ; DFI (SIF).',
    ch_it_nonreturn_note:
      'En principe, jusqu’à 45 jours par année civile sans retour quotidien au domicile pour motifs professionnels (congés et jours de maladie non comptés dans ces 45). Source : protocole modificatif Fedlex.',
    basel_de_tax_pending: 'Règles fiscales jours Allemagne–Suisse',
    basel_de_employer_commute: 'Pratique employeur (Bâle-Ville) : jours sur site ce mois (plancher ≈ 5)',
    basel_de_employer_note:
      'Orientation RH de Bâle-Ville (état au 1er janv. 2026) : home office seulement si l’employé se rend sur le lieu de travail suisse au moins 1 jour par semaine ou au moins 5 jours par mois. Pratique employeur, pas un compteur fiscal fédéral publié. Source : Département des finances du canton de Bâle-Ville.',
    be_tax_pending: 'Règles fiscales jours pour les corridors belges',
    ruleBeingConfirmed: 'Règle en cours de confirmation',
    pending_bmf:
      'Les règles exactes Allemagne–Suisse (jours / non-retour) pour ce corridor sont en cours de confirmation d’après les textes de consultation du BMF. Ce compteur reste désactivé.',
    pending_lu_be_tax:
      'Le seuil de tolérance luxembourgeois pour les résidents belges est souvent décrit comme 34 jours, mais les pages primaires ACD / SPF Finances n’ont pas été confirmées pour cette version. Compteur désactivé.',
    pending_lu_de_tax:
      'Le seuil de tolérance luxembourgeois pour les résidents allemands (y compris une éventuelle règle des 30 minutes) est en cours de confirmation d’après les pages ACD / BMF. Compteur désactivé.',
    pending_be_tax:
      'Aucun seuil de tolérance public simple pour FR→BE ou NL→BE n’a été vérifié sur SPF Finances pour cette version. Compteur fiscal désactivé ; le compteur accord-cadre de sécurité sociale reste disponible.',
    usedOf: '{used} sur {limit}',
    percentUsed: '{used} % sur {limit} %',
    usedOfDays: '{used} sur {allowed} jours',
    percentOfAnnual: '{pct} % de {annual} j/an (plafond {limit} %)',
    status_ok: 'Sous le seuil',
    status_warn: 'Seuil approché',
    status_critical: 'Proche du seuil',
    status_over: 'Au-delà du seuil',
    status_disabled: 'Pas encore disponible',
    sourceLink: 'Source officielle',
    checkedOn: 'Vérifié le {date}',
  },
  app: {
    title: 'Votre journal de jours',
    pickBorder: 'Votre frontière',
    pickBorderHint: 'Résidence → lieu de travail',
    today: 'Aujourd’hui',
    logDay: 'Enregistrer ce jour',
    changeDay: 'Modifier',
    calendar: 'Calendrier',
    counters: 'Vos compteurs',
    noBorder: 'Choisissez une frontière pour voir les compteurs.',
    exportJson: 'Exporter JSON',
    exportCsv: 'Exporter CSV',
    deleteAll: 'Supprimer tous les jours',
    deleteAllConfirm: 'Supprimer tous les jours sur cet appareil ? Action irréversible.',
    deleted: 'Tous les jours ont été supprimés.',
    annualWorkingDays: 'Jours de travail contractuels / an',
    annualWorkingDaysHint:
      'Utilisé pour convertir les jours en pourcentage. La valeur par défaut dépend de votre frontière.',
    installHint: 'Ajoutez BorderDay à l’écran d’accueil pour une application en un geste.',
    emptyMonth: 'Aucun jour enregistré ce mois-ci.',
    weekdays: ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'],
    disclaimerBanner:
      'Outil de suivi uniquement — pas un conseil fiscal ou juridique. Vérifiez les seuils auprès de l’autorité compétente.',
  },
  pricing: {
    title: 'Tarifs',
    subtitle: 'Abonnements uniquement. Le paiement n’est pas encore actif — rejoignez la liste d’attente.',
    individual: 'Particulier',
    company: 'Entreprise / RH',
    monthly: '4,99 € / mois',
    yearly: '49 € / an',
    yearlyNote: 'Environ deux mois offerts par rapport au mensuel.',
    companyPrice: '5 € / collaborateur actif / mois',
    companyMin: 'Minimum 39 € / mois',
    companyYearly: 'Facturation annuelle : 2 mois offerts',
    includes: 'Inclus',
    include1: 'Tous les packs de frontières disponibles dans votre offre',
    include2: 'Compteurs fiscaux et de sécurité sociale séparés',
    include3: 'Alertes à l’approche des seuils',
    include4: 'Export et suppression de vos données à tout moment',
    include5: 'Anglais, français, allemand, italien',
    include6: 'PWA installable',
    companyInclude1: 'Tableau de bord multi-collaborateurs (avec le paiement)',
    companyInclude2: 'Packs partagés et export',
    comingSoon: 'Bientôt',
    waitlistCta: 'Rejoindre la liste d’attente',
    compareNote: 'Tarifs alignés sur des outils comparables vérifiés le 31 oct. 2026 (Europe/Zurich).',
  },
  faq: {
    title: 'FAQ',
    q1: 'BorderDay est-il un conseil fiscal ou juridique ?',
    a1: 'Non. C’est un outil personnel de suivi et de rappel. Les seuils proviennent de sources officielles publiques et peuvent évoluer. Vérifiez toujours auprès de votre employeur, d’un conseiller qualifié ou de l’autorité compétente.',
    q2: 'Où est stocké mon journal de jours ?',
    a2: 'Sur votre appareil (IndexedDB dans le navigateur). Vous pouvez exporter en JSON ou CSV, ou tout supprimer. La synchronisation cloud optionnelle n’est pas dans cette version.',
    q3: 'Pourquoi certains compteurs sont-ils désactivés ?',
    a3: 'Nous n’affichons un chiffre que lorsqu’il est confirmé sur une page officielle. Sinon le compteur indique « règle en cours de confirmation » et n’invente pas de valeur.',
    q4: 'Suivez-vous ma localisation ?',
    a4: 'Non. La version 1 n’a ni GPS ni localisation en arrière-plan. Vous enregistrez les jours vous-même.',
    q5: 'Quelles frontières couvrez-vous ?',
    a5: 'Genève/Romandie–France, Bâle–France/Allemagne, Luxembourg avec France/Belgique/Allemagne, Belgique en commençant par les navetteurs depuis la France et les Pays-Bas, et Tessin–Italie.',
    q6: 'Et l’App Store ?',
    a6: 'La version 1 est une progressive web app installable (écran d’accueil). Une application iOS native pourra venir plus tard.',
    q7: 'Comment fonctionnent les paiements ?',
    a7: 'Le paiement n’est pas encore actif. Prévu : Stripe Managed Payments (merchant of record, TVA). Inscrivez-vous à la liste d’attente pour être prévenu.',
  },
  privacy: {
    title: 'Confidentialité',
    updated: 'Dernière mise à jour : 31 oct. 2026 (Europe/Zurich)',
    s1Title: 'Ce que nous collectons dans cette version',
    s1Body:
      'Le journal stocke sur votre appareil : le pack de frontière choisi, le type de chaque jour (télétravail, sur site, pays tiers, non travaillé), des notes optionnelles, et des réglages optionnels tels que les jours de travail contractuels par an. Ces données ne quittent pas votre appareil sauf si vous les exportez.',
    s2Title: 'Ce que nous ne faisons pas',
    s2Body:
      'Pas de GPS continu. Pas de trackers publicitaires. Pas de vente de données personnelles. Aucun compte n’est requis pour le journal local.',
    s3Title: 'E-mail de liste d’attente',
    s3Body:
      'Si vous envoyez un e-mail via le formulaire de liste d’attente, il sert uniquement à vous prévenir de l’ouverture des abonnements. Vous pouvez demander le retrait à tout moment.',
    s4Title: 'Vos droits',
    s4Body:
      'Exportez ou supprimez votre journal local à tout moment depuis l’application. Pour les e-mails de liste d’attente, contactez-nous pour effacer votre adresse.',
    s5Title: 'Sous-traitants (futur)',
    s5Body:
      'Lorsque les comptes et le paiement seront lancés, les sous-traitants (hébergement, e-mail, paiements) seront listés ici avec leurs rôles. Préférence pour une résidence des données dans l’UE lorsque c’est possible.',
    contact: 'Contact confidentialité : privacy@borderday.com',
  },
  disclaimer: {
    title: 'Avertissement',
    body:
      'BorderDay est un outil personnel de suivi et de rappel. Ce n’est ni un conseil fiscal, ni un conseil juridique, ni un substitut à votre employeur, à un conseiller fiscal qualifié ou à l’institution de sécurité sociale compétente. Les seuils affichés proviennent de sources officielles publiques et peuvent évoluer ; vérifiez toujours auprès de l’autorité qui s’applique à votre situation. Vous êtes responsable de l’exactitude des jours que vous enregistrez.',
  },
  footer: {
    tagline: 'Suivi personnel des jours pour le travail transfrontalier.',
    rights: '© {year} BorderDay',
  },
  waitlist: {
    thanks: 'Merci — nous vous écrirons à l’ouverture du paiement.',
    invalid: 'Veuillez saisir une adresse e-mail valide.',
    localOnly:
      'Dans cet aperçu, l’adresse est conservée uniquement sur votre appareil pour afficher la confirmation. Le stockage réel de la liste d’attente sera branché lorsque l’envoi d’e-mails sera approuvé.',
  },
};

export default fr;

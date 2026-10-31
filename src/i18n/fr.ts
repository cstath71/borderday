import type { Dict } from './en';

const fr: Dict = {
  meta: {
    siteName: 'BorderDay',
    tagline:
      'Seuils de jours fiscaux et sociaux pour les RH et les collaborateurs — avant les mauvaises surprises.',
    description:
      'BorderDay aide les RH et les collaborateurs à consigner télétravail, jours sur site et déplacements. Compteurs de sécurité sociale sur les neuf corridors ; compteurs fiscaux sur quatre : Genève et autres cantons hors accord de 1983, Allemagne→Suisse, France→Luxembourg et Italie→Suisse. Outil de suivi — pas un conseil fiscal ou juridique.',
  },
  nav: {
    home: 'Accueil',
    app: 'App collaborateur',
    pricing: 'Tarifs',
    faq: 'FAQ',
    privacy: 'Confidentialité',
    disclaimer: 'Avertissement',
    terms: 'Conditions',
    openApp: 'Ouvrir l’app',
    joinWaitlist: 'Connexion',
    forIndividuals: 'Pour les particuliers',
    forCompanies: 'Pour les entreprises',
    hrDashboard: 'Tableau de bord RH',
    companySignup: 'Créer une entreprise',
  },
  lang: {
    en: 'English',
    fr: 'Français',
    de: 'Deutsch',
    it: 'Italiano',
    label: 'Langue',
  },
  home: {
    heroTitle: 'Un seul outil pour toutes les frontières de vos équipes',
    heroBody:
      'Pour les RH et responsables finance à Genève, Bâle, au Tessin, au Luxembourg et en Belgique : des compteurs de jours par collaborateur, avant un changement d’affiliation ou le dépassement d’un seuil fiscal. Compteurs de sécurité sociale sur les neuf corridors, compteurs fiscaux sur quatre, et chaque corridor indique ce qu’il couvre. Quatre langues, fiscalité et sécurité sociale suivies séparément.',
    ctaPrimary: 'Créer un compte entreprise',
    ctaSecondary: 'Voir les tarifs entreprise',
    ctaIndividuals: 'Je suis un collaborateur individuel',
    riskTitle: 'Pourquoi les seuils de jours comptent pour l’employeur',
    risk1Title: 'Affiliation à la sécurité sociale',
    risk1Body:
      'Selon l’accord-cadre UE/EEE/CH, un télétravail dans l’État de résidence de 25 % ou plus du temps de travail y transfère normalement la sécurité sociale, sauf demande d’attestation A1. À partir de 50 %, l’accord-cadre n’est plus disponible. BorderDay affiche les trois tranches, séparément de la fiscalité : moins de 25 %, de 25 % à moins de 50 % (A1 requise) et 50 % ou plus.',
    risk2Title: 'Seuils fiscaux de jours',
    risk2Body:
      'Des compteurs fiscaux fonctionnent aujourd’hui sur quatre corridors : Genève et autres cantons hors accord de 1983 (40 % / 10 jours de mission), Allemagne→Suisse (60 jours de non-retour), France→Luxembourg (34 jours, réduits en cas de temps partiel) et Italie→Suisse (25 % / 45 jours de non-retour). Les cinq autres indiquent clairement qu’aucun compteur fiscal ne fonctionne. Nous n’inventons jamais de chiffre.',
    risk3Title: 'Équipes multi-frontières',
    risk3Body:
      'Un tableau de bord pour des collaborateurs sur des frontières différentes. Filtres par frontière ou statut. Export CSV pour audit. Les collaborateurs voient exactement les mêmes compteurs que les RH.',
    feature1Title: 'Fiscalité et sécurité sociale, séparément',
    feature1Body:
      'Compteurs indépendants avec sources officielles. Alertes à 75 % et 90 % du plafond applicable, puis états « à la limite » et « au-delà » avec la conséquence expliquée.',
    feature2Title: 'Invitation par lien e-mail',
    feature2Body:
      'Les collaborateurs rejoignent votre entreprise, choisissent leur pack frontière et enregistrent uniquement le type de jour — jamais la localisation GPS.',
    feature3Title: 'Protection des données dès la conception',
    feature3Body:
      'Orienté RGPD et LPD suisse : isolation par entreprise, export et suppression, avis clair sur ce que voient les RH, note de conservation. Ni GPS ni localisation de l’appareil.',
    bordersTitle: 'Corridors couverts en version 1',
    bordersIntro:
      'Chaque corridor indique ce qu’il compte aujourd’hui. Si aucune règle fiscale ne peut encore être comptée, il le dit et n’affiche aucun chiffre.',
    howTitle: 'Comment les entreprises utilisent BorderDay',
    how1: 'Créez un compte entreprise et invitez les collaborateurs par lien e-mail.',
    how2: 'Chaque collaborateur choisit son pack frontière et enregistre télétravail / sur site / déplacement / non travaillé.',
    how3: 'Les RH suivent les compteurs fiscaux et de sécurité sociale, filtrent par statut et exportent en CSV.',
    waitlistTitle: 'Commencez avec un compte entreprise',
    waitlistBody:
      'Créez un compte entreprise par e-mail ou Google, invitez votre équipe, puis abonnez-vous sur la page Tarifs. Une entreprise DÉMO étiquetée reste disponible.',
    waitlistButton: 'Créer un compte',
    waitlistNote: 'Pas de liste d\'attente — comptes et paiement sont actifs. Offres entreprise : 5 €/employé/mois (min. 39 €), essai de 7 jours.',
    disclaimerShort:
      'BorderDay est un outil de suivi et de rappel des classifications de jours. Ce n’est pas un conseil fiscal ou juridique. Vérifiez toujours auprès de l’autorité compétente ou d’un conseiller qualifié.',
    demoBanner: 'Les captures et l’entreprise préchargée utilisent des données DEMO clairement étiquetées — pas de vrais collaborateurs.',
    inShort:
      'BorderDay aide les RH à suivre télétravail, jours sur site et déplacements par collaborateur : compteurs de sécurité sociale sur les neuf corridors de cinq régions, compteurs fiscaux sur quatre d’entre eux. Offre entreprise : 5 € par collaborateur actif et par mois (minimum 39 €) ; particuliers 4,99 €/mois ou 49 €/an. Essai de 7 jours avec carte requise. Outil de suivi — pas un conseil fiscal ou juridique.',
    inShortLabel: 'En bref',
    chipTaxYes: 'Fiscalité : oui',
    chipTaxNo: 'Fiscalité : pas encore',
    chipSsYes: 'Sécurité sociale : oui',
  },
  borders: {
    geneva_fr: 'Genève et autres cantons hors accord de 1983 ← France',
    basel_fr: 'Bâle et autres cantons de l’accord de 1983 ← France',
    basel_de: 'Bâle / Suisse ← Allemagne',
    luxembourg_fr: 'Luxembourg ← France',
    luxembourg_be: 'Luxembourg ← Belgique',
    luxembourg_de: 'Luxembourg ← Allemagne',
    belgium_fr: 'Belgique ← France',
    belgium_nl: 'Belgique ← Pays-Bas',
    ticino_it: 'Tessin ← Italie',
    geneva_region:
      'Régime de la convention : Genève et tous les cantons hors accord de 1983, règle de télétravail applicable dès le 1er janv. 2026. Si votre employeur est à Berne, Soleure, Bâle-Ville, Bâle-Campagne, Vaud, Valais, Neuchâtel ou Jura, choisissez plutôt le pack de l’accord de 1983.',
    basel_region:
      'La règle des 60 jours vaut pour toute la Suisse. Le minimum de 5 jours est la règle que Bâle-Ville applique à son propre personnel.',
    ticino_region: 'Accord Italie–Suisse relatif aux travailleurs frontaliers, tel que modifié pour le télétravail.',
    ch_fr_1983_region:
      'Accord de 1983 : Berne, Soleure, Bâle-Ville, Bâle-Campagne, Vaud, Valais, Neuchâtel et Jura. Genève et les autres cantons suivent un autre régime : choisissez l’autre pack France–Suisse.',
  },
  dayTypes: {
    telework: 'Télétravail à domicile',
    onsite: 'Sur le lieu de travail',
    third_country: 'Déplacement professionnel / État tiers',
    non_working: 'Jour non travaillé',
    teleworkHint: 'Jour de travail effectué dans le pays de résidence (domicile ou espace de coworking local).',
    onsiteHint: 'Jour de travail dans les locaux de l’employeur dans le pays du lieu de travail.',
    third_countryHint: 'Déplacement professionnel, formation, visite client ou mission temporaire hors du pays du lieu de travail.',
    non_workingHint: 'Congé, jour férié non travaillé, maladie ou jour de repos.',
    teleworkHint_ticino:
      'Jour de travail à votre domicile en Italie. Le protocole dit « au domicile » : la prise en compte d’un jour en coworking n’est pas confirmée, vérifiez auprès de votre autorité.',
    third_countryHint_basel_de:
      'Travail hors d’Allemagne et de Suisse : toujours un jour de non-retour, même avec retour le soir. Ne l’utilisez pas pour un déplacement d’une journée en Allemagne ou en Suisse.',
    logHint_luxembourg_fr:
      'Toute fraction de journée hors du Luxembourg compte comme une journée entière : consignez toute la journée en télétravail ou déplacement.',
    overnightAway: 'Nuit hors du domicile pour le travail (pas de retour à la maison)',
    overnightAwayHint:
      'Un oui ou un non, jamais un lieu. Certains seuils comptent ces jours. Dans un compte entreprise, les RH le voient avec le type de jour.',
    overnightAwayShort: 'Nuit hors domicile',
  },
  counters: {
    tax: 'Fiscalité',
    social_security: 'Sécurité sociale',
    ch_fr_tax_telework_40: 'Part de télétravail (max. 40 % du temps de travail annuel)',
    ch_fr_tax_missions_10: 'Missions temporaires hors de Suisse (max. 10 jours/an)',
    ch_fr_tax_note:
      'Régime de la convention : le télétravail depuis la France jusqu’à 40 % du temps de travail annuel reste imposable en Suisse. Jusqu’à 10 jours de mission par an comptent comme télétravail, seulement dans la mesure où ils tiennent sous les 40 % après le télétravail ordinaire. Les autres jours de mission sont imposés différemment. Au-delà de 40 %, le télétravail est imposable en France dès le premier jour. L’astreinte ne compte qu’en cas d’intervention effective. Sources : avenant du 27 juin 2023 (protocole additionnel) pour la règle des 40 % ; accord amiable AFC du 29 avr. 2026 pour les jours de mission ; ge.ch.',
    ch_fr_missions_note:
      'Missions temporaires en France ou dans un État tiers : jusqu’à 10 jours par an comptent dans les 40 %, seulement dans la mesure où ils tiennent après le télétravail ordinaire. Temps partiel ou année incomplète : les 10 jours sont réduits proportionnellement et arrondis à l’unité supérieure. Les jours hors de ces limites sont imposables en France, sous réserve de la convention avec l’État tiers. Sources : accord amiable AFC du 29 avr. 2026 ; fiche impots.gouv.fr.',
    lu_tax_tolerance_34: 'Jours hors du Luxembourg (jusqu’à 34 jours, temps plein sur l’année)',
    lu_tax_tolerance_pending: 'Jours hors du Luxembourg (seuil de tolérance fiscale)',
    lu_fr_tax_note:
      'Résidents de France employés au Luxembourg : jusqu’à 34 jours par période imposable physiquement présents en France et/ou dans un État tiers pour le travail, sans perdre l’imposition au Luxembourg sur la période. Temps partiel ou année incomplète : les 34 jours sont réduits proportionnellement et arrondis à l’unité inférieure. Au-delà, la France peut imposer le temps réellement travaillé en France ou dans un État tiers, dès le premier jour. Toute fraction de journée compte comme une journée entière, et la formation compte. Les congés, le repos hebdomadaire, les jours fériés non travaillés, la maladie et la force majeure ne comptent pas. Le seuil couvre tous vos contrats de l’année et il vous appartient de prouver vos jours : ce journal seul peut ne pas suffire. Source : accord impots.gouv.fr (le PDF indique 29 jours, portés à 34 par l’avenant du 7 nov. 2022).',
    ss_framework_under_50:
      'Télétravail transfrontalier (accord-cadre : A1 dès 25 %, moins de 50 %)',
    ss_framework_note:
      'Selon l’accord-cadre UE/EEE/CH : sous 25 % du temps de travail télétravaillé dans l’État de résidence, aucune attestation A1 n’est nécessaire au titre du télétravail. De 25 % à moins de 50 %, l’État de résidence devient normalement compétent, sauf si employeur et salarié demandent une A1 maintenant l’État de l’employeur. L’A1 vaut 3 ans au plus et ne peut rétroagir que de 3 mois, si les cotisations y ont déjà été payées. À partir de 50 %, l’accord-cadre n’est pas disponible. Il ne couvre pas les personnes qui exercent habituellement une autre activité que le télétravail dans l’État de résidence, travaillent habituellement dans un État autre que l’État de résidence et celui du siège de l’employeur, sont indépendantes ou ont des employeurs dans plusieurs États. Le télétravail suppose ici un lien informatique. Sources : SPF belge (dépositaire) ; CLEISS.',
    ss_framework_lu_note:
      'CCSS Luxembourg : télétravail uniquement dans l’État de résidence. Sous 25 % : pas d’A1 au titre du télétravail. De 25 % à moins de 50 %, les deux États signataires : l’employeur peut demander une A1 pour maintenir la couverture luxembourgeoise ; sans elle, l’État de résidence devient normalement compétent. À partir de 50 %, l’accord-cadre n’est pas disponible. Une activité habituelle autre que le télétravail dans l’État de résidence ou un travail dans un État autre que l’État de résidence et celui du siège de l’employeur peut faire sortir le cas de l’accord-cadre. Sources : CCSS ; SPF belge.',
    ch_it_tax_telework_25: 'Télétravail au domicile (max. 25 % de l’activité lucrative dépendante)',
    ch_it_tax_nonreturn_45: 'Jours sans retour à domicile pour le travail (max. 45/an)',
    ch_it_tax_note:
      'Selon le protocole modifiant l’accord Italie–Suisse (en vigueur le 9 févr. 2026, applicable dès le 1er janv. 2024, y compris au régime transitoire) : au plus 25 % de l’activité lucrative dépendante en télétravail à domicile dans l’État de résidence par année civile, sans changer le statut ni le traitement fiscal de ce télétravail. Le protocole ne dit pas ce qui se passe au-delà de 25 %. Sources : Fedlex RO 2026 104 ; SFI.',
    ch_it_nonreturn_note:
      'En principe, et sauf décision contraire des autorités, jusqu’à 45 jours par année civile sans retour quotidien à domicile pour le travail. Les congés et la maladie ne comptent pas. BorderDay ne compte que les jours que vous marquez « nuit hors du domicile pour le travail » ; un déplacement d’une journée ne compte pas. Source : protocole de modification, Fedlex.',
    basel_de_employer_commute:
      'Règle du personnel de Bâle-Ville : jours sur site ce mois-ci (minimum 5, ou 1 par semaine)',
    basel_de_employer_note:
      'C’est la règle que le canton de Bâle-Ville applique à son propre personnel (état au 1er janv. 2026) : télétravail seulement si la personne se rend sur son lieu de travail au moins 1 jour par semaine ou au moins 5 jours par mois. D’autres employeurs peuvent appliquer d’autres règles, et ce n’est pas un seuil fiscal général. Source : Département des finances de Bâle-Ville.',
    pending_lu_be_tax:
      'Le gouvernement luxembourgeois a annoncé 34 jours dès 2022 pour les résidents de Belgique. Le texte belge précisant la réduction à temps partiel et ce qui compte n’a pas été trouvé : aucun compteur ne fonctionne. Vérifiez auprès de votre autorité.',
    pending_lu_de_tax:
      'Le gouvernement luxembourgeois indique que la tolérance est passée de 19 à 34 jours dès 2024 pour les résidents d’Allemagne. Le texte allemand sur ce qui compte et sur le temps partiel n’a pas pu être confirmé : aucun compteur ne fonctionne et la réduction France–Luxembourg n’est pas appliquée. Vérifiez auprès de votre autorité.',
    usedOf: '{used} sur {limit}',
    percentUsed: '{used} % sur {limit} %',
    usedOfDays: '{used} sur {allowed} jours',
    percentOfAnnual: '{pct} % de {annual} j/an (plafond {limit} %)',
    status_ok: 'Sous le seuil',
    status_warn: 'Attention',
    status_critical: 'Proche du seuil',
    status_over: 'Au-delà du seuil',
    status_disabled: 'Pas encore de compteur',
    sourceLink: 'Sources officielles',
    checkedOn: 'Vérifié le {date}',
    employer_practice: 'Pratique d’employeur',
    ch_fr_over_40:
      'Au-delà de 40 % : les jours de télétravail sont imposables en France dès le premier jour, pas seulement le dépassement, et les jours de mission ne comptent plus comme télétravail. Vérifiez auprès de votre autorité fiscale.',
    ch_fr_mission_excess:
      'Parmi vos jours de mission, {counted} comptent dans les 40 % et {excess} non : ceux-ci sont imposables en France, sous réserve d’une convention avec un État tiers.',
    ch_fr_1983_label: 'Fiscalité France–Suisse (accord de 1983) : régime en cours d’examen',
    ch_fr_1983_value: 'Régime en cours d’examen : vérifiez auprès de votre autorité',
    ch_fr_1983_note:
      'Ces cantons ne suivent pas la règle genevoise. Selon l’accord de 1983, les résidents de France sont en général imposés en France, qui reverse à la Suisse 4,5 % du salaire brut. Les conditions publiées comprennent le télétravail jusqu’à 40 % du temps de travail, jusqu’à 10 jours de mission dans ces 40 % et au plus 45 nuits par an en Suisse ou dans un État tiers. Un seul jour de mission en France au-delà de ces limites met fin au régime. BorderDay ne sait pas encore distinguer les missions en France des autres : il n’affiche donc pas de compteur fiscal ici plutôt qu’un faux feu vert. Les Suisses du secteur public et les résidents à la semaine sont traités autrement. Vérifiez auprès de votre autorité fiscale cantonale.',
    lu_over_34:
      'Seuil dépassé : la France peut imposer le temps réellement travaillé en France ou dans un État tiers, dès le premier jour. Vérifiez auprès de votre autorité fiscale.',
    prorate_missing:
      '{limit} jours valent uniquement pour un temps plein sur toute l’année — indiquez votre taux d’emploi.',
    prorate_applied: 'Seuil ajusté à votre taux d’emploi de {pct} % : {limit} jours.',
    at_limit_note: 'À la limite : encore admis, mais le jour suivant dépasse.',
    ss_band_under: 'Moins de {from} % : pas d’A1 nécessaire au titre du télétravail.',
    ss_band_approaching:
      'Vous approchez de {from} % : dès ce seuil, une A1 est requise pour rester dans l’État de l’employeur.',
    ss_band_a1_required:
      'De 25 % à moins de 50 % : A1 requise. Sans elle, l’État de résidence devient normalement compétent. Indiquez-la ici dès que votre employeur l’a obtenue.',
    ss_band_a1_recorded:
      'A1 enregistrée, valable jusqu’au {until}. BorderDay ne vérifie pas l’attestation.',
    ss_band_a1_recorded_nodate:
      'A1 enregistrée, sans date de fin. Une A1 de l’accord-cadre vaut 3 ans au plus : ajoutez sa date de fin. BorderDay ne vérifie pas l’attestation.',
    ss_band_a1_expired:
      'L’A1 enregistrée a pris fin le {until}. À 25 % ou plus, une nouvelle attestation est requise.',
    ss_band_residence:
      '50 % ou plus : l’accord-cadre n’est pas disponible et l’État de résidence s’applique normalement. Un accord individuel peut être possible : vérifiez auprès de votre institution de sécurité sociale.',
    ss_third_country:
      'Jours de déplacement consignés cette année : {days}. Un travail récurrent hors de l’État de l’employeur peut sortir de l’accord-cadre : vérifiez auprès de votre institution de sécurité sociale.',
    ch_it_over:
      'Seuil dépassé. Le protocole n’en précise pas la conséquence : interrogez l’autorité compétente.',
    basel_de_nonreturn_60: 'Jours de non-retour pour le travail (jusqu’à 60 par an)',
    basel_de_nonreturn_note:
      'Allemagne–Suisse : le statut frontalier est perdu au-delà de 60 jours de non-retour professionnels par an. Sont comptés ici les jours marqués « nuit hors du domicile pour le travail », plus chaque jour de travail hors d’Allemagne et de Suisse, même avec retour le soir. Les déplacements d’une journée en Allemagne ou en Suisse, la maladie et l’accident ne comptent pas. Lors de voyages de plusieurs jours payés par l’employeur, week-ends et jours fériés comptent aussi : consignez-les en déplacement. Les temps partiels travaillant certains jours seulement ont un seuil réduit proportionnellement, et plusieurs employeurs sont appréciés ensemble. La prise en compte d’un jour de télétravail n’est pas confirmée ici : vérifiez auprès de votre autorité. L’employeur dépose le formulaire Gre-3 (31 mars en Argovie ; vérifiez dans votre canton). Sources : KonsVerCHEV §§ 8–9 ; notice du canton d’Argovie, état au 1er janv. 2026.',
    basel_de_over_60:
      'Au-delà de 60 jours, le statut frontalier est perdu : l’impôt à la source suisse passe de 4,5 % au barème normal pour l’année. Vérifiez auprès de votre autorité fiscale.',
    floor_week_met: 'Atteint grâce à au moins un jour sur site chaque semaine du mois.',
    floor_below_note:
      'Ce mois s’est terminé avec moins de {limit} jours sur site et sans couvrir chaque semaine. Si cette règle vous concerne, vérifiez auprès de votre employeur.',
    be_fr_tax_label: 'Fiscalité France→Belgique',
    be_fr_value: 'Aucune tolérance en jours trouvée',
    be_nl_tax_label: 'Fiscalité Pays-Bas→Belgique',
    be_nl_value: 'Aucune règle confirmée : vérifiez auprès de votre autorité',
    lu_announced_value: '34 jours annoncés : pas encore de compteur',
    pending_be_fr_tax:
      'Aucune tolérance en jours trouvée. Les jours travaillés depuis la France sont en général imposés en France, au prorata, dès le premier jour (réponse ministérielle du 28 mai 2024). Les personnes devenues frontalières avant le 1er janv. 2012 gardent un régime distinct jusqu’en 2033, avec une limite de 30 jours hors de la zone frontalière belge. Une convention signée en 2021 attendait encore sa ratification à cette date. Aucun compteur ici : vérifiez auprès de votre autorité.',
    pending_be_nl_tax:
      'Aucune tolérance pour le travail à domicile sur la page de l’administration fiscale néerlandaise, qui n’aborde pas ces jours, et aucun texte primaire belge trouvé. Aucun compteur ici : vérifiez auprès d’un conseiller ou de votre autorité.',
    pace_line:
      'Rythme actuel : {pct} % des jours travaillés consignés ({days}).',
    pace_above:
      'Rythme actuel : {pct} % des jours travaillés consignés ({days}), au-dessus de {limit} %. S’il se maintient, ce seuil sera franchi.',
    multi_employer_note:
      'Ces compteurs ne couvrent que les jours consignés ici. D’autres emplois dans la même année peuvent aussi compter.',
    ruleAndConditions: 'Règle et conditions',
    status_approaching: 'Proche du seuil',
    status_at_limit: 'À la limite',
    status_ss_under: 'Moins de 25 %',
    status_a1_required: 'A1 requise',
    status_a1_recorded: 'A1 enregistrée',
    status_ss_residence: '50 % et plus : État de résidence',
    status_floor_met: 'Minimum atteint',
    status_floor_below: 'Sous le minimum',
    status_floor_progress: 'Mois en cours',
    status_floor_no_data: 'Aucun jour consigné',
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
      'Sert à convertir les jours en pourcentage. La valeur par défaut est une hypothèse, sauf 240 sur France–Suisse, base simplifiée officielle à temps plein : indiquez votre propre chiffre, plus bas à temps partiel.',
    installHint: 'Ajoutez BorderDay à l’écran d’accueil pour une application en un geste.',
    emptyMonth: 'Aucun jour enregistré ce mois-ci.',
    weekdays: ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'],
    loading: 'Chargement…',
    previewBadge: 'APERÇU',
    previewBody: 'Aperçu gratuit : les jours restent dans ce navigateur, sur cet appareil, et seul le mois en cours peut être saisi. Un abonnement débloque tous les mois et enregistre votre journal dans votre compte.',
    previewCompanyBody: '{company} n’a pas encore d’abonnement actif : vous utilisez donc l’aperçu gratuit. Les jours restent dans ce navigateur, sur cet appareil, et seul le mois en cours peut être saisi.',
    previewCta: 'Voir les offres',
    previewMonthOnly: 'L’aperçu ne permet de saisir que le mois en cours.',
    savedToAccount: 'Enregistré dans votre compte.',
    savedToCompany:
      'Enregistré dans votre compte {company}. Vos RH voient le type et la date de chaque jour, s’il est marqué comme nuit hors du domicile pour le travail, et vos compteurs.',
    saveError: 'Enregistrement impossible. Réessayez.',
    deleteAllAccountConfirm: 'Supprimer tous les jours enregistrés dans votre compte ? Action irréversible.',
    importLocal: 'Copier {count} jours de cet appareil vers votre compte',
    disclaimerBanner:
      'Outil de suivi uniquement — pas un conseil fiscal ou juridique. Vérifiez les seuils auprès de l’autorité compétente.',
    employmentPercent: 'Taux d’emploi cette année',
    employmentPercentHint:
      'Temps partiel et année incomplète ensemble : 80 pour 80 % toute l’année, 50 pour un temps plein sur six mois. Certains seuils en jours sont réduits selon ce chiffre. Dans un compte entreprise, les RH le voient.',
    a1InPlace: 'Attestation A1 en place (accord-cadre)',
    a1ValidUntil: 'A1 valable jusqu’au',
    a1Hint:
      'Indiquée par vous ou votre employeur. BorderDay ne vérifie pas l’attestation. Dans un compte entreprise, les RH la voient.',
  },
  pricing: {
    title: 'Tarifs',
    subtitle: 'Offre entreprise en premier. Abonnements via Stripe Managed Payments (vendu via Link).',
    individual: 'Individuel (collaborateur)',
    company: 'Entreprise / RH',
    monthly: '4,99 € / mois',
    yearly: '49 € / an',
    yearlyNote: 'Environ deux mois offerts vs mensuel.',
    companyPrice: '5 € / collaborateur actif / mois',
    companyMin: 'Minimum 39 € / mois (couvre jusqu’à 7 collaborateurs actifs)',
    companyYearly: 'Facturation annuelle : 2 mois offerts (minimum 390 € / an)',
    activeEmployeeDef:
      'Collaborateur actif : membre de l\'entreprise ayant accepté l\'invitation et non désactivé. La facturation utilise l\'effectif actif courant chaque période (minimum 39 € / mois).',
    companyTax: 'hors TVA',
    individualTax: 'TVA incluse',
    includes: 'Inclus',
    include1: 'Tous les packs frontière de votre offre',
    include2:
      'Compteurs fiscaux lorsqu’ils existent, compteurs de sécurité sociale sur chaque corridor',
    include3: 'Alertes à l’approche des seuils',
    include4: 'Export et suppression de vos données à tout moment',
    include5: 'Anglais, français, allemand, italien',
    include6: 'PWA installable',
    companyInclude1: 'Tableau de bord RH avec compteurs par collaborateur et filtres',
    companyInclude2: 'Invitations e-mail, rôles (administrateur du compte / RH en lecture), export CSV',
    companyInclude3: 'Les collaborateurs voient les mêmes compteurs que les RH',
    companyInclude4: 'Protection des données dès la conception (types de jours seulement — pas de localisation)',
    subscribeMonthly: 'Commencer au mois',
    subscribeYearly: 'Commencer à l\'année',
    trialNote: 'Essai gratuit de 7 jours — carte requise à l\'inscription.',
    checkoutSuccess: 'Paiement configuré — votre essai est actif. Ouvrez votre compte pour continuer.',
    checkoutCancel: 'Paiement annulé — aucun débit. Vous pouvez réessayer à tout moment.',
    goToAccount: 'Aller au compte',
    needCompany: 'Créez ou ouvrez d\'abord un compte entreprise, puis abonnez-vous.',
    waitlistCta: 'Créer un compte',
    compareNote: 'Tarifs alignés sur des outils comparables au 31 oct. 2026 (Europe/Zurich). Pas un conseil fiscal.',
    recommended: 'Recommandé pour les employeurs',
  },
  faq: {
    title: 'FAQ',
    q1: 'BorderDay est-il un conseil fiscal ou juridique ?',
    a1: 'Non. C’est un outil personnel de suivi et de rappel. Les seuils proviennent de sources officielles publiques et peuvent évoluer. Vérifiez toujours auprès de votre employeur, d’un conseiller qualifié ou de l’autorité compétente.',
    q2: 'Où est stocké mon journal de jours ?',
    a2: 'Sans abonnement, uniquement sur votre appareil (IndexedDB dans le navigateur). Avec un abonnement actif ou un compte entreprise, dans votre compte BorderDay. Dans tous les cas, vous pouvez exporter en JSON ou CSV, ou tout supprimer.',
    q3: 'Pourquoi certains compteurs sont-ils désactivés ?',
    a3:
      'Nous n’affichons un chiffre que si sa méthode de calcul est confirmée par une source officielle. Sinon, la carte explique pourquoi aucun compteur ne fonctionne et vous renvoie à votre autorité. Elle n’invente jamais de chiffre.',
    q4: 'Suivez-vous ma localisation ?',
    a4: 'Non. La version 1 n’a ni GPS ni localisation en arrière-plan. Vous enregistrez les jours vous-même.',
    q5: 'Quelles frontières couvrez-vous ?',
    a5:
      'Neuf corridors dans cinq régions. Compteurs de sécurité sociale sur les neuf. Compteurs fiscaux sur quatre : Genève et autres cantons hors accord de 1983←France, Allemagne→Suisse, France→Luxembourg et Italie→Suisse. Pas encore de compteur fiscal : cantons de l’accord de 1983←France (Bâle et autres), Belgique→Luxembourg, Allemagne→Luxembourg, France→Belgique et Pays-Bas→Belgique.',
    q6: 'Et l’App Store ?',
    a6: 'La version 1 est une progressive web app installable (écran d’accueil). Une application iOS native pourra venir plus tard.',
    q7: 'Comment fonctionnent les paiements ?',
    a7: 'Le paiement utilise Stripe Managed Payments : Link est le marchand officiel (merchant of record) et gère la TVA/GST au checkout. Les offres entreprise et individuel incluent un essai gratuit de 7 jours ; une carte est requise à l\'inscription. Les codes promo sont acceptés. Voir les Conditions pour la résiliation et le droit de rétractation de 14 jours (consommateurs UE).',
    q8: 'Que ne couvre pas BorderDay ?',
    a8:
      'Les indépendants, les règles propres au secteur public, les personnes ayant des employeurs dans plusieurs États et le travail sans lien informatique au sens de l’accord-cadre. Les corridors non listés, comme France→Allemagne ou Pays-Bas→Allemagne. Les compteurs ne voient que les jours consignés ici : les autres emplois de l’année ne sont pas inclus. Les compteurs fiscaux n’existent pas sur tous les corridors. L’export CSV est un document de travail, pas une déclaration officielle comme le taux de télétravail annuel exigé par certains cantons. En cas de doute, vérifiez auprès de votre autorité.',
  },
  privacy: {
    title: 'Confidentialité',
    updated: 'Dernière mise à jour : 31 oct. 2026 (Europe/Zurich)',
    controllerTitle: 'Responsable du traitement',
    controllerBody:
      'Le responsable du traitement (RGPD) et le responsable du traitement au sens de la Loi fédérale suisse sur la protection des données (LPD / nLPD) pour les comptes entreprise BorderDay et les traitements associés est PrimeLogic Advisory Sàrl, Cours des Bastions 13, 1205 Genève, Suisse (IDE/UID CHE-312.418.158). Contact : hello@borderday.com · Confidentialité : privacy@borderday.com.',
    s1Title: 'Ce que nous collectons',
    s1Body:
      'Journal individuel (appareil) : pack frontière, type de chaque jour (télétravail, sur site, pays tiers, non travaillé), marque de nuit hors du domicile pour le travail, notes facultatives, jours de travail contractuels par an, taux d’emploi et A1 si vous les indiquez. Comptes entreprise (si utilisés) : nom de l’entreprise, e-mails/noms des membres, rôles, pack frontière, types et dates de jours, marques de nuit hors du domicile, taux d’emploi et A1 si indiqués, enregistrements de consentement. Conçu pour le RGPD et la loi fédérale suisse sur la protection des données (LPD / nLPD).',
    s2Title: 'Ce que nous ne collectons pas',
    s2Body:
      'Pas de GPS, pas de localisation continue, pas de géolocalisation IP stockée comme lieu de travail. Les RH voient types de jours, marques de nuit hors du domicile, taux d’emploi et A1 s’ils sont indiqués, et totaux — les mêmes compteurs que le collaborateur. Pas de traceurs pub. Pas de vente de données.',
    s3Title: 'E-mail du compte',
    s3Body:
      'Les e-mails de compte (inscription, lien magique, invitations) servent uniquement à l\'authentification et aux invitations. Demande d\'effacement : privacy@borderday.com.',
    s4Title: 'Vos droits (collaborateurs et RH)',
    s4Body:
      'Les collaborateurs peuvent exporter et supprimer leur journal. Ils voient exactement ce que voient les RH pour leurs compteurs. Retrait du consentement et effacement possibles via privacy@borderday.com.',
    s5Title: 'Sous-traitants et résidence',
    s5Body:
      'Production sur Supabase (UE, eu-central-1). Sous-traitants : Resend (e-mails transactionnels, invitations et auth), Stripe / Link (paiements Managed Payments). Auth : e-mail et Google.',
    s6Title: 'Conservation des données',
    s6Body:
      'Conservation par défaut des journaux entreprise : 24 mois, sauf réglage entreprise (1–120 mois) ou obligation légale plus longue. Ensuite suppression ou anonymisation. Les données DEMO sont étiquetées et réinitialisables.',
    s7Title: 'Transparence collaborateur / RH',
    s7Body:
      'Aucun score caché réservé aux RH. Le calcul des compteurs (jours utilisés, autorisés, statut) est identique pour le collaborateur et le tableau RH.',
    contact: 'Contact confidentialité : privacy@borderday.com · hello@borderday.com',
  },
  individuals: {
    title: 'BorderDay pour les particuliers',
    heroTitle: 'Enregistrez vos propres jours de travail',
    heroBody:
      'Salariés et particuliers peuvent consigner télétravail, jours sur site, déplacements et jours non travaillés : compteurs de sécurité sociale sur chaque corridor, compteurs fiscaux là où la règle peut être comptée aujourd’hui. Si votre employeur utilise BorderDay, rejoignez-le via son lien d’invitation pour partager les mêmes compteurs avec les RH.',
    ctaApp: 'Ouvrir l’app collaborateur',
    ctaPricing: 'Tarif individuel',
    ctaCompanies: 'Mon employeur a besoin de l’offre entreprise',
    point1:
      'L’aperçu gratuit reste sur votre appareil ; un abonnement enregistre le journal dans votre compte. Export et suppression dans les deux cas.',
    point2: 'Mêmes packs frontière et compteurs sourcés avec prudence',
    point3: 'Adhésion entreprise optionnelle — vous voyez ce que voient les RH',
  },
  company: {
    signupTitle: 'Créer un compte entreprise',
    signupSubtitle:
      'Connectez-vous par e-mail ou Google, puis créez votre entreprise. Abonnez-vous ensuite sur la page Tarifs.',
    companyName: 'Nom de l’entreprise',
    yourName: 'Votre nom',
    workEmail: 'E-mail professionnel',
    createButton: 'Créer l\'entreprise',
    created: 'Entreprise créée. Vous en êtes l’administrateur du compte.',
    openDashboard: 'Ouvrir le tableau de bord RH',
    inviteTitle: 'Inviter des collaborateurs',
    inviteSubtitle: 'Générez un lien d\'invitation. Nous envoyons l\'e-mail d\'invitation lorsque c\'est possible ; vous pouvez toujours copier et partager le lien.',
    inviteEmail: 'E-mail du collaborateur',
    inviteRole: 'Rôle',
    roleOwner: 'Administrateur du compte',
    roleHr: 'RH (lecture)',
    roleEmployee: 'Collaborateur',
    sendInvite: 'Créer le lien d’invitation',
    inviteLinkLabel: 'Lien d’invitation (copier)',
    inviteCreated: 'Invitation créée. Partagez le lien avec le collaborateur.',
    pendingInvites: 'Invitations en attente',
    dashboardTitle: 'Tableau de bord RH',
    dashboardSubtitle:
      'Compteurs fiscaux et de sécurité sociale par collaborateur. Types de jours, marques de nuit hors du domicile et totaux — jamais la localisation.',
    filterBorder: 'Filtrer par frontière',
    filterStatus: 'Filtrer par statut',
    filterAll: 'Tous',
    exportCsv: 'Exporter CSV (audit)',
    employees: 'Collaborateurs',
    noEmployees: 'Aucun collaborateur. Créez un lien d’invitation.',
    viewHistory: 'Historique des jours',
    historyTitle: 'Historique des jours du collaborateur',
    historySubtitle:
      'Type de jour, date et marque de nuit hors du domicile uniquement. Aucune donnée de localisation n’est stockée.',
    backDashboard: 'Retour au tableau de bord',
    joinTitle: 'Rejoindre votre entreprise',
    joinSubtitle: 'Acceptez l’invitation, le consentement de visibilité, et choisissez votre pack frontière.',
    joinButton: 'Rejoindre l’entreprise',
    joinSuccess:
      'C’est fait : vous faites partie de l’entreprise. Ouvrez l’app collaborateur pour enregistrer vos jours.',
    pickBorder: 'Votre pack frontière',
    consentTitle: 'Consentement — ce que les RH peuvent voir',
    consentBody:
      'En rejoignant l’entreprise, vous acceptez que le propriétaire et les lecteurs RH de votre employeur voient : votre nom, votre e-mail, le pack frontière choisi, les jours de travail contractuels, le taux d’emploi et l’A1 s’ils sont indiqués, le type et la date de chaque jour consigné, sa marque éventuelle de nuit hors du domicile pour le travail, et les mêmes compteurs fiscaux et de sécurité sociale que vous. Ils peuvent aussi indiquer votre taux d’emploi et votre A1. Ils ne voient ni GPS ni trace de localisation — BorderDay ne collecte pas la localisation. Vous pouvez exporter ou supprimer votre journal. Conservation par défaut : 24 mois (paramètre de l’entreprise). Outil de suivi, pas un conseil fiscal ou juridique.',
    consentAccept: 'J’ai lu et j’accepte cet avis',
    consentRequired: 'Acceptez l’avis de consentement pour continuer.',
    demoDataBadge: 'DONNÉES DEMO',
    demoBanner: 'Cette entreprise est étiquetée DEMO. Chiffres d’exemple pour l’aperçu produit — pas de vrais collaborateurs.',
    loadDemo: 'Charger l’entreprise DEMO',
    loading: 'Chargement…',
    loadError: 'Impossible de charger cette page. Réessayez.',
    accessDenied: 'Il vous faut un accès RH ou administrateur du compte à cette entreprise.',
    noCompany: 'Vous ne faites encore partie d’aucune entreprise.',
    chooseCompany: 'Choisissez une entreprise.',
    billingInactive: 'Cette entreprise n’a pas d’abonnement actif. Les collaborateurs peuvent la rejoindre, mais ne pourront saisir leurs jours qu’après votre souscription.',
    billingCta: 'Voir les offres',
    inviteEmailed: 'Invitation créée et envoyée par e-mail. Vous pouvez aussi partager le lien.',
    inviteInvalid: 'Invitation introuvable ou expirée.',
    joinEmailMismatch:
      'Cette invitation a été envoyée à {invited}, mais la session ouverte est celle de {current}. Déconnectez-vous, puis connectez-vous avec l’adresse invitée.',
    joinEmailUnconfirmed: 'Confirmez votre adresse e-mail, puis rouvrez cette invitation.',
    viewMyHistory: 'Voir ce que voient les RH',
    countersHeading: 'Compteurs',
    status: 'Statut',
    usedAllowed: 'Utilisé / autorisé',
    kindTax: 'Fiscalité',
    kindSs: 'Sécurité sociale',
    colDate: 'Date',
    colDayType: 'Type de jour',
    emptyCounters: 'Le collaborateur n’a pas encore choisi de pack frontière.',
    profileTitle: 'Taux d’emploi et A1',
    saveProfile: 'Enregistrer',
    profileSaved: 'Enregistré.',
  },

  terms: {
    title: 'Conditions d’utilisation',
    updated: 'Dernière mise à jour : 31 oct. 2026 (Europe/Zurich)',
    providerTitle: 'Prestataire et partie contractante',
    providerBody:
      'Le service BorderDay est fourni par PrimeLogic Advisory Sàrl, Cours des Bastions 13, 1205 Genève, Suisse (IDE/UID CHE-312.418.158), qui est la partie contractante pour le service. Contact : hello@borderday.com. Le checkout utilise Stripe Managed Payments : les achats apparaissent comme vendus via Link, et Link est le marchand officiel (merchant of record / vendeur enregistré) pour le paiement, la collecte de la fiscalité et les remboursements au niveau de la commande lorsque Managed Payments s’applique.',
    s1Title: 'Service',
    s1Body:
      'BorderDay est un outil de suivi et de rappel des classifications de jours pour employeurs et collaborateurs sur certains corridors transfrontaliers. Ce n’est pas un conseil fiscal ou juridique, ni un substitut à votre employeur, à un conseiller qualifié ou à une autorité compétente. Voir l’Avertissement.',
    s2Title: 'Comptes et usage entreprise',
    s2Body:
      'Vous devez fournir des informations de compte exactes. Les administrateurs du compte invitent les collaborateurs ; ceux-ci choisissent un pack frontière et enregistrent uniquement le type de jour (pas de localisation). Les RH voient les mêmes compteurs que le collaborateur. Vous êtes responsable de l’exactitude des jours enregistrés et du traitement licite des données sous le RGPD et, le cas échéant, la LPD suisse.',
    s3Title: 'Abonnements, essai et résiliation',
    s3Body:
      'Les offres payantes sont des abonnements. Entreprise et individuel incluent un essai gratuit de 7 jours ; une carte de paiement est requise à l’inscription. Sans moyen de paiement valide à la fin de l’essai, l’abonnement est résilié. Vous pouvez résilier via les outils de commande Link ou le portail client Stripe. La résiliation arrête les renouvellements futurs ; les montants déjà encaissés pour une période commencée ne sont pas proratisés, sauf obligation légale ou politique de remboursement Link.',
    s4Title: 'Tarifs, TVA et marchand officiel',
    s4Body:
      'Entreprise : 5 € par collaborateur actif et par mois, minimum 39 € / mois (ou équivalent annuel avec 2 mois offerts), hors TVA. Individuel : 4,99 € / mois ou 49 € / an, TVA incluse. Le checkout utilise Stripe Managed Payments : les achats apparaissent comme vendus via Link, et Link est le marchand officiel pour la collecte et le dépôt de la TVA là où Managed Payments s’applique. Les prix peuvent être convertis en devise locale au checkout.',
    s5Title: 'Droit de rétractation des consommateurs UE (14 jours)',
    s5Body:
      'Si vous achetez une offre individuelle en tant que consommateur dans l’UE/EEE, la directive 2011/83/UE vous confère un droit de rétractation de 14 jours à compter de la conclusion du contrat, sans motif. Pour l’exercer, contactez le support Link pour la commande (vendue via Link) et/ou privacy@borderday.com avec l’e-mail du compte et la référence. Pour les services numériques, le début d’exécution pendant le délai après consentement exprès préalable et reconnaissance de la perte du droit une fois l’exécution commencée peut limiter ou éteindre ce droit (art. 16) — le checkout et les conditions Sold through Link de Link décrivent le traitement pour votre commande. Les achats entreprise ne sont pas des contrats à distance de consommation.',
    s6Title: 'Remboursements et support paiement',
    s6Body:
      'Les demandes de paiement, reçu, facture fiscale et remboursement au niveau de la commande Managed Payments sont gérées par Link selon les conditions Sold through Link / Purchase de Stripe. Les questions produit (fonctionnement, accès, export) : hello@borderday.com ou privacy@borderday.com.',
    s7Title: 'Modifications',
    s7Body:
      'Nous pouvons mettre à jour ces Conditions. La date « Dernière mise à jour » change alors. L’usage continu après une mise à jour vaut acceptation, sauf processus différent imposé par le droit de la consommation.',
    contact: 'Contact : hello@borderday.com · Confidentialité : privacy@borderday.com',
  },
  disclaimer: {
    title: 'Avertissement',
    body:
      'BorderDay est un outil personnel de suivi et de rappel. Ce n’est ni un conseil fiscal, ni un conseil juridique, ni un substitut à votre employeur, à un conseiller fiscal qualifié ou à l’institution de sécurité sociale compétente. Les seuils affichés proviennent de sources officielles publiques et peuvent évoluer ; vérifiez toujours auprès de l’autorité compétente. Vous êtes responsable de l’exactitude des jours que vous enregistrez.',
  },
  footer: {
    tagline:
      'Suivi des jours pour les équipes et les collaborateurs qui travaillent par-delà les frontières.',
    rights: '© {year} BorderDay',
  },
  auth: {
    signInTitle: 'Connexion',
    signInSubtitle: 'E-mail (mot de passe ou lien magique) ou Google.',
    signUpTitle: 'Créer un compte',
    signUpSubtitle: 'E-mail professionnel et mot de passe, ou continuer avec Google.',
    email: 'E-mail',
    password: 'Mot de passe',
    displayName: 'Votre nom',
    signIn: 'Se connecter',
    signUp: "S'inscrire",
    createAccount: 'Créer le compte',
    magicLink: 'Lien magique',
    sendMagic: "M'envoyer un lien de connexion",
    magicSent: 'Vérifiez votre e-mail pour le lien de connexion.',
    continueGoogle: 'Continuer avec Google',
    googleHint: 'OAuth Google sécurisé — nous ne voyons jamais votre mot de passe Google.',
    googleNotReady: "Google n'est pas encore activé. Utilisez l'e-mail pour l'instant.",
    checkEmail: 'Vérifiez votre e-mail pour confirmer le compte (si demandé), puis continuez.',
    noAccount: 'Pas encore de compte ?',
    hasAccount: 'Déjà un compte ?',
    notConfigured: "L'authentification n'est pas configurée dans cette version.",
    completing: 'Finalisation de la connexion…',
    callbackFailed: 'Impossible de terminer la connexion. Réessayez.',
    paymentsUnavailable: 'Impossible de démarrer le paiement — réessayez ou contactez le support.',
    signOut: 'Se déconnecter',
  },
};

export default fr;

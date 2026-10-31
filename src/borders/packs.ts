import type { BorderPack, LimitCounter, OfficialSource } from './types';

const CHECKED = '2026-10-31';

const SRC = {
  geAvenant: {
    title: 'ge.ch — avenant télétravail',
    url: 'https://www.ge.ch/actualite/teletravail-personnes-frontalieres-entree-vigueur-avenant-convention-franco-suisse-29-07-2025',
    checked: CHECKED,
  },
  geCalc: {
    title: 'ge.ch — calculer le taux de télétravail',
    url: 'https://www.ge.ch/imposition-du-teletravail-personnes-frontalieres/comment-calculer-taux-teletravail',
    checked: CHECKED,
  },
  estvAi: {
    title: 'ESTV amicable agreement CH–FR (PDF)',
    url: 'https://www.estv.admin.ch/dam/fr/sd-web/Bibcb06jL1wG/int-laender-fr-dba-ai-cdi-20260429-fr.pdf',
    checked: CHECKED,
  },
  impots10: {
    title: 'impots.gouv.fr — fiche 10 jours / 40%',
    url: 'https://www.impots.gouv.fr/sites/default/files/media/1_metier/1_particulier/EV/4_changements_de_situation/480_depart_arrivee_france/fiche-pratique-accords-interpretatifs-10-jours-cdi.pdf',
    checked: CHECKED,
  },
  impots34: {
    title: 'impots.gouv.fr — FR–LU seuil 34 jours',
    url: 'https://www.impots.gouv.fr/sites/default/files/media/10_conventions/luxembourg/nid_13587_accord_avec_le_luxembourg_sur_les_modalites_d_application_du_seuil_des_34_jours.pdf',
    checked: CHECKED,
  },
  fps: {
    title: 'Belgian FPS — framework agreement depositary',
    url: 'https://socialsecurity.belgium.be/en/internationally-active/cross-border-telework-eu-eea-and-switzerland',
    checked: CHECKED,
  },
  cleiss: {
    title: 'CLEISS — télétravail transfrontalier',
    url: 'https://www.cleiss.fr/particuliers/teletravail-transfrontalier.html',
    checked: CHECKED,
  },
  sifIt: {
    title: 'SIF — Switzerland–Italy home office rules in force',
    url: 'https://www.bsv.admin.ch/en/newnsb/KIyFJwwqspqaOcHDaT7u0',
    checked: CHECKED,
  },
  fedlex: {
    title: 'Fedlex RU 2026 104 — protocollo CH–IT',
    url: 'https://www.fedlex.admin.ch/eli/oc/2026/104/it',
    checked: CHECKED,
  },
  baselStadt: {
    title: 'Basel-Stadt — Homeoffice Vorgaben (rules for its own staff)',
    url: 'https://media.bs.ch/original_file/e51a326a9041d841276beda8d30aa16451ad97ca/homeoffice-vorgaben-fuer-grenzgaengerinnen-und-grenzgaenger.pdf',
    checked: CHECKED,
  },
  fwMemo: {
    title: 'Belgian FPS — framework agreement, explanatory memorandum (25% and 50%)',
    url: 'https://socialsecurity.belgium.be/sites/default/files/content/docs/en/international/explanatory_memorandum_to_the_framework_agreement.pdf',
    checked: CHECKED,
  },
  fwText: {
    title: 'Belgian FPS — framework agreement text (Art. 2 exclusions, Art. 3, Art. 4)',
    url: 'https://socialsecurity.belgium.be/sites/default/files/content/docs/en/international/framework_agreement_on_cross-border_telework.pdf',
    checked: CHECKED,
  },
  ccssParent: {
    title: 'CCSS Luxembourg — telework agreement',
    url: 'https://ccss.public.lu/en/employeurs/secteur-prive/activite-etranger/accord-teletravail.html',
    checked: CHECKED,
  },
  ge40: {
    title: 'ge.ch — au-delà de 40% de télétravail (imposable en France dès le 1er jour)',
    url: 'https://www.ge.ch/imposition-du-teletravail-personnes-frontalieres/au-dela-40-activite-teletravail',
    checked: CHECKED,
  },
  ai1983: {
    title: 'impots.gouv.fr — accord amiable du 30 juin 2023 (accord frontalier de 1983)',
    url: 'https://www.impots.gouv.fr/sites/default/files/media/10_conventions/suisse/suisse_accord_interpretatif_teletravail_accord_frontalier_1983.pdf',
    checked: CHECKED,
  },
  ex1983: {
    title: 'ESTV — fiche pratique, accord du 11 avril 1983 (exemples)',
    url: 'https://www.estv.admin.ch/dam/fr/sd-web/Uf-QRIyIOJ5T/int-laender-fr-dba-exemplare-ai-1983-20230630-fr.pdf',
    checked: CHECKED,
  },
  impotsCantons: {
    title: 'impots.gouv.fr — tax treatment of cross-border workers, by canton',
    url: 'https://www.impots.gouv.fr/international-particulier/questions/tax-treatment-cross-border-workers',
    checked: CHECKED,
  },
  jura: {
    title: 'Canton du Jura — frontaliers (45 nuits, 4,5 %)',
    url: 'https://www.jura.ch/fr/Autorites/Administration/DFI/CTR/Impots-speciaux/Frontaliers/Frontaliers.html',
    checked: CHECKED,
  },
  konsVerCHEV: {
    title: 'KonsVerCHEV §§ 7–10 — Nichtrückkehrtage (gesetze-im-internet.de)',
    url: 'https://www.gesetze-im-internet.de/konsverchev/BJNR218700010.html',
    checked: CHECKED,
  },
  aargau: {
    title: 'Kanton Aargau — Merkblatt Grenzgänger (Stand 1. Januar 2026)',
    url: 'https://www.ag.ch/media/kanton-aargau/dfr/dokumente/steuern/quellensteuer/quellensteuer-arbeitnehmende/qust-merkblaetter/qust-grenzgaenger-2026.pdf',
    checked: CHECKED,
  },
  luDe34: {
    title: 'BMF — Konsultationsvereinbarung DE–LU 11 Jan 2024 (34 Tage)',
    url: 'https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/Internationales_Steuerrecht/Staatenbezogene_Informationen/Laender_A_Z/Luxemburg/2024-01-15-Luxemburg-Abkommen-DBA-Verstaendigungsvereinbarung-Anwendung-Auslegung-DBA.html',
    checked: CHECKED,
  },
  luDe34Gov: {
    title: 'gouvernement.lu — nouveautés 2024: DE–LU, 19 à 34 jours',
    url: 'https://gouvernement.lu/fr/actualites/toutes_actualites/communiques/2023/12-decembre/29-nouveautes-2024.html',
    checked: CHECKED,
  },
  luBe34: {
    title: 'impotsdirects.public.lu — seuil de tolérance BE–LU 34 jours',
    url: 'https://impotsdirects.public.lu/dam-assets/fr/conventions/conv/seuil-de-tolerance-b-03-2023.pdf',
    checked: CHECKED,
  },
  luBe34Gov: {
    title: 'gouvernement.lu — Gaichel 2021: BE–LU, 34 jours dès 2022',
    url: 'https://gouvernement.lu/fr/actualites/toutes_actualites/communiques/2021/08-aout/31-gaichel-accords-domaine-fiscal.html',
    checked: CHECKED,
  },
  luFrAvenant: {
    title: 'gouvernement.lu — avenant FR–LU du 7 novembre 2022 (34 jours)',
    url: 'https://gouvernement.lu/fr/actualites/toutes_actualites/communiques/2022/11-novembre/07-signature-luxembourg-france.html',
    checked: CHECKED,
  },
  frBeAnswer: {
    title: 'Assemblée nationale — réponse ministérielle du 28 mai 2024 (FR–BE, art. 11)',
    url: 'https://questions.assemblee-nationale.fr/q16/16-12971QE.htm',
    checked: CHECKED,
  },
  frBeBofip: {
    title: 'BOFiP — régime frontalier France–Belgique',
    url: 'https://bofip.impots.gouv.fr/bofip/5518-PGP.html/identifiant=BOI-INT-CVB-BEL-10-60-20170306',
    checked: CHECKED,
  },
  nlBe: {
    title: 'Belastingdienst — belastingverdrag met België',
    url: 'https://www.belastingdienst.nl/wps/wcm/connect/nl/buitenland/content/belastingverdrag-met-belgie',
    checked: CHECKED,
  },
} as const;

const WARN = [0.75, 0.9, 1];

/**
 * Shared EU framework social-security counter.
 * Three bands: under 25% no A1 on telework grounds, 25% to under 50% A1 required, 50% or more
 * residence state. 25%: explanatory memorandum. "Less than 50%": framework agreement Art. 3.
 * Strict at 50%, so not `inclusive`. Trip days stay out of the percentage (they are not telework);
 * the engine warns on them instead because they can break eligibility (Art. 2(3)).
 */
function ssFramework(
  id: string,
  sources: OfficialSource[] = [SRC.fwMemo, SRC.fwText, SRC.fps, SRC.cleiss],
  notesKey = 'ss_framework_note',
): LimitCounter {
  return {
    id,
    kind: 'social_security',
    labelKey: 'ss_framework_under_50',
    enabled: true,
    limit: 50,
    a1FromPercent: 25,
    unit: 'percent_of_working_time',
    countsAs: {
      telework: 'toward_percent',
      onsite: 'none',
      third_country: 'none',
      non_working: 'none',
    },
    warningAt: WARN,
    sources,
    notesKey,
  };
}

const LU_SS_SOURCES = [SRC.ccssParent, SRC.fwMemo, SRC.fwText, SRC.fps];

export const BORDER_PACKS: BorderPack[] = [
  {
    // Convention regime: Geneva and every canton outside the 1983 agreement.
    id: 'geneva_fr',
    nameKey: 'geneva_fr',
    residenceCountries: ['FR'],
    workCountries: ['CH'],
    regionNoteKey: 'geneva_region',
    defaultAnnualWorkingDays: 240,
    counters: [
      {
        id: 'geneva_tax_telework_40',
        kind: 'tax',
        labelKey: 'ch_fr_tax_telework_40',
        enabled: true,
        limit: 40,
        inclusive: true, // "jusqu'à 40 %"
        missionRole: 'share',
        unit: 'percent_of_working_time',
        countsAs: {
          telework: 'toward_percent',
          onsite: 'none',
          third_country: 'mission', // only the fraction inside both limits: see chFrMissionSplit
          non_working: 'none',
        },
        warningAt: WARN,
        sources: [SRC.geAvenant, SRC.geCalc, SRC.ge40, SRC.estvAi, SRC.impots10],
        notesKey: 'ch_fr_tax_note',
        overKey: 'ch_fr_over_40',
      },
      {
        id: 'geneva_tax_missions_10',
        kind: 'tax',
        labelKey: 'ch_fr_tax_missions_10',
        enabled: true,
        limit: 10,
        inclusive: true, // "dans la limite annuelle de 10 jours"
        missionRole: 'missions',
        prorate: 'ceil', // ESTV accord 29.04.2026 §1.d: "arrondie à l'unité supérieure"
        unit: 'days_per_year',
        countsAs: {
          telework: 'none',
          onsite: 'none',
          third_country: 'mission',
          non_working: 'none',
        },
        warningAt: WARN,
        sources: [SRC.estvAi, SRC.impots10],
        notesKey: 'ch_fr_missions_note',
      },
      ssFramework('geneva_ss_50'),
    ],
  },
  {
    // 1983 agreement: Bern, Solothurn, Basel-Stadt, Basel-Landschaft, Vaud, Valais, Neuchâtel, Jura.
    // Taxed in France (France remits 4.5% to Switzerland). Same 40%/10-day mission split as the
    // convention regime, plus a 45 work-night cap. Any excess mission day in France ends the regime;
    // BorderDay cannot tell France from a third state, so every excess mission day is a warning.
    id: 'basel_fr',
    nameKey: 'basel_fr',
    residenceCountries: ['FR'],
    workCountries: ['CH'],
    regionNoteKey: 'ch_fr_1983_region',
    defaultAnnualWorkingDays: 240,
    counters: [
      {
        id: 'basel_fr_tax_telework_40',
        kind: 'tax',
        labelKey: 'ch_fr_1983_telework_40',
        enabled: true,
        limit: 40,
        inclusive: true,
        missionRole: 'share',
        unit: 'percent_of_working_time',
        countsAs: {
          telework: 'toward_percent',
          onsite: 'none',
          third_country: 'mission',
          non_working: 'none',
        },
        warningAt: WARN,
        sources: [SRC.ai1983, SRC.ex1983, SRC.impotsCantons, SRC.jura],
        notesKey: 'ch_fr_1983_tax_note',
        overKey: 'ch_fr_1983_over_40',
        missionExcessKey: 'ch_fr_1983_mission_excess',
      },
      {
        id: 'basel_fr_tax_missions_10',
        kind: 'tax',
        labelKey: 'ch_fr_1983_missions_10',
        enabled: true,
        limit: 10,
        inclusive: true,
        missionRole: 'missions',
        prorate: 'ceil',
        unit: 'days_per_year',
        countsAs: {
          telework: 'none',
          onsite: 'none',
          third_country: 'mission',
          non_working: 'none',
        },
        warningAt: WARN,
        sources: [SRC.ai1983, SRC.ex1983, SRC.jura],
        notesKey: 'ch_fr_1983_missions_note',
        overKey: 'ch_fr_1983_over_mission',
        missionExcessKey: 'ch_fr_1983_mission_excess',
      },
      {
        id: 'basel_fr_tax_nights_45',
        kind: 'tax',
        labelKey: 'ch_fr_1983_nights_45',
        enabled: true,
        limit: 45,
        inclusive: true,
        countsOvernight: true,
        unit: 'days_per_year',
        countsAs: {
          telework: 'none',
          onsite: 'none',
          third_country: 'none',
          non_working: 'none',
        },
        warningAt: WARN,
        sources: [SRC.ai1983, SRC.ex1983, SRC.jura, SRC.impotsCantons],
        notesKey: 'ch_fr_1983_nights_note',
        overKey: 'ch_fr_1983_over_45',
      },
      ssFramework('basel_fr_ss_50'),
    ],
  },
  {
    // The 60-day rule is national (DE–CH). The 5-day floor is one canton's staff rule.
    id: 'basel_de',
    nameKey: 'basel_de',
    residenceCountries: ['DE'],
    workCountries: ['CH'],
    regionNoteKey: 'basel_region',
    defaultAnnualWorkingDays: 240,
    dayHintKeys: { third_country: 'third_countryHint_basel_de' },
    counters: [
      {
        id: 'basel_de_nonreturn_60',
        kind: 'tax',
        labelKey: 'basel_de_nonreturn_60',
        enabled: true,
        limit: 60,
        inclusive: true, // status lost "bei mehr als 60 Nichtrückkehrtagen"
        countsOvernight: true,
        unit: 'days_per_year',
        countsAs: {
          telework: 'none',
          onsite: 'none',
          third_country: 'full', // KonsVerCHEV §8(5): third-state trips always count, even same-day
          non_working: 'none',
        },
        warningAt: WARN,
        sources: [SRC.konsVerCHEV, SRC.aargau],
        notesKey: 'basel_de_nonreturn_note',
        overKey: 'basel_de_over_60',
      },
      {
        id: 'basel_de_employer_practice',
        kind: 'employer_practice',
        labelKey: 'basel_de_employer_commute',
        enabled: true,
        limit: 5,
        direction: 'floor', // "mindestens an fünf Tagen pro Monat"
        period: 'month',
        unit: 'days_per_period',
        countsAs: {
          telework: 'none',
          onsite: 'full',
          third_country: 'none',
          non_working: 'none',
        },
        warningAt: [],
        sources: [SRC.baselStadt, SRC.konsVerCHEV],
        notesKey: 'basel_de_employer_note',
      },
      ssFramework('basel_de_ss_50'),
    ],
  },
  {
    id: 'luxembourg_fr',
    nameKey: 'luxembourg_fr',
    residenceCountries: ['FR'],
    workCountries: ['LU'],
    defaultAnnualWorkingDays: 220,
    logHintKey: 'logHint_luxembourg_fr',
    counters: [
      {
        id: 'lu_fr_tax_34',
        kind: 'tax',
        labelKey: 'lu_tax_tolerance_34',
        enabled: true,
        limit: 34,
        inclusive: true, // "n'excédant pas au total"
        prorate: 'floor', // accord §1.b: "le nombre inférieur de journées entières"
        unit: 'days_per_year',
        countsAs: {
          telework: 'full',
          onsite: 'none',
          third_country: 'full',
          non_working: 'none',
        },
        warningAt: WARN,
        sources: [SRC.impots34, SRC.luFrAvenant],
        notesKey: 'lu_fr_tax_note',
        overKey: 'lu_over_34',
      },
      ssFramework('lu_fr_ss_50', [...LU_SS_SOURCES, SRC.cleiss], 'ss_framework_lu_note'),
    ],
  },
  {
    id: 'luxembourg_be',
    nameKey: 'luxembourg_be',
    residenceCountries: ['BE'],
    workCountries: ['LU'],
    defaultAnnualWorkingDays: 220,
    counters: [
      {
        // Official LU PDF: 34 days; part-time and part-year are NOT reduced; fraction of a day = full day.
        id: 'lu_be_tax_34',
        kind: 'tax',
        labelKey: 'lu_tax_tolerance_34',
        enabled: true,
        limit: 34,
        inclusive: true,
        unit: 'days_per_year',
        countsAs: {
          telework: 'full',
          onsite: 'none',
          third_country: 'full',
          non_working: 'none',
        },
        warningAt: WARN,
        sources: [SRC.luBe34, SRC.luBe34Gov],
        notesKey: 'lu_be_tax_note',
        overKey: 'lu_be_over_34',
      },
      ssFramework('lu_be_ss_50', LU_SS_SOURCES, 'ss_framework_lu_note'),
    ],
  },
  {
    id: 'luxembourg_de',
    nameKey: 'luxembourg_de',
    residenceCountries: ['DE'],
    workCountries: ['LU'],
    defaultAnnualWorkingDays: 220,
    counters: [
      {
        // BMF Konsultationsvereinbarung 11 Jan 2024: 34 days; part-time/part-year NOT reduced.
        // Activity under 30 minutes does not count — BorderDay has no minute entry, so note that.
        id: 'lu_de_tax_34',
        kind: 'tax',
        labelKey: 'lu_tax_tolerance_34',
        enabled: true,
        limit: 34,
        inclusive: true,
        unit: 'days_per_year',
        countsAs: {
          telework: 'full',
          onsite: 'none',
          third_country: 'full',
          non_working: 'none',
        },
        warningAt: WARN,
        sources: [SRC.luDe34, SRC.luDe34Gov],
        notesKey: 'lu_de_tax_note',
        overKey: 'lu_de_over_34',
      },
      ssFramework('lu_de_ss_50', LU_SS_SOURCES, 'ss_framework_lu_note'),
    ],
  },
  {
    id: 'belgium_fr',
    nameKey: 'belgium_fr',
    residenceCountries: ['FR'],
    workCountries: ['BE'],
    defaultAnnualWorkingDays: 220,
    counters: [
      {
        id: 'be_fr_tax',
        kind: 'tax',
        labelKey: 'be_fr_tax_label',
        enabled: false,
        countsAs: {},
        warningAt: WARN,
        sources: [SRC.frBeAnswer, SRC.impotsCantons, SRC.frBeBofip],
        pendingReasonKey: 'pending_be_fr_tax',
        pendingValueKey: 'be_fr_value',
      },
      ssFramework('be_fr_ss_50'),
    ],
  },
  {
    id: 'belgium_nl',
    nameKey: 'belgium_nl',
    residenceCountries: ['NL'],
    workCountries: ['BE'],
    defaultAnnualWorkingDays: 220,
    counters: [
      {
        id: 'be_nl_tax',
        kind: 'tax',
        labelKey: 'be_nl_tax_label',
        enabled: false,
        countsAs: {},
        warningAt: WARN,
        sources: [SRC.nlBe],
        pendingReasonKey: 'pending_be_nl_tax',
        pendingValueKey: 'be_nl_value',
      },
      ssFramework('be_nl_ss_50'),
    ],
  },
  {
    id: 'ticino_it',
    nameKey: 'ticino_it',
    residenceCountries: ['IT'],
    workCountries: ['CH'],
    regionNoteKey: 'ticino_region',
    defaultAnnualWorkingDays: 240,
    dayHintKeys: { telework: 'teleworkHint_ticino' },
    counters: [
      {
        id: 'ticino_tax_telework_25',
        kind: 'tax',
        labelKey: 'ch_it_tax_telework_25',
        enabled: true,
        limit: 25,
        inclusive: true, // "al massimo il 25 per cento"
        unit: 'percent_of_working_time',
        countsAs: {
          telework: 'toward_percent',
          onsite: 'none',
          third_country: 'none',
          non_working: 'none',
        },
        warningAt: WARN,
        sources: [SRC.fedlex, SRC.sifIt],
        notesKey: 'ch_it_tax_note',
        overKey: 'ch_it_over',
      },
      {
        // Protocol 2.1: days "non rientrare quotidianamente al proprio domicilio... per motivi
        // professionali". Only the overnight flag measures this; a same-day trip abroad does not count.
        id: 'ticino_tax_nonreturn_45',
        kind: 'tax',
        labelKey: 'ch_it_tax_nonreturn_45',
        enabled: true,
        limit: 45,
        inclusive: true, // "per un massimo di 45 giorni"
        countsOvernight: true,
        unit: 'days_per_year',
        countsAs: {
          telework: 'none',
          onsite: 'none',
          third_country: 'none',
          non_working: 'none',
        },
        warningAt: WARN,
        sources: [SRC.fedlex, SRC.sifIt],
        notesKey: 'ch_it_nonreturn_note',
        overKey: 'ch_it_over',
      },
      ssFramework('ticino_ss_50'),
    ],
  },
];

export function getBorderPack(id: string): BorderPack | undefined {
  return BORDER_PACKS.find((p) => p.id === id);
}

export function listBorderPacks(): BorderPack[] {
  return BORDER_PACKS;
}

/** Corridors with a running treaty or statute tax counter. Marketing copy must match this list. */
export function hasTaxCounter(pack: BorderPack): boolean {
  // Profile-gated counters (e.g. FR→BE pre-2012) are optional and must not claim general tax coverage.
  return pack.counters.some((c) => c.kind === 'tax' && c.enabled && !c.requiresProfileFlag);
}

export function hasSocialSecurityCounter(pack: BorderPack): boolean {
  return pack.counters.some((c) => c.kind === 'social_security' && c.enabled);
}

export function tracksOvernight(pack: BorderPack): boolean {
  return pack.counters.some((c) => c.enabled && c.countsOvernight);
}

import type { BorderPack } from './types';

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
  ccss: {
    title: 'CCSS Luxembourg — telework framework notice',
    url: 'https://ccss.public.lu/en/employeurs/secteur-prive/activite-etranger/accord-teletravail/notice-teletravail.html',
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
    title: 'Basel-Stadt — Homeoffice Vorgaben',
    url: 'https://media.bs.ch/original_file/e51a326a9041d841276beda8d30aa16451ad97ca/homeoffice-vorgaben-fuer-grenzgaengerinnen-und-grenzgaenger.pdf',
    checked: CHECKED,
  },
  inami: {
    title: 'INAMI — statistiques travailleurs frontaliers',
    url: 'https://www.inami.fgov.be/fr/statistiques/statistiques-travailleurs-frontaliers',
    checked: CHECKED,
  },
} as const;

const WARN = [0.75, 0.9, 1];

/** Shared EU framework social-security counter (under 50% telework in residence). */
function ssFrameworkUnder50(id: string): BorderPack['counters'][number] {
  return {
    id,
    kind: 'social_security',
    labelKey: 'ss_framework_under_50',
    enabled: true,
    limit: 50,
    unit: 'percent_of_working_time',
    countsAs: {
      telework: 'toward_percent',
      onsite: 'none',
      third_country: 'none', // can break framework eligibility — tracked separately in notes
      non_working: 'none',
    },
    warningAt: WARN,
    sources: [SRC.fps, SRC.cleiss],
    notesKey: 'ss_framework_note',
  };
}

export const BORDER_PACKS: BorderPack[] = [
  {
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
        unit: 'percent_of_working_time',
        countsAs: {
          telework: 'toward_percent',
          onsite: 'none',
          third_country: 'toward_percent', // missions count inside the 40% expression
          non_working: 'none',
        },
        warningAt: WARN,
        sources: [SRC.geAvenant, SRC.geCalc, SRC.estvAi, SRC.impots10],
        notesKey: 'ch_fr_tax_note',
      },
      {
        id: 'geneva_tax_missions_10',
        kind: 'tax',
        labelKey: 'ch_fr_tax_missions_10',
        enabled: true,
        limit: 10,
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
      ssFrameworkUnder50('geneva_ss_50'),
    ],
  },
  {
    id: 'basel_fr',
    nameKey: 'basel_fr',
    residenceCountries: ['FR'],
    workCountries: ['CH'],
    regionNoteKey: 'basel_region',
    defaultAnnualWorkingDays: 240,
    counters: [
      {
        id: 'basel_fr_tax_telework_40',
        kind: 'tax',
        labelKey: 'ch_fr_tax_telework_40',
        enabled: true,
        limit: 40,
        unit: 'percent_of_working_time',
        countsAs: {
          telework: 'toward_percent',
          onsite: 'none',
          third_country: 'toward_percent',
          non_working: 'none',
        },
        warningAt: WARN,
        sources: [SRC.estvAi, SRC.baselStadt, SRC.impots10],
        notesKey: 'ch_fr_tax_note',
      },
      {
        id: 'basel_fr_tax_missions_10',
        kind: 'tax',
        labelKey: 'ch_fr_tax_missions_10',
        enabled: true,
        limit: 10,
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
      ssFrameworkUnder50('basel_fr_ss_50'),
    ],
  },
  {
    id: 'basel_de',
    nameKey: 'basel_de',
    residenceCountries: ['DE'],
    workCountries: ['CH'],
    regionNoteKey: 'basel_region',
    defaultAnnualWorkingDays: 240,
    counters: [
      {
        id: 'basel_de_tax',
        kind: 'tax',
        labelKey: 'basel_de_tax_pending',
        enabled: false,
        countsAs: {},
        warningAt: WARN,
        sources: [SRC.baselStadt],
        pendingReasonKey: 'pending_bmf',
      },
      {
        id: 'basel_de_employer_practice',
        kind: 'tax',
        labelKey: 'basel_de_employer_commute',
        enabled: true,
        limit: 5,
        unit: 'days_per_period', // per month — Basel-Stadt HR practice
        countsAs: {
          telework: 'none',
          onsite: 'full',
          third_country: 'none',
          non_working: 'none',
        },
        warningAt: [0.5], // informational floor, not a tax limit
        sources: [SRC.baselStadt],
        notesKey: 'basel_de_employer_note',
      },
      ssFrameworkUnder50('basel_de_ss_50'),
    ],
  },
  {
    id: 'luxembourg_fr',
    nameKey: 'luxembourg_fr',
    residenceCountries: ['FR'],
    workCountries: ['LU'],
    defaultAnnualWorkingDays: 220,
    counters: [
      {
        id: 'lu_fr_tax_34',
        kind: 'tax',
        labelKey: 'lu_tax_tolerance_34',
        enabled: true,
        limit: 34,
        unit: 'days_per_period',
        countsAs: {
          telework: 'full',
          onsite: 'none',
          third_country: 'full',
          non_working: 'none',
        },
        warningAt: WARN,
        sources: [SRC.impots34],
        notesKey: 'lu_fr_tax_note',
      },
      {
        id: 'lu_fr_ss_50',
        kind: 'social_security',
        labelKey: 'ss_framework_under_50',
        enabled: true,
        limit: 50,
        unit: 'percent_of_working_time',
        countsAs: {
          telework: 'toward_percent',
          onsite: 'none',
          third_country: 'none',
          non_working: 'none',
        },
        warningAt: WARN,
        sources: [SRC.ccss, SRC.fps, SRC.cleiss],
        notesKey: 'ss_framework_lu_note',
      },
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
        id: 'lu_be_tax_34',
        kind: 'tax',
        labelKey: 'lu_tax_tolerance_pending',
        enabled: false,
        countsAs: {},
        warningAt: WARN,
        sources: [],
        pendingReasonKey: 'pending_lu_be_tax',
      },
      {
        id: 'lu_be_ss_50',
        kind: 'social_security',
        labelKey: 'ss_framework_under_50',
        enabled: true,
        limit: 50,
        unit: 'percent_of_working_time',
        countsAs: {
          telework: 'toward_percent',
          onsite: 'none',
          third_country: 'none',
          non_working: 'none',
        },
        warningAt: WARN,
        sources: [SRC.ccss, SRC.fps],
        notesKey: 'ss_framework_lu_note',
      },
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
        id: 'lu_de_tax_34',
        kind: 'tax',
        labelKey: 'lu_tax_tolerance_pending',
        enabled: false,
        countsAs: {},
        warningAt: WARN,
        sources: [],
        pendingReasonKey: 'pending_lu_de_tax',
      },
      {
        id: 'lu_de_ss_50',
        kind: 'social_security',
        labelKey: 'ss_framework_under_50',
        enabled: true,
        limit: 50,
        unit: 'percent_of_working_time',
        countsAs: {
          telework: 'toward_percent',
          onsite: 'none',
          third_country: 'none',
          non_working: 'none',
        },
        warningAt: WARN,
        sources: [SRC.ccss, SRC.fps],
        notesKey: 'ss_framework_lu_note',
      },
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
        labelKey: 'be_tax_pending',
        enabled: false,
        countsAs: {},
        warningAt: WARN,
        sources: [SRC.inami],
        pendingReasonKey: 'pending_be_tax',
      },
      ssFrameworkUnder50('be_fr_ss_50'),
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
        labelKey: 'be_tax_pending',
        enabled: false,
        countsAs: {},
        warningAt: WARN,
        sources: [SRC.inami],
        pendingReasonKey: 'pending_be_tax',
      },
      ssFrameworkUnder50('be_nl_ss_50'),
    ],
  },
  {
    id: 'ticino_it',
    nameKey: 'ticino_it',
    residenceCountries: ['IT'],
    workCountries: ['CH'],
    regionNoteKey: 'ticino_region',
    defaultAnnualWorkingDays: 240,
    counters: [
      {
        id: 'ticino_tax_telework_25',
        kind: 'tax',
        labelKey: 'ch_it_tax_telework_25',
        enabled: true,
        limit: 25,
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
      },
      {
        id: 'ticino_tax_nonreturn_45',
        kind: 'tax',
        labelKey: 'ch_it_tax_nonreturn_45',
        enabled: true,
        limit: 45,
        unit: 'days_per_year',
        countsAs: {
          telework: 'none',
          onsite: 'none',
          third_country: 'non_return', // professional nights away / non-daily return
          non_working: 'none',
        },
        warningAt: WARN,
        sources: [SRC.fedlex],
        notesKey: 'ch_it_nonreturn_note',
      },
      ssFrameworkUnder50('ticino_ss_50'),
    ],
  },
];

export function getBorderPack(id: string): BorderPack | undefined {
  return BORDER_PACKS.find((p) => p.id === id);
}

export function listBorderPacks(): BorderPack[] {
  return BORDER_PACKS;
}

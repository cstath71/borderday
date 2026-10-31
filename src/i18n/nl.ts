const nl = {
  meta: {
    siteName: 'BorderDay',
    tagline: 'Grensoverschrijdende daglimieten voor HR en medewerkers — vóór verrassingen over aansluiting of belasting.',
    description:
      'BorderDay helpt HR en medewerkers telewerk-, ter-plaatse- en reisdagen te registreren. Socialezekerheids-telewerktellers op alle negen corridors; belastingtellers op zeven: Genève en andere niet-1983-kantons, 1983-verdragskantons←Frankrijk, Duitsland→Zwitserland, Frankrijk→Luxemburg, België→Luxemburg, Duitsland→Luxemburg en Italië→Zwitserland. Een registratietool — geen belasting- of juridisch advies.',
  },
  nav: {
    home: 'Home',
    app: 'Medewerkers-app',
    pricing: 'Prijzen',
    faq: 'FAQ',
    privacy: 'Privacy',
    disclaimer: 'Disclaimer',
    terms: 'Voorwaarden & impressum',
    openApp: 'Open de app',
    joinWaitlist: 'Inloggen',
    forIndividuals: 'Voor particulieren',
    forCompanies: 'Voor bedrijven',
    hrDashboard: 'HR-dashboard',
    companySignup: 'Bedrijf aanmelden',
    withdraw: 'Herroeping',
    cancel: 'Abonnement opzeggen',
    accessibility: 'Toegankelijkheid',
    dpa: 'Verwerkersovereenkomst',
    account: 'Account',
    menu: 'Menu',
    skipToContent: 'Ga naar hoofdinhoud',
    homeLabel: 'BorderDay home',
    mainLabel: 'Hoofd',
  },
  lang: {
    en: 'English',
    fr: 'Français',
    de: 'Deutsch',
    it: 'Italiano',
    nl: 'Nederlands',
    label: 'Taal',
    apply: 'Toepassen',
  },
  home: {
    heroTitle: 'Eén plek voor elke grens waar uw mensen overheen werken',
    heroBody:
      'For HR and finance managers in Geneva, Basel, Ticino, Luxembourg and Belgium: see day counters per employee before a social-security switch or a tax limit is crossed. Social-security counters on all nine corridors, tax counters on seven, and every corridor says which it has. Four languages, tax and social security tracked separately.',
    ctaPrimary: 'Create company account',
    ctaSecondary: 'See company pricing',
    ctaIndividuals: 'I am an individual employee',
    riskTitle: 'Why day limits matter for employers',
    risk1Title: 'Social-security affiliation',
    risk1Body:
      'Under the EU/EEA/CH framework agreement, telework in the residence state of 25% or more of working time normally moves social security there unless an A1 is requested. At 50% or more the framework is no longer available. BorderDay shows the three bands: under 25%, 25% to under 50% (A1 required) and 50% or more, separately from tax.',
    risk2Title: 'Tax day thresholds',
    risk2Body:
      'Tax counters run today on seven corridors: Geneva and other non-1983 cantons (40% / 10 mission days), 1983-agreement cantons←France (40% / 10 mission days / 45 work nights, taxed in France), Germany→Switzerland (60 non-return days), France→Luxembourg (34 days, reduced for part-time), Belgium→Luxembourg (34 days, not reduced for part-time), Germany→Luxembourg (34 days, not reduced for part-time) and Italy→Switzerland (25% / 45 non-return days). France→Belgium and Netherlands→Belgium say plainly that no general tax counter runs. We never invent a number.',
    risk3Title: 'Multi-border teams',
    risk3Body:
      'One company dashboard for employees on different borders. Filter by border or status. Export CSV. Employees see the same counters for their own days that HR sees for them.',
    feature1Title: 'Tax and social security, separately',
    feature1Body:
      'Independent counters with official sources linked. Warnings at 75% and 90% of the applicable limit, then at-limit and over-limit states with the consequence spelled out.',
    feature2Title: 'Invite by email link',
    feature2Body: 'Employees join your company, pick their border route, and log day types only — never GPS location.',
    feature3Title: 'Data protection by design',
    feature3Body:
      'GDPR and Swiss FADP oriented: company isolation, export and delete, a clear notice of what HR can see, and a retention note. No GPS or device location.',
    bordersTitle: 'Corridors covered in version 1',
    bordersIntro:
      'Each corridor shows what it counts today. Where no tax rule can be counted yet, it says so and shows no number.',
    howTitle: 'How companies use BorderDay',
    how1: 'Create a company account and invite employees by email link.',
    how2: 'Each employee picks their border route and logs telework / on-site / trip / non-working days.',
    how3: 'HR watches per-employee tax and social-security counters, filters by status, and exports CSV.',
    waitlistTitle: 'Start with a company account',
    waitlistBody:
      'Create a company account with email or Google, invite your team, then subscribe on the Pricing page. A labeled DEMO company remains available for preview.',
    waitlistButton: 'Create account',
    waitlistNote:
      'No waitlist: accounts and checkout are live. Company plan: €5 per active employee per month (minimum €39), excl. VAT. 7-day free trial, then charged automatically on day 8 and renewing until you cancel.',
    disclaimerShort:
      'BorderDay is a tracking and reminder tool for day classifications. It is not tax advice or legal advice. Always verify with the competent authority or a qualified adviser.',
    demoBanner: 'Screenshots and the seeded company use clearly labeled DEMO data — not real employees.',
    inShort:
      'BorderDay helps HR track telework, on-site and travel days per employee: social-security counters on all nine corridors in five regions, tax counters on seven of them. Company plan: €5 per active employee per month (€39 minimum), excl. VAT; individuals €4.99/month or €49/year, incl. VAT. 7-day free trial, then the plan you chose at the stated price, charged automatically on day 8 and renewing until you cancel; card required at signup. A tracking tool — not tax or legal advice.',
    inShortLabel: 'In short',
    chipTaxYes: 'Tax: yes',
    chipTaxNo: 'Tax: not yet',
    chipSsYes: 'Social security: yes',
  },
  borders: {
    geneva_fr: 'Geneva and other non-1983 cantons ← France',
    basel_fr: 'Basel and other 1983-agreement cantons ← France',
    basel_de: 'Basel / Switzerland ← Germany',
    luxembourg_fr: 'Luxembourg ← France',
    luxembourg_be: 'Luxembourg ← Belgium',
    luxembourg_de: 'Luxembourg ← Germany',
    belgium_fr: 'Belgium ← France',
    belgium_nl: 'Belgium ← Netherlands',
    ticino_it: 'Ticino ← Italy',
    geneva_region:
      'Convention regime: Geneva and every canton outside the 1983 agreement, with the telework rule applying from 1 Jan 2026. If your employer is in Bern, Solothurn, Basel-Stadt, Basel-Landschaft, Vaud, Valais, Neuchâtel or Jura, choose the 1983-agreement border route instead.',
    basel_region:
      'The 60-day rule applies across Switzerland. The 5-day minimum is the rule Basel-Stadt applies to its own staff.',
    ticino_region: 'Italy–Switzerland frontier-worker agreement, as amended for telework.',
    ch_fr_1983_region:
      '1983 agreement: Bern, Solothurn, Basel-Stadt, Basel-Landschaft, Vaud, Valais, Neuchâtel and Jura. Geneva and other cantons follow a different regime: choose the other France–Switzerland border route.',
  },
  dayTypes: {
    telework: 'Telework at home',
    onsite: 'On site at workplace',
    third_country: 'Work trip / third State',
    non_working: 'Non-working day',
    teleworkHint: 'Workday performed in your residence country, typically at home.',
    onsiteHint: 'Workday at the employer’s premises in the work country.',
    third_countryHint: 'Business trip, training, client visit or temporary mission outside the work country.',
    non_workingHint: 'Leave, public holiday not worked, sickness, or rest day.',
    teleworkHint_ticino:
      'Workday at your home in Italy. The protocol says “at your domicile”: whether a co-working day counts is not confirmed, so check with your authority.',
    teleworkHint_ch_fr:
      'Workday in France (home or local co-working). The CH–FR convention regime is not limited to the domicile.',
    third_countryHint_basel_de:
      'Work outside Germany and Switzerland: always a non-return day, even if you return that evening. Do not use it for a same-day trip inside Germany or Switzerland.',
    logHint_luxembourg_fr:
      'Any part of a workday outside Luxembourg counts as a whole day: log the whole day as telework or trip.',
    halfDay: 'Half day',
    halfDayHint:
      'Only part of this day matches the type above (for example morning on site, afternoon telework). For Luxembourg tax, any fraction outside Luxembourg still counts as a whole day.',
    halfDayShort: 'Half',
    overnightAway: 'Stayed away overnight for work (did not return home)',
    overnightAwayHint:
      'A yes or no, never a place. Some limits count these days. In a company account, HR sees it with the day type.',
    overnightAwayShort: 'Overnight away',
  },
  counters: {
    tax: 'Tax',
    social_security: 'Social security',
    ch_fr_tax_telework_40: 'Telework share (max 40% of annual working time)',
    ch_fr_tax_missions_10: 'Temporary missions outside Switzerland (max 10 days/year)',
    ch_fr_tax_note:
      'Convention regime: telework from France up to 40% of annual working time stays taxable in Switzerland. Up to 10 mission days a year count as telework, only as far as they fit under 40% after ordinary telework. Extra mission days are taxed differently. Above 40%, telework is taxable in France from the first day. On-call time counts only if you actually intervened. Sources: amendment of 27 Jun 2023 (additional protocol) for the 40% rule; FTA amicable agreement of 29 Apr 2026 for mission days; ge.ch.',
    ch_fr_missions_note:
      'Temporary missions in France or a third State: up to 10 days a year count inside the 40%, only as far as they fit after ordinary telework. Part-time or part-year: the 10 days are reduced in proportion and rounded up. Days outside those limits are taxable in France, subject to any treaty with the third state. Sources: FTA amicable agreement of 29 Apr 2026; impots.gouv.fr fact sheet.',
    lu_tax_tolerance_34: 'Days outside Luxembourg (up to 34 days/year)',
    lu_fr_tax_note:
      'Residents of France employed in Luxembourg: up to 34 days per taxable period physically present in France and/or a third state for work, without losing Luxembourg taxation for the period. Part-time or part-year: the 34 is reduced in proportion and rounded down. Beyond the limit, France may tax the time actually worked in France or a third state, from the first day. Any fraction of a day counts as a whole day, and training counts. Leave, weekly rest, public holidays not worked, sickness and force majeure do not. The limit covers all your contracts in the year, and it is up to you to prove your days: this log alone may not be enough. Source: impots.gouv.fr agreement (the PDF says 29 days, raised to 34 by the avenant of 7 Nov 2022).',
    ss_framework_under_50: 'Cross-border telework (framework agreement: A1 from 25%, under 50%)',
    ss_framework_note:
      'Under the EU/EEA/CH framework agreement: under 25% of working time teleworked in the residence state, no A1 is needed on telework grounds. From 25% to under 50%, the residence state normally becomes competent unless employer and employee request an A1 keeping the employer’s state. The A1 lasts up to 3 years and can reach back at most 3 months, if contributions were already paid there. At 50% or more the framework is not available. It does not cover people who habitually work other than by telework in the residence state, habitually work in a state other than the residence state and the employer’s state, are self-employed, or have employers in more than one state. Telework here means work done through an IT link. Sources: Belgian FPS (depositary); CLEISS.',
    ss_framework_lu_note:
      'Luxembourg CCSS: telework only in the residence state. Under 25%: no A1 on telework grounds. From 25% to under 50%, both states signed: the employer may request an A1 so Luxembourg cover continues; without it the residence state normally becomes competent. At 50% or more the framework is not available. Habitual non-telework activity in the residence state or work in a state other than the residence state and the employer’s state can push the case out of the framework. Sources: CCSS; Belgian FPS.',
    ch_it_tax_telework_25: 'Telework at domicile (max 25% of employed activity)',
    ch_it_tax_nonreturn_45: 'Days without returning home for work (max 45/year)',
    ch_it_tax_note:
      'Under the protocol amending the Italy–Switzerland agreement (in force 9 Feb 2026, applying from 1 Jan 2024, including transitional-regime workers): at most 25% of employed activity as telework at your home in the residence state in a calendar year, without changing status or the tax treatment of that telework. The protocol does not state what happens above 25%. Sources: Fedlex AS 2026 104; SIF (EFD).',
    ch_it_nonreturn_note:
      'In principle, and unless the authorities decide otherwise, up to 45 days in a calendar year without returning home daily for work. Leave and sickness do not count. BorderDay counts only the days you mark “stayed away overnight for work”; a same-day trip does not count. Source: Fedlex amending protocol.',
    basel_de_employer_commute:
      'Basel-Stadt staff rule: on-site days this month (minimum 5, or 1 a week)',
    basel_de_employer_note:
      'This is the rule the canton of Basel-Stadt applies to its own staff (as of 1 Jan 2026): telework from home only if the employee commutes to the workplace at least 1 day a week or at least 5 days a month. Other employers may apply different rules, and it is not a general tax limit. Source: Basel-Stadt Finance Department.',
    pending_lu_be_tax:
      'The Luxembourg government announced 34 days from 2022 for residents of Belgium. The Belgian text settling part-time reduction and what counts was not found, so no counter runs. Check with your authority.',
    pending_lu_de_tax:
      'The Luxembourg government states the tolerance rose from 19 to 34 days from 2024 for residents of Germany. The German text on what counts and on part-time could not be confirmed, so no counter runs and the France–Luxembourg reduction is not applied. Check with your authority.',
    usedOf: '{used} of {limit}',
    usedOfDays: '{used} of {allowed} days',
    percentOfAnnual: '{pct}% of {annual} days/yr (limit {limit}%)',
    status_ok: 'Below tracked limit',
    status_warn: 'Attention',
    status_critical: 'Near limit',
    status_over: 'Over limit',
    status_disabled: 'No counter yet',
    checkedOn: 'Checked {date}',
    employer_practice: 'Employer practice',
    ch_fr_over_40:
      'Above 40%: telework days are taxable in France from the first day, not only the overshoot, and mission days no longer count as telework. Check with your tax authority.',
    ch_fr_mission_excess:
      'Of your mission days, {counted} count inside the 40% and {excess} do not: those are taxable in France, subject to any treaty with a third state.',
    ch_fr_1983_telework_40: 'Telework share (max 40% of annual working time, 1983 regime)',
    ch_fr_1983_missions_10: 'Temporary missions outside Switzerland (max 10 days/year, 1983)',
    ch_fr_1983_nights_45: 'Work nights away from home (max 45/year, 1983)',
    ch_fr_1983_tax_note:
      '1983 frontier agreement (Bern, Solothurn, Basel-Stadt, Basel-Landschaft, Vaud, Valais, Neuchâtel, Jura): residents of France are taxed in France; France remits 4.5% of gross salary to Switzerland. Telework from France up to 40% of annual working time stays in that regime. Up to 10 mission days a year count inside the 40%, only as far as they fit after ordinary telework. Sources: interpretative agreement of 30 June 2023 (impots.gouv.fr); ESTV practical sheet; Canton of Jura.',
    ch_fr_1983_missions_note:
      'Temporary missions in France or a third State: up to 10 days a year count inside the 40%, only as far as they fit after ordinary telework. Part-time or part-year: the 10 days are reduced in proportion and rounded up. Any excess mission day in France ends the 1983 regime. BorderDay cannot tell France from a third state, so treat every excess mission day as a risk. Sources: ESTV practical sheet; impots.gouv.fr 1983 interpretative agreement.',
    ch_fr_1983_nights_note:
      'No more than 45 nights a year spent away from home for work in Switzerland or a third state (inclusive). BorderDay counts only days you mark “stayed away overnight for work” on an on-site or trip day. Excess nights end the 1983 regime. Source: Canton of Jura; ESTV practical sheet.',
    ch_fr_1983_over_40:
      'Above 40%: the 1983 frontier regime is lost. Check with your tax authority.',
    ch_fr_1983_over_mission:
      'Mission days over the 10-day cap (and over what still fits under 40%): any of those days that took place in France ends the 1983 regime. BorderDay cannot tell France from a third state. Check with your tax authority.',
    ch_fr_1983_over_45:
      'Above 45 work nights away: the 1983 frontier regime is lost. Check with your tax authority.',
    ch_fr_1983_mission_excess:
      'Of your mission days, {counted} count inside the 40% and {excess} do not. Any excess day in France ends the 1983 regime; BorderDay cannot tell France from a third state.',
    ch_fr_1983_value: 'See 40% / 10 mission / 45 night counters',
    ch_fr_1983_note:
      'These cantons follow the 1983 agreement: taxed in France (France remits 4.5% to Switzerland). Counters track telework up to 40%, up to 10 mission days, and at most 45 work nights away.',
    lu_over_34:
      'Limit exceeded: France may tax the time actually worked in France or a third state, from the first day. Check with your tax authority.',
    lu_be_tax_note:
      'Residents of Belgium employed in Luxembourg: up to 34 days per calendar year physically present in Belgium and/or a third state for work, without losing Luxembourg taxation for those days. Unlike France–Luxembourg, the 34-day limit is not reduced for part-time or part-year work. Any fraction of a day counts as a whole day. On-site in Luxembourg and non-working days do not count. Source: Luxembourg Administration des contributions directes (seuil de tolérance BE–LU PDF).',
    lu_be_over_34:
      'Limit exceeded: Belgium may tax the time actually worked in Belgium or a third state, from the first day. Check with your tax authority.',
    lu_de_tax_note:
      'Residents of Germany employed in Luxembourg: up to 34 days per calendar year (from 2024) physically present in Germany and/or a third state for work, without losing Luxembourg taxation for those days. The 34-day limit is not reduced for part-time or part-year work. Activity lasting under half an hour does not count under the BMF agreement; BorderDay has no minute entry, so log a day only when the activity is material. On-site in Luxembourg and non-working days do not count. Source: German BMF Konsultationsvereinbarung of 11 January 2024.',
    lu_de_over_34:
      'Limit exceeded: Germany may tax the time actually worked in Germany or a third state, from the first day. Check with your tax authority.',
    prorate_missing:
      '{limit} days applies to full-year, full-time only — set your employment percentage.',
    prorate_applied: 'Limit adjusted to your {pct}% employment: {limit} days.',
    at_limit_note: 'At the limit: still allowed, but the next day goes over.',
    ss_band_under: 'Under {from}%: no A1 needed on telework grounds.',
    ss_band_approaching:
      'Approaching {from}%: from there, an A1 is required to stay in the employer’s state.',
    ss_band_a1_required:
      '25% to under 50%: A1 required. Without one, the residence state normally becomes competent. Record it here once your employer has it.',
    ss_band_a1_recorded:
      'A1 recorded, valid until {until}. BorderDay does not check the certificate.',
    ss_band_a1_recorded_nodate:
      'A1 recorded, no end date given. A framework A1 lasts up to 3 years, so add its end date. BorderDay does not check the certificate.',
    ss_band_a1_expired:
      'The A1 you recorded ended on {until}. At 25% or more, a new one is required.',
    ss_band_residence:
      '50% or more: the framework is not available and the residence state normally applies. An individual agreement may be possible: check with your social-security institution.',
    ss_third_country:
      'Trip days logged this year: {days}. Recurring work outside the employer’s state may fall outside the framework: check with your social-security institution.',
    ch_it_over:
      'Limit exceeded. The protocol does not state the consequence: ask the competent authority.',
    basel_de_nonreturn_60: 'Non-return days for work (up to 60 a year)',
    basel_de_nonreturn_note:
      'Germany–Switzerland: cross-border status is lost above 60 work-related non-return days a year. Counted here: days you mark “stayed away overnight for work”, plus every day of work outside Germany and Switzerland, even with same-day return. Same-day trips inside Germany or Switzerland, illness and accident do not count. On multi-day business trips paid by the employer, weekends and holidays count too, so log them as trip days. Part-time staff working only certain days have a proportionally lower limit, and several employers are assessed together. Whether a home-office day can be a non-return day is not confirmed here: check with your authority. The employer files form Gre-3 (31 March in Aargau; check your canton). Sources: KonsVerCHEV §§ 8–9; Canton Aargau leaflet, status 1 Jan 2026.',
    basel_de_over_60:
      'Above 60 days, cross-border status is lost: Swiss withholding moves from 4.5% to the normal rate for the year. Check with your tax authority.',
    floor_week_met: 'Met through at least one on-site day in every week of the month.',
    floor_below_note:
      'This month ended with fewer than {limit} on-site days and not every week covered. If this rule applies to you, check with your employer.',
    be_fr_tax_label: 'France→Belgium tax',
    be_fr_value: 'No day tolerance found',
    be_nl_tax_label: 'Netherlands→Belgium tax',
    be_nl_value: 'No rule confirmed: check with your authority',
    pending_be_fr_tax:
      'No day tolerance found. Home-working days in France are taxed in France, pro rata, from the first day (Art. 11 of the France–Belgium convention; French minister’s answer of 28 May 2024, questions.assemblee-nationale.fr/q16/16-12971QE.htm; BOFiP). People who became frontier workers before 1 January 2012 keep a separate regime until 2033: tick that option below to open the 30-day counter. No general tax counter runs here.',
    be_fr_pre2012_30: 'Days outside the Belgian border zone (max 30/year, pre-2012 frontier workers)',
    be_fr_pre2012_note:
      'Only for people who were frontier workers under the France–Belgium regime before 1 January 2012. Until 2033 they keep a 30-day annual limit for work outside the Belgian border zone. BorderDay counts trip days as a proxy and cannot verify Belgian border-zone geography. Beyond that, the normal Art. 11 rule applies. Sources: French minister’s answer of 28 May 2024; BOFiP.',
    be_fr_pre2012_over:
      'Above 30 days outside the border zone: the pre-2012 transitional regime no longer covers those days. Check with your tax authority.',
    be_fr_pre2012_pending:
      'Optional counter for frontier workers before 2012. Tick “frontier worker before 2012” in settings to enable it.',
    pending_be_nl_tax:
      'No home-working tolerance found on the Dutch tax authority page; check with an adviser.',
    pace_line:
      'Current pace: {pct}% of working days logged so far ({days}).',
    pace_above:
      'Current pace: {pct}% of working days logged so far ({days}), above {limit}%. If this continues, that line will be crossed.',
    multi_employer_note:
      'These counters only cover days logged here. Other jobs in the same year can count too.',
    ruleAndConditions: 'Rule and conditions',
    status_approaching: 'Approaching limit',
    status_at_limit: 'At limit',
    status_ss_under: 'Under 25%',
    status_a1_required: 'A1 required',
    status_a1_recorded: 'A1 recorded',
    status_ss_residence: '50%+: residence state',
    status_floor_met: 'Minimum met',
    status_floor_below: 'Below minimum',
    status_floor_progress: 'Month in progress',
    status_floor_no_data: 'No days logged',
  },
  app: {
    title: 'Your day log',
    pickBorder: 'Your border route',
    pickBorderHint: 'Residence → workplace',
    today: 'Today',
    logDay: 'Log this day',
    calendar: 'Calendar',
    counters: 'Your counters',
    noBorder: 'Choose a border route to see counters.',
    exportJson: 'Export JSON',
    exportCsv: 'Export CSV',
    deleteAll: 'Delete all days',
    deleteAllConfirm: 'Delete every day on this device? This cannot be undone.',
    deleted: 'All days deleted.',
    annualWorkingDays: 'Contractual working days / year',
    annualWorkingDaysHint:
      'Used when converting day counts to a percentage. The default is an assumption except for 240 on France–Switzerland, the official simplified full-time base: set your own figure, lower if you work part-time.',
    installHint: 'Add BorderDay to your home screen for a one-tap app.',
    emptyMonth: 'No days logged this month yet.',
    weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    loading: 'Loading…',
    previewBadge: 'PREVIEW',
    previewBody: 'Free preview: days stay in this browser on this device, and only the current month can be logged. A plan unlocks every month and saves your log to your account.',
    previewCompanyBody: '{company} has no active subscription yet, so this is the free preview. Days stay in this browser on this device, and only the current month can be logged.',
    previewCta: 'See plans',
    previewMonthOnly: 'The preview only logs the current month.',
    savedToAccount: 'Saved to your account.',
    savedToCompany:
      'Saved to your {company} account. Your HR team sees each day’s type and date, whether you marked it as a night away for work, and your counters.',
    saveError: 'Could not save. Try again.',
    deleteAllAccountConfirm: 'Delete every day saved in your account? This cannot be undone.',
    importLocal: 'Copy {count} days from this device to your account',
    disclaimerBanner:
      'Tracking tool only — not tax or legal advice. Verify thresholds with the authority that applies to you.',
    employmentPercent: 'Employment percentage this year',
    employmentPercentHint:
      'Part-time and part-year together: 80 for 80% all year, 50 for full-time for six months. Some day limits are reduced with this figure. In a company account, HR sees it.',
    a1InPlace: 'A1 certificate in place (framework agreement)',
    a1ValidUntil: 'A1 valid until',
    frontierBefore2012: 'Frontier worker before 2012 (France–Belgium)',
    frontierBefore2012Hint:
      'Only for people who were frontier workers under the France–Belgium regime before 1 January 2012. Opens the optional 30-day counter for work outside the Belgian border zone (valid until 2033).',
    a1Hint:
      'Recorded by you or your employer. BorderDay does not check the certificate. In a company account, HR sees it.',
    prevMonth: 'Previous month',
    nextMonth: 'Next month',
    notLogged: 'not logged',
    calendarDay: '{date}: {type}',
    exportDeviceNote: 'These buttons export the days on this device only.',
    exportAccountNote:
      'These buttons export the days shown here. Your full account export is on the Account page.',
  },
  pricing: {
    title: 'Prijzen',
    subtitle: 'Eerst het bedrijfsabonnement. Abonnementen via Stripe Managed Payments (verkocht via Link).',
    individual: 'Individual (employee)',
    company: 'Company / HR',
    monthly: '€4,99 / maand',
    yearly: '€49 / jaar',
    yearlyNote: 'About two months free vs monthly.',
    companyPrice: '€5 / actieve medewerker / maand',
    companyMin: 'Minimum €39 / month (the minimum covers up to 7 active employees; beyond that you pay per seat)',
    companyYearly: 'Yearly billing: 2 months free (€390 / year minimum)',
    activeEmployeeDef:
      'Active employee: a company member with an accepted invite who has not been deactivated. Billing uses the current active headcount each period (minimum €39 / month).',
    companyTax: 'excl. VAT',
    individualTax: 'incl. VAT',
    includes: 'Includes',
    include1: 'All border routes available in your plan',
    include2:
      'Tax counters where available, social-security counters on every corridor',
    include3: 'Warnings as limits approach',
    include4: 'Export and delete your data anytime',
    include5: 'Engels, Frans, Duits, Italiaans, Nederlands',
    include6: 'Installable PWA',
    companyInclude1: 'HR dashboard with per-employee counters and filters',
    companyInclude2: 'Email invites, roles (owner / HR viewer), CSV export',
    companyInclude3: 'Employees see the same counters HR sees',
    companyInclude4: 'Data protection by design (day types per date — no GPS or device location)',
    subscribeMonthly: 'Start monthly',
    subscribeYearly: 'Start yearly',
    checkoutSuccess: 'Payment set up — your trial is active. Open your account to continue.',
    checkoutCancel: 'Checkout canceled — no charge. You can try again anytime.',
    goToAccount: 'Go to account',
    needCompany: 'Create or open a company account first, then subscribe.',
    waitlistCta: 'Start free account',
    recommended: 'Recommended for employers',
    trialCompany:
      '7-day free trial, then €5 per active employee per month (minimum €39/month) or, on yearly billing, minimum €390/year, excl. VAT, charged automatically on day 8 and renewing until you cancel. Card required at signup. Cancel before day 8 and nothing is charged.',
    trialIndividual:
      '7-day free trial, then €4.99/month or €49/year incl. VAT (the plan you pick), charged automatically on day 8 and renewing until you cancel. Card required at signup. Cancel before day 8 and nothing is charged.',
    readBefore: 'Before you subscribe, read:',
    companyBusinessOnly: 'For businesses. Consumers should choose the individual plan.',
    yearlyRenewal:
      'Yearly individual plans (€49) renew for a further year at the then-current price until you cancel. BorderDay emails a renewal reminder before each yearly charge. Cancel anytime via Cancel subscription in the footer (customer portal). After the first year you can cancel a renewed plan at any time; unused-period refunds apply where mandatory consumer law requires them.',
    approxChf: '≈ {chf}',
    chfBillingNote:
      'Facturatie is in EUR. CHF-bedragen zijn bij benadering, volgens de ECB-euroreferentiekoers van {date} (1 EUR = {rate} CHF). Bron: Europese Centrale Bank.',
  },
  faq: {
    title: 'FAQ',
    q1: 'Is BorderDay tax or legal advice?',
    a1:
      'No. It is a record-keeping and reminder tool for employers and employees. Thresholds are taken from public official sources and may change. Always verify with your employer, a qualified adviser, or the competent authority.',
    q2: 'Where is my day log stored?',
    a2: 'Without a plan, only on your device (IndexedDB in the browser). With an active plan or a company account, in your BorderDay account. Either way you can export JSON or CSV, or delete everything.',
    q3: 'Why are some counters disabled?',
    a3:
      'We only show a number when we have confirmed how to count it on an official source. Otherwise the card says why no counter runs and points you to your authority. It never invents a figure.',
    q4: 'Do you track my location?',
    a4:
      'No. You log days yourself. No GPS or device location. HR sees day type (and overnight-away yes/no) per date — country category, never coordinates. Notes are private to the employee.',
    q5: 'Which borders do you cover?',
    a5:
      'Nine corridors in five regions. Social-security counters on all nine. Tax counters on seven: Geneva and other non-1983 cantons←France, 1983-agreement cantons←France (40%/10 missions/45 nights), Germany→Switzerland, France→Luxembourg, Belgium→Luxembourg, Germany→Luxembourg and Italy→Switzerland. No general tax counter yet: France→Belgium and Netherlands→Belgium.',
    q6: 'What about the App Store?',
    a6: 'Version 1 is an installable progressive web app (home screen). A native iOS app may come later.',
    q7: 'How do payments work?',
    a7:
      'Checkout uses Stripe Managed Payments: Link is the merchant of record and handles VAT/GST in Checkout. Company and individual plans start with a 7-day free trial, and a card is required at signup. After 7 days the plan becomes paid at the stated price (individual €4.99/month or €49/year incl. VAT; company €5 per active employee per month, minimum €39/month, or minimum €390/year, excl. VAT), charged automatically on day 8 and renewing until you cancel. Promo codes are supported at checkout. See the Terms for cancellation and the 14-day EU withdrawal right for consumers.',
    q8: 'What does BorderDay not cover?',
    a8:
      'The self-employed, public-sector special rules, people with employers in several states, and non-IT work under the telework framework. Corridors not listed, such as France→Germany or Netherlands→Germany. Counters only see days logged here, so other jobs in the year are not included. Tax counters do not run on every corridor. The CSV export is a working record, not an official filing such as the annual telework-rate report some cantons require. When in doubt, check with your authority.',
  },
  privacy: {
    title: 'Privacyverklaring',
    updated: 'Laatst bijgewerkt: 31 okt. 2026 (Europe/Zurich)',
    intro:
      'Deze verklaring legt uit welke persoonsgegevens BorderDay verwerkt, waarom, wie ze ontvangt, waar ze naartoe gaan en hoe lang ze worden bewaard, en uw rechten onder de AVG en de Zwitserse federale wet inzake gegevensbescherming (DSG).',
    controllerTitle: 'Verwerkingsverantwoordelijke',
    controllerBody:
      'PrimeLogic Advisory Sàrl, Cours des Bastions 13, 1205 Genève, Zwitserland (UID CHE-312.418.158) is de verwerkingsverantwoordelijke onder de AVG en onder de Zwitserse federale wet inzake gegevensbescherming (DSG) voor deze website, individuele abonnementen, gebruikersaccounts, beheer van bedrijfsaccounts, facturatie, support en beveiliging. Contact: hello@borderday.com · Privacy: privacy@borderday.com. Personen in de EU/EER kunnen dezelfde adressen gebruiken.',
    rolesTitle: 'Wie verantwoordelijk is voor medewerker-dagregistraties',
    rolesBody:
      'In een bedrijfsaccount beslist de werkgever waarom en hoe de dagen van medewerkers worden geregistreerd. De werkgever is daarom de verwerkingsverantwoordelijke van die dagregistraties en van het HR-gebruik ervan, inclusief de rechtsgrond; BorderDay verwerkt ze voor de werkgever als verwerker. Vragen over waarom uw werkgever deze dagen registreert, of over de bewaarplicht, gaan eerst naar uw werkgever; verzoeken aan privacy@borderday.com geven wij door. De openbare verwerkersovereenkomst voor bedrijfsaccounts staat op /dpa/ (gelinkt vanaf Prijzen, bedrijfsregistratie en de Voorwaarden).',
    s1Title: 'Wat wij verzamelen',
    s1Body:
      'Gratis voorvertoning, op uw apparaat: grenscorridor, type van elke dag (telewerk, ter plaatse, dienstreis / derde staat, niet gewerkt), of u een nacht uit voor werk hebt gemarkeerd, optionele notities, contractuele werkdagen per jaar, tewerkstellingspercentage en A1-gegevens indien u die invoert. Individueel abonnement: dezelfde gegevens, opgeslagen in uw account. Bedrijfsaccounts: bedrijfsnaam, e-mails en namen van leden, rollen, grenscorridor, dagsoorten en data, markeringen nacht-uit, tewerkstellingspercentage en A1-gegevens indien ingevoerd, en het record dat de kennisgeving over wat HR kan zien aan u is getoond. Accounts en facturatie: e-mail, naam, inlogmethode, abonnementsstatus en de Stripe-klantreferentie. Wij ontvangen uw volledige kaartnummer niet.',
    s2Title: 'Wat wij niet verzamelen',
    s2Body:
      'Geen GPS of apparaatlocatie. HR ziet dagsoort (en nacht-uit ja/nee) per datum — landcategorie, nooit coördinaten. Notities zijn privé voor de medewerker. HR ziet ook tewerkstellingspercentage en A1-gegevens indien ingevoerd, en tellingen: dezelfde tellers als de medewerker. Geen IP-adres wordt opgeslagen als werklocatie. Geen advertentietrackers. Geen verkoop van persoonsgegevens.',
    tableTitle: 'Doeleinden, rechtsgronden, ontvangers, doorgiften en bewaartermijnen',
    tableIntro:
      'Artikelnummers verwijzen naar de AVG. De Zwitserse DSG somt rechtsgronden niet op dezelfde manier op; dezelfde doeleinden, ontvangers en landen gelden.',
    tableCols: {
      purpose: 'Doeleinde',
      data: 'Gegevens',
      basis: 'Rechtsgrond',
      recipients: 'Ontvangers',
      transfer: 'Land en waarborg',
      retention: 'Bewaartermijn',
    },
    tableRows: [
      {
        purpose: 'Deze website tonen',
        data: 'IP-adres en verzoekdetails in de logboeken van de host. Geen analytics- of advertentiecookies.',
        basis: 'Gerechtvaardigde belangen bij het runnen en beveiligen van de site (art. 6(1)(f))',
        recipients: 'GitHub Pages (hosting)',
        transfer: 'Verenigde Staten; waarborgen hieronder',
        retention: 'Bepaald door GitHub. BorderDay bewaart geen aparte bezoekerslogboeken.',
      },
      {
        purpose: 'Accounts, inloggen en beveiliging',
        data: 'E-mail, naam, wachtwoordhash of Google-login, sessie- en beveiligingslogboeken',
        basis: 'Overeenkomst (art. 6(1)(b)); gerechtvaardigde belangen bij beveiliging (art. 6(1)(f))',
        recipients: 'Supabase (database, authenticatie); Resend (inlog-e-mail); Google, alleen als u Google-login kiest',
        transfer: 'Database gehost in de EU (eu-central-1). Supabase, Resend en Google zijn VS-gevestigde providers; waarborgen hieronder',
        retention: 'Tot het account wordt gesloten. Wissen op verzoek via de app of privacy@borderday.com (geen getimede auto-verwijdering van het hele account).',
      },
      {
        purpose: 'Individueel abonnement: uw dagregistratie en tellers',
        data: 'Grenscorridor, dagsoorten en data, markeringen nacht-uit, notities, werkdagen, tewerkstellingspercentage, A1-gegevens',
        basis: 'Overeenkomst (art. 6(1)(b))',
        recipients: 'Supabase',
        transfer: 'EU-hosting (eu-central-1); VS-gevestigde provider; waarborgen hieronder',
        retention: 'Tot u de dagen wist of het account sluit',
      },
      {
        purpose: 'Beheer van bedrijfsaccounts',
        data: 'Bedrijfsnaam, namen en e-mails van accounteigenaren en HR-kijkers, rollen, actief personeelsbestand voor facturatie',
        basis: 'Overeenkomst met de werkgever; gerechtvaardigde belangen bij omgang met diens contacten (art. 6(1)(b), (f))',
        recipients: 'Supabase',
        transfer: 'EU-hosting (eu-central-1); VS-gevestigde provider; waarborgen hieronder',
        retention: 'Zolang het bedrijfsaccount bestaat. Wissen op verzoek via privacy@borderday.com.',
      },
      {
        purpose: 'Bedrijfsaccount: medewerker-dagregistraties en HR-tellers (de werkgever is verantwoordelijke, BorderDay diens verwerker)',
        data: 'Naam, e-mail, grenscorridor, werkdagen, tewerkstellingspercentage, A1-gegevens, dagsoort en datum, markering nacht-uit, tellers. Notities zijn privé voor de medewerker.',
        basis: 'Bepaald door de werkgever als verwerkingsverantwoordelijke, bijvoorbeeld een wettelijke verplichting of gerechtvaardigde belangen. BorderDay steunt hier niet op toestemming van de medewerker.',
        recipients: 'Accounteigenaren en HR-kijkers van de werkgever; Supabase',
        transfer: 'EU-hosting (eu-central-1); VS-gevestigde provider; waarborgen hieronder',
        retention: 'Standaard 24 maanden (bedrijfsinstelling, 1–120 maanden). Een dagelijkse job wist dagregistraties waarvan de werkdatum ouder is dan dat venster.',
      },
      {
        purpose: 'Uitnodigingen en het record van de kennisgeving',
        data: 'Door de werkgever opgegeven e-mailadres, rol, uitnodigingslink; datum, taal en versie van de kennisgeving die u hebt bevestigd',
        basis: 'Uitnodigingen: de werkgever als verwerkingsverantwoordelijke, zoals hierboven. Record van de kennisgeving: gerechtvaardigde belangen bij het bewijzen dat de kennisgeving is gegeven (art. 6(1)(f))',
        recipients: 'Resend (uitnodigings-e-mail); Supabase',
        transfer: 'Verenigde Staten (Resend) en EU-hosting (Supabase); waarborgen hieronder',
        retention: 'Uitnodigingslinks verlopen na 14 dagen; een dagelijkse job markeert openstaande uitnodigingen die te laat zijn als verlopen. Lidmaatschaps- en uitnodigingsrecords blijven zolang het lidmaatschap of bedrijfsaccount bestaat.',
      },
      {
        purpose: 'Abonnementen en betalingen',
        data: 'Bij Stripe en Link: e-mail, factuuradres, betaalmethode, order- en belastinggegevens. Bij BorderDay: abonnementsstatus en klantreferentie.',
        basis: 'Overeenkomst; wettelijke verplichtingen in boekhouding en belasting (art. 6(1)(b), (c))',
        recipients: 'Stripe en Link, als onafhankelijke verwerkingsverantwoordelijken onder hun eigen privacyverklaringen',
        transfer: 'EU en Verenigde Staten; zie de verklaringen van Stripe en Link',
        retention: 'Stripe en Link: zie hun verklaringen. BorderDay: zolang het account bestaat en zolang boekhoudrecht dat vereist.',
      },
      {
        purpose: 'Support, rechtenverzoeken, herroepings- en opzeggingsberichten',
        data: 'Uw e-mailadres en wat u schrijft',
        basis: 'Overeenkomst; wettelijke verplichtingen; gerechtvaardigde belangen bij het beantwoorden van u (art. 6(1)(b), (c), (f))',
        recipients: 'Zoho (mailboxen)',
        transfer: 'EU-datacenter (Zoho EU)',
        retention: 'Zolang nodig om het verzoek te behandelen, en elke wettelijke bewaartermijn',
      },
    ],
    s5Title: 'Ontvangers',
    recipients: [
      'Supabase: database en authenticatie, als verwerker. EU-hosting (eu-central-1); VS-gevestigde provider.',
      'Resend: inlog- en uitnodigings-e-mail, als verwerker. VS-gevestigde provider.',
      'Stripe en Link: checkout, betaling, belasting en terugbetalingen op Order-niveau, als onafhankelijke verwerkingsverantwoordelijken onder hun eigen privacyverklaringen. Uw e-mailadres gaat naar hen wanneer u checkout start.',
      'GitHub Pages: websitehosting; ontvangt IP-adressen van bezoekers. Verenigde Staten.',
      'Zoho: mailboxen voor hello@borderday.com en privacy@borderday.com. EU-datacenter.',
      'Google: login, alleen als u die kiest. Verenigde Staten.',
      'Uw werkgever: in een bedrijfsaccount, diens accounteigenaren en HR-kijkers.',
    ],
    transfersTitle: 'Internationale doorgiften',
    transfersBody:
      'De verwerkingsverantwoordelijke is gevestigd in Zwitserland, dat door de Europese Commissie als adequaat wordt erkend; Zwitserland erkent op zijn beurt de EU- en EER-staten als adequaat. Voor ontvangers in de Verenigde Staten of elders steunen wij op de EU–VS- en Zwitsers–VS-Data Privacy Frameworks waar de provider is gecertificeerd, en anders op de standaardcontractbepalingen (met Zwitserse aanpassingen) in de gepubliceerde verwerkersvoorwaarden van de provider. Vraag privacy@borderday.com om een kopie van deze waarborgen.',
    s6Title: 'Bewaartermijnen',
    s6Body:
      'Bedrijfsdagregistraties: standaard 24 maanden, of de instelling van het bedrijf (1–120 maanden), tenzij toepasselijk recht langer vereist. Een dagelijkse geplande job wist bedrijfsdagregistraties waarvan de werkdatum buiten dat venster valt, en markeert openstaande uitnodigingen na hun 14-dagen-vervaldatum als verlopen. Dagregistraties van individuele abonnementen blijven tot u ze wist of het account sluit. Hele accounts, bedrijfslidmaatschap en factureringsgegevens worden niet getimed verwijderd: sluit het account of schrijf naar privacy@borderday.com. Demogegevens zijn gelabeld DEMO en kunnen altijd worden gereset.',
    s4Title: 'Uw rechten',
    rightsIntro: 'Binnen de wettelijke grenzen hebt u deze rechten:',
    rights: [
      'Inzage: een kopie van uw gegevens en informatie over hoe ze worden verwerkt.',
      'Rectificatie: correctie van onjuiste gegevens.',
      'Wissing: verwijdering van uw gegevens.',
      'Beperking: beperking van de verwerking in bepaalde gevallen.',
      'Bezwaar: bezwaar tegen verwerking op basis van gerechtvaardigde belangen.',
      'Overdraagbaarheid: uw gegevens in een gestructureerd, machineleesbaar formaat.',
      'Intrekking van toestemming: waar van toepassing, intrekking van toestemming zonder afbreuk aan de rechtmatigheid van de verwerking vóór de intrekking.',
    ],
    rightsHow:
      'Gebruik de Account-pagina om uw dagregistraties te exporteren of verwijdering te vragen, of schrijf naar privacy@borderday.com. De AVG geeft ons één maand om te antwoorden en de DSG 30 dagen. Voor dagregistraties in een bedrijfsaccount is de werkgever de verwerkingsverantwoordelijke, en die kan sommige records moeten bewaren.',
    complaintBody:
      'U kunt een klacht indienen bij de Zwitserse Federale Commissaris voor gegevensbescherming en informatievrijheid (EDÖB, www.edoeb.admin.ch). Als u in de EU/EER woont of werkt, kunt u ook klagen bij uw lokale gegevensbeschermingsautoriteit.',
    requiredBody:
      'Een e-mailadres is nodig voor een account, en daggegevens zijn nodig voor de tellers: zonder die kan de dienst niet worden geleverd. Tewerkstellingspercentage, A1-gegevens en notities zijn optioneel, hoewel sommige limieten zonder hen minder precies zijn. BorderDay neemt geen geautomatiseerde beslissingen met rechtsgevolgen: tellers berekenen alleen op basis van de geregistreerde dagen.',
    storageTitle: 'Opslag op uw apparaat',
    storageBody:
      'BorderDay zet geen cookies en gebruikt geen advertentie- of analyticstrackers. Het bewaart alleen wat de app op uw apparaat nodig heeft: IndexedDB voor de dagregistratie en instellingen van de gratis voorvertoning, localStorage voor uw inlogsessie en het demobedrijf, en een service-worker-cache zodat de app offline laadt. Dit is strikt noodzakelijk, dus er wordt geen toestemmingsbanner getoond. U kunt ze wissen in uw browserinstellingen.',
    s7Title: 'Transparantie tussen medewerker en HR',
    s7Body:
      'Er is geen verborgen HR-only-score. De tellerwiskunde (gebruikte dagen, toegestane dagen, status) is identiek voor de medewerkerview en het HR-dashboard.',
    contact: 'Privacycontact: privacy@borderday.com · hello@borderday.com',
  },

  individuals: {
    title: 'BorderDay for individuals',
    heroTitle: 'Log your own border days',
    heroBody:
      'Employees and individual users can log telework, on-site, trip and non-working days: social-security counters on every corridor, tax counters where the rule can be counted today. If your employer uses BorderDay, join via their invite link to share the same counters with HR.',
    ctaApp: 'Open employee app',
    ctaPricing: 'Individual pricing',
    ctaCompanies: 'My employer needs the company plan',
    point1:
      'Free preview stays on your device; a plan saves your log to your account. Export and delete either way.',
    point2: 'Same border routes and careful, sourced counters',
    point3: 'Optional company join — you see what HR sees',
  },
  company: {
    signupTitle: 'Create a company account',
    signupSubtitle: 'Sign in with email or Google, then create your company. Subscribe on the Pricing page when ready.',
    companyName: 'Company name',
    yourName: 'Your name',
    createButton: 'Create company',
    created: 'Company created. You are the owner.',
    openDashboard: 'Open HR dashboard',
    inviteTitle: 'Invite employees',
    inviteSubtitle: 'Generate an invite link. We email the invite when possible; you can always copy and share the link.',
    inviteEmail: 'Employee email',
    inviteRole: 'Role',
    roleOwner: 'Owner',
    roleHr: 'HR viewer',
    roleEmployee: 'Employee',
    sendInvite: 'Create invite link',
    inviteLinkLabel: 'Invite link (copy)',
    inviteCreated: 'Invite created. Share the link with the employee.',
    pendingInvites: 'Pending invites',
    dashboardTitle: 'HR dashboard',
    dashboardSubtitle:
      'Tax and social-security counters per employee. Day types, night-away marks and counts — never GPS or device location.',
    filterBorder: 'Filter by border route',
    filterStatus: 'Filter by status',
    filterAll: 'All',
    exportCsv: 'Export CSV',
    exportCsvNote:
      'Working record only. Not the annual telework-rate filing some cantons (for example the AFC) require — compute and submit that rate with your authority.',
    employees: 'Employees',
    noEmployees: 'No employees yet. Create an invite link.',
    viewHistory: 'Day history',
    historyTitle: 'Employee day history',
    historySubtitle:
      'Day type, date and night-away mark only. No GPS or device location is stored, and notes are not shown.',
    backDashboard: 'Back to dashboard',
    joinTitle: 'Join your company',
    joinSubtitle: 'Accept the invite, read the notice on what HR can see, and pick your border route.',
    joinButton: 'Join company',
    joinSuccess: 'You joined the company. Open the employee app to log days.',
    pickBorder: 'Your border route',
    demoDataBadge: 'DEMO DATA',
    demoBanner: 'This company is labeled DEMO. Figures are sample data for product preview — not real employees.',
    loadDemo: 'Load DEMO company',
    loading: 'Loading…',
    loadError: 'Could not load this page. Try again.',
    accessDenied: 'You need HR or owner access to this company.',
    noCompany: 'You do not belong to a company yet.',
    chooseCompany: 'Choose a company.',
    billingInactive: 'This company has no active subscription. Employees can join, but they cannot log days until you subscribe.',
    billingCta: 'See plans',
    inviteEmailed: 'Invite created and emailed. You can also share the link.',
    inviteInvalid: 'Invite not found or expired.',
    joinEmailMismatch: 'This invite was sent to {invited}, but you are signed in as {current}. Sign out, then sign in with the invited address.',
    joinEmailUnconfirmed: 'Confirm your email address, then open this invite again.',
    viewMyHistory: 'See what HR sees',
    countersHeading: 'Counters',
    status: 'Status',
    usedAllowed: 'Used / allowed',
    kindTax: 'Tax',
    kindSs: 'Social security',
    colDate: 'Date',
    colDayType: 'Day type',
    emptyCounters: 'Employee has not chosen a border route yet.',
    profileTitle: 'Employment percentage and A1',
    saveProfile: 'Save',
    profileSaved: 'Saved.',
    noticeTitle: 'Notice — what HR can see',
    noticeBody:
      'This is information, not a request for consent: your employer decides why and on what legal basis it records these days, and is responsible for that. If you join, your employer’s account owners and HR viewers can see: your name, email, chosen border route, contractual working days, employment percentage and A1 record if entered, each logged day’s type and date, whether you marked it as a night away for work, and the same tax and social-security counters you see. They can also record your employment percentage and A1. They cannot see GPS or device location, because BorderDay does not collect it, and notes are private to you. The day type does show a country category per date. You can export or delete your day log, and ask your employer or privacy@borderday.com about your rights. Retention: 24 months by default (company setting, 1–120 months); company day logs older than that window are deleted automatically each day. This is a tracking tool, not tax or legal advice.',
    noticeAck: 'I have read this notice',
    noticeRequired: 'Confirm that you have read the notice to continue.',
    noticePrivacyLink: 'Full privacy notice',
    retentionTitle: 'Day-log retention',
    retentionHelp: 'Company day logs older than this many months are deleted automatically each day (1–120). Default 24. Membership, billing and whole accounts are not timed-deleted.',
    retentionMonths: 'Months',
    retentionSave: 'Save retention',
    retentionSaved: 'Retention updated.',
    hrDisclaimer:
      'Counters only reflect the days logged here and are not a legal or tax determination. The employer remains responsible for A1 applications, payroll and tax filings. Verify with the competent authority.',
    inviteLanguage: 'Employee’s language',
    inviteFailed: 'Could not create the invite. Check the address and try again.',
  },

  terms: {
    title: 'Voorwaarden & impressum',
    updated: 'Laatst bijgewerkt: 31 okt. 2026 (Europe/Zurich)',
    providerTitle: 'Impressum: aanbieder en contractpartij',
    providerBody:
      'De BorderDay-dienst en deze website worden aangeboden door PrimeLogic Advisory Sàrl, Cours des Bastions 13, 1205 Genève, Zwitserland (UID CHE-312.418.158; Zwitsers IDE/UID-nummer), die de contractpartij voor de dienst is. De vennootschap is onder dat UID ingeschreven in het handelsregister van Genève. Zij wordt vertegenwoordigd door haar aldaar ingeschreven bestuurders. Contact: hello@borderday.com · Privacy: privacy@borderday.com. Postadres zoals hierboven. Checkout gebruikt Stripe Managed Payments: aankopen verschijnen als verkocht via Link, en Link is merchant of record (verkoper) voor betaling, belastingheffing en -aangifte, en terugbetalingen op Order-niveau waar Managed Payments van toepassing is.',
    legalNoticeNote: 'Dit onderdeel is het impressum / de wettelijke vermelding. Een uittreksel uit het handelsregister en verdere bijzonderheden (inclusief een eventuele EU-vertegenwoordiger volgens art. 27, indien later aangesteld) zijn op verzoek beschikbaar via hello@borderday.com.',
    s1Title: 'Dienst',
    s1Body:
      'BorderDay is een registratie- en herinneringstool voor dagclassificaties voor werkgevers en medewerkers op geselecteerde grensoverschrijdende corridors. Het is geen belastingadvies, juridisch advies, noch een vervanging van uw werkgever, een gekwalificeerde adviseur of een bevoegde autoriteit. Zie de Disclaimer.',
    s2Title: 'Accounts en zakelijk gebruik',
    s2Body:
      'U moet accurate accountgegevens verstrekken. Eigenaren van bedrijfsaccounts nodigen medewerkers uit; medewerkers kiezen een grenscorridor en registreren alleen dagsoorten (geen GPS of apparaatlocatie). HR ziet dezelfde tellers als de medewerker. In een bedrijfsaccount beslist de werkgever waarom en hoe medewerkerdagen worden geregistreerd: de werkgever is de verwerkingsverantwoordelijke van die dagregistraties en is verantwoordelijk voor de rechtsgrond, voor het informeren van medewerkers en voor eventuele consultatie die zijn wet vereist, en de aanbieder treedt op als verwerker. Verplichtingen aan werkgeverszijde kunnen rechtmatig gebruik blokkeren tot ze zijn vervuld: bijvoorbeeld medezeggenschap van de ondernemingsraad over technische controlesystemen (Duitsland BetrVG § 87(1) nr. 6), regels over personeelsvertegenwoordiging of CCT in Frankrijk, België, Luxemburg en Zwitserland, en lokale regels over medewerkersmonitoring of privacy op de werkplek. BorderDay voert die consultaties niet voor u uit. De aanbieder is verwerkingsverantwoordelijke van accounts, facturatie en beveiliging. De verwerkersovereenkomst voor medewerker-dagregistraties staat op /dpa/. U bent verantwoordelijk voor de juistheid van de dagen die u registreert.',
    s3Title: 'Abonnementen, proefperiode, verlenging en opzegging',
    s3Body:
      'Betaalde plannen zijn abonnementen. Bedrijfs- en individuele abonnementen beginnen met een gratis proefperiode van 7 dagen; bij aanmelding is een betaalkaart vereist. Na 7 dagen wordt het plan betaald tegen de vermelde prijs: uw kaart wordt automatisch belast op dag 8 en het abonnement verlengt daarna elke maand of elk jaar tot u opzegt. Als u vóór dag 8 opzegt, wordt niets in rekening gebracht. Als er bij afloop van de proefperiode geen geldig betaalmiddel is, wordt het abonnement geannuleerd. U kunt altijd opzeggen via de link Abonnement opzeggen in de voettekst van elke pagina, die naar het klantenportaal, uw Link-ordertools of een e-mailverzoek leidt. Opzegging stopt toekomstige verlengingen. Al geïnde bedragen voor een gestarte factureringsperiode worden niet pro rata terugbetaald, tenzij de wet of de terugbetalingsvoorwaarden van Link dat vereisen; uw herroepingsrecht hieronder blijft onaangetast.',
    s3YearlyBody:
      'Jaarlijkse individuele abonnementen verlengen voor een verder jaar tot u opzegt. BorderDay stuurt vóór elke jaarlijkse verlenging een herinnering per e-mail. Opzeggen tijdens het eerste jaar stopt de volgende verlenging. Na het eerste jaar kunt u een verlengd jaarabonnement altijd opzeggen; het eindigt dan, en eventuele terugbetaling van het ongebruikte deel geldt zoals dwingend consumentenrecht in uw land vereist. Opzeggen via de link Abonnement opzeggen in de voettekst (klantenportaal), uw Link-ordertools of e-mail.',
    s4Title: 'Prijzen, btw en merchant of record',
    s4Body:
      'Bedrijf: €5 per actieve medewerker per maand, minimum €39 per maand, of jaarlijkse facturatie met 2 maanden gratis (minimum €390 per jaar), alles exclusief btw. Individueel: €4,99 per maand of €49 per jaar, inclusief btw. Checkout gebruikt Stripe Managed Payments: aankopen verschijnen als verkocht via Link, en Link is merchant of record voor belastingheffing en -aangifte waar Managed Payments van toepassing is. Getoonde prijzen kunnen bij checkout naar lokale valuta worden omgerekend.',
    s5Title: 'Herroepingsrecht voor consumenten in de EU/EER (14 dagen)',
    s5Body:
      'Als u als consument in de EU/EER een individueel abonnement koopt, kunt u de overeenkomst binnen 14 dagen herroepen zonder opgave van reden. De termijn loopt vanaf de dag waarop de overeenkomst tot stand komt, dat is de dag waarop u na checkout toegang krijgt. Om te herroepen, laat u ons duidelijk weten: gebruik de pagina Herroeping van de overeenkomst, het modelformulier hieronder of een gewone e-mail aan privacy@borderday.com, of neem contact op met Link-support voor uw Order. Het volstaat uw bericht vóór het einde van de 14 dagen te versturen.',
    s5EffectsBody:
      'BorderDay is een digitale dienst, dus het herroepingsrecht eindigt pas wanneer de overeenkomst volledig is uitgevoerd, niet wanneer de uitvoering begint. Herroepen tijdens de gratis proefperiode kost niets. Als u herroept nadat een betaalde periode is begonnen, bent u alleen een bedrag verschuldigd in verhouding tot de tot uw herroeping geleverde dienst, en alleen als u uitdrukkelijk hebt gevraagd de dienst tijdens de termijn te starten en deze informatie hebt ontvangen. Al het overige dat u hebt betaald, wordt zonder onnodige vertraging en uiterlijk binnen 14 dagen terugbetaald, via hetzelfde betaalmiddel; Link handelt de terugbetaling voor uw Order af.',
    s5BusinessBody: 'Bedrijfsabonnementen worden verkocht voor zakelijk gebruik. Dwingende consumentenrechten blijven onaangetast.',
    s5FormTitle: 'Modelformulier voor herroeping (alleen invullen en terugsturen als u wilt herroepen)',
    s5Form:
      'Aan: BorderDay, privacy@borderday.com (gegevens van de aanbieder in het impressum hierboven)\nHierbij deel ik mee dat ik mijn overeenkomst voor de volgende dienst herroep: BorderDay-abonnement\nBesteld op / ontvangen op:\nNaam van de consument:\nAdres van de consument:\nHandtekening van de consument (alleen bij kennisgeving op papier):\nDatum:',
    s6Title: 'Terugbetalingen en betalingsondersteuning',
    s6Body:
      'Verzoeken over betaling, ontvangstbewijs, factuur en terugbetalingen op Order-niveau onder Managed Payments worden door Link behandeld onder de voorwaarden die Stripe publiceert als “Sold through Link” (checkout-branding) en “Purchase” (de Link-orderpagina). Productvragen (hoe BorderDay werkt, accounttoegang, gegevensexport) gaan naar hello@borderday.com of privacy@borderday.com.',
    s7Title: 'Wijzigingen',
    s7Body:
      'Wij kunnen deze Voorwaarden bijwerken. De datum “Laatst bijgewerkt” hierboven verandert wanneer wij dat doen. Bij materiële wijzigingen die uw rechten of verplichtingen raken, geven wij redelijke voorafgaande kennisgeving (bijvoorbeeld per e-mail naar het accountadres of een melding in het product) voordat ze van kracht worden. Als dwingend consumenten- of arbeidsrecht uw uitdrukkelijke instemming of een ander proces vereist, geldt dat proces in plaats van loutere voortzetting van gebruik. Niet-materiële verduidelijkingen kunnen van kracht worden bij publicatie.',
    s8Title: 'Toepasselijk recht en forum',
    s8Body:
      'Deze Voorwaarden worden beheerst door het materiële recht van Zwitserland, met uitsluiting van zijn conflictenrecht. Voor geschillen met zakelijke klanten zijn de rechtbanken van Genève, Zwitserland, exclusief bevoegd. Dwingende consumentenbescherming en exclusieve consumentenfora waar u woont blijven onaangetast. Niets hier beperkt rechten waaraan onder de AVG, de Zwitserse DSG of het consumentenrecht van uw woonland niet kan worden afstand gedaan.',
    s9Title: 'Aansprakelijkheid',
    s9Body:
      'BorderDay is een registratie- en herinneringstool voor dagclassificaties. Het is geen belasting-, juridisch, loon- of socialezekerheidsadvies. Voor zover wettelijk toegestaan is de aanbieder niet aansprakelijk voor beslissingen die u of uw werkgever neemt op basis van tellers, drempels of toelichtingen in het product, noch voor beoordelingen door autoriteiten die van die tellers afwijken. Niets in deze Voorwaarden sluit aansprakelijkheid uit of beperkt die voor dood of persoonlijk letsel door nalatigheid, voor fraude of bedrieglijke voorstelling van zaken, of voor andere aansprakelijkheid die onder toepasselijk recht niet kan worden beperkt. Tegenover zakelijke klanten is aansprakelijkheid voor eenvoudige nalatigheid beperkt tot directe schade die typisch voorzienbaar is voor dit soort SaaS-abonnement, en sluit gederfde winst en indirecte schade uit, behalve waar dwingend recht anders bepaalt.',
    s10Title: 'Intellectuele eigendom en teruggave van gegevens',
    s10Body:
      'De naam BorderDay, software, ontwerp en documentatie blijven intellectuele eigendom van de aanbieder. U ontvangt een beperkt, niet-exclusief recht om de dienst te gebruiken tijdens een actief abonnement of gratis voorvertoning. U (of, voor bedrijfsdagregistraties, uw werkgever als verwerkingsverantwoordelijke) behoudt rechten op de dagregistratie-inhoud die u indient. Op schriftelijk verzoek na beëindiging van het account, of via de export in het product waar beschikbaar, geven wij dagregistratiegegevens terug of wissen ze zoals beschreven in de Privacyverklaring en de /dpa/-overeenkomst, behalve waar de wet bewaring vereist (bijvoorbeeld factureringsgegevens). De aanbieder kan een account beëindigen of opschorten wegens materiële schending, onbetaalde bedragen na kennisgeving, of juridisch risico, na een redelijke hersteltermijn waar herstel uitvoerbaar is.',
    contact: 'Contact: hello@borderday.com · Privacy: privacy@borderday.com',
  },
  disclaimer: {
    title: 'Disclaimer',
    body:
      'BorderDay is een registratie- en herinneringstool voor werkgevers en medewerkers. Het is geen belastingadvies, juridisch advies, noch een vervanging van uw werkgever, een gekwalificeerde belastingadviseur of de bevoegde socialezekerheidsinstelling. Getoonde drempels komen uit openbare officiële bronnen en kunnen wijzigen; controleer altijd bij de voor u geldende autoriteit. U bent verantwoordelijk voor de juistheid van de dagen die u registreert. Werkgevers blijven verantwoordelijk voor A1-aanvragen, loonadministratie en belastingaangiften.',
  },
  withdrawal: {
    title: 'Herroeping van de overeenkomst',
    intro:
      'Als u als consument in de EU/EER een individueel abonnement hebt gekocht, kunt u binnen 14 dagen na ontvangst van de toegang herroepen zonder opgave van reden. Vul de velden in, bevestig en verstuur het voorbereide bericht vanuit uw e-mail.',
    howTitle: 'Hoe het werkt',
    how:
      'Deze pagina bereidt uw herroepingsbericht voor aan privacy@borderday.com. Uw herroeping is gedaan wanneer u het verstuurt. Bewaar een kopie van de verzonden e-mail als bewijs. Wij bevestigen de ontvangst per e-mail en Link handelt de terugbetaling voor uw Order af.',
    linkNote:
      'U kunt ook contact opnemen met de Link-support voor uw Order, of een herroepingsoptie op uw Link-orderpagina gebruiken. Wij hebben daar geen one-click-herroepingsfunctie kunnen verifiëren, dus deze pagina en het bovenstaande e-mailadres blijven beschikbaar.',
    scopeNote:
      'Alle bijzonderheden en het modelformulier staan in de Voorwaarden & impressum. Bedrijfsabonnementen worden verkocht voor zakelijk gebruik.',
    orderedOn: 'Bestel- of toegangsdatum',
    submit: 'Doorgaan naar bevestiging',
    confirm: 'Herroeping bevestigen',
    mailSubject: 'Herroeping van BorderDay-overeenkomst',
    mailBody:
      'Hierbij deel ik mee dat ik mijn overeenkomst voor de volgende dienst herroep: BorderDay-abonnement.\n\nNaam: {name}\nAccount-e-mail: {email}\nOrderreferentie: {reference}\nBesteld op / ontvangen op: {date}\nDatum van deze kennisgeving: {today}',
  },
  mailForm: {
    name: 'Your name',
    email: 'Account email',
    reference: 'Order reference',
    referenceHint: 'From your Link receipt, if you have it.',
    reviewTitle: 'Check your message',
    to: 'To:',
    subject: 'Subject:',
    send: 'Open in my email app',
    manual: 'If no email app opens, copy this text and send it to {to}.',
    back: 'Change details',
  },
  account: {
    title: 'Your account',
    signedInAs: 'Signed in as {email}',
    exportTitle: 'Export your saved day logs',
    exportBody:
      'Downloads what is saved on our servers for your account: your individual plan’s day log, and your own day log and settings in each company you belong to.',
    exportError: 'Could not prepare the export. Try again.',
    deviceTitle: 'This device only',
    deviceBody: 'Days from the free preview, stored in this browser and not on our servers.',
    deleteTitle: 'Request account deletion',
    deleteBody:
      'Deleting an account is handled by us, not automatically. Send the request below and we delete your account and personal day log and answer within one month. For day logs in a company account your employer is the controller and may need to keep some records: we tell you if so. Cancel any paid plan first.',
    deleteConfirm: 'I want to request the deletion of my account',
    deleteSend: 'Open deletion request in my email app',
    deleteHint: 'The request is made when you send the email to {to}.',
    deleteMailSubject: 'BorderDay account deletion request',
    deleteMailBody:
      'Please delete my BorderDay account.\n\nAccount email: {email}\nAccount ID: {id}\nDate: {today}',
  },
  cancel: {
    title: 'Cancel subscription',
    intro:
      'Cancel your BorderDay subscription here. Cancellation stops future renewals. If you cancel before day 8 of your trial, nothing is charged.',
    accountTitle: 'Cancel from your account',
    accountBody: 'Opens the billing portal, where you confirm the cancellation.',
    companyButton: 'Cancel the {company} subscription',
    individualButton: 'Cancel my individual plan',
    noPlans: 'No subscription you can manage was found for this account. Use the options below.',
    signIn: 'Sign in to cancel from your account',
    portalError: 'The billing portal could not be opened. Use the options below.',
    linkTitle: 'Plans bought through Link',
    linkBody:
      'Purchases are sold through Link. Use the order link in your Link receipt email to manage or cancel the subscription, or contact Link support for your Order.',
    formTitle: 'Cancel by email, without signing in',
    formBody:
      'Fill in the fields, confirm, and send the prepared message from your email. We confirm the cancellation by email.',
    submit: 'Continue to confirmation',
    confirm: 'Confirm cancellation',
    mailSubject: 'BorderDay subscription cancellation',
    mailBody:
      'I cancel my BorderDay subscription.\n\nName: {name}\nAccount email: {email}\nOrder reference: {reference}\nDate: {today}',
  },
  accessibility: {
    title: 'Toegankelijkheid',
    updated: 'Laatst bijgewerkt: 31 oktober 2026',
    intro:
      'BorderDay wil bruikbaar zijn met toetsenbord, schermlezers en gangbare ondersteunende technologieën. Wij werken toe naar WCAG 2.2 niveau AA. Deze pagina is een korte openbare verklaring; het is geen formele conformiteitsclaim onder de European Accessibility Act.',
    scopeTitle: 'Reikwijdte',
    scopeBody:
      'Deze verklaring dekt de openbare website en het ingelogde product op borderday.com (Engels, Frans, Duits, Italiaans en Nederlands). Checkout van derden (Stripe / Link) en e-mailclients volgen hun eigen toegankelijkheidspraktijken.',
    statusTitle: 'Huidige status',
    statusBody:
      'Geautomatiseerde controles met axe op de hoofdschermen meldden geen schendingen bij de laatste interne scan (31 oktober 2026). Handmatige review vindt nog hiaten die wij herstellen: kalenderdagcellen hebben vollediger toegankelijke namen nodig (datum en dagsoort, niet alleen kleur); maandbediening heeft duidelijkere labels nodig; sommige formulierfouten moeten duidelijker worden aangekondigd; de navigatie op klein scherm heeft een makkelijkere weg naar elke pagina nodig. Een volledige acceptatietest met schermlezer is nog niet afgerond.',
    feedbackTitle: 'Feedback',
    feedbackBody:
      'Als u een barrière vindt, mail hello@borderday.com met de pagina-URL, uw browser of ondersteunende technologie, en wat u probeerde te doen. Wij streven ernaar binnen vijf werkdagen te antwoorden.',
  },

  dpa: {
    title: 'Verwerkersovereenkomst (bedrijfsaccounts)',
    updated: 'Laatst bijgewerkt: 31 okt. 2026 (Europe/Zurich)',
    intro:
      'Deze verwerkersovereenkomst (“DPA”) geldt wanneer een werkgever een BorderDay-bedrijfsaccount gebruikt zodat BorderDay persoonsgegevens van medewerkers van die werkgever verwerkt (dagregistraties en gerelateerde lidmaatschapsgegevens). Zij wordt aangeboden onder artikel 28 AVG en onder de Zwitserse federale wet inzake gegevensbescherming (DSG / LPD / FADP) voor verwerking door een verwerker / Auftragsbearbeiter. Het aanmaken of gebruiken van een bedrijfsaccount, of het blijven gebruiken na publicatie van deze pagina, geldt als aanvaarding van deze DPA door de werkgever voor die verwerking.',
    partiesTitle: 'Partijen',
    partiesBody:
      'Verwerkingsverantwoordelijke (werkgever): de rechtspersoon die het BorderDay-bedrijfsaccount houdt en beslist waarom en hoe dagregistraties van medewerkers worden vastgelegd. Verwerker (aanbieder): PrimeLogic Advisory Sàrl, Cours des Bastions 13, 1205 Genève, Zwitserland (UID CHE-312.418.158), die BorderDay exploiteert. Contact: privacy@borderday.com · hello@borderday.com.',
    rolesTitle: 'Rollen',
    rolesBody:
      'Voor medewerker-dagregistraties, uitnodigingen en de daaruit afgeleide HR-tellers is de werkgever de verwerkingsverantwoordelijke en PrimeLogic Advisory Sàrl de verwerker. Voor de BorderDay-website, individuele abonnementen, gebruikersaccounts, beheer van bedrijfsaccounts, facturatie, support en beveiliging blijft PrimeLogic Advisory Sàrl verwerkingsverantwoordelijke onder de Privacyverklaring. Stripe en Link treden op als onafhankelijke verwerkingsverantwoordelijken voor checkout en betaling onder hun eigen verklaringen; zij zijn geen verwerkers van medewerker-dagregistraties onder deze DPA.',
    subjectTitle: 'Voorwerp en aard van de verwerking',
    subjectBody:
      'Voorwerp: hosting, opslag, raadpleging, doorgifte en weergave van lidmaatschaps- en dagregistratiegegevens van medewerkers zodat de werkgever telewerk- en belastingdag-tellers kan voeren. Aard: geautomatiseerde verwerking in een gehoste applicatie (aanmaken, lezen, bijwerken, wissen; aggregatie tot tellers; uitnodigings-e-mail). Doeinde: alleen de doeleinden die de werkgever via de BorderDay-bedrijfsfuncties opdraagt, en zoals beschreven in de Privacyverklaring. Categorieën van betrokkenen: medewerkers en andere natuurlijke personen die de werkgever uitnodigt voor het bedrijfsaccount. Categorieën van persoonsgegevens: naam, e-mail, rol, grenscorridor, contractuele werkdagen, tewerkstellingspercentage en A1-gegevens indien ingevoerd, dagsoort en datum, markering nacht-uit, tellers, en het record dat de kennisgeving “wat HR kan zien” is getoond. Notities blijven privé voor de medewerker en worden niet aan HR getoond. Er wordt geen GPS of apparaatlocatie verzameld.',
    durationTitle: 'Duur',
    durationBody:
      'De verwerking duurt zolang het bedrijfsaccount en het lidmaatschap bestaan, en daarna alleen voor zover nodig om gegevens onder deze DPA te wissen of terug te geven en de bewaartermijnen in de Privacyverklaring (inclusief een bedrijfsinstelling voor bewaring).',
    instructionsTitle: 'Gedocumenteerde instructies (art. 28(3)(a))',
    instructionsBody:
      'De verwerker verwerkt medewerker-dagregistratiegegevens alleen op gedocumenteerde instructies van de verwerkingsverantwoordelijke. De BorderDay-Voorwaarden, deze DPA, de Privacyverklaring en de handelingen die de accounteigenaren van de werkgever in het product verrichten (uitnodigen, verwijderen, bewaarinstelling, exportverzoeken) zijn de instructies. De verwerker informeert de werkgever als een instructie naar haar oordeel in strijd is met de AVG of de DSG.',
    securityTitle: 'Beveiliging (art. 28(3)(c); DSG art. 8)',
    securityBody:
      'De verwerker treft passende technische en organisatorische maatregelen, waaronder toegangscontrole en encryptie onderweg naar de gehoste database, rolgebaseerde isolatie tussen bedrijfsaccounts (RLS), en beperking van personeelstoegang tot wat nodig is voor support en beveiliging. Bijzonderheden over hosting staan onder subverwerkers.',
    subTitle: 'Toegestane subverwerkers',
    subIntro:
      'De werkgever geeft een algemene machtiging voor de volgende subverwerkers voor de beschreven verwerking. Hieronder vermelde regio’s zijn die wij vandaag kunnen verifiëren; providervennootschappen kunnen nog buiten die regio’s zijn gevestigd.',
    subprocessors: [
      'Supabase (database en authenticatie): primaire database en authenticatie voor project uufmlmwgvoqhhtqgrclu in AWS-regio eu-central-1 (Frankfurt, EU), geverifieerd 31 okt. 2026. VS-gevestigde provider; doorgiften onder diens gepubliceerde DPA / SCC’s. https://supabase.com/legal/dpa',
      'Resend (transactionele e-mail voor login en bedrijfsuitnodigingen): VS-gevestigde provider; gepubliceerde DPA met SCC’s / Zwitserse voorwaarden. https://resend.com/legal/dpa',
      'GitHub Pages (statische websitehosting): ontvangt IP-adressen van bezoekers in host-logboeken. Verenigde Staten. https://docs.github.com/en/pages',
      'Google (optionele login alleen als de gebruiker Google kiest): Verenigde Staten; Google’s eigen voorwaarden voor de login.',
      'Stripe / Link (checkout en betaling voor het bedrijfsabonnement): onafhankelijke verwerkingsverantwoordelijken voor betaling, belasting en Order-gegevens onder hun verklaringen — geen verwerkers van medewerker-dagregistraties. Hier vermeld omdat bedrijfsfacturatie ze gebruikt. https://stripe.com/legal/dpa · https://link.com/terms',
    ],
    subChangeBody:
      'Materiële wijzigingen in deze lijst worden op deze pagina weergegeven. De werkgever kan binnen 14 dagen na de update op redelijke gegevensbeschermingsgronden bezwaar maken via privacy@borderday.com; als geen werkbare oplossing wordt overeengekomen, mag de werkgever stoppen met de bedrijfsfuncties die van de nieuwe subverwerker afhangen.',
    transfersTitle: 'Internationale doorgiften',
    transfersBody:
      'De verwerkingsverantwoordelijke is typisch gevestigd in de EU/EER, Zwitserland of een andere staat. De verwerker is gevestigd in Zwitserland (adequaatheid). Databasehosting voor BorderDay is in de EU (eu-central-1). Waar een subverwerker in de Verenigde Staten of elders is gevestigd, steunen doorgiften op de EU–VS- en Zwitsers–VS-Data Privacy Frameworks waar de provider is gecertificeerd, anders op de standaardcontractbepalingen (met Zwitserse aanpassingen) in de gepubliceerde voorwaarden van die provider. Een kopie van de waarborgen kan worden gevraagd via privacy@borderday.com.',
    assistanceTitle: 'Bijstand bij rechten van betrokkenen en naleving (art. 28(3)(e)–(f))',
    assistanceBody:
      'Rekening houdend met de aard van de verwerking, staat de verwerker de werkgever bij via productfuncties (export/wissen waar beschikbaar) en door verzoeken aan privacy@borderday.com door te sturen die duidelijk betrekking hebben op medewerkers van die werkgever. De werkgever blijft verantwoordelijk voor het beantwoorden van diens medewerkers. De verwerker staat ook, op verzoek en tegen redelijke kosten waar de wet dat toelaat, bij bij gegevensbeschermingseffectbeoordelingen en voorafgaande raadpleging waar die betrekking hebben op BorderDay-bedrijfsfuncties.',
    breachTitle: 'Inbreuken in verband met persoonsgegevens (art. 28(3)(f); DSG art. 24)',
    breachBody:
      'De verwerker stelt de werkgever zonder onnodige vertraging in kennis nadat zij kennis heeft genomen van een inbreuk in verband met persoonsgegevens die de medewerkergegevens van die werkgever onder deze DPA raakt, met de dan beschikbare informatie om de werkgever te helpen diens eigen meldingsplichten na te komen.',
    deletionTitle: 'Teruggave en wissing (art. 28(3)(g))',
    deletionBody:
      'Wanneer het bedrijfsaccount eindigt, of eerder op schriftelijke instructie, wist of geeft de verwerker medewerker-dagregistratiegegevens terug (behalve waar Unie-, lidstaat- of Zwitsers recht bewaring vereist — bijvoorbeeld boekhoudkundige records van het abonnement zelf). Exporttools in het product, waar beschikbaar, zijn de primaire methode van teruggave.',
    auditTitle: 'Informatie en audits (art. 28(3)(h))',
    auditBody:
      'De verwerker stelt informatie beschikbaar die nodig is om naleving van deze DPA aan te tonen, inclusief deze pagina, de Privacyverklaring en actuele documentatie over subverwerkers. Audits op locatie zijn beperkt tot één keer per jaar (tenzij een bevoegde autoriteit meer vereist), met redelijke voorafgaande kennisgeving, tijdens kantooruren, zonder verstoring van andere klanten, en op kosten van de werkgever tenzij een materiële schending door de verwerker wordt vastgesteld.',
    liabilityTitle: 'Vertrouwelijkheid en aansprakelijkheid',
    liabilityBody:
      'Personen die gemachtigd zijn de gegevens te verwerken, zijn tot geheimhouding verplicht. De aansprakelijkheid van elke partij jegens de andere voor deze DPA volgt de BorderDay-Voorwaarden, zonder beperking van dwingende rechten van betrokkenen onder de AVG of de DSG.',
    lawTitle: 'Toepasselijk recht en hiërarchie',
    lawBody:
      'Deze DPA wordt beheerst door Zwitsers recht, onverminderd dwingende bepalingen van de AVG die op de verwerking van toepassing zijn. Als deze DPA conflicteert met de Voorwaarden over zuiver commerciële punten, prevaleren de Voorwaarden; over gegevensbeschermingsverplichtingen voor medewerker-dagregistraties prevaleert deze DPA. Dwingend consumenten- of arbeidsrecht blijft onaangetast.',
    contactTitle: 'Contact',
    contactBody:
      'Gegevensbeschermingscontact voor de verwerker: privacy@borderday.com. Algemeen: hello@borderday.com. Post: PrimeLogic Advisory Sàrl, Cours des Bastions 13, 1205 Genève, Zwitserland.',
    disclaimer:
      'Deze DPA is een openbare standaardtekst voor BorderDay-bedrijfsaccounts. Het is geen juridisch advies. Werkgevers met bijzondere eisen (sectorspecifieke regels, ondernemingsraadakkoorden, extra SCC’s) moeten zelf advies inwinnen en contact opnemen met privacy@borderday.com voordat zij BorderDay gebruiken voor gereguleerde verwerking.',
  },
  footer: {
    tagline: 'Day tracking for cross-border teams and employees.',
    rights: '© {year} BorderDay',
  },
  auth: {
    signInTitle: 'Sign in',
    signInSubtitle: 'Email (password or magic link) or Google.',
    signUpTitle: 'Create your account',
    signUpSubtitle: 'Use work email and a password, or continue with Google.',
    email: 'Email',
    password: 'Password',
    displayName: 'Your name',
    signIn: 'Sign in',
    signUp: 'Sign up',
    createAccount: 'Create account',
    magicLink: 'Magic link',
    sendMagic: 'Email me a sign-in link',
    magicSent: 'Check your email for the sign-in link.',
    continueGoogle: 'Continue with Google',
    googleHint: 'Secure Google OAuth — we never see your Google password.',
    googleNotReady: 'Google sign-in is not enabled yet. Use email for now.',
    checkEmail: 'Check your email to confirm your account (if required), then continue.',
    noAccount: 'No account yet?',
    hasAccount: 'Already have an account?',
    notConfigured: 'The authentication backend is not configured in this build.',
    completing: 'Completing sign-in…',
    callbackFailed: 'Could not complete sign-in. Try again.',
    paymentsUnavailable: 'Could not start checkout — try again or contact support.',
    signOut: 'Sign out',
    signUpTerms:
      'Creating an account is free. A paid plan starts only through checkout: 7-day free trial, then the plan you chose at the stated price, charged automatically on day 8 and renewing until you cancel. Read:',
  },
};

export default nl;

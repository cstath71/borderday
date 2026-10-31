const en = {
  meta: {
    siteName: 'BorderDay',
    tagline: 'Cross-border day limits for HR and employees — before affiliation or tax surprises.',
    description:
      'BorderDay helps HR and employees log telework, on-site and travel days. Social-security telework counters on all nine corridors; tax counters on four: Geneva and other non-1983 cantons, Germany→Switzerland, France→Luxembourg and Italy→Switzerland. A tracking tool — not tax or legal advice.',
  },
  nav: {
    home: 'Home',
    app: 'Employee app',
    pricing: 'Pricing',
    faq: 'FAQ',
    privacy: 'Privacy',
    disclaimer: 'Disclaimer',
    terms: 'Terms',
    openApp: 'Open the app',
    joinWaitlist: 'Sign in',
    forIndividuals: 'For individuals',
    forCompanies: 'For companies',
    hrDashboard: 'HR dashboard',
    companySignup: 'Company sign-up',
  },
  lang: {
    en: 'English',
    fr: 'Français',
    de: 'Deutsch',
    it: 'Italiano',
    label: 'Language',
  },
  home: {
    heroTitle: 'One place for every border your people work across',
    heroBody:
      'For HR and finance managers in Geneva, Basel, Ticino, Luxembourg and Belgium: see day counters per employee before a social-security switch or a tax limit is crossed. Social-security counters on all nine corridors, tax counters on four, and every corridor says which it has. Four languages, tax and social security tracked separately.',
    ctaPrimary: 'Create company account',
    ctaSecondary: 'See company pricing',
    ctaIndividuals: 'I am an individual employee',
    riskTitle: 'Why day limits matter for employers',
    risk1Title: 'Social-security affiliation',
    risk1Body:
      'Under the EU/EEA/CH framework agreement, telework in the residence state of 25% or more of working time normally moves social security there unless an A1 is requested. At 50% or more the framework is no longer available. BorderDay shows the three bands: under 25%, 25% to under 50% (A1 required) and 50% or more, separately from tax.',
    risk2Title: 'Tax day thresholds',
    risk2Body:
      'Tax counters run today on four corridors: Geneva and other non-1983 cantons (40% / 10 mission days), Germany→Switzerland (60 non-return days), France→Luxembourg (34 days, reduced for part-time) and Italy→Switzerland (25% / 45 non-return days). The other five say plainly that no tax counter runs. We never invent a number.',
    risk3Title: 'Multi-border teams',
    risk3Body:
      'One company dashboard for employees on different borders. Filter by border or status. Export CSV for audit. Employees see exactly the same counters HR sees.',
    feature1Title: 'Tax and social security, separately',
    feature1Body:
      'Independent counters with official sources linked. Warnings at 75% and 90% of the real allowance, then at-limit and over-limit states with the consequence spelled out.',
    feature2Title: 'Invite by email link',
    feature2Body: 'Employees join your company, pick their border pack, and log day types only — never GPS location.',
    feature3Title: 'Data protection by design',
    feature3Body: 'GDPR and Swiss FADP (nLPD) oriented: company isolation, export and delete, clear consent, retention note. HR sees day types and counts, not location.',
    bordersTitle: 'Corridors covered in version 1',
    bordersIntro:
      'Each corridor shows what it counts today. Where no tax rule can be counted yet, it says so and shows no number.',
    howTitle: 'How companies use BorderDay',
    how1: 'Create a company account and invite employees by email link.',
    how2: 'Each employee picks their border pack and logs telework / on-site / trip / non-working days.',
    how3: 'HR watches per-employee tax and social-security counters, filters by status, and exports CSV.',
    waitlistTitle: 'Start with a company account',
    waitlistBody:
      'Create a company account with email or Google, invite your team, then subscribe on the Pricing page. A labeled DEMO company remains available for preview.',
    waitlistPlaceholder: 'you@company.com',
    waitlistButton: 'Create account',
    waitlistNote: 'No waitlist — accounts and checkout are live. Company plans: €5/employee/mo (min €39), 7-day trial.',
    disclaimerShort:
      'BorderDay is a tracking and reminder tool for day classifications. It is not tax advice or legal advice. Always verify with the competent authority or a qualified adviser.',
    demoBanner: 'Screenshots and the seeded company use clearly labeled DEMO data — not real employees.',
    inShort:
      'BorderDay helps HR track telework, on-site and travel days per employee: social-security counters on all nine corridors in five regions, tax counters on four of them. Company plan: €5 per active employee per month (€39 minimum); individuals €4.99/month or €49/year. 7-day trial with card required. A tracking tool — not tax or legal advice.',
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
      'Convention regime: Geneva and every canton outside the 1983 agreement, with the telework rule applying from 1 Jan 2026. If your employer is in Bern, Solothurn, Basel-Stadt, Basel-Landschaft, Vaud, Valais, Neuchâtel or Jura, choose the 1983-agreement pack instead.',
    basel_region:
      'The 60-day rule applies across Switzerland. The 5-day minimum is the rule Basel-Stadt applies to its own staff.',
    ticino_region: 'Italy–Switzerland frontier-worker agreement, as amended for telework.',
    ch_fr_1983_region:
      '1983 agreement: Bern, Solothurn, Basel-Stadt, Basel-Landschaft, Vaud, Valais, Neuchâtel and Jura. Geneva and other cantons follow a different regime: choose the other France–Switzerland pack.',
  },
  dayTypes: {
    telework: 'Telework at home',
    onsite: 'On site at workplace',
    third_country: 'Third country / work trip',
    non_working: 'Non-working day',
    teleworkHint: 'Workday performed in your residence country (home or local co-working).',
    onsiteHint: 'Workday at the employer’s premises in the work country.',
    third_countryHint: 'Business trip, training, client visit or temporary mission outside the work country.',
    non_workingHint: 'Leave, public holiday not worked, sickness, or rest day.',
    teleworkHint_ticino:
      'Workday at your home in Italy. The protocol says “at your domicile”: whether a co-working day counts is not confirmed, so check with your authority.',
    third_countryHint_basel_de:
      'Work outside Germany and Switzerland: always a non-return day, even if you return that evening. Do not use it for a same-day trip inside Germany or Switzerland.',
    logHint_luxembourg_fr:
      'Any part of a workday outside Luxembourg counts as a whole day: log the whole day as telework or trip.',
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
      'Convention regime: telework from France up to 40% of annual working time stays taxable in Switzerland. Up to 10 mission days a year count as telework, only as far as they fit under 40% after ordinary telework. Extra mission days are taxed differently. Above 40%, telework is taxable in France from the first day. On-call time counts only if you actually intervened. Sources: ESTV agreement of 29 Apr 2026; ge.ch.',
    ch_fr_missions_note:
      'Temporary missions in France or a third country: up to 10 days a year count inside the 40%, only as far as they fit after ordinary telework. Part-time or part-year: the 10 days are reduced in proportion and rounded up. Days outside those limits are taxable in France, subject to any treaty with the third state. Sources: ESTV agreement of 29 Apr 2026; impots.gouv.fr fact sheet.',
    lu_tax_tolerance_34: 'Days outside Luxembourg (up to 34 days, full-year full-time)',
    lu_tax_tolerance_pending: 'Days outside Luxembourg (tax tolerance)',
    lu_fr_tax_note:
      'Residents of France employed in Luxembourg: up to 34 days per taxable period physically present in France and/or a third state for work, without losing Luxembourg taxation for the period. Part-time or part-year: the 34 is reduced in proportion and rounded down. Beyond the limit, France may tax the time actually worked in France or a third state, from the first day. Any fraction of a day counts as a whole day, and training counts. Leave, weekly rest, public holidays not worked, sickness and force majeure do not. The limit covers all your contracts in the year, and it is up to you to prove your days: this log alone may not be enough. Source: impots.gouv.fr agreement (the PDF says 29 days, raised to 34 by the avenant of 7 Nov 2022).',
    ss_framework_under_50: 'Cross-border telework (framework agreement: A1 from 25%, under 50%)',
    ss_framework_note:
      'Under the EU/EEA/CH framework agreement: under 25% of working time teleworked in the residence state, no A1 is needed on telework grounds. From 25% to under 50%, the residence state normally becomes competent unless employer and employee request an A1 keeping the employer’s state. The A1 lasts up to 3 years and can reach back at most 3 months, if contributions were already paid there. At 50% or more the framework is not available. It does not cover people who habitually work other than by telework in the residence state, habitually work in another state, are self-employed, or have employers in more than one state. Telework here means work done through an IT link. Sources: Belgian FPS (depositary); CLEISS.',
    ss_framework_lu_note:
      'Luxembourg CCSS: telework only in the residence state. Under 25%: no A1 on telework grounds. From 25% to under 50%, both states signed: the employer may request an A1 so Luxembourg cover continues; without it the residence state normally becomes competent. At 50% or more the framework is not available. Habitual non-telework activity in the residence state or work in another member state can push the case out of the framework. Sources: CCSS; Belgian FPS.',
    ch_it_tax_telework_25: 'Telework at domicile (max 25% of employed activity)',
    ch_it_tax_nonreturn_45: 'Days without returning home for work (max 45/year)',
    ch_it_tax_note:
      'Under the protocol amending the Italy–Switzerland agreement (in force 9 Feb 2026, applying from 1 Jan 2024, including transitional-regime workers): at most 25% of employed activity as telework at your home in the residence state in a calendar year, without changing status or the tax treatment of that telework. The protocol does not state what happens above 25%. Sources: Fedlex RU 2026 104; SIF.',
    ch_it_nonreturn_note:
      'In principle, and unless the authorities decide otherwise, up to 45 days in a calendar year without returning home daily for work. Leave and sickness do not count. BorderDay counts only the days you mark “stayed away overnight for work”; a same-day trip does not count. Source: Fedlex amending protocol.',
    basel_de_employer_commute:
      'Basel-Stadt staff rule: on-site days this month (minimum 5, or 1 a week)',
    basel_de_employer_note:
      'This is the rule the canton of Basel-Stadt applies to its own staff (as of 1 Jan 2026): home office only if the employee commutes to the workplace at least 1 day a week or at least 5 days a month. Other employers may apply different rules, and it is not a general tax limit. Source: Basel-Stadt Finance Department.',
    pending_lu_be_tax:
      'The Luxembourg government announced 34 days from 2022 for residents of Belgium. The Belgian text settling part-time reduction and what counts was not found, so no counter runs. Check with your authority.',
    pending_lu_de_tax:
      'The Luxembourg government states the tolerance rose from 19 to 34 days from 2024 for residents of Germany. The German text on what counts and on part-time could not be confirmed, so no counter runs and the France–Luxembourg reduction is not applied. Check with your authority.',
    usedOf: '{used} of {limit}',
    percentUsed: '{used}% of {limit}%',
    usedOfDays: '{used} of {allowed} days',
    percentOfAnnual: '{pct}% of {annual} days/yr (limit {limit}%)',
    status_ok: 'Within limit',
    status_warn: 'Attention',
    status_critical: 'Near limit',
    status_over: 'Over limit',
    status_disabled: 'No counter yet',
    sourceLink: 'Official sources',
    checkedOn: 'Checked {date}',
    employer_practice: 'Employer practice',
    ch_fr_over_40:
      'Above 40%: telework days are taxable in France from the first day, not only the overshoot, and mission days no longer count as telework. Check with your tax authority.',
    ch_fr_mission_excess:
      'Of your mission days, {counted} count inside the 40% and {excess} do not: those are taxable in France, subject to any treaty with a third state.',
    ch_fr_1983_label: 'France–Switzerland tax (1983 agreement): regime under review',
    ch_fr_1983_value: 'Regime under review: check with your authority',
    ch_fr_1983_note:
      'These cantons do not follow the Geneva rule. Under the 1983 agreement, residents of France are generally taxed in France, and France pays 4.5% of gross salary to Switzerland. Published conditions include telework up to 40% of working time, up to 10 mission days within that 40%, and no more than 45 nights a year in Switzerland or a third state. A single mission day in France beyond those limits ends the regime. BorderDay cannot yet separate missions in France from missions elsewhere, so it shows no tax counter here rather than a false green light. Swiss nationals in the public sector and weekly residents are treated differently. Check with your cantonal tax authority.',
    lu_over_34:
      'Limit exceeded: France may tax the time actually worked in France or a third state, from the first day. Check with your tax authority.',
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
    lu_announced_value: '34 days announced: no counter yet',
    pending_be_fr_tax:
      'No day tolerance found. Days worked from France are generally taxed in France, in proportion, from the first day (French minister’s answer of 28 May 2024). People who became frontier workers before 1 Jan 2012 keep a separate regime until 2033, with a 30-day limit outside the Belgian border zone. A convention signed in 2021 was still awaiting ratification at that date. No counter runs here: check with your authority.',
    pending_be_nl_tax:
      'No home-working tolerance was found on the Dutch tax authority’s treaty page, which does not address home-working days, and no Belgian primary text was found. No counter runs here: check with an adviser or your authority.',
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
    pickBorder: 'Your border',
    pickBorderHint: 'Residence → workplace',
    today: 'Today',
    logDay: 'Log this day',
    changeDay: 'Change',
    calendar: 'Calendar',
    counters: 'Your counters',
    noBorder: 'Choose a border pack to see counters.',
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
    a1Hint:
      'Recorded by you or your employer. BorderDay does not check the certificate. In a company account, HR sees it.',
  },
  pricing: {
    title: 'Pricing',
    subtitle: 'Company plan first. Subscriptions via Stripe Managed Payments (sold through Link).',
    individual: 'Individual (employee)',
    company: 'Company / HR',
    monthly: '€4.99 / month',
    yearly: '€49 / year',
    yearlyNote: 'About two months free vs monthly.',
    companyPrice: '€5 / active employee / month',
    companyMin: 'Minimum €39 / month (covers up to 7 active employees)',
    companyYearly: 'Yearly billing: 2 months free (€390 / year minimum)',
    activeEmployeeDef:
      'Active employee: a company member with an accepted invite who has not been deactivated. Billing uses the current active headcount each period (minimum €39 / month).',
    companyTax: 'excl. VAT',
    individualTax: 'incl. VAT',
    includes: 'Includes',
    include1: 'All border packs available in your plan',
    include2:
      'Tax counters where available, social-security counters on every corridor',
    include3: 'Warnings as limits approach',
    include4: 'Export and delete your data anytime',
    include5: 'English, French, German, Italian',
    include6: 'Installable PWA',
    companyInclude1: 'HR dashboard with per-employee counters and filters',
    companyInclude2: 'Email invites, roles (owner / HR viewer), CSV audit export',
    companyInclude3: 'Employees see the same counters HR sees',
    companyInclude4: 'Data protection by design (day types only — no location)',
    comingSoon: 'Live checkout',
    subscribeMonthly: 'Start monthly',
    subscribeYearly: 'Start yearly',
    trialNote: '7-day free trial — card required at signup.',
    checkoutSuccess: 'Payment set up — your trial is active. Open your account to continue.',
    checkoutCancel: 'Checkout canceled — no charge. You can try again anytime.',
    goToAccount: 'Go to account',
    needCompany: 'Create or open a company account first, then subscribe.',
    waitlistCta: 'Start free account',
    compareNote: 'Prices aligned with comparable tools checked on 31 Oct 2026 (Europe/Zurich). Not tax advice.',
    recommended: 'Recommended for employers',
  },
  faq: {
    title: 'FAQ',
    q1: 'Is BorderDay tax or legal advice?',
    a1: 'No. It is a personal record-keeping and reminder tool. Thresholds are taken from public official sources and may change. Always verify with your employer, a qualified adviser, or the competent authority.',
    q2: 'Where is my day log stored?',
    a2: 'Without a plan, only on your device (IndexedDB in the browser). With an active plan or a company account, in your BorderDay account. Either way you can export JSON or CSV, or delete everything.',
    q3: 'Why are some counters disabled?',
    a3:
      'We only show a number when we have confirmed how to count it on an official source. Otherwise the card says why no counter runs and points you to your authority. It never invents a figure.',
    q4: 'Do you track my location?',
    a4: 'No. Version 1 has no GPS and no background location. You log days yourself.',
    q5: 'Which borders do you cover?',
    a5:
      'Nine corridors in five regions. Social-security counters on all nine. Tax counters on four: Geneva and other non-1983 cantons←France, Germany→Switzerland, France→Luxembourg and Italy→Switzerland. No tax counter yet: the 1983-agreement cantons←France (Basel and others), Belgium→Luxembourg, Germany→Luxembourg, France→Belgium and Netherlands→Belgium.',
    q6: 'What about the App Store?',
    a6: 'Version 1 is an installable progressive web app (home screen). A native iOS app may come later.',
    q7: 'How do payments work?',
    a7: 'Checkout uses Stripe Managed Payments: Link is the merchant of record and handles VAT/GST in Checkout. Company and individual plans include a 7-day free trial; a card is required at signup. Promo codes are supported at checkout. See Terms for cancellation and the EU 14-day withdrawal right for consumers.',
    q8: 'What does BorderDay not cover?',
    a8:
      'The self-employed, public-sector special rules, people with employers in several states, and non-IT work under the telework framework. Corridors not listed, such as France→Germany or Netherlands→Germany. Counters only see days logged here, so other jobs in the year are not included. Tax counters do not run on every corridor. The CSV export is a working record, not an official filing such as the annual telework-rate report some cantons require. When in doubt, check with your authority.',
  },
  privacy: {
    title: 'Privacy',
    updated: 'Last updated: 31 Oct 2026 (Europe/Zurich)',
    controllerTitle: 'Data controller',
    controllerBody:
      'The data controller (GDPR) and the controller under the Swiss Federal Act on Data Protection (FADP / nLPD) for BorderDay company accounts and related processing is PrimeLogic Advisory Sàrl, Cours des Bastions 13, 1205 Genève, Switzerland (IDE/UID CHE-312.418.158). Contact: hello@borderday.com · Privacy: privacy@borderday.com.',
    s1Title: 'What we collect',
    s1Body:
      'Individual logger (device): border pack, each day’s type (telework, on site, third country, non-working), whether you marked a night away for work, optional notes, contractual working days per year, employment percentage and A1 record if you enter them. Company accounts (when used): company name, member emails/names, roles, border pack, day types and dates, night-away marks, employment percentage and A1 record if entered, consent records. Designed for GDPR and the Swiss Federal Act on Data Protection (FADP / nLPD).',
    s2Title: 'What we do not collect',
    s2Body:
      'No GPS, no continuous location, no IP geolocation stored as a work location. HR sees day types, night-away marks, employment percentage and A1 records if entered, and counts — the same counters the employee sees. No advertising trackers. No sale of personal data.',
    s3Title: 'Account email',
    s3Body:
      'Account emails (sign-up, magic link, invites) are used for authentication and company invites only. You can request erasure via privacy@borderday.com.',
    s4Title: 'Your rights (employees and HR)',
    s4Body:
      'Employees can export and delete their day log. Employees see exactly what HR sees for their counters. You may withdraw consent for company processing where applicable and request erasure via privacy@borderday.com.',
    s5Title: 'Processors and residency',
    s5Body:
      'Production uses Supabase (EU, eu-central-1). Processors: Resend (transactional email, including invites and auth mail), Stripe / Link (payments under Managed Payments). Auth: email and Google.',
    s6Title: 'Data retention',
    s6Body:
      'Default retention for company day logs is 24 months unless your company sets a different window (1–120 months) or applicable law requires longer. After retention, day logs are deleted or anonymised. Demo data is labeled DEMO and may be reset anytime.',
    s7Title: 'Transparency between employee and HR',
    s7Body:
      'There is no hidden HR-only score. Counter math (used days, allowed days, status) is identical for the employee view and the HR dashboard.',
    contact: 'Privacy contact: privacy@borderday.com · hello@borderday.com',
  },

  individuals: {
    title: 'BorderDay for individuals',
    heroTitle: 'Log your own border days on your device',
    heroBody:
      'Employees and self-trackers can log telework, on-site, trip and non-working days: social-security counters on every corridor, tax counters where the rule can be counted today. If your employer uses BorderDay, join via their invite link to share the same counters with HR.',
    ctaApp: 'Open employee app',
    ctaPricing: 'Individual pricing',
    ctaCompanies: 'My employer needs the company plan',
    point1: 'Local-first logger with export and delete',
    point2: 'Same border packs and careful, sourced counters',
    point3: 'Optional company join — you see what HR sees',
  },
  company: {
    signupTitle: 'Create a company account',
    signupSubtitle: 'Sign in with email or Google, then create your company. Subscribe on the Pricing page when ready.',
    companyName: 'Company name',
    yourName: 'Your name',
    workEmail: 'Work email',
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
      'Tax and social-security counters per employee. Day types, night-away marks and counts — never location.',
    filterBorder: 'Filter by border',
    filterStatus: 'Filter by status',
    filterAll: 'All',
    exportCsv: 'Export CSV (audit)',
    employees: 'Employees',
    noEmployees: 'No employees yet. Create an invite link.',
    viewHistory: 'Day history',
    historyTitle: 'Employee day history',
    historySubtitle: 'Day type, date and night-away mark only. No location data is stored.',
    backDashboard: 'Back to dashboard',
    joinTitle: 'Join your company',
    joinSubtitle: 'Accept the invite, consent to company visibility, and pick your border pack.',
    joinButton: 'Join company',
    joinSuccess: 'You joined the company. Open the employee app to log days.',
    pickBorder: 'Your border pack',
    consentTitle: 'Consent — what HR can see',
    consentBody:
      'By joining, you agree that your employer’s owner and HR viewers can see: your name, email, chosen border pack, contractual working days, employment percentage and A1 record if entered, each logged day’s type and date, whether you marked it as a night away for work, and the same tax/social-security counters you see. They can also record your employment percentage and A1. They cannot see GPS or any location trail — BorderDay does not collect location. You can export or delete your day log. Retention defaults to 24 months (company setting). This is a tracking tool, not tax or legal advice.',
    consentAccept: 'I have read and accept this notice',
    consentRequired: 'Accept the consent notice to continue.',
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
    emptyCounters: 'Employee has not chosen a border pack yet.',
    profileTitle: 'Employment percentage and A1',
    saveProfile: 'Save',
    profileSaved: 'Saved.',
  },

  terms: {
    title: 'Terms of service',
    updated: 'Last updated: 31 Oct 2026 (Europe/Zurich)',
    providerTitle: 'Provider and contracting party',
    providerBody:
      'The BorderDay service is provided by PrimeLogic Advisory Sàrl, Cours des Bastions 13, 1205 Genève, Switzerland (IDE/UID CHE-312.418.158), which is the contracting party for the service. Contact: hello@borderday.com. Checkout uses Stripe Managed Payments: purchases appear as sold through Link, and Link is the merchant of record (seller of record) for payment, tax collection and Order-level refunds where Managed Payments applies.',
    s1Title: 'Service',
    s1Body:
      'BorderDay is a day-classification tracking and reminder tool for employers and employees on selected cross-border corridors. It is not tax advice, legal advice, or a substitute for your employer, a qualified adviser, or a competent authority. See the Disclaimer.',
    s2Title: 'Accounts and company use',
    s2Body:
      'You must provide accurate account details. Company owners invite employees; employees choose a border pack and log day types only (no location). HR sees the same counters the employee sees. You are responsible for the accuracy of days you log and for lawful use of employee data under GDPR and, where applicable, Swiss FADP.',
    s3Title: 'Subscriptions, trial and cancellation',
    s3Body:
      'Paid plans are subscriptions. Company and individual plans include a 7-day free trial; a payment card is required at signup. If no valid payment method is on file when the trial ends, the subscription cancels. You can cancel via the Link order tools or the Stripe customer portal linked from your account. Cancellation stops future renewals; charges already collected for a started billing period are not pro-rated unless required by law or by Link’s refund policy.',
    s4Title: 'Prices, VAT and merchant of record',
    s4Body:
      'Company: €5 per active employee per month, minimum €39 per month (or yearly equivalent with 2 months free), excluding VAT. Individual: €4.99 per month or €49 per year, including VAT. Checkout uses Stripe Managed Payments: purchases appear as sold through Link, and Link is the merchant of record for tax collection and filing where Managed Payments applies. Displayed prices may be converted to local currency at checkout.',
    s5Title: 'EU consumer right of withdrawal (14 days)',
    s5Body:
      'If you buy an individual plan as a consumer in the EU/EEA, Directive 2011/83/EU gives you a 14-day right of withdrawal from the day the contract is concluded, without giving a reason. To exercise it, contact Link support for the Order (sold through Link) and/or privacy@borderday.com with your account email and order reference. For digital services, starting the service during the withdrawal period after you gave prior express consent and acknowledged that you lose the right once performance has begun may limit or end that right under Article 16 of the Directive — checkout and Link’s Sold through Link terms describe how this is handled for your Order. Business (company) purchases are not consumer distance contracts.',
    s6Title: 'Refunds and payment support',
    s6Body:
      'Payment, receipt, tax invoice and Order-level refund requests for Managed Payments are handled by Link under Stripe’s Sold through Link / Purchase terms. Product questions (how BorderDay works, account access, data export) go to hello@borderday.com or privacy@borderday.com.',
    s7Title: 'Changes',
    s7Body:
      'We may update these Terms. The “Last updated” date above changes when we do. Continued use after an update means you accept the revised Terms, except where mandatory consumer law requires a different process.',
    contact: 'Contact: hello@borderday.com · Privacy: privacy@borderday.com',
  },
  disclaimer: {
    title: 'Disclaimer',
    body:
      'BorderDay is a personal record-keeping and reminder tool. It is not tax advice, legal advice, or a substitute for your employer, a qualified tax adviser, or the competent social-security institution. Thresholds shown are taken from public official sources and may change; always verify with the authority that applies to you. You are responsible for the accuracy of the days you log.',
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
    notConfigured: 'Auth backend is not configured in this build.',
    completing: 'Completing sign-in…',
    callbackFailed: 'Could not complete sign-in. Try again.',
    paymentsUnavailable: 'Could not start checkout — try again or contact support.',
    signOut: 'Sign out',
  },
  waitlist: {
    thanks: 'Account created — continue to company sign-up.',
    invalid: 'Please enter a valid email.',
    localOnly:
      'Use Sign up / Sign in for a real account. Checkout is live on the Pricing page.',
  },
};

type DeepString<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepString<T[K]>;
};

export type Dict = DeepString<typeof en>;
export default en;

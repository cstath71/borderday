# BorderDay legal / translation review — 31 Oct 2026 (Europe/Zurich)

Reviewer: Grok Bot (executor). Scope: FR / DE / IT disclaimer, privacy, HR/join consent, pricing legal lines, counter help notes, plus new Terms (all 4 languages). Official sources checked; clear wording errors fixed and deployed. Judgment calls and lawyer items listed, not shipped as settled law.

**Not legal advice.** This is a terminology and completeness pass for Gus. A lawyer / DPO / sworn translator should still sign off before heavy promotion.

---

## Word counts (string values only)

| Corpus | EN | FR | DE | IT | FR+DE+IT |
| --- | ---: | ---: | ---: | ---: | ---: |
| Disclaimer + privacy + terms + consent | ~895 | ~922 | ~741 | ~835 | **~2,498** |
| + counter help notes + pricing legal lines | ~1,767 | ~1,896 | ~1,526 | ~1,803 | **~5,225** |

Swiss agency “standard lines” (≈55 characters incl. spaces) for disclaimer+privacy+terms+consent only: FR ~110, DE ~104, IT ~104 (**~318 lines** across the three languages).

---

## Sources used

| Topic | Source | URL |
| --- | --- | --- |
| GDPR (FR) | Regulation (EU) 2016/679 | https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32016R0679 |
| GDPR (DE) | Regulation (EU) 2016/679 | https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016R0679 |
| GDPR (IT) | Regulation (EU) 2016/679 | https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX:32016R0679 |
| GDPR Art. 25 (by design) | same | FR “protection des données dès la conception”; DE “Datenschutz durch Technikgestaltung”; IT “protezione dei dati fin dalla progettazione” |
| Swiss FADP / LPD / DSG | Fedlex | https://www.fedlex.admin.ch/eli/cc/2022/491/fr · /de · /it |
| IT–CH frontalieri protocol | Fedlex RU 2026 104 | https://www.fedlex.admin.ch/eli/oc/2026/104/it |
| Telework framework + A1 | CLEISS | https://www.cleiss.fr/docs/dossiers/teletravail-transfrontalier.html |
| Portable document A1 | Reg. 883/2004 / 987/2009 (via CLEISS) | same CLEISS dossier |
| Consumer withdrawal 14 days | Directive 2011/83/EU Arts. 9 & 16 | https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32011L0083 |
| Stripe Managed Payments | Stripe docs | https://docs.stripe.com/payments/managed-payments |
| Link MoR / Sold through Link | link.com | https://link.com/terms (Sold Through Link / Purchase terms) |
| Prior open items | TRANSLATION_REVIEW.md | repo file |

---

## Consumer-law note (EU individual plans)

- **14-day withdrawal** for distance contracts with consumers (CRD Art. 9) applies to individual plans sold to EU/EEA consumers. Digital-content / digital-service exception (Art. 16) can end the right after performance begins **only** with prior express consent + acknowledgment — that UX is owned by Stripe Checkout / Link under Managed Payments; BorderDay Terms now disclose the right and point to Link + `privacy@borderday.com`.
- **Link as merchant of record** handles Order-level payment, tax, receipts and refunds under Sold through Link terms. That **does not** replace BorderDay’s own product Terms / Privacy / Disclaimer (Stripe docs explicitly allow linking custom ToS/privacy in Checkout).
- **Gap found and closed:** site previously linked only `/privacy` and `/disclaimer` — **no Terms page**. Added `/[lang]/terms` in EN/FR/DE/IT with trial, cancellation, VAT/MoR, and EU withdrawal notice.

Company purchases are framed as B2B (not consumer distance contracts) in Terms §5.

---

## Changes made (before → after)

### All languages

| Item | Before | After | Why / source |
| --- | --- | --- | --- |
| `pricing.subtitle` | “checkout not yet available / pas encore disponible / noch nicht verfügbar / non ancora disponibile” | Stripe Managed Payments (sold through Link) | Payments are live |
| `company.signupSubtitle` / `inviteSubtitle` | Stripe/Resend gated copy | Subscribe on Pricing; email when possible + shareable link | Resend live |
| `privacy.s5*` | “planned / prévu / geplant / previsti” processors | Live processors: Supabase, Resend, Stripe/Link | Accuracy |
| FAQ `a7` | Weak “vendeur / Verkäufer / venditore” | Link = merchant of record; points to Terms for cancel + 14-day withdrawal | Stripe Managed Payments docs; CRD |
| `pricing.activeEmployeeDef` (new) | — | Definition of active employee / collaborateur actif / aktive Mitarbeitende / collaboratore attivo + min €39 | Pricing clarity |
| `pricing.companyMin` / `companyYearly` | Bare minimum | “up to 7 active…”, yearly min €390 | Match billing math |
| New `terms.*` + page `/terms` | Missing | 7 sections: service, accounts, trial/cancel, prices/VAT/MoR, EU 14-day withdrawal, refunds, changes | CRD + Link MoR |
| Footer / sitemap / `llms.txt` | No terms | Terms linked; checkout described as live Managed Payments | Completeness |

### French

| Key | Before | After | Source |
| --- | --- | --- | --- |
| `home.feature3Title` / `companyInclude4` | “Confidentialité by design” (franglais) | “Protection des données dès la conception” | GDPR FR Art. 25 |
| `privacy.s1Body` | “nLPD suisse” only | “Loi fédérale suisse sur la protection des données (LPD / nLPD)” | Fedlex LPD |
| `privacy.s5Body` | “Processeurs prévus” | “Sous-traitants : Resend… Stripe / Link…” | GDPR FR “sous-traitant” |
| `ss_framework_note` | “conserver la sécurité sociale” | “maintien à la législation de sécurité sociale de l’État de l’employeur” | CLEISS / FPS framework |
| `ss_framework_lu_note` | “peut sortir du cadre” | “faire sortir la situation du champ d’application de l’accord-cadre” | CCSS / framework scope |

### German

| Key | Before | After | Source |
| --- | --- | --- | --- |
| `home.feature3Title` / `companyInclude4` | “Privacy by Design” (EN loan) | “Datenschutz durch Technikgestaltung” | GDPR DE Art. 25 |
| `privacy.s1Body` | “Schweizer nDSG” | “Bundesgesetz über den Datenschutz (DSG / nDSG)” | Fedlex DSG |
| `privacy.s5*` | “Geplante Prozessoren” | “Auftragsverarbeiter: Resend… Stripe / Link…” | GDPR DE “Auftragsverarbeiter” |
| `ss_framework_note` | “Sozialversicherung … belassen” | “sozialversicherungsrechtliche Zuständigkeit des Arbeitgeberstaats beibehalten” + “portables Dokument A1” | TRANSLATION_REVIEW #5; CLEISS |
| `ss_framework_lu_note` | “kann aus dem Rahmen fallen” | “kann die Anwendung der Rahmenvereinbarung entfallen lassen” | Parallel to IT fix |

### Italian

| Key | Before | After | Source |
| --- | --- | --- | --- |
| `home.feature3Title` / `companyInclude4` | “Privacy by design” | “Protezione dei dati fin dalla progettazione” | GDPR IT Art. 25 |
| `privacy.s1Body` | “nLPD svizzera” | “Legge federale svizzera sulla protezione dei dati (LPD / nLPD)” | Fedlex LPD IT |
| `privacy.s5*` | “Processori previsti” | “Responsabili del trattamento: Resend… Stripe / Link…” | GDPR IT terminology |
| `ss_framework_note` | “può mantenere la sicurezza sociale” | “mantenimento della legislazione di sicurezza sociale dello Stato del datore di lavoro” | CLEISS sense |
| `ss_framework_lu_note` | “può uscire dal quadro” | “far decadere l’applicazione dell’accordo quadro” | TRANSLATION_REVIEW #10 |
| `ch_it_tax_note` | “attività dipendente in modalità di telelavoro al domicilio” | “attività di lavoro dipendente presso il proprio domicilio” | Fedlex RU 2026 104 |
| `ch_it_nonreturn_note` | “senza rientro giornaliero a casa” | “non rientra quotidianamente al proprio domicilio” + RU 2026 104 cite | Fedlex RU 2026 104 |

### English (aligned)

Same stale-copy / MoR / processors / Terms / active-employee fixes so EN remains the source of truth for `Dict`.

---

## Open items (human / lawyer — do **not** treat as fixed in product)

1. **Governing law & jurisdiction** in Terms — deliberately omitted; needs lawyer (Link MoR + EU consumer mandatory rules + possible Swiss company seat).
2. **GDPR legal basis for employee day logs** — consent is used in `company.consentBody`; employment / legitimate interest may be more appropriate in some Member States. Lawyer / DPO.
3. **Art. 16 waiver UX at Checkout** — confirm Stripe Managed Payments actually collects express consent + acknowledgment for digital services; if not, add BorderDay-side step.
4. **Controller identity** on privacy/terms — public copy must not invent a public “owner” name; when a legal entity is ready for public display, add it (without Swiss/PrimeLogic branding constraints Gus set for marketing).
5. **FR `home.heroTitle` “seuils”** (TRANSLATION_REVIEW #1) — marketing tone; optional “limites / plafonds”.
6. **FR `ch_fr_tax_note` “expression”** (#2) — ESTV calque; native tax reader preference.
7. **DE `home.heroTitle` “Grenztag-Schwellen”** (#4) — coined compound; native prefer longer official phrasing?
8. **DE `lu_fr_tax_note` length** (#7) — native tighten without changing meaning.
9. **IT hero** — “Sai…” already gone in current marketing; keep watching for informal tone.
10. **“Active employee” vs “active seat”** (#11) — product/billing preference for Gus.
11. **nLPD / nDSG colloquial vs official LPD / DSG** — we now pair both; lawyer may prefer one form only.
12. **Sworn vs specialist review** — privacy/ToS for a website usually need specialist legal translation / lawyer review, not sworn/certified translation for authorities.
13. **Checkout custom ToS URL** — ensure Stripe Checkout Session / Managed Payments links to `https://borderday.com/{lang}/terms` and privacy (Stripe docs support custom links).

---

## Remaining risk

- FR/DE/IT legal pages are careful adaptations, **not** sworn translations.
- Consumer withdrawal notice is now present, but **effectiveness** depends on Checkout UX (Link) and on whether individual buyers are correctly classified as consumers.
- Tax/SS counter notes cite public sources and can drift when authorities update thresholds — keep source URLs and re-check on schedule.
- No public legal-entity controller name yet → transparency risk under GDPR Arts. 13–14 until addressed.

---

## Deploy

See git commit on `main` after this file (“legal: …”). Tests: vitest **85 passed**.

---

## Part 2 — professional reviewer options (research only; nobody contacted)

Corpus for a paid review (FR+DE+IT disclaimer+privacy+terms+consent): **~2,500 words / ~318 Swiss standard lines**. Including counter notes + pricing legal: **~5,200 words**.

| # | Option | What they offer | Published price | Turnaround | Link |
| --- | ---: | --- | --- | --- | --- |
| 1 | **Fachübersetzungsdienst (FÜD), Switzerland** | ISO 17100 specialist + legal translation; DE/FR/IT; GDPR-compliant; binding fixed price before order | From **CHF 1.09 / standard line** (guide); orders from **CHF 89**. For ~318 lines ≈ **CHF ~350+** before legal surcharge → **quote needed** for exact | Usual: few working days; 24h express if feasible | https://www.fachuebersetzungsdienst.ch/en/ |
| 2 | **Panorama Languages, Switzerland** | Certified / legal; native speakers; ISO 17100 four-eyes; fixed price in ~120 min | From **CHF 1.15 / standard line** → ~318 lines ≈ **CHF ~365+** → **quote needed** | Often same/next day for short docs; binding date on quote | https://www.panoramalanguages.ch/en/ |
| 3 | **Apostroph Group (CH)** | Legal translations incl. GDPR / GTC / privacy; Swiss-hosted data; ISO 27001 | **Quote needed** (no public per-line rate on legal page). Capacity: ~2,400 words/translator/day | Express available | https://apostrophgroup.ch/en/translations/specialist-translations/legal-translations |
| 4a | **Upwork legal translators** | Per-language native legal review | Specialized/legal **$0.25–$0.50 / word** (Upwork cost guide); ~2,500 words × 3 langs rough **$1,875–$3,750** if billed per word, or hire hourly **$75+/hr** expert — **quote per freelancer** | Negotiated (often 3–7 days) | https://www.upwork.com/hire/legal-translators/ · https://www.upwork.com/hire/translators/cost/ |
| 4b | **LegalCheck.be** (GDPR lawyer screen, one language at a time) | Belgian lawyer screens privacy policy | Basic from **€199 excl. VAT** / doc; Premium **€399**; rebuild **€499**; rush +€149. 48–72h | https://legalcheck.be/privacy-policy-screenen |
| 4c | **GDPRCheck** (DPO product review) | Certified DPO review of site/SaaS (privacy + terms on higher plans) | Website **€99** (2 days); E-commerce **€199** (5 days, includes Terms); **SaaS €399** (10 days) | https://gdprcheck.me/ |

### Recommendation

**Primary:** FÜD or Panorama for a **native FR + DE + IT specialist legal review** of the ~2.5k-word core (disclaimer, privacy, terms, consent) with ISO four-eyes — expect roughly **CHF 350–600** once quoted, possibly more with legal surcharge and three target languages. Ask them to treat EN as source and return tracked changes + glossary confirmation against Fedlex / EUR-Lex terms.

**Add-on (substance, not just language):** one **GDPRCheck SaaS (€399)** or **LegalCheck Premium (€399 excl. VAT)** pass on the EN (or FR) privacy+terms against GDPR — catches controller identity, legal basis, and withdrawal UX gaps that a pure translator will not.

**Avoid as sole path:** cheapest Fiverr “legal translation” gigs (listed from ~$5 / 500 words on marketplace search) — fine for a second proofread, not for MoR/CRD/Swiss LPD wording.

**Do not book or pay** until Gus approves a specific vendor and budget.

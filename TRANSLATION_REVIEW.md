# BorderDay translation review

Checked: 31 Oct 2026 (Europe/Zurich). Process: EN written first; FR/DE/IT drafted with official glossary terms from the plan; independent back-translation spot-check (FR/DE/IT → EN) against EN.

**Please have a fluent speaker review FR, DE and IT marketing + help before launch.** Machine-assisted draft only.

## Official terms used (do not “improve”)

| Concept | FR | DE | IT | Source |
| --- | --- | --- | --- | --- |
| Cross-border telework | télétravail transfrontalier | grenzüberschreitende Telearbeit | telelavoro transfrontaliero | CLEISS; CCSS; Framework Agreement |
| Framework agreement | accord-cadre | Rahmenübereinkommen | accordo quadro sul telelavoro transfrontaliero | Belgian FPS; CLEISS; LGBl 2023/272 |
| A1 certificate | document portable A1 | A1-Bescheinigung | documento portatile A1 | CLEISS; Reg. 987/2009 |
| CH–FR tax share | 40 % du temps de travail / taux de télétravail | 40 % der Arbeitszeit / Telearbeitsquote | 40% del tempo di lavoro annuo | ge.ch; ESTV |
| LU tax tolerance (FR) | seuil de tolérance / 34 jours | Toleranzschwelle: 34 Tage | soglia di tolleranza: 34 giorni | impots.gouv.fr |
| CH–IT telework | — | 25 % der Arbeitszeit | 25 per cento … in modalità di telelavoro | Fedlex RU 2026 104 |

## Branding rule

Avoid **frontalier / Grenzgänger / frontaliere** in slogans and hero copy. Official status terms appear only in help notes that quote authorities (e.g. CH–IT protocol “lavoratore frontaliere”, Basel-Stadt PDF title). Flagged below.

## Phrases to review (unsure / high-stakes)

1. **FR `home.heroTitle`** — “Sachez où vous en êtes par rapport à vos seuils de jours”  
   Back-translation: “Know where you stand relative to your day thresholds.” Natural? Prefer “limites de jours” / “plafonds” ?

2. **FR `counters.ch_fr_tax_note`** — “s’inscrivent dans cette expression” mirrors ESTV “expression” of telework. Confirm French tax readers find “expression” clear, or prefer “pris en compte dans le calcul du taux de télétravail”.

3. **FR `borders.ticino_region`** — “Accord Italie–Suisse relatif aux travailleurs frontaliers” uses the official status term. OK in help; confirm we never surface this in hero/slogan.

4. **DE `home.heroTitle`** — “Wissen, wo Sie bei Ihren Grenztag-Schwellen stehen”  
   “Grenztag-Schwellen” is a coined compound. Alternatives: “Schwellenwerte für grenzüberschreitende Arbeitstage” (longer) or “Tageskontingente”.

5. **DE `counters.ss_framework_note`** — “die Sozialversicherung des Arbeitgeberstaats belassen”  
   Awkward. Prefer “die sozialversicherungsrechtliche Zuständigkeit des Arbeitgeberstaats beibehalten” (closer to CLEISS/FPS wording)?

6. **DE `borders.ticino_region` / help** — “Grenzgängern” appears as official admin term. Confirm placement only in regional note, not marketing.

7. **DE `lu_fr_tax_note`** — long sentence calqued from FR amicable agreement. A native speaker should tighten without changing legal meaning.

8. **IT `home.heroTitle`** — “Sai a che punto sei rispetto alle soglie di giorni”  
   Informal “sai”. Prefer “Scopri a che punto sei…” or “Tieni sotto controllo le soglie di giorni”?

9. **IT `ch_it_tax_note`** — deliberately keeps “lavoratore frontaliere” and “25 per cento … in modalità di telelavoro” close to Fedlex IT. Confirm against Fedlex RU 2026 104 Art. I before launch.

10. **IT `counters.ss_framework_lu_note`** — “può uscire dal quadro” for leaving the framework agreement. Prefer “fa decadere l’applicazione dell’accordo quadro”?

11. **All languages `pricing.companyPrice`** — “active employee / collaborateur actif / aktiver Mitarbeitender / dipendente attivo”  
    Align with competitors’ “active seat” wording Gus prefers?

12. **All languages disclaimer** — EN matched the plan draft. FR/DE/IT are careful adaptations, **not** sworn translations. Fluent legal review required before paywall/PDF.

13. **Calendar weekday headers** — localised (EN Mon–Sun, FR lun–dim, DE Mo–So, IT lun–dom).

14. **FR/DE/IT `waitlist.localOnly`** — explains preview-only localStorage. Reword when real waitlist backend is wired (and email sending approved).

## Back-translation spot checks (sample)

| Key | Target | Back to EN (sense) | Match EN? |
| --- | --- | --- | --- |
| `disclaimer.body` FR | Avertissement long | Personal tracking tool; not tax/legal advice; verify with authority; you own log accuracy | Yes |
| `disclaimer.body` DE | Haftungsausschluss | Same sense | Yes |
| `disclaimer.body` IT | Avvertenza | Same sense | Yes |
| `counters.lu_tax_tolerance_34` FR | 34 jours hors LU | Days outside Luxembourg (tolerance 34) | Yes |
| `counters.ch_it_tax_telework_25` IT | max 25% attività dipendente | Telework at domicile max 25% | Yes |
| `dayTypes.telework` DE | Telearbeit zu Hause | Telework at home | Yes |

## Empty / N/A

- No invented headcounts in any language (INAMI / STATEC figures not used in marketing copy).
- No “official” claim that agents can buy (N/A — not SBI).

## Employer-first batch (31 Oct 2026, Europe/Zurich)

New keys under `nav.*`, `home.*` (HR hero / risk / features), `pricing.company*` / `recommended` / `companyInclude*`, `privacy.s6`–`s7`, `individuals.*`, `company.*` (signup, invite, dashboard, join consent, DEMO labels, retention). Consent copy lives in `company.consentBody` in EN/FR/DE/IT — **legal review recommended** before production.

### Needs Gus / native-speaker review

| Key | Why |
| --- | --- |
| `home.heroTitle` / `home.heroBody` | Marketing tone for Geneva/Basel/Ticino/LU/BE HR |
| `home.risk1Body` / `risk2Body` | Framework-agreement 50% and corridor numbers — keep aligned with official wording |
| `company.consentBody` | GDPR / Swiss nLPD employee consent — lawyer or DPO review |
| `privacy.s1Body`–`s7Body` | Retention (24 months default), transparency, processors |
| `pricing.companyPrice` / `companyMin` / `companyYearly` | Display-only; checkout not live |
| `nav.forCompanies` / `forIndividuals` / `hrDashboard` | Nav labels |
| DE: `grenüberschreitende` / IT: `transfrontalier*` in taglines | Allowed in descriptive footer/tagline; confirm branding rule still OK |
| FR `entreprise` vs `société` in company signup | Preference? |

### Avoided in branding

Hero and product name still avoid “frontalier”. Official status words remain only where quoting authority texts in help/counter notes (unchanged from v1 packs).

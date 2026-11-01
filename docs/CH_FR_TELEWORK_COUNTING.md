# How work-trip days count in the France–Switzerland 40% telework share

Checked 1 Nov 2026 (issue E16). BorderDay is a tracking tool: this note explains the counter, it is not tax advice.

**Conclusion: they count, within limits, so the counter stays as it is.** A "Work trip / third State" day is a
*temporary mission*. Missions in France or a third State count inside the 40%, but only up to 10 days a year and
only as far as they still fit after ordinary telework. Days beyond either limit stay out of the share.

Example: 3 telework days, 1 half telework day and 1 trip day give 4.5 days in the share (3 + 0.5 + 1).

## Sources

- **Amicable agreement CH–FR of 29 Apr 2026, §1 a–d** (ESTV PDF:
  <https://www.estv.admin.ch/dam/fr/sd-web/Bibcb06jL1wG/int-laender-fr-dba-ai-cdi-20260429-fr.pdf>). §1.a includes
  missions "dans son Etat de résidence ou dans un Etat tiers" in the telework activity "à hauteur de la fraction
  respectant, à la fois, la limite annuelle de 10 jours, et celle de 40 %", after the other telework days. §1.c keeps
  the excess out. §1.d reduces the 10 days for part-time or part-year work, rounded up.
- **DGFiP practical sheet**, examples 1–3 on a 240-day base (53, 63 and 96 days in the share):
  <https://www.impots.gouv.fr/sites/default/files/media/1_metier/1_particulier/EV/4_changements_de_situation/480_depart_arrivee_france/fiche-pratique-accords-interpretatifs-10-jours-cdi.pdf>
- **Geneva AFC, "Règles pour les missions temporaires à l'étranger"**: missions are "incluses dans le taux de
  télétravail, dans la limite de 10 jours par an". Its examples are run in `tests/counting.test.ts`:
  <https://www.ge.ch/imposition-du-teletravail-personnes-frontalieres/regles-missions-temporaires-etranger>

The agreement is the rule. The sheet and the Geneva page are the two authorities' worked examples of it.

## What the code does

`chFrMissionSplit` in `src/lib/counting.ts` counts telework first, then missions up to the lower of the 10-day cap
and the room left under 40%. If telework alone is above 40%, no mission is counted. The counter now also says how
many telework and trip days make up the share, as the mix surprised a tester.

## Known limits

- BorderDay does not separate missions in France from missions in a third State. §1.b puts France first, which
  changes where the excess is taxed but not the number in the share.
- Pace (`paceMessage`) is an estimate for planning, from no official source. The count is what matters.

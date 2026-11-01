// Yearly renewal + trial-ending consumer reminders (AR3-09 / A3-06).
// Five locales; yearly mail always carries a visually boxed deadline (L215-1 style).
import { escapeHtml } from "./invite.ts";
import { inviteLang, type InviteLang } from "./inviteEmail.ts";

export type ReminderKind = "yearly_renewal" | "trial_ending";

export type ReminderCopy = {
  subject: string;
  intro: string;
  /** Plain-text boxed deadline block (no HTML). */
  boxPlain: string;
  /** Inner HTML of the boxed deadline (already escaped values). */
  boxHtmlInner: string;
  afterBox: string;
  signoff: string;
};

type ReminderVars = {
  renewOn: string;
  cancelUrl: string;
  priceLine: string;
};

const YEARLY: Record<InviteLang, (v: ReminderVars) => ReminderCopy> = {
  en: (v) => ({
    subject: "BorderDay: your yearly plan renews soon",
    intro:
      `Your BorderDay individual yearly plan (${v.priceLine}) renews on ${v.renewOn} unless you cancel.`,
    boxPlain:
      `┌──────────────────────────────────────────────┐\n` +
      `│  DEADLINE TO REFUSE RENEWAL: ${v.renewOn}\n` +
      `│  Cancel before that date to stop the renewal.\n` +
      `│  Cancel: ${v.cancelUrl}\n` +
      `└──────────────────────────────────────────────┘`,
    boxHtmlInner:
      `<strong>Deadline to refuse renewal: ${escapeHtml(v.renewOn)}</strong><br/>` +
      `Cancel before that date to stop the renewal.<br/>` +
      `<a href="${escapeHtml(v.cancelUrl)}">Cancel subscription</a>`,
    afterBox:
      `You can also cancel in the Link order tools or from your BorderDay account.\n\n` +
      `After the first year you can cancel a renewed plan at any time; unused-period refunds apply where mandatory consumer law requires them.`,
    signoff: "— BorderDay",
  }),
  fr: (v) => ({
    subject: "BorderDay : votre abonnement annuel se renouvelle bientôt",
    intro:
      `Votre abonnement individuel annuel BorderDay (${v.priceLine}) se renouvelle le ${v.renewOn} sauf résiliation.`,
    boxPlain:
      `┌──────────────────────────────────────────────┐\n` +
      `│  DATE LIMITE POUR REFUSER LA RECONDUCTION : ${v.renewOn}\n` +
      `│  (Code de la consommation, art. L215-1)\n` +
      `│  Résiliez avant cette date pour empêcher le renouvellement.\n` +
      `│  Résilier : ${v.cancelUrl}\n` +
      `└──────────────────────────────────────────────┘`,
    boxHtmlInner:
      `<strong>Date limite pour refuser la reconduction : ${escapeHtml(v.renewOn)}</strong><br/>` +
      `(Code de la consommation, art. L215-1)<br/>` +
      `Résiliez avant cette date pour empêcher le renouvellement.<br/>` +
      `<a href="${escapeHtml(v.cancelUrl)}">Résilier l'abonnement</a>`,
    afterBox:
      `Vous pouvez aussi résilier via les outils de commande Link ou depuis votre compte BorderDay.\n\n` +
      `Après la première année, vous pouvez résilier un abonnement reconduit à tout moment ; le remboursement de la période non utilisée s'applique lorsque le droit de la consommation l'impose.`,
    signoff: "— BorderDay",
  }),
  de: (v) => ({
    subject: "BorderDay: Ihr Jahresabo verlängert sich bald",
    intro:
      `Ihr BorderDay Einzel-Jahresabo (${v.priceLine}) verlängert sich am ${v.renewOn}, sofern Sie nicht kündigen.`,
    boxPlain:
      `┌──────────────────────────────────────────────┐\n` +
      `│  FRIST ZUR ABLEHNUNG DER VERLÄNGERUNG: ${v.renewOn}\n` +
      `│  Kündigen Sie vor diesem Datum, um die Verlängerung zu stoppen.\n` +
      `│  Kündigen: ${v.cancelUrl}\n` +
      `└──────────────────────────────────────────────┘`,
    boxHtmlInner:
      `<strong>Frist zur Ablehnung der Verlängerung: ${escapeHtml(v.renewOn)}</strong><br/>` +
      `Kündigen Sie vor diesem Datum, um die Verlängerung zu stoppen.<br/>` +
      `<a href="${escapeHtml(v.cancelUrl)}">Abo kündigen</a>`,
    afterBox:
      `Sie können auch über die Link-Bestelltools oder Ihr BorderDay-Konto kündigen.\n\n` +
      `Nach dem ersten Jahr können Sie ein verlängertes Abo jederzeit beenden; Erstattungen für nicht genutzte Zeiträume gelten, soweit zwingendes Verbraucherrecht dies verlangt.`,
    signoff: "— BorderDay",
  }),
  it: (v) => ({
    subject: "BorderDay: il vostro piano annuale si rinnova a breve",
    intro:
      `Il vostro piano individuale annuale BorderDay (${v.priceLine}) si rinnova il ${v.renewOn} salvo disdetta.`,
    boxPlain:
      `┌──────────────────────────────────────────────┐\n` +
      `│  SCADENZA PER RIFIUTARE IL RINNOVO: ${v.renewOn}\n` +
      `│  Disdite prima di quella data per fermare il rinnovo.\n` +
      `│  Disdici: ${v.cancelUrl}\n` +
      `└──────────────────────────────────────────────┘`,
    boxHtmlInner:
      `<strong>Scadenza per rifiutare il rinnovo: ${escapeHtml(v.renewOn)}</strong><br/>` +
      `Disdite prima di quella data per fermare il rinnovo.<br/>` +
      `<a href="${escapeHtml(v.cancelUrl)}">Disdici l'abbonamento</a>`,
    afterBox:
      `Potete anche disdire tramite gli strumenti ordine Link o dal vostro account BorderDay.\n\n` +
      `Dopo il primo anno potete disdire un piano rinnovato in qualsiasi momento; i rimborsi del periodo non utilizzato si applicano ove il diritto dei consumatori lo imponga.`,
    signoff: "— BorderDay",
  }),
  nl: (v) => ({
    subject: "BorderDay: uw jaarabonnement wordt binnenkort verlengd",
    intro:
      `Uw BorderDay individuele jaarabonnement (${v.priceLine}) wordt verlengd op ${v.renewOn} tenzij u opzegt.`,
    boxPlain:
      `┌──────────────────────────────────────────────┐\n` +
      `│  UITERSTE DATUM OM VERLENGING TE WEIGEREN: ${v.renewOn}\n` +
      `│  Zeg vóór die datum op om de verlenging te stoppen.\n` +
      `│  Opzeggen: ${v.cancelUrl}\n` +
      `└──────────────────────────────────────────────┘`,
    boxHtmlInner:
      `<strong>Uiterste datum om verlenging te weigeren: ${escapeHtml(v.renewOn)}</strong><br/>` +
      `Zeg vóór die datum op om de verlenging te stoppen.<br/>` +
      `<a href="${escapeHtml(v.cancelUrl)}">Abonnement opzeggen</a>`,
    afterBox:
      `U kunt ook opzeggen via de Link-besteltools of vanuit uw BorderDay-account.\n\n` +
      `Na het eerste jaar kunt u een verlengd abonnement op elk moment beëindigen; restitutie van de ongebruikte periode geldt waar dwingend consumentenrecht dat vereist.`,
    signoff: "— BorderDay",
  }),
};

const TRIAL: Record<InviteLang, (v: ReminderVars) => ReminderCopy> = {
  en: (v) => ({
    subject: "BorderDay: your free trial ends soon",
    intro: `Your BorderDay free trial ends on ${v.renewOn}. After that, the plan you chose is charged automatically and renews until you cancel.`,
    boxPlain:
      `┌──────────────────────────────────────────────┐\n` +
      `│  CANCEL BEFORE: ${v.renewOn}\n` +
      `│  Cancel before the trial ends and nothing is charged.\n` +
      `│  Cancel: ${v.cancelUrl}\n` +
      `└──────────────────────────────────────────────┘`,
    boxHtmlInner:
      `<strong>Cancel before: ${escapeHtml(v.renewOn)}</strong><br/>` +
      `Cancel before the trial ends and nothing is charged.<br/>` +
      `<a href="${escapeHtml(v.cancelUrl)}">Cancel subscription</a>`,
    afterBox: "",
    signoff: "— BorderDay",
  }),
  fr: (v) => ({
    subject: "BorderDay : votre essai gratuit se termine bientôt",
    intro:
      `Votre essai gratuit BorderDay se termine le ${v.renewOn}. Ensuite, le plan choisi est facturé automatiquement et se renouvelle jusqu'à résiliation.`,
    boxPlain:
      `┌──────────────────────────────────────────────┐\n` +
      `│  RÉSILIEZ AVANT LE : ${v.renewOn}\n` +
      `│  Résiliez avant la fin de l'essai : aucun montant n'est débité.\n` +
      `│  Résilier : ${v.cancelUrl}\n` +
      `└──────────────────────────────────────────────┘`,
    boxHtmlInner:
      `<strong>Résiliez avant le : ${escapeHtml(v.renewOn)}</strong><br/>` +
      `Résiliez avant la fin de l'essai : aucun montant n'est débité.<br/>` +
      `<a href="${escapeHtml(v.cancelUrl)}">Résilier l'abonnement</a>`,
    afterBox: "",
    signoff: "— BorderDay",
  }),
  de: (v) => ({
    subject: "BorderDay: Ihre kostenlose Testphase endet bald",
    intro:
      `Ihre kostenlose BorderDay-Testphase endet am ${v.renewOn}. Danach wird der gewählte Plan automatisch berechnet und verlängert sich, bis Sie kündigen.`,
    boxPlain:
      `┌──────────────────────────────────────────────┐\n` +
      `│  KÜNDIGEN SIE VOR DEM: ${v.renewOn}\n` +
      `│  Kündigen Sie vor Testende — es wird nichts berechnet.\n` +
      `│  Kündigen: ${v.cancelUrl}\n` +
      `└──────────────────────────────────────────────┘`,
    boxHtmlInner:
      `<strong>Kündigen Sie vor dem: ${escapeHtml(v.renewOn)}</strong><br/>` +
      `Kündigen Sie vor Testende — es wird nichts berechnet.<br/>` +
      `<a href="${escapeHtml(v.cancelUrl)}">Abo kündigen</a>`,
    afterBox: "",
    signoff: "— BorderDay",
  }),
  it: (v) => ({
    subject: "BorderDay: la prova gratuita termina a breve",
    intro:
      `La vostra prova gratuita BorderDay termina il ${v.renewOn}. Dopo, il piano scelto viene addebitato automaticamente e si rinnova fino a disdetta.`,
    boxPlain:
      `┌──────────────────────────────────────────────┐\n` +
      `│  DISDETE PRIMA DEL: ${v.renewOn}\n` +
      `│  Disdite prima della fine della prova e non viene addebitato nulla.\n` +
      `│  Disdici: ${v.cancelUrl}\n` +
      `└──────────────────────────────────────────────┘`,
    boxHtmlInner:
      `<strong>Disdete prima del: ${escapeHtml(v.renewOn)}</strong><br/>` +
      `Disdite prima della fine della prova e non viene addebitato nulla.<br/>` +
      `<a href="${escapeHtml(v.cancelUrl)}">Disdici l'abbonamento</a>`,
    afterBox: "",
    signoff: "— BorderDay",
  }),
  nl: (v) => ({
    subject: "BorderDay: uw gratis proefperiode eindigt binnenkort",
    intro:
      `Uw gratis BorderDay-proefperiode eindigt op ${v.renewOn}. Daarna wordt het gekozen abonnement automatisch in rekening gebracht en verlengd tot u opzegt.`,
    boxPlain:
      `┌──────────────────────────────────────────────┐\n` +
      `│  ZEG OP VÓÓR: ${v.renewOn}\n` +
      `│  Zeg vóór het einde van de proefperiode op — er wordt niets in rekening gebracht.\n` +
      `│  Opzeggen: ${v.cancelUrl}\n` +
      `└──────────────────────────────────────────────┘`,
    boxHtmlInner:
      `<strong>Zeg op vóór: ${escapeHtml(v.renewOn)}</strong><br/>` +
      `Zeg vóór het einde van de proefperiode op — er wordt niets in rekening gebracht.<br/>` +
      `<a href="${escapeHtml(v.cancelUrl)}">Abonnement opzeggen</a>`,
    afterBox: "",
    signoff: "— BorderDay",
  }),
};

const DATE_LOCALES: Record<InviteLang, string> = {
  en: "en-GB",
  fr: "fr-CH",
  de: "de-CH",
  it: "it-CH",
  nl: "nl-BE",
};

/** Format a renewal / trial-end instant for the reminder in Europe/Zurich. */
export function formatReminderDate(iso: string | null, lang: InviteLang): string {
  if (!iso) {
    return {
      en: "the renewal date",
      fr: "la date de renouvellement",
      de: "dem Verlängerungsdatum",
      it: "la data di rinnovo",
      nl: "de vernieuwingsdatum",
    }[lang];
  }
  return new Intl.DateTimeFormat(DATE_LOCALES[lang], {
    timeZone: "Europe/Zurich",
    dateStyle: "long",
  }).format(new Date(iso));
}

export function buildConsumerReminder(opts: {
  kind: ReminderKind;
  lang: unknown;
  renewOnIso: string | null;
  cancelUrl: string;
  /** Shown only on yearly renewal; default matches current public price. */
  priceLine?: string;
}): { lang: InviteLang; subject: string; text: string; html: string } {
  const lang = inviteLang(opts.lang);
  const renewOn = formatReminderDate(opts.renewOnIso, lang);
  const priceLine = opts.priceLine ?? "€49 incl. VAT";
  const vars: ReminderVars = { renewOn, cancelUrl: opts.cancelUrl, priceLine };
  const copy = (opts.kind === "yearly_renewal" ? YEARLY : TRIAL)[lang](vars);
  const textParts = [copy.intro, "", copy.boxPlain];
  if (copy.afterBox) textParts.push("", copy.afterBox);
  textParts.push("", copy.signoff);
  const text = textParts.join("\n");
  const html =
    `<div style="font-family:system-ui,sans-serif;line-height:1.5;color:#111">` +
    `<p>${escapeHtml(copy.intro)}</p>` +
    `<div style="border:2px solid #111;padding:12px 16px;margin:16px 0;background:#f8f8f8">` +
    copy.boxHtmlInner +
    `</div>` +
    (copy.afterBox
      ? `<p>${escapeHtml(copy.afterBox).replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br/>")}</p>`
      : "") +
    `<p>${escapeHtml(copy.signoff)}</p>` +
    `</div>`;
  return { lang, subject: copy.subject, text, html };
}

/** Thrown when Resend rejects the send so the webhook returns 500 and Stripe retries (AR3-09). */
export class ReminderSendError extends Error {
  constructor(readonly status: number) {
    super(`reminder send failed: ${status}`);
  }
}

// Withdrawal and cancellation requests (A3-08): validation, limits, receipt text and the flow itself.
// The flow takes its side effects as arguments, so tests run it with no database and no email.
import { isSendableInviteAddress } from "./invite.ts";
import { inviteLang, type InviteLang } from "./inviteEmail.ts";

export type ContractRequestKind = "withdrawal" | "cancellation";

export interface ContractRequestFields {
  kind: ContractRequestKind;
  name: string;
  email: string;
  orderReference: string | null;
  orderDate: string | null;
  lang: InviteLang;
}

export const NAME_MAX_LENGTH = 200;
export const REFERENCE_MAX_LENGTH = 200;
export const EMAIL_MAX_LENGTH = 254;

/** Requests accepted per hour. Above these the form falls back to the prepared email, so nobody is shut out. */
export const MAX_REQUESTS_PER_ADDRESS_PER_HOUR = 5;
export const MAX_REQUESTS_PER_HOUR = 60;
/** The form is public and the receipt goes to an address nobody has verified: keep it useless as a mailer. */
export const MAX_RECEIPTS_PER_ADDRESS_PER_HOUR = 3;
export const MAX_RECEIPTS_PER_HOUR = 30;

const ONE_HOUR_MS = 60 * 60 * 1000;
const STAFF_MAILBOX: Record<ContractRequestKind, string> = {
  withdrawal: "privacy@borderday.com",
  cancellation: "hello@borderday.com",
};

function cleanLine(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  // deno-lint-ignore no-control-regex
  return value.replace(/[\u0000-\u001f\u007f]+/g, " ").trim().slice(0, max);
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

/** Null means the request cannot be stored as it stands. */
export function parseContractRequest(body: unknown): ContractRequestFields | null {
  if (body === null || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (b.kind !== "withdrawal" && b.kind !== "cancellation") return null;
  const name = cleanLine(b.name, NAME_MAX_LENGTH);
  const email = cleanLine(b.email, EMAIL_MAX_LENGTH + 1).toLowerCase();
  if (!name || email.length > EMAIL_MAX_LENGTH || !isSendableInviteAddress(email)) return null;
  const date = cleanLine(b.orderDate, 10);
  if (date && !validDate(date)) return null;
  return {
    kind: b.kind,
    name,
    email,
    orderReference: cleanLine(b.orderReference, REFERENCE_MAX_LENGTH) || null,
    orderDate: date || null,
    lang: inviteLang(b.lang),
  };
}

/** The stored request keeps what the person typed; only the mail to their address drops anything link-like. */
export function withoutLinks(value: string): string {
  return value
    .replace(/\b[a-z][a-z0-9+.-]*:\/\/\S*/gi, "[link removed]")
    .replace(/\bwww\.\S*/gi, "[link removed]")
    .replace(/\b[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}(\/\S*)?/gi, "[link removed]");
}

/** Date and time of receipt on the site's reference clock. */
export function receiptStamp(iso: string, lang: InviteLang): { date: string; time: string } {
  const locale = { en: "en-GB", fr: "fr-CH", de: "de-CH", it: "it-CH", nl: "nl-BE" }[lang];
  const at = new Date(iso);
  return {
    date: new Intl.DateTimeFormat(locale, { timeZone: "Europe/Zurich", dateStyle: "long" }).format(at),
    time: new Intl.DateTimeFormat(locale, { timeZone: "Europe/Zurich", timeStyle: "medium" }).format(at),
  };
}

const RECEIPT = {
  en: {
    subject: { withdrawal: "BorderDay: withdrawal received", cancellation: "BorderDay: cancellation request received" },
    intro: { withdrawal: "We have received your withdrawal from your BorderDay contract.", cancellation: "We have received your request to cancel your BorderDay subscription." },
    next: { withdrawal: "Link handles the refund for your Order.", cancellation: "We confirm the cancellation by email." },
    received: "Received on {date} at {time} (Europe/Zurich).",
    labels: { reference: "Reference", name: "Name", email: "Account email", order: "Order reference", date: "Order or access date" },
  },
  fr: {
    subject: { withdrawal: "BorderDay : rétractation reçue", cancellation: "BorderDay : demande de résiliation reçue" },
    intro: { withdrawal: "Nous avons bien reçu votre rétractation de votre contrat BorderDay.", cancellation: "Nous avons bien reçu votre demande de résiliation de votre abonnement BorderDay." },
    next: { withdrawal: "Link gère le remboursement de votre commande.", cancellation: "Nous confirmons la résiliation par e-mail." },
    received: "Reçu le {date} à {time} (Europe/Zurich).",
    labels: { reference: "Référence", name: "Nom", email: "E-mail du compte", order: "Référence de commande", date: "Date de commande ou d’accès" },
  },
  de: {
    subject: { withdrawal: "BorderDay: Widerruf eingegangen", cancellation: "BorderDay: Kündigung eingegangen" },
    intro: { withdrawal: "Wir haben Ihren Widerruf Ihres BorderDay-Vertrags erhalten.", cancellation: "Wir haben Ihre Kündigung Ihres BorderDay-Abonnements erhalten." },
    next: { withdrawal: "Link wickelt die Rückerstattung Ihrer Bestellung ab.", cancellation: "Wir bestätigen die Kündigung per E-Mail." },
    received: "Eingegangen am {date} um {time} (Europe/Zurich).",
    labels: { reference: "Referenz", name: "Name", email: "Konto-E-Mail", order: "Bestellreferenz", date: "Bestell- oder Zugriffsdatum" },
  },
  it: {
    subject: { withdrawal: "BorderDay: recesso ricevuto", cancellation: "BorderDay: richiesta di disdetta ricevuta" },
    intro: { withdrawal: "Abbiamo ricevuto il vostro recesso dal contratto BorderDay.", cancellation: "Abbiamo ricevuto la vostra richiesta di disdetta dell’abbonamento BorderDay." },
    next: { withdrawal: "Link gestisce il rimborso del vostro ordine.", cancellation: "Confermiamo la disdetta via e-mail." },
    received: "Ricevuto il {date} alle {time} (Europe/Zurich).",
    labels: { reference: "Riferimento", name: "Nome", email: "E-mail dell’account", order: "Riferimento dell’ordine", date: "Data dell’ordine o dell’accesso" },
  },
  nl: {
    subject: { withdrawal: "BorderDay: herroeping ontvangen", cancellation: "BorderDay: opzegverzoek ontvangen" },
    intro: { withdrawal: "We hebben uw herroeping van uw BorderDay-contract ontvangen.", cancellation: "We hebben uw verzoek om uw BorderDay-abonnement op te zeggen ontvangen." },
    next: { withdrawal: "Link handelt de terugbetaling van uw bestelling af.", cancellation: "We bevestigen de opzegging per e-mail." },
    received: "Ontvangen op {date} om {time} (Europe/Zurich).",
    labels: { reference: "Referentie", name: "Naam", email: "Account-e-mail", order: "Bestelreferentie", date: "Bestel- of toegangsdatum" },
  },
};

/** Text only: what was received, and when. */
export function buildReceipt(fields: ContractRequestFields, id: string, receivedAt: string): { subject: string; text: string } {
  const copy = RECEIPT[fields.lang];
  const { date, time } = receiptStamp(receivedAt, fields.lang);
  const lines = [
    copy.intro[fields.kind],
    copy.received.replace("{date}", date).replace("{time}", time),
    "",
    `${copy.labels.reference}: ${id}`,
    `${copy.labels.name}: ${withoutLinks(fields.name)}`,
    `${copy.labels.email}: ${fields.email}`,
  ];
  if (fields.orderReference) lines.push(`${copy.labels.order}: ${withoutLinks(fields.orderReference)}`);
  if (fields.orderDate) lines.push(`${copy.labels.date}: ${fields.orderDate}`);
  lines.push("", copy.next[fields.kind], "", "BorderDay");
  return { subject: copy.subject[fields.kind], text: lines.join("\n") };
}

function buildStaffNotice(fields: ContractRequestFields, id: string, receivedAt: string): { subject: string; text: string } {
  return {
    subject: `BorderDay ${fields.kind} request ${id}`,
    text: [
      `Kind: ${fields.kind}`,
      `Received: ${receivedAt}`,
      `Reference: ${id}`,
      `Name: ${fields.name}`,
      `Email: ${fields.email} (not verified; see docs/DATA_REQUESTS.md)`,
      `Order reference: ${fields.orderReference ?? "-"}`,
      `Order or access date: ${fields.orderDate ?? "-"}`,
      `Language: ${fields.lang}`,
    ].join("\n"),
  };
}

export type ReceiptOutcome = "sent" | "dry_run" | "failed" | "limited";

export type ContractRequestResponse =
  | { status: 200; body: { recorded: true; id: string; receivedAt: string; receipt: ReceiptOutcome } }
  | { status: 400 | 429 | 503; body: { recorded: false; code: "invalid" | "rate_limited" | "unavailable" } };

export interface ContractRequestDeps {
  now: () => Date;
  /** Null is an error reading the count: fail closed. */
  countRequests: (opts: { sinceIso: string; email?: string; receiptsOnly?: boolean }) => Promise<number | null>;
  /** Null is a failed insert. */
  insert: (fields: ContractRequestFields, receivedAt: string) => Promise<{ id: string; receivedAt: string } | null>;
  mark: (id: string, column: "receipt_sent_at" | "staff_notified_at", at: string) => Promise<void>;
  /** Null: no key or email paused. Nothing leaves in that case. */
  sendEmail: null | ((mail: { to: string; replyTo?: string; subject: string; text: string }) => Promise<boolean>);
}

const refused = (status: 400 | 429 | 503, code: "invalid" | "rate_limited" | "unavailable"): ContractRequestResponse => ({
  status,
  body: { recorded: false, code },
});

export async function handleContractRequest(body: unknown, deps: ContractRequestDeps): Promise<ContractRequestResponse> {
  const fields = parseContractRequest(body);
  if (!fields) return refused(400, "invalid");

  const sinceIso = new Date(deps.now().getTime() - ONE_HOUR_MS).toISOString();
  const [forAddress, overall] = await Promise.all([
    deps.countRequests({ sinceIso, email: fields.email }),
    deps.countRequests({ sinceIso }),
  ]);
  if (forAddress === null || overall === null) return refused(503, "unavailable");
  if (forAddress >= MAX_REQUESTS_PER_ADDRESS_PER_HOUR || overall >= MAX_REQUESTS_PER_HOUR) {
    return refused(429, "rate_limited");
  }

  const stored = await deps.insert(fields, deps.now().toISOString());
  if (!stored) return refused(503, "unavailable");
  const ok = (receipt: ReceiptOutcome): ContractRequestResponse => ({
    status: 200,
    body: { recorded: true, id: stored.id, receivedAt: stored.receivedAt, receipt },
  });

  // Recorded from here on: a mail problem must not turn this into a failure the person has to redo.
  if (!deps.sendEmail) return ok("dry_run");
  try {
    const notice = buildStaffNotice(fields, stored.id, stored.receivedAt);
    if (await deps.sendEmail({ to: STAFF_MAILBOX[fields.kind], replyTo: fields.email, ...notice })) {
      await deps.mark(stored.id, "staff_notified_at", deps.now().toISOString());
    }
    const [receiptsForAddress, receipts] = await Promise.all([
      deps.countRequests({ sinceIso, email: fields.email, receiptsOnly: true }),
      deps.countRequests({ sinceIso, receiptsOnly: true }),
    ]);
    if (receiptsForAddress === null || receipts === null) return ok("failed");
    if (receiptsForAddress >= MAX_RECEIPTS_PER_ADDRESS_PER_HOUR || receipts >= MAX_RECEIPTS_PER_HOUR) return ok("limited");
    const receipt = buildReceipt(fields, stored.id, stored.receivedAt);
    if (!(await deps.sendEmail({ to: fields.email, ...receipt }))) return ok("failed");
    await deps.mark(stored.id, "receipt_sent_at", deps.now().toISOString());
    return ok("sent");
  } catch {
    return ok("failed");
  }
}

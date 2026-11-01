// When RESEND_LIVE=0, real Resend sends stay limited to these test mailboxes.
// When live, any single-recipient address may be emailed (auth + rate limit still apply).
// Anchored on the whole address: emails are HR-supplied and could carry a second recipient.
const TEST_ADDRESS = /^[^\s@,;<>]+@(borderday\.com|example\.com|example\.org|borderday\.test)$/i;

/** Single mailbox only — blocks commas, angle-brackets and lookalike multi-recipient tricks. */
const SENDABLE_ADDRESS = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;

export function isInviteTestAddress(email: string): boolean {
  return TEST_ADDRESS.test(email);
}

export function isSendableInviteAddress(email: string): boolean {
  return SENDABLE_ADDRESS.test(email.trim());
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Cap real Resend traffic per company and per inviting user (last 60 minutes). */
export const MAX_INVITE_EMAILS_PER_HOUR = 30;

/**
 * One email per address per company in this window. It matches the hourly window on purpose:
 * email_sent_at holds only the latest send, so a shorter cooldown would hide sends from the hourly count.
 */
export const INVITE_COOLDOWN_MS = 60 * 60 * 1000;

/** Also enforced by bd_companies_name_length and the sign-up form. */
export const COMPANY_NAME_MAX_LENGTH = 120;

/** Same rule as bd_company_has_access (SQL) and companyHasPaidAccess (client). past_due has no access in either. */
export function companyCanEmailInvites(
  status: string | null | undefined,
  trialEndsAt: string | null | undefined,
  now = Date.now(),
): boolean {
  if (status === "active" || status === "trialing") return true;
  return !!trialEndsAt && new Date(trialEndsAt).getTime() > now;
}

export type InviteSendBlock = "cooldown" | "rate_limited";

/** Counts are real sends in the last hour, read from bd_invitations.email_sent_at. */
export function inviteSendBlock(sends: { company: number; user: number; recipient: number }): InviteSendBlock | null {
  if (sends.recipient > 0) return "cooldown";
  if (sends.company >= MAX_INVITE_EMAILS_PER_HOUR || sends.user >= MAX_INVITE_EMAILS_PER_HOUR) return "rate_limited";
  return null;
}

/** For matching an address exactly but case-insensitively with ilike: % and _ are legal in an address. */
export function escapeIlike(s: string): string {
  return s.replace(/[\\%_]/g, "\\$&");
}

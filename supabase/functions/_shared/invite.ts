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

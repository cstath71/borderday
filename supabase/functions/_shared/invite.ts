// Real invite emails go to test mailboxes only, until real sends are approved.
// Anchored on the whole address: emails are HR-supplied and could carry a second recipient.
const TEST_ADDRESS = /^[^\s@,;<>]+@(borderday\.com|example\.com|example\.org|borderday\.test)$/i;

export function isInviteTestAddress(email: string): boolean {
  return TEST_ADDRESS.test(email);
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

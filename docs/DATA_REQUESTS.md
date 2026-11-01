# Data-subject and contract requests

Account deletion requests reach `privacy@borderday.com` by email: the Account page prepares the message, it does not send it. Withdrawal and cancellation requests are stored by `bd-contract-request` (see below), and fall back to a prepared email if that fails. The browser cannot call Supabase Auth Admin, so account deletion stays a manual step.

Clocks: GDPR one month, FADP 30 days. Withdrawal: confirm receipt by email and handle the refund through Link.

## Account deletion

1. Check the request came from the account's address. The message carries the account email and ID.
2. Cancel any active subscription first (Stripe dashboard, or ask the customer to use the Cancel page).
3. If the person is an employee in a company account, the employer is controller of those day logs: tell the employer before deleting. Employer day logs and notice-proof rows are kept (detached) until the company's retention window ends — tell the person that.
4. Supabase dashboard → Authentication → Users → delete the user. `bd_profiles`, memberships, personal day logs and the person's own subscriptions cascade. Company `bd_day_logs` and `bd_consents` stay: `employee_user_id` / `user_id` become null and a label/email snapshot is kept for HR. A company the person alone administers stays and needs its own decision.
5. Reply to confirm.

## Export

The Account page exports the person's own server data, private notes included. Requests beyond it (auth logs, mailbox) are answered by hand.

## Someone removed from a company

They keep their own day log: the Account page lists each company they left, with the days and their notes, includes them in the export, and lets them delete them. Clearing their copy hides the days from them and wipes private notes; the employer’s copy stays under retention (soft-void while active, or employee_cleared_at after they leave). Notes are never visible to HR. `bd_my_day_log_companies` names the companies; reads and deletes go through the employee's own RLS.

## Withdrawal and cancellation requests

The Withdraw and Cancel pages post to `bd-contract-request`, which stores a row in `bd_contract_requests` (service role only). It also emails `privacy@borderday.com` (withdrawal) or `hello@borderday.com` (cancellation), and sends the person a receipt when Resend is live. The mail can fail, so the table is what counts. Check it every working day:

```sql
select id, kind, received_at, name, email, order_reference, order_date, user_id, staff_notified_at, receipt_sent_at
from public.bd_contract_requests where handled_at is null order by received_at;
```

1. **The email address is not verified.** Anyone can type any address. Match it to the order or account before acting (`user_id` is set only if the person was signed in). If it does not match, ask at that address before changing anything.
2. `receipt_sent_at` empty: send the receipt by hand, with the time from `received_at`.
3. Withdrawal: handle the refund through Link. `received_at` is the time of receipt shown to the person.
4. Cancellation: cancel in Stripe, then confirm by email.
5. `update public.bd_contract_requests set handled_at = now() where id = '…';`

These rows are not deleted automatically: the retention period has not been set.

## Company closure

Cancelling a plan closes nothing and deletes nothing. A company account ends only on the owner's written instruction to `privacy@borderday.com`. No job does this yet, because no post-termination period has been set: an owner who cancels and goes silent keeps their data, under the retention setting, until that is decided.

1. Check the sender is an active `owner` of that company. If not, ask an owner to confirm from their account address.
2. Cancel any live subscription in Stripe first, and wait for the webhook to record it.
3. Offer the owner the HR dashboard CSV before deleting. The employer is the controller and decides what it must keep: get its answer in writing.
4. Delete the company: `delete from public.bd_companies where id = '…';`. Members, invites, day logs, notice records and `bd_subscriptions` rows cascade from it (check the foreign keys against the current schema first), so keep anything accounting law or proof of the notice still needs before this step. Stripe keeps its own records. Employee sign-in accounts and individual plans are separate and stay.
5. Reply to the owner with the date done. Telling employees is the employer's job as controller.

## Retention

Daily `pg_cron` job `bd_purge_expired_data_daily` (03:17 UTC) runs `public.bd_purge_expired_data()`:
- deletes `bd_day_logs` whose `work_date` is older than the company `data_retention_months` (default 24, owner-editable 1–120 on the HR dashboard);
- marks pending `bd_invitations` with `expires_at` in the past as `expired`;
- deletes `expired` or `revoked` invites 30 days after `expires_at`.

Personal day logs, whole accounts, membership and billing rows are not timed-deleted — handle those via the steps above or privacy@borderday.com.

## What an HR viewer can do (A2-02)

Decision (2026-11-01): remove, reactivate, promote, billing and Stripe are **owners only** (RLS trigger + checkout/portal edge functions). Labels no longer say "read-only".

An active `hr_viewer` can:

- read colleagues' day records through the dashboard;
- invite and revoke non-owner invites;
- edit employees' profile figures (employment %, A1, contract days).

They cannot flip `role`/`active`, open checkout or the billing portal for the company, or cancel the company plan. Owners can do all of those. Answer access questions from employers on this basis.

A personal-data breach follows `docs/BREACH_RESPONSE.md`.

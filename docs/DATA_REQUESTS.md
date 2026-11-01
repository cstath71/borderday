# Data-subject and contract requests

Account deletion requests reach `privacy@borderday.com` by email: the Account page prepares the message, it does not send it. Withdrawal and cancellation requests are stored by `bd-contract-request` (see below), and fall back to a prepared email if that fails. The browser cannot call Supabase Auth Admin, so account deletion stays a manual step.

Clocks: GDPR one month, FADP 30 days. Withdrawal: confirm receipt by email and handle the refund through Link.

## Account deletion

1. Check the request came from the account's address. The message carries the account email and ID.
2. Cancel any active subscription first (Stripe dashboard, or ask the customer to use the Cancel page).
3. If the person is an employee in a company account, the employer is controller of those day logs: tell the employer before deleting, and tell the person if a record must be kept.
4. Supabase dashboard → Authentication → Users → delete the user. `bd_profiles`, memberships, day logs, personal day logs, notice records and subscriptions cascade from it. A company the person alone administers stays and needs its own decision.
5. Reply to confirm.

## Export

The Account page exports the person's own server data. Requests beyond it (auth logs, mailbox) are answered by hand.

## Retention

Daily `pg_cron` job `bd_purge_expired_data_daily` (03:17 UTC) runs `public.bd_purge_expired_data()`:
- deletes `bd_day_logs` whose `work_date` is older than the company `data_retention_months` (default 24, owner-editable 1–120 on the HR dashboard);
- marks pending `bd_invitations` with `expires_at` in the past as `expired`.

Personal day logs, whole accounts, membership and billing rows are not timed-deleted — handle those via the steps above or privacy@borderday.com.

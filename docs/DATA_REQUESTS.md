# Data-subject and contract requests

Requests reach `privacy@borderday.com` or `hello@borderday.com` by email: the Account, Withdrawal and Cancel pages prepare the message, they do not send it. The browser cannot call Supabase Auth Admin, so account deletion stays a manual step.

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

No purge job exists yet (`data_retention_months` is stored but not enforced). Privacy says so. Update Privacy `s6Body` and the table when a job ships.

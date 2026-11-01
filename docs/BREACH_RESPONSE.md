# Personal-data breach runbook

An engineering checklist for the first hours. It does not decide what the law requires. This repo is public, so keep names, secrets and incident details out of this file: they go in the private incident note (step 2).

**What the contract promises.** DPA section "Personal-data breaches (Art. 28(3)(f); FADP Art. 24)": the processor notifies the employer without undue delay after becoming aware of a breach affecting that employer's employee data, with the information then available. See `/en/dpa/`.

**Who decides what.**

- Employee day logs and invitations: the employer is the controller. The employer decides whether its regulator and its employees must be told. BorderDay informs the employer and does not make that call for it.
- BorderDay's own data (accounts, billing, security, individual plans, withdrawal and cancellation requests): PrimeLogic Advisory Sàrl is the controller. The owner decides, with legal advice. Read GDPR Art. 33–34 and FADP Art. 24 at that point; this file does not restate their tests or deadlines.

## 1. Contain

Do the ones that apply. Note the time of each.

- Leaked secret: rotate it where it lives (Supabase project keys, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY_BORDERDAY`), then redeploy the edge functions that read it.
- Mail abuse: set `RESEND_LIVE=0` on the functions. Reminders and invites then stop sending.
- A compromised account: Supabase dashboard → Authentication → Users → sign the user out or delete them. Deactivate memberships if needed.
- A faulty deploy: revert to the last good commit. Do not delete rows or logs: they are the evidence.

## 2. Open a private incident note

Outside this repo. Record:

- when and how BorderDay became aware. This is the time the DPA clause and any statutory clock are measured from, so write it down first;
- who is handling it;
- each action with its time.

## 3. Assess

Establish facts only:

- which data, which tables, which period;
- which companies and which people;
- whether the data left the system or was only exposed;
- whether it is still happening.

Where to look:

- Supabase dashboard → Logs (API, Postgres, Auth, Edge Functions). Export what you need early: retention on the plan may be short.
- Resend dashboard → Logs, for what was sent to whom.
- Stripe dashboard → Developers → Events and Logs.
- GitHub → repository security log, if code or Actions secrets are involved.

Who is affected, by company:

```sql
select c.id, c.name, p.email as owner_email
from public.bd_companies c
join public.bd_company_members m on m.company_id = c.id and m.role = 'owner' and m.active
join public.bd_profiles p on p.id = m.user_id
where c.id in ('…');
```

## 4. Notify

1. **The owner, straight away:** write to both `privacy@borderday.com` and `hello@borderday.com`, even if the facts are incomplete. If the mailbox itself is affected, use another channel. The owner decides what happens next.
2. **Affected employers, as the DPA promises:** without undue delay, to each company's owner address. Say what happened, which data and period, what has been done, what is still unknown, and a contact. Do not wait for a complete picture: send what is known and follow up.
3. **Regulators and individuals:** not an engineering decision. For employee data, the employer decides. For BorderDay's own data, the owner decides with legal advice.

Sub-processors: if a provider reports a breach to BorderDay, handle it the same way from the moment of that report.

## 5. Close

- Confirm the cause is fixed, and add a test if the cause was in code.
- Record the final facts, decisions and who took them in the private note, including a decision not to notify, and why.
- Update this file if a step was wrong or missing.

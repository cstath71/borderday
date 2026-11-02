# BorderDay

Multilingual PWA for HR and employees to track telework / on-site / third-country / non-working days against published limits: social-security counters on nine border routes (Geneva, Basel, Luxembourg, Belgium, Ticino), tax counters on four. See the FAQ for which.

## Stack

- Vite + React + TypeScript PWA
- Supabase (EU `fig-mail` project): Auth, `bd_*` tables + RLS, Edge Functions
- GitHub Pages hosting
- Stripe Checkout live (Managed Payments, sold through Link)
- Resend configured for invite email. Live by default (`RESEND_LIVE=1` or unset; set `RESEND_LIVE=0` to pause). When live, any single-recipient address may be emailed (owner/hr only, rate-limited). When paused, real sends stay limited to test addresses (`@borderday.com`, `@example.com`, `@example.org`, `@borderday.test`).

## Auth

Email (password + magic link) and **Google** OAuth.

## Routes and data

- Company pages (`/:lang/company/*`, `/:lang/join/:token`) use `src/lib/companyApi.ts` and real auth.
- The browser-local mock (`src/lib/supabaseMock.ts`) is reachable only from the labelled `/:lang/demo` routes.
- `/:lang/app` needs an active or trialing individual subscription, or membership of a paid company. Everyone else gets a labelled on-device preview limited to the current month.
- HR reads day logs through the `bd_list_day_types` RPC: employee, date and day type, never `note`.

## Local

```bash
cp .env.example .env.local   # fill anon key
npm install
npm run dev
npm test   # includes RLS tests against a real PostgreSQL 17 (embedded-postgres; must not run as root)
```

## Stripe products

Live products and prices already exist. The script below is for a test-mode account only:

```bash
STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-create-products.mjs
```

Company pricing (approved): **€5 per active employee / month**, **minimum €39 / month**, yearly **2 months free** (10× monthly).

- Seats **1–7** → flat `company-min-month` (€39) / `company-min-year` (€390), quantity 1
- Seats **≥ 8** → `company-seat-month` (€5) / `company-seat-year` (€50) × seats
- Edge: `bd-create-checkout`, `bd-stripe-webhook` (seat sync on update), `bd-sync-company-billing`
- Env: `STRIPE_PRICE_COMPANY_MIN_MONTH`, `STRIPE_PRICE_COMPANY_MIN_YEAR`, plus existing seat/individual price envs
- Invites: `bd-send-invite` uses `RESEND_API_KEY_BORDERDAY` (fallback `RESEND_API_KEY`); default From `BorderDay <hello@borderday.com>` when `RESEND_FROM` unset. `RESEND_LIVE` defaults on (set `0` to pause). Live sends go to any single-recipient address after owner/hr auth and a 30/hour per-company and per-user cap; when paused, the test-address allowlist in `supabase/functions/_shared/invite.ts` still applies.
- Stripe SDK API version: `2025-03-31.basil` (required for Managed Payments on this account).
- Tax: account default **exclusive**; company prices exclusive; individual prices **inclusive**. Managed Payments handles tax, so Checkout must not send `automatic_tax` or `tax_id_collection`; a billing address is required.

Never use an unrelated Stripe account (never WeddingVenues).

## License

Proprietary — all rights reserved unless otherwise noted.

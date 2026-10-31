# BorderDay

Multilingual PWA for HR and employees to track telework / on-site / third-country / non-working days against official tax and social-security limits (Geneva, Basel, Luxembourg, Belgium, Ticino corridors).

## Stack

- Vite + React + TypeScript PWA
- Supabase (EU `fig-mail` project): Auth, `bd_*` tables + RLS, Edge Functions
- GitHub Pages hosting
- Stripe Checkout (TEST prep; live when keys connected)
- Resend for invite email (domain setup required)

## Auth

Email (password + magic link) and **Google** OAuth.

## Local

```bash
cp .env.example .env.local   # fill anon key
npm install
npm run dev
npm test
```

## Stripe products (TEST only)

```bash
STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-create-products.mjs
```

Company pricing (approved): **€5 per active employee / month**, **minimum €39 / month**, yearly **2 months free** (10× monthly).

- Seats **1–7** → flat `company-min-month` (€39) / `company-min-year` (€390), quantity 1
- Seats **≥ 8** → `company-seat-month` (€5) / `company-seat-year` (€50) × seats
- Edge: `bd-create-checkout`, `bd-stripe-webhook` (seat sync on update), `bd-sync-company-billing`
- Env: `STRIPE_PRICE_COMPANY_MIN_MONTH`, `STRIPE_PRICE_COMPANY_MIN_YEAR`, plus existing seat/individual price envs
- Invites: `bd-send-invite` uses `RESEND_API_KEY_BORDERDAY` (fallback `RESEND_API_KEY`); default From `BorderDay <hello@borderday.com>` when `RESEND_FROM` unset. Real sends stay gated by `RESEND_LIVE=1` (still dry-run until Gus approves).
- Tax: account default **exclusive**; company prices exclusive; individual prices **inclusive**. Checkout uses `automatic_tax`, `tax_id_collection`, and required billing address.

Never use a live key or an unrelated Stripe account (never WeddingVenues).

## License

Proprietary — all rights reserved unless otherwise noted.

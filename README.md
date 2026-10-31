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

Never use a live key or an unrelated Stripe account.

## License

Proprietary — all rights reserved unless otherwise noted.

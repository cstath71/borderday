# BorderDay

Employer-first day tracker for cross-border teams. HR sees tax and social-security counters per employee; employees log telework, on-site, third-country and non-working days against official limits. The individual app is the employee side.

**Domain:** [borderday.com](https://borderday.com) (not deployed yet)

## Accuracy

- Thresholds come from public official sources linked in each counter.
- Counters marked “rule being confirmed” are disabled — no invented numbers.
- BorderDay is a tracking / reminder tool, not tax or legal advice. See `/disclaimer`.

## Employer features (local preview)

- Company signup, email invite **links** (no real email sending), employee join + consent + border pack
- HR dashboard: used vs allowed days, tax/SS separately, status within / 75% / 90% / over, filters, CSV audit export, per-employee history
- Roles: owner, HR viewer, employee
- Privacy by design: day types and counts only — no location; employees see what HR sees; export/delete; consent in EN/FR/DE/IT; retention note

## Backend mode

**Local mock** (`src/lib/supabaseMock.ts`) mirroring `supabase/migrations/20261031120000_employer_first.sql` RLS.

Docker / `supabase start` was not available on the build box, so no local Supabase stack and **no cloud Supabase project** is connected. SQL + RLS policies are in-repo for a future EU-region Supabase when Gus approves.

## Local preview

```bash
npm install
npm run dev      # http://127.0.0.1:5173/en/
npm test
npm run build && npm run preview
```

Load DEMO company from `/en/company/signup` (clearly labeled demo data).

## Stack

- Vite + React + TypeScript PWA
- Employee day log: IndexedDB (individual) + company day_logs in local tenant mock
- EN / FR / DE / IT with per-language URLs
- Designed for Supabase EU (migrations + RLS); runtime = local mock

## Pricing (display only)

- Company: €5 / active employee / month, min €39 / month; yearly = 2 months free
- Individual: €4.99 / month or €49 / year
- Payments: coming soon / waitlist

## Repo policy

No secrets. Do not mention the owner entity on the public site. No GitHub push / DNS / deploy / Stripe / real email without Gus approval.

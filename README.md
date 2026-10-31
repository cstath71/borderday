# BorderDay

Personal day tracker for people who live in one country and work in another.
Counts telework, on-site, third-country and non-working days against official tax and social-security limits.

**Domain:** [borderday.com](https://borderday.com) (not deployed yet)

## Accuracy

- Thresholds shown in the app come from public official sources linked in each counter.
- Counters marked “rule being confirmed” are disabled — no invented numbers.
- BorderDay is a record-keeping tool, not tax or legal advice. See `/disclaimer` in every language.

## Local preview

```bash
npm install
npm run dev      # http://127.0.0.1:5173/en/
npm test
npm run build && npm run preview
```

## Stack

- Vite + React + TypeScript PWA
- Local-first day log (IndexedDB)
- EN / FR / DE / IT with per-language URLs

## Repo policy

Public. No secrets. Do not mention the owner entity on the public site.

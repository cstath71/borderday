-- A3-03: the invite rate limit counted invitation rows, so re-sending one invite was unlimited.
-- bd-send-invite now reads this column. Apply this migration before deploying that function: until
-- then the function refuses to send rather than treating the missing count as zero.
alter table public.bd_invitations add column if not exists email_sent_at timestamptz;

-- Written by the service role only. authenticated keeps its column grants (20261031160000), which
-- do not include this column.
create index if not exists bd_invitations_email_sent_idx
  on public.bd_invitations (company_id, email_sent_at)
  where email_sent_at is not null;

-- A3-03: company names go into email from our domain and were unlimited (100,000 characters accepted).
-- Postgres checks a constraint on every update of a row, even with NOT VALID, so an over-long legacy
-- name would make the Stripe webhook's status updates fail. Shorten such rows first; the limit is far
-- above any real company name.
update public.bd_companies set name = left(name, 120) where char_length(name) > 120;
alter table public.bd_companies drop constraint if exists bd_companies_name_length;
alter table public.bd_companies
  add constraint bd_companies_name_length check (char_length(name) <= 120);

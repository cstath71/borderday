-- audit-2 A3-08: withdrawal and cancellation requests were only a prepared email, so no record existed
-- unless the user sent it. The bd-contract-request function stores them here.
-- Service role only: the form works signed out, so no client may read or write this table directly.

create table if not exists public.bd_contract_requests (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('withdrawal', 'cancellation')),
  name text not null check (char_length(name) between 1 and 200),
  email text not null check (char_length(email) between 3 and 254),
  order_reference text check (order_reference is null or char_length(order_reference) <= 200),
  order_date date,
  lang text not null default 'en' check (lang in ('en', 'fr', 'de', 'it', 'nl')),
  -- Set only when the caller was signed in. Survives account deletion as proof of the request.
  user_id uuid references auth.users (id) on delete set null,
  received_at timestamptz not null default now(),
  receipt_sent_at timestamptz,
  staff_notified_at timestamptz,
  handled_at timestamptz
);

create index if not exists bd_contract_requests_received_idx on public.bd_contract_requests (received_at);
create index if not exists bd_contract_requests_email_idx on public.bd_contract_requests (lower(email), received_at);
create index if not exists bd_contract_requests_open_idx on public.bd_contract_requests (received_at) where handled_at is null;

alter table public.bd_contract_requests enable row level security;

revoke all on public.bd_contract_requests from public, anon, authenticated;
grant all on public.bd_contract_requests to service_role;

comment on table public.bd_contract_requests is
  'Withdrawal and cancellation requests from the public forms. Runbook: docs/DATA_REQUESTS.md. Retention period: not set yet, see the owner decision list.';

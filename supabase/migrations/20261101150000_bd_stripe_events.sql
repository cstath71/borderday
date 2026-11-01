-- audit-2 A3-16: Stripe delivers at least once and in any order. This records which events are done,
-- so a retry is safe and an old subscription snapshot cannot overwrite a newer one.
-- Holds Stripe IDs and event types only. Service role only.

create table if not exists public.bd_stripe_events (
  event_id text primary key,
  event_type text not null,
  -- Set only for events that write subscription state.
  stripe_subscription_id text,
  event_created_at timestamptz not null,
  received_at timestamptz not null default now(),
  -- Null until every write succeeded, so a retry runs the event again.
  processed_at timestamptz
);

create index if not exists bd_stripe_events_subscription_idx
  on public.bd_stripe_events (stripe_subscription_id, event_created_at)
  where stripe_subscription_id is not null;

alter table public.bd_stripe_events enable row level security;

revoke all on public.bd_stripe_events from public, anon, authenticated;
grant all on public.bd_stripe_events to service_role;

comment on table public.bd_stripe_events is
  'Stripe webhook events seen by bd-stripe-webhook. Retention period: not set yet, see the owner decision list.';

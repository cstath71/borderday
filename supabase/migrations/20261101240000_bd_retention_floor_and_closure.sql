-- AR3-19: retention floor ~13 months so a calendar year of counters cannot be wiped mid-filing.
-- AR3-08: per-table periods for bd_contract_requests and bd_stripe_events, plus canceled-company
-- closure after the company's retention window past current_period_end. Notice is in-product /
-- DATA_REQUESTS (no automated email).

-- Raise floor; bump any company still below it.
update public.bd_companies
set data_retention_months = 13
where data_retention_months < 13;

alter table public.bd_companies
  drop constraint if exists bd_companies_data_retention_months_check;

alter table public.bd_companies
  add constraint bd_companies_data_retention_months_check
  check (data_retention_months between 13 and 120);

alter table public.bd_companies
  add column if not exists closed_at timestamptz;

comment on column public.bd_companies.closed_at is
  'Set by bd_purge_expired_data when a canceled company finishes its post-period retention window.';

comment on table public.bd_contract_requests is
  'Withdrawal and cancellation requests. Handled rows deleted after 36 months; open rows kept until handled.';

comment on table public.bd_stripe_events is
  'Stripe webhook events seen by bd-stripe-webhook. Rows deleted 36 months after received_at.';

create or replace function public.bd_purge_expired_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  company_logs_deleted int := 0;
  invites_expired int := 0;
  invites_deleted int := 0;
  contract_requests_deleted int := 0;
  stripe_events_deleted int := 0;
  companies_closed int := 0;
  n int;
  r record;
begin
  for r in
    select c.id as company_id, c.data_retention_months
    from public.bd_companies c
    where c.closed_at is null
  loop
    delete from public.bd_day_logs l
    where l.company_id = r.company_id
      and l.work_date < (current_date - make_interval(months => r.data_retention_months));
    get diagnostics n = row_count;
    company_logs_deleted := company_logs_deleted + n;
  end loop;

  update public.bd_invitations
  set status = 'expired'
  where status = 'pending'
    and expires_at < now();
  get diagnostics invites_expired = row_count;

  delete from public.bd_invitations
  where status in ('expired', 'revoked')
    and expires_at < now() - interval '30 days';
  get diagnostics invites_deleted = row_count;

  -- Handled consumer/company contract requests: 36 months after handled_at.
  delete from public.bd_contract_requests
  where handled_at is not null
    and handled_at < now() - interval '36 months';
  get diagnostics contract_requests_deleted = row_count;

  delete from public.bd_stripe_events
  where received_at < now() - interval '36 months';
  get diagnostics stripe_events_deleted = row_count;

  -- Canceled companies: after retention months past the paid period end, close the account data.
  for r in
    select c.id as company_id, c.data_retention_months, c.current_period_end
    from public.bd_companies c
    where c.closed_at is null
      and c.subscription_status = 'canceled'
      and c.current_period_end is not null
      and c.current_period_end < now() - make_interval(months => c.data_retention_months)
  loop
    delete from public.bd_day_logs where company_id = r.company_id;
    delete from public.bd_invitations where company_id = r.company_id;
    -- Member contact data lives on bd_profiles (shared across companies); do not rewrite profiles.
    update public.bd_company_members
    set active = false
    where company_id = r.company_id;
    update public.bd_companies
    set closed_at = now(),
        name = 'Closed company'
    where id = r.company_id;
    companies_closed := companies_closed + 1;
  end loop;

  return jsonb_build_object(
    'company_day_logs_deleted', company_logs_deleted,
    'invites_expired', invites_expired,
    'invites_deleted', invites_deleted,
    'contract_requests_deleted', contract_requests_deleted,
    'stripe_events_deleted', stripe_events_deleted,
    'companies_closed', companies_closed,
    'ran_at', now()
  );
end;
$$;

revoke all on function public.bd_purge_expired_data() from public;
revoke all on function public.bd_purge_expired_data() from anon, authenticated;
grant execute on function public.bd_purge_expired_data() to service_role;

comment on function public.bd_purge_expired_data() is
  'Daily retention: company day logs past data_retention_months (min 13); expire/delete stale invites; delete handled contract_requests and stripe_events after 36 months; close canceled companies after retention past current_period_end.';

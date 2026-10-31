-- H3: scheduled retention purge for company day logs and expired invites.
-- Company day logs older than bd_companies.data_retention_months (by work_date) are deleted daily.
-- Pending invites past expires_at are marked expired. Personal day logs are not auto-purged
-- (privacy: until the user deletes them or closes the account).

create or replace function public.bd_purge_expired_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  company_logs_deleted int := 0;
  invites_expired int := 0;
  n int;
  r record;
begin
  for r in
    select c.id as company_id, c.data_retention_months
    from public.bd_companies c
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

  return jsonb_build_object(
    'company_day_logs_deleted', company_logs_deleted,
    'invites_expired', invites_expired,
    'ran_at', now()
  );
end;
$$;

revoke all on function public.bd_purge_expired_data() from public;
revoke all on function public.bd_purge_expired_data() from anon, authenticated;
grant execute on function public.bd_purge_expired_data() to service_role;

comment on function public.bd_purge_expired_data() is
  'Deletes company day logs older than each company data_retention_months and expires pending invites past expires_at. Scheduled daily via pg_cron.';

-- Enable scheduler when available (Supabase hosted).
create extension if not exists pg_cron with schema pg_catalog;

-- Idempotent schedule: unschedule prior job name if present, then schedule daily 03:17 UTC.
do $$
begin
  perform cron.unschedule(jobid)
  from cron.job
  where jobname = 'bd_purge_expired_data_daily';
exception
  when undefined_table then null;
  when undefined_function then null;
end $$;

select cron.schedule(
  'bd_purge_expired_data_daily',
  '17 3 * * *',
  $cron$select public.bd_purge_expired_data();$cron$
);

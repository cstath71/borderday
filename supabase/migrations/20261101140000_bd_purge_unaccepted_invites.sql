-- audit-2 A3-09: emails of invitees who never joined stayed as long as the company existed, because
-- the purge only marked those rows expired. Rule: an invite that was never accepted (expired or
-- revoked) is deleted 30 days after its link expired. Accepted invites are not touched. Nothing else
-- reads these rows: the invite send limits look back one hour.
--
-- Same function, one more step. Its schedule from 20261031180000 stays as it is. The first run after
-- this migration deletes every invite already past the rule.

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

  delete from public.bd_invitations
  where status in ('expired', 'revoked')
    and expires_at < now() - interval '30 days';
  get diagnostics invites_deleted = row_count;

  return jsonb_build_object(
    'company_day_logs_deleted', company_logs_deleted,
    'invites_expired', invites_expired,
    'invites_deleted', invites_deleted,
    'ran_at', now()
  );
end;
$$;

-- CREATE OR REPLACE keeps existing grants; repeated so this file reads complete on its own.
revoke all on function public.bd_purge_expired_data() from public;
revoke all on function public.bd_purge_expired_data() from anon, authenticated;
grant execute on function public.bd_purge_expired_data() to service_role;

comment on function public.bd_purge_expired_data() is
  'Deletes company day logs older than each company data_retention_months, expires pending invites past expires_at, and deletes never-accepted invites 30 days after expires_at. Scheduled daily via pg_cron when the extension is available.';

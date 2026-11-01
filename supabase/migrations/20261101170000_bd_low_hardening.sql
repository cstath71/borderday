-- audit-2 A3-23, A3-26 to A3-30. Additive: revokes, triggers and one function body. No data changes.
-- Triggers act only on a signed-in client (auth.uid() set). The service role, the Stripe webhook,
-- account deletion and cascades do not pass through these rules.

-- ---------------------------------------------------------------------------
-- A3-23: anon needs no table privileges. RLS was its only barrier, so one policy mistake would
-- have been enough. bd_get_invite_by_token (SECURITY DEFINER) stays the only anon route.
-- ---------------------------------------------------------------------------
revoke all on public.bd_profiles, public.bd_companies, public.bd_company_members, public.bd_invitations,
  public.bd_day_logs, public.bd_consents, public.bd_personal_day_logs, public.bd_subscriptions,
  public.bd_contract_requests, public.bd_stripe_events
  from anon;

-- ---------------------------------------------------------------------------
-- A3-26: a company keeps at least one active owner. The company row is locked so two owners cannot
-- remove each other at the same moment. No company row means a cascade from deleting the company.
-- ---------------------------------------------------------------------------
create or replace function public.bd_keep_last_owner()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is null or old.role <> 'owner' or not old.active then
    return coalesce(new, old);
  end if;
  if tg_op = 'UPDATE' and new.role = 'owner' and new.active and new.company_id = old.company_id then
    return new;
  end if;
  perform 1 from public.bd_companies c where c.id = old.company_id for update;
  if not found then return coalesce(new, old); end if;
  if not exists (
    select 1 from public.bd_company_members m
    where m.company_id = old.company_id and m.role = 'owner' and m.active and m.id <> old.id
  ) then
    raise exception 'a company must keep an active owner' using errcode = 'BD002';
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists bd_members_keep_last_owner on public.bd_company_members;
create trigger bd_members_keep_last_owner
  before update or delete on public.bd_company_members
  for each row execute function public.bd_keep_last_owner();

revoke all on function public.bd_keep_last_owner() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- A3-27: notice records and log timestamps are evidence, so clients do not write them.
-- bd_accept_invite (SECURITY DEFINER) stays the only way to record the notice, and accepted_at
-- keeps its default. The version string still comes from the app: see GUS_DECISIONS.
-- ---------------------------------------------------------------------------
drop policy if exists bd_consents_insert on public.bd_consents;
revoke insert, update, delete on public.bd_consents from authenticated;

-- A trigger, not column grants: clients already send updated_at, and a revoked column would fail
-- every day log until the new frontend is live.
create or replace function public.bd_server_timestamps()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is null then return new; end if;
  if tg_op = 'INSERT' then
    new.created_at := now();
  else
    new.created_at := old.created_at;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists bd_day_logs_server_timestamps on public.bd_day_logs;
create trigger bd_day_logs_server_timestamps
  before insert or update on public.bd_day_logs
  for each row execute function public.bd_server_timestamps();

drop trigger if exists bd_personal_day_logs_server_timestamps on public.bd_personal_day_logs;
create trigger bd_personal_day_logs_server_timestamps
  before insert or update on public.bd_personal_day_logs
  for each row execute function public.bd_server_timestamps();

revoke all on function public.bd_server_timestamps() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- A3-28: a signed-in stranger can no longer ask whether a company UUID has paid access. Only the
-- day-log policies call this, and those already require membership.
-- ---------------------------------------------------------------------------
create or replace function public.bd_company_has_access(cid uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.bd_is_company_member(cid) and exists (
    select 1 from public.bd_companies c
    where c.id = cid
      and (c.subscription_status in ('active', 'trialing') or c.trial_ends_at > now())
  );
$$;

-- ---------------------------------------------------------------------------
-- A3-29: HR reads bd_profiles.email, so it follows the auth email. Existing rows only: this must
-- not create profiles for the other apps' users on this shared project.
-- ---------------------------------------------------------------------------
create or replace function public.bd_sync_profile_email()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  update public.bd_profiles set email = coalesce(new.email, '') where id = new.id;
  return new;
end;
$$;

drop trigger if exists bd_on_auth_user_email_changed on auth.users;
create trigger bd_on_auth_user_email_changed
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.bd_sync_profile_email();

revoke all on function public.bd_sync_profile_email() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- A3-30: one record per person and date is the existing unique key. Logging a date already held by
-- another company used to move the row, and the first employer's record disappeared.
-- ---------------------------------------------------------------------------
create or replace function public.bd_day_log_keep_company()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null and new.company_id <> old.company_id then
    raise exception 'this date is already logged under another company' using errcode = 'BD001';
  end if;
  return new;
end;
$$;

drop trigger if exists bd_day_logs_keep_company on public.bd_day_logs;
create trigger bd_day_logs_keep_company
  before update on public.bd_day_logs
  for each row execute function public.bd_day_log_keep_company();

revoke all on function public.bd_day_log_keep_company() from public, anon, authenticated;

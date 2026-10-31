-- BorderDay Phase 1 (audit findings H1, H2, H5, C8): harden tenant RLS.
-- Membership is created only by SECURITY DEFINER RPCs, roles cannot be self-assigned,
-- invites bind to the signed-in email, HR reads day types through an RPC (never `note`),
-- and paid writes are enforced in the database as well as the UI.
-- Billing columns stay writable by service_role only (Stripe webhook).

-- ---------------------------------------------------------------------------
-- Column grants. Supabase default privileges give anon/authenticated ALL on new
-- tables, so RLS alone leaves every column of an allowed row writable.
-- ---------------------------------------------------------------------------

revoke insert, update on public.bd_company_members from anon, authenticated;
grant update (role, active, border_pack_id, annual_working_days)
  on public.bd_company_members to authenticated;

-- stripe_customer_id: a forged value would open another customer's billing portal.
-- subscription_status / trial_ends_at: a forged value would unlock paid features.
revoke select, insert, update on public.bd_companies from anon, authenticated;
grant select (id, name, created_at, data_retention_months, subscription_status, plan_kind,
              seat_count, current_period_end, trial_ends_at)
  on public.bd_companies to authenticated;
grant update (name, data_retention_months) on public.bd_companies to authenticated;

-- bd_accept_invite compares auth.users.email, but HR reads bd_profiles.email, so keep it honest.
revoke insert, update on public.bd_profiles from anon, authenticated;
grant update (display_name) on public.bd_profiles to authenticated;
drop policy if exists bd_profiles_insert on public.bd_profiles;

-- token, status, expires_at and created_at keep their defaults on insert.
revoke insert, update on public.bd_invitations from anon, authenticated;
grant insert (company_id, email, role, invited_by) on public.bd_invitations to authenticated;
grant update (status) on public.bd_invitations to authenticated;

-- Writes to bd_subscriptions come from service_role only (no write policies exist either).
revoke insert, update, delete on public.bd_subscriptions from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Paid-access helpers. Same rule as companyHasPaidAccess in src/lib/billing.ts.
-- ---------------------------------------------------------------------------

create or replace function public.bd_company_has_access(cid uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.bd_companies c
    where c.id = cid
      and (c.subscription_status in ('active', 'trialing') or c.trial_ends_at > now())
  );
$$;

create or replace function public.bd_has_individual_access()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.bd_subscriptions s
    where s.user_id = auth.uid()
      and s.plan_kind = 'individual'
      and (s.status in ('active', 'trialing') or s.trial_ends_at > now())
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS: members
-- ---------------------------------------------------------------------------

-- No insert policy at all: bd_create_company and bd_accept_invite are the only ways in.
drop policy if exists bd_members_insert on public.bd_company_members;

-- Owners manage everyone. HR viewers manage others, never owners, and cannot grant owner.
-- Self-service goes through bd_update_member_self.
drop policy if exists bd_members_update on public.bd_company_members;
create policy bd_members_update on public.bd_company_members for update
  using (
    public.bd_member_role(company_id) = 'owner'
    or (public.bd_is_hr_or_owner(company_id) and user_id <> auth.uid() and role <> 'owner')
  )
  with check (
    public.bd_member_role(company_id) = 'owner'
    or (public.bd_is_hr_or_owner(company_id) and user_id <> auth.uid() and role <> 'owner')
  );

-- ---------------------------------------------------------------------------
-- RLS: invitations. Only an owner may issue or touch an owner invite.
-- ---------------------------------------------------------------------------

drop policy if exists bd_invites_insert on public.bd_invitations;
create policy bd_invites_insert on public.bd_invitations for insert with check (
  invited_by = auth.uid()
  and (
    public.bd_member_role(company_id) = 'owner'
    or (public.bd_is_hr_or_owner(company_id) and role <> 'owner')
  )
);

-- Status can only move away from pending; an accepted or revoked invite cannot be revived.
drop policy if exists bd_invites_update on public.bd_invitations;
create policy bd_invites_update on public.bd_invitations for update
  using (
    public.bd_member_role(company_id) = 'owner'
    or (public.bd_is_hr_or_owner(company_id) and role <> 'owner')
  )
  with check (status in ('revoked', 'expired'));

-- ---------------------------------------------------------------------------
-- RLS: day logs. Direct table reads are self-only so HR cannot select `note`.
-- ---------------------------------------------------------------------------

drop policy if exists bd_day_logs_select on public.bd_day_logs;
create policy bd_day_logs_select on public.bd_day_logs for select using (employee_user_id = auth.uid());

drop policy if exists bd_day_logs_insert on public.bd_day_logs;
create policy bd_day_logs_insert on public.bd_day_logs for insert with check (
  employee_user_id = auth.uid()
  and public.bd_is_company_member(company_id)
  and public.bd_company_has_access(company_id)
);

drop policy if exists bd_day_logs_update on public.bd_day_logs;
create policy bd_day_logs_update on public.bd_day_logs for update
  using (employee_user_id = auth.uid())
  with check (
    employee_user_id = auth.uid()
    and public.bd_is_company_member(company_id)
    and public.bd_company_has_access(company_id)
  );

drop policy if exists bd_personal_insert on public.bd_personal_day_logs;
create policy bd_personal_insert on public.bd_personal_day_logs for insert with check (
  user_id = auth.uid() and public.bd_has_individual_access()
);

drop policy if exists bd_personal_update on public.bd_personal_day_logs;
create policy bd_personal_update on public.bd_personal_day_logs for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and public.bd_has_individual_access());

drop policy if exists bd_consents_insert on public.bd_consents;
create policy bd_consents_insert on public.bd_consents for insert with check (
  user_id = auth.uid() and public.bd_is_company_member(company_id)
);

-- ---------------------------------------------------------------------------
-- RPCs
-- ---------------------------------------------------------------------------

-- fig-mail has auth users that predate the bd_profiles trigger; membership FKs need a row.
create or replace function public.bd_ensure_profile(uid uuid)
returns void
language sql security definer set search_path = public
as $$
  insert into public.bd_profiles (id, email, display_name)
  select u.id,
         coalesce(u.email, ''),
         coalesce(u.raw_user_meta_data->>'display_name', u.raw_user_meta_data->>'full_name',
                  split_part(coalesce(u.email, ''), '@', 1))
  from auth.users u
  where u.id = uid
  on conflict (id) do update set email = excluded.email;
$$;

create or replace function public.bd_create_company(company_name text)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
  cid uuid;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  perform public.bd_ensure_profile(uid);
  insert into public.bd_companies (name) values (company_name) returning id into cid;
  insert into public.bd_company_members (company_id, user_id, role)
  values (cid, uid, 'owner');
  return cid;
end;
$$;

-- Email comes from auth.users: JWT claims can be stale and bd_profiles is not the identity source.
create or replace function public.bd_accept_invite(invite_token text, consent_version text, text_lang text)
returns uuid
language plpgsql security definer set search_path = public
as $$
#variable_conflict use_column
declare
  inv public.bd_invitations%rowtype;
  uid uuid := auth.uid();
  user_email text;
  user_confirmed timestamptz;
begin
  if uid is null then raise exception 'not authenticated'; end if;

  select * into inv from public.bd_invitations
    where token = invite_token and status = 'pending' and expires_at > now()
    for update;
  if not found then raise exception 'invite not found or expired'; end if;

  select u.email, u.email_confirmed_at into user_email, user_confirmed
    from auth.users u where u.id = uid;
  if user_email is null or lower(trim(user_email)) <> lower(trim(inv.email)) then
    raise exception 'invite email mismatch' using errcode = '42501';
  end if;
  if user_confirmed is null then
    raise exception 'email not confirmed' using errcode = '42501';
  end if;

  perform public.bd_ensure_profile(uid);

  -- A later invite must not silently demote an existing owner.
  insert into public.bd_company_members as m (company_id, user_id, role)
  values (inv.company_id, uid, inv.role)
  on conflict (company_id, user_id) do update
    set role = case when m.role = 'owner' then m.role else excluded.role end,
        active = true;

  -- The parameters share these column names. The previous version failed here on every call:
  -- "column reference consent_version is ambiguous". Hence use_column above and qualified values.
  insert into public.bd_consents (user_id, company_id, consent_version, text_lang)
  values (uid, inv.company_id, bd_accept_invite.consent_version, bd_accept_invite.text_lang)
  on conflict (user_id, company_id, consent_version) do nothing;

  update public.bd_invitations set status = 'accepted' where id = inv.id;
  return inv.company_id;
end;
$$;

-- The only way an employee changes their own member row. No role parameter by design.
create or replace function public.bd_update_member_self(
  p_company_id uuid,
  p_border_pack_id text,
  p_annual_working_days int
)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if p_border_pack_id is not null and p_border_pack_id !~ '^[a-z0-9_]{1,64}$' then
    raise exception 'invalid border pack';
  end if;
  update public.bd_company_members
    set border_pack_id = p_border_pack_id,
        annual_working_days = p_annual_working_days
    where company_id = p_company_id and user_id = uid and active;
  if not found then raise exception 'not a member of this company' using errcode = '42501'; end if;
end;
$$;

-- What HR sees, and what employees see of themselves: employee, date, day type. Never `note`.
create or replace function public.bd_list_day_types(cid uuid, employee uuid default null)
returns table (employee_user_id uuid, work_date date, day_type public.bd_day_type)
language plpgsql stable security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if public.bd_is_hr_or_owner(cid) then
    return query
      select l.employee_user_id, l.work_date, l.day_type
      from public.bd_day_logs l
      where l.company_id = cid and (employee is null or l.employee_user_id = employee)
      order by l.work_date desc, l.employee_user_id;
  elsif employee is null or employee = uid then
    return query
      select l.employee_user_id, l.work_date, l.day_type
      from public.bd_day_logs l
      where l.company_id = cid and l.employee_user_id = uid
      order by l.work_date desc;
  else
    raise exception 'day log access denied' using errcode = '42501';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- EXECUTE: Supabase default privileges grant new functions to anon, so revoke explicitly.
-- ---------------------------------------------------------------------------

revoke all on function public.bd_ensure_profile(uuid) from public, anon, authenticated;
grant execute on function public.bd_ensure_profile(uuid) to service_role;

revoke all on function public.bd_company_has_access(uuid) from public, anon;
grant execute on function public.bd_company_has_access(uuid) to authenticated, service_role;

revoke all on function public.bd_has_individual_access() from public, anon;
grant execute on function public.bd_has_individual_access() to authenticated, service_role;

revoke all on function public.bd_update_member_self(uuid, text, int) from public, anon;
grant execute on function public.bd_update_member_self(uuid, text, int) to authenticated, service_role;

revoke all on function public.bd_list_day_types(uuid, uuid) from public, anon;
grant execute on function public.bd_list_day_types(uuid, uuid) to authenticated, service_role;

-- Only reachable by a privileged role; RLS policies and triggers do not use it from clients.
revoke all on function public.bd_active_seat_count(uuid) from authenticated;

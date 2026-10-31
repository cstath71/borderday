-- BorderDay Phase 2: facts some rules depend on.
--   employment_percent : part-time / part-year reduction of day limits (FR-LU 34 days, CH-FR 10 days).
--   a1_in_place, a1_valid_until : framework agreement band from 25% of working time.
--   overnight_away_for_work : day attribute for "did not return home for work" rules (CH-IT 45, DE-CH 60).
--     A yes/no on a day, never a place. HR may see it, as they see the day type; `note` stays private.
-- Additive only, so the frontend already deployed keeps working before and after this runs.

alter table public.bd_company_members
  add column if not exists employment_percent int
    check (employment_percent is null or employment_percent between 1 and 100),
  add column if not exists a1_in_place boolean not null default false,
  add column if not exists a1_valid_until date;

alter table public.bd_day_logs
  add column if not exists overnight_away_for_work boolean not null default false;

alter table public.bd_personal_day_logs
  add column if not exists overnight_away_for_work boolean not null default false;

-- Column grants from bd_rls_harden list what HR may update: extend, without touching the rest.
grant update (employment_percent, a1_in_place, a1_valid_until)
  on public.bd_company_members to authenticated;

-- The only way an employee changes these on their own row (no direct update policy for self).
create or replace function public.bd_update_member_profile(
  p_company_id uuid,
  p_employment_percent int,
  p_a1_in_place boolean,
  p_a1_valid_until date
)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not authenticated'; end if;
  update public.bd_company_members
    set employment_percent = p_employment_percent,
        a1_in_place = coalesce(p_a1_in_place, false),
        a1_valid_until = p_a1_valid_until
    where company_id = p_company_id and user_id = uid and active;
  if not found then raise exception 'not a member of this company' using errcode = '42501'; end if;
end;
$$;

-- bd_list_day_types plus the overnight flag. Same access rule, still never `note`.
-- bd_list_day_types stays: installed PWAs may still call it.
create or replace function public.bd_list_day_records(cid uuid, employee uuid default null)
returns table (
  employee_user_id uuid,
  work_date date,
  day_type public.bd_day_type,
  overnight_away_for_work boolean
)
language plpgsql stable security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if public.bd_is_hr_or_owner(cid) then
    return query
      select l.employee_user_id, l.work_date, l.day_type, l.overnight_away_for_work
      from public.bd_day_logs l
      where l.company_id = cid and (employee is null or l.employee_user_id = employee)
      order by l.work_date desc, l.employee_user_id;
  elsif employee is null or employee = uid then
    return query
      select l.employee_user_id, l.work_date, l.day_type, l.overnight_away_for_work
      from public.bd_day_logs l
      where l.company_id = cid and l.employee_user_id = uid
      order by l.work_date desc;
  else
    raise exception 'day log access denied' using errcode = '42501';
  end if;
end;
$$;

-- Supabase default privileges grant new functions to anon, so revoke explicitly.
revoke all on function public.bd_update_member_profile(uuid, int, boolean, date) from public, anon;
grant execute on function public.bd_update_member_profile(uuid, int, boolean, date) to authenticated, service_role;

revoke all on function public.bd_list_day_records(uuid, uuid) from public, anon;
grant execute on function public.bd_list_day_records(uuid, uuid) to authenticated, service_role;

comment on column public.bd_day_logs.overnight_away_for_work is
  'Did not return home for work reasons. Yes/no only: no place, no GPS, no address.';

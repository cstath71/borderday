-- A2-01 / AR3-02: active employees soft-void a day (correction trail); no hard DELETE of employer rows.
-- Bulk wipe is refused in the app; RLS no longer allows employee DELETE.

alter table public.bd_day_logs
  add column if not exists voided_at timestamptz,
  add column if not exists prior_day_type public.bd_day_type,
  add column if not exists corrected_at timestamptz;

comment on column public.bd_day_logs.voided_at is
  'When set, the employee cleared this day; the row stays for the employer. Excluded from live counters until re-logged.';
comment on column public.bd_day_logs.prior_day_type is
  'Day type at the moment of the last void (correction trail for HR).';
comment on column public.bd_day_logs.corrected_at is
  'When the employee re-logged a previously voided day.';

-- Employees may no longer hard-delete company day rows (retention purge is security definer).
drop policy if exists bd_day_logs_delete on public.bd_day_logs;
create policy bd_day_logs_delete on public.bd_day_logs for delete using (false);

-- Single-day soft void (active member). Wipes the private note; keeps employer fields.
create or replace function public.bd_void_my_day_log(p_company_id uuid, p_work_date date)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  if not exists (
    select 1 from public.bd_company_members m
    where m.company_id = p_company_id and m.user_id = uid and m.active
  ) then
    raise exception 'not an active member' using errcode = '42501';
  end if;
  update public.bd_day_logs
     set voided_at = coalesce(voided_at, now()),
         prior_day_type = coalesce(prior_day_type, day_type),
         note = null
   where company_id = p_company_id
     and employee_user_id = uid
     and work_date = p_work_date
     and voided_at is null;
end;
$$;

revoke all on function public.bd_void_my_day_log(uuid, date) from public, anon;
grant execute on function public.bd_void_my_day_log(uuid, date) to authenticated, service_role;

-- Re-log after a void: clear void, stamp corrected_at (called from client upsert too; trigger covers race).
create or replace function public.bd_day_logs_clear_void_on_write()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and old.voided_at is not null and new.voided_at is null then
    new.corrected_at := coalesce(new.corrected_at, now());
  end if;
  -- Fresh write of day fields while voided (upsert without clearing voided_at) still counts as a correction.
  if tg_op = 'UPDATE' and old.voided_at is not null
     and (new.day_type is distinct from old.day_type
       or new.day_share is distinct from old.day_share
       or new.overnight_away_for_work is distinct from old.overnight_away_for_work) then
    new.voided_at := null;
    new.corrected_at := coalesce(new.corrected_at, now());
  end if;
  return new;
end;
$$;

drop trigger if exists bd_day_logs_clear_void_on_write on public.bd_day_logs;
create trigger bd_day_logs_clear_void_on_write
  before update on public.bd_day_logs
  for each row execute function public.bd_day_logs_clear_void_on_write();

-- HR sees voided rows + trail; the employee’s own live calendar omits voided days.
drop function if exists public.bd_list_day_records(uuid, uuid);
create function public.bd_list_day_records(cid uuid, employee uuid default null)
returns table (
  employee_user_id uuid,
  work_date date,
  day_type public.bd_day_type,
  overnight_away_for_work boolean,
  day_share numeric,
  voided_at timestamptz,
  prior_day_type public.bd_day_type,
  corrected_at timestamptz
)
language plpgsql stable security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if public.bd_is_hr_or_owner(cid) then
    return query
      select l.employee_user_id, l.work_date, l.day_type, l.overnight_away_for_work, l.day_share,
             l.voided_at, l.prior_day_type, l.corrected_at
      from public.bd_day_logs l
      where l.company_id = cid and (employee is null or l.employee_user_id = employee)
      order by l.work_date desc, l.employee_user_id;
  elsif employee is null or employee = uid then
    return query
      select l.employee_user_id, l.work_date, l.day_type, l.overnight_away_for_work, l.day_share,
             l.voided_at, l.prior_day_type, l.corrected_at
      from public.bd_day_logs l
      where l.company_id = cid and l.employee_user_id = uid and l.voided_at is null
      order by l.work_date desc;
  else
    raise exception 'day log access denied' using errcode = '42501';
  end if;
end;
$$;

revoke all on function public.bd_list_day_records(uuid, uuid) from public, anon;
grant execute on function public.bd_list_day_records(uuid, uuid) to authenticated, service_role;

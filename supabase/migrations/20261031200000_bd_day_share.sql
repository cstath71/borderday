-- BorderDay: fraction-of-day (half / full) for counters that weight days.
-- FR–LU: any fraction outside LU counts as a whole day (enforced in app counting via
-- fractionCountsAsFull + day_share). CH–FR: half-days can contribute 0.5 toward %.
-- Additive; installed clients keep working before and after this runs.

alter table public.bd_day_logs
  add column if not exists day_share numeric(2,1) not null default 1.0
    check (day_share in (0.5, 1.0));

alter table public.bd_personal_day_logs
  add column if not exists day_share numeric(2,1) not null default 1.0
    check (day_share in (0.5, 1.0));

-- Return type gains day_share: must drop before recreate (42P13 otherwise).
drop function if exists public.bd_list_day_records(uuid, uuid);

create function public.bd_list_day_records(cid uuid, employee uuid default null)
returns table (
  employee_user_id uuid,
  work_date date,
  day_type public.bd_day_type,
  overnight_away_for_work boolean,
  day_share numeric
)
language plpgsql stable security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if public.bd_is_hr_or_owner(cid) then
    return query
      select l.employee_user_id, l.work_date, l.day_type, l.overnight_away_for_work, l.day_share
      from public.bd_day_logs l
      where l.company_id = cid and (employee is null or l.employee_user_id = employee)
      order by l.work_date desc, l.employee_user_id;
  elsif employee is null or employee = uid then
    return query
      select l.employee_user_id, l.work_date, l.day_type, l.overnight_away_for_work, l.day_share
      from public.bd_day_logs l
      where l.company_id = cid and l.employee_user_id = uid
      order by l.work_date desc;
  else
    raise exception 'day log access denied' using errcode = '42501';
  end if;
end;
$$;

revoke all on function public.bd_list_day_records(uuid, uuid) from public, anon;
grant execute on function public.bd_list_day_records(uuid, uuid) to authenticated, service_role;

comment on column public.bd_day_logs.day_share is
  'Share of the day for this type: 1.0 full, 0.5 half. Never a place.';
comment on column public.bd_personal_day_logs.day_share is
  'Share of the day for this type: 1.0 full, 0.5 half. Never a place.';

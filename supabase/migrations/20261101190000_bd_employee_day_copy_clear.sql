-- E24 (Gus 1 Nov 2026): a leaver clearing their day log removes only their own copy.
-- Company rows stay until the company retention purge. Private notes are wiped on clear.
alter table public.bd_day_logs
  add column if not exists employee_cleared_at timestamptz;

comment on column public.bd_day_logs.employee_cleared_at is
  'When set, the employee cleared their own copy (and note). The row remains for the employer under retention.';

comment on column public.bd_day_logs.note is
  'Private to the employee: never returned to HR, never in a company export. Cleared when the employee clears their copy; otherwise deleted with the row.';

-- Hard DELETE only while the person is still an active member (correcting the live log).
drop policy if exists bd_day_logs_delete on public.bd_day_logs;
create policy bd_day_logs_delete on public.bd_day_logs for delete using (
  employee_user_id = auth.uid()
  and exists (
    select 1 from public.bd_company_members m
    where m.company_id = bd_day_logs.company_id
      and m.user_id = auth.uid()
      and m.active
  )
);

-- Former (or any) employee: mark copy cleared and wipe the private note; keep the company row.
create or replace function public.bd_clear_my_day_log_copy(p_company_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  update public.bd_day_logs
     set employee_cleared_at = coalesce(employee_cleared_at, now()),
         note = null
   where company_id = p_company_id
     and employee_user_id = auth.uid()
     and employee_cleared_at is null;
end;
$$;

revoke all on function public.bd_clear_my_day_log_copy(uuid) from public, anon;
grant execute on function public.bd_clear_my_day_log_copy(uuid) to authenticated, service_role;

-- Former-company list ignores rows the employee already cleared.
create or replace function public.bd_my_day_log_companies()
returns table (
  company_id uuid,
  company_name text,
  active boolean,
  day_count bigint,
  first_date date,
  last_date date
)
language sql
stable
security definer
set search_path = public
as $$
  select l.company_id, c.name, coalesce(bool_or(m.active), false), count(*), min(l.work_date), max(l.work_date)
  from public.bd_day_logs l
  join public.bd_companies c on c.id = l.company_id
  left join public.bd_company_members m on m.company_id = l.company_id and m.user_id = l.employee_user_id
  where l.employee_user_id = auth.uid()
    and l.employee_cleared_at is null
  group by l.company_id, c.name
  order by c.name;
$$;

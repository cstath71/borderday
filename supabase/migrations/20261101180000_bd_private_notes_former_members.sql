-- E15: private per-day notes. The `note` columns already exist and direct reads are self-only
-- (bd_day_logs_select, 20261031160000); HR reads through bd_list_day_records, which never returns them.
-- Nothing has written a note to these tables yet, so the checks cannot fail on existing rows.
alter table public.bd_day_logs
  add constraint bd_day_logs_note_length check (note is null or char_length(note) <= 500);
alter table public.bd_personal_day_logs
  add constraint bd_personal_day_logs_note_length check (note is null or char_length(note) <= 500);

comment on column public.bd_day_logs.note is
  'Private to the employee: never returned to HR, never in a company export. Deleted with the row.';
comment on column public.bd_personal_day_logs.note is
  'Private to the user. Deleted with the row.';

-- E24: a removed member can still read and delete their own rows (RLS is by employee, not by
-- membership), but loses sight of the company row. This names the companies they hold days in.
-- Only companies where the caller has logged a day, so it reveals nothing to anyone else.
create or replace function public.bd_my_day_log_companies()
returns table (
  company_id uuid,
  company_name text,
  active boolean,
  day_count bigint,
  first_date date,
  last_date date
)
language sql stable security definer set search_path = public
as $$
  select l.company_id, c.name, coalesce(bool_or(m.active), false), count(*), min(l.work_date), max(l.work_date)
  from public.bd_day_logs l
  join public.bd_companies c on c.id = l.company_id
  left join public.bd_company_members m on m.company_id = l.company_id and m.user_id = l.employee_user_id
  where l.employee_user_id = auth.uid()
  group by l.company_id, c.name
  order by c.name;
$$;

revoke all on function public.bd_my_day_log_companies() from public, anon;
grant execute on function public.bd_my_day_log_companies() to authenticated, service_role;

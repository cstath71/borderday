-- HR bulk import of historical company day logs.
-- Employees keep the only direct write path (RLS unchanged). HR and owners write through
-- bd_import_company_day_logs, which is security definer and checks the caller and each target.
-- Imported rows stay marked as entered by HR. An employee correction wins and is recorded;
-- it does not erase who imported the day. Existing employee rows are never overwritten.

alter table public.bd_company_members
  add column if not exists employed_from date,
  add column if not exists employed_until date;

alter table public.bd_company_members
  drop constraint if exists bd_company_members_employment_order;
alter table public.bd_company_members
  add constraint bd_company_members_employment_order
  check (employed_from is null or employed_until is null or employed_from <= employed_until);

comment on column public.bd_company_members.employed_from is
  'First employment day at this company for historical import. Null means no start bound, so days before the person joined BorderDay can be loaded. Not joined_at.';
comment on column public.bd_company_members.employed_until is
  'Last employment day at this company. Null means no end date. A removed member is also capped at removed_at.';

grant update (employed_from, employed_until) on public.bd_company_members to authenticated;

alter table public.bd_day_logs
  add column if not exists entry_source text not null default 'employee'
    check (entry_source in ('employee', 'hr')),
  add column if not exists imported_by uuid references public.bd_profiles (id) on delete set null,
  add column if not exists imported_at timestamptz,
  add column if not exists import_batch_id uuid,
  add column if not exists employee_confirmed_at timestamptz,
  add column if not exists employee_corrected_at timestamptz;

comment on column public.bd_day_logs.entry_source is
  'Who first entered the day: employee, or hr. Never rewritten to hide an HR import.';
comment on column public.bd_day_logs.imported_by is
  'HR or owner who imported the day. Null on employee-entered rows and after that account is deleted.';
comment on column public.bd_day_logs.imported_at is
  'When the HR import was written.';
comment on column public.bd_day_logs.import_batch_id is
  'bd_day_import_batches row for this import. Audit only.';
comment on column public.bd_day_logs.employee_confirmed_at is
  'When the employee confirmed an HR import without changing it.';
comment on column public.bd_day_logs.employee_corrected_at is
  'When the employee changed an HR import. Their values win; entry_source stays hr.';

-- Attempt log. No CSV body and no notes: the day rows hold the data. Clients cannot write it.
create table if not exists public.bd_day_import_batches (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.bd_companies (id) on delete cascade,
  imported_by uuid references public.bd_profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  submitted_count int not null check (submitted_count >= 0),
  imported_count int not null check (imported_count >= 0),
  skipped_count int not null check (skipped_count >= 0),
  error_count int not null check (error_count >= 0)
);

create index if not exists bd_day_import_batches_company_idx
  on public.bd_day_import_batches (company_id, created_at desc);

alter table public.bd_day_import_batches enable row level security;
revoke all on public.bd_day_import_batches from public, anon, authenticated;
grant all on public.bd_day_import_batches to service_role;

alter table public.bd_day_logs
  drop constraint if exists bd_day_logs_import_batch_fkey;
alter table public.bd_day_logs
  add constraint bd_day_logs_import_batch_fkey
  foreign key (import_batch_id) references public.bd_day_import_batches (id) on delete set null;

comment on table public.bd_day_import_batches is
  'One row per HR day-import call: who, when, and how many rows were imported, skipped or rejected. No file body.';

-- Authenticated clients cannot forge provenance. The import and confirm RPCs run as the
-- function owner, so current_user is not ''authenticated'' and their writes are kept.
create or replace function public.bd_day_logs_protect_provenance()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user <> 'authenticated' then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.entry_source := 'employee';
    new.imported_by := null;
    new.imported_at := null;
    new.import_batch_id := null;
    new.employee_confirmed_at := null;
    new.employee_corrected_at := null;
    return new;
  end if;
  new.entry_source := old.entry_source;
  new.imported_by := old.imported_by;
  new.imported_at := old.imported_at;
  new.import_batch_id := old.import_batch_id;
  if new.employee_user_id is not distinct from old.employee_user_id
     and auth.uid() is not null
     and auth.uid() = old.employee_user_id
     and old.entry_source = 'hr'
     and (
       new.day_type is distinct from old.day_type
       or new.day_share is distinct from old.day_share
       or new.overnight_away_for_work is distinct from old.overnight_away_for_work
       or new.note is distinct from old.note
     ) then
    new.employee_corrected_at := now();
    new.employee_confirmed_at := null;
  else
    new.employee_corrected_at := old.employee_corrected_at;
    new.employee_confirmed_at := old.employee_confirmed_at;
  end if;
  return new;
end;
$$;

drop trigger if exists bd_day_logs_protect_provenance on public.bd_day_logs;
create trigger bd_day_logs_protect_provenance
  before insert or update on public.bd_day_logs
  for each row execute function public.bd_day_logs_protect_provenance();

revoke all on function public.bd_day_logs_protect_provenance() from public, anon, authenticated;

-- Employee confirms an HR day without changing it. A later correction clears this stamp.
create or replace function public.bd_confirm_imported_day(p_company_id uuid, p_work_date date)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  update public.bd_day_logs
     set employee_confirmed_at = coalesce(employee_confirmed_at, now())
   where company_id = p_company_id
     and employee_user_id = uid
     and work_date = p_work_date
     and entry_source = 'hr'
     and employee_corrected_at is null
     and voided_at is null
     and employee_cleared_at is null;
end;
$$;

revoke all on function public.bd_confirm_imported_day(uuid, date) from public, anon;
grant execute on function public.bd_confirm_imported_day(uuid, date) to authenticated, service_role;

create or replace function public.bd_import_company_day_logs(p_company_id uuid, p_rows jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  today date := (timezone('Europe/Zurich', now()))::date;
  n int;
  batch_id uuid;
  rec record;
  v_email text;
  v_date_text text;
  v_date date;
  v_type text;
  v_note text;
  v_overnight boolean;
  v_half boolean;
  v_status text;
  v_code text;
  v_employee uuid;
  v_end date;
  v_active boolean;
  v_from date;
  v_removed date;
  v_until date;
  profile_ids uuid[];
  ex record;
  imported int;
  skipped int;
  errored int;
  rows_json jsonb;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if not public.bd_is_hr_or_owner(p_company_id) then
    raise exception 'day import denied' using errcode = '42501';
  end if;
  if not public.bd_company_has_access(p_company_id) then
    raise exception 'company has no active plan' using errcode = '42501';
  end if;
  if p_rows is null or jsonb_typeof(p_rows) <> 'array' then
    raise exception 'rows must be a json array' using errcode = '22023';
  end if;
  n := jsonb_array_length(p_rows);
  if n = 0 then
    raise exception 'no rows' using errcode = '22023';
  end if;
  if n > 20000 then
    raise exception 'too many rows' using errcode = '22023';
  end if;

  -- One import at a time per company, so two uploads cannot both insert the same day.
  perform 1 from public.bd_companies c where c.id = p_company_id for update;

  insert into public.bd_day_import_batches (
    company_id, imported_by, submitted_count, imported_count, skipped_count, error_count
  ) values (p_company_id, uid, n, 0, 0, 0)
  returning id into batch_id;

  drop table if exists pg_temp.bd_import_work;
  create temp table bd_import_work (
    idx int primary key,
    email text not null,
    work_date date,
    day_type text,
    overnight boolean,
    half boolean,
    note text,
    status text not null,
    code text,
    employee_id uuid
  ) on commit drop;

  for rec in
    select t.value as row, (t.ordinality - 1)::int as idx
    from jsonb_array_elements(p_rows) with ordinality as t(value, ordinality)
  loop
    v_status := 'ready';
    v_code := null;
    v_employee := null;
    v_date := null;
    v_overnight := false;
    v_half := false;
    v_type := null;
    v_note := null;
    v_email := '';

    if jsonb_typeof(rec.row) <> 'object' then
      v_status := 'error';
      v_code := 'bad_date';
    else
      if rec.row ? 'email' and jsonb_typeof(rec.row->'email') = 'string' then
        v_email := lower(trim(rec.row->>'email'));
      end if;
      if v_email = '' then
        v_status := 'error';
        v_code := 'unknown_email';
      end if;

      v_date_text := case
        when rec.row ? 'work_date' and jsonb_typeof(rec.row->'work_date') = 'string' then trim(rec.row->>'work_date')
        else ''
      end;
      if v_status = 'ready' then
        if v_date_text !~ '^\d{4}-\d{2}-\d{2}$' then
          v_status := 'error';
          v_code := 'bad_date';
        else
          begin
            v_date := v_date_text::date;
            if to_char(v_date, 'YYYY-MM-DD') <> v_date_text then
              v_date := null;
              v_status := 'error';
              v_code := 'bad_date';
            end if;
          exception when others then
            v_date := null;
            v_status := 'error';
            v_code := 'bad_date';
          end;
        end if;
      end if;

      if v_status = 'ready' and v_date > today then
        v_status := 'error';
        v_code := 'future_date';
      end if;

      if v_status = 'ready' then
        if rec.row ? 'day_type' and jsonb_typeof(rec.row->'day_type') = 'string' then
          v_type := lower(trim(rec.row->>'day_type'));
          v_type := replace(replace(v_type, '-', '_'), ' ', '_');
          if v_type = 'on_site' then v_type := 'onsite'; end if;
        end if;
        if v_type is null or v_type not in ('telework', 'onsite', 'third_country', 'non_working') then
          v_status := 'error';
          v_code := 'invalid_type';
        end if;
      end if;

      if v_status = 'ready' then
        if not (rec.row ? 'overnight_away') or jsonb_typeof(rec.row->'overnight_away') = 'null' then
          v_overnight := false;
        elsif jsonb_typeof(rec.row->'overnight_away') = 'boolean' then
          v_overnight := (rec.row->>'overnight_away')::boolean;
        else
          v_status := 'error';
          v_code := 'invalid_flag';
        end if;
      end if;
      if v_status = 'ready' then
        if not (rec.row ? 'half_day') or jsonb_typeof(rec.row->'half_day') = 'null' then
          v_half := false;
        elsif jsonb_typeof(rec.row->'half_day') = 'boolean' then
          v_half := (rec.row->>'half_day')::boolean;
        else
          v_status := 'error';
          v_code := 'invalid_flag';
        end if;
      end if;

      if v_status = 'ready' and v_half and v_type = 'non_working' then
        v_status := 'error';
        v_code := 'invalid_half_day';
      end if;
      if v_status = 'ready' and v_overnight and v_type not in ('onsite', 'third_country') then
        v_status := 'error';
        v_code := 'invalid_overnight';
      end if;

      if v_status = 'ready' then
        if rec.row ? 'note' and jsonb_typeof(rec.row->'note') not in ('string', 'null') then
          v_status := 'error';
          v_code := 'invalid_note';
        else
          v_note := trim(coalesce(rec.row->>'note', ''));
          if v_note ~ '^[=+\-@\t\r]' then
            v_note := '''' || v_note;
          end if;
          if char_length(v_note) > 500 then
            v_status := 'error';
            v_code := 'note_too_long';
          end if;
        end if;
      end if;

      if v_status = 'ready' then
        profile_ids := array(
          select p.id from public.bd_profiles p where lower(trim(p.email)) = v_email
        );
        if cardinality(profile_ids) = 0 then
          v_status := 'error';
          v_code := 'unknown_email';
        elsif cardinality(profile_ids) > 1 then
          v_status := 'error';
          v_code := 'ambiguous_email';
        else
          select m.active, m.employed_from, m.employed_until, m.removed_at::date
            into v_active, v_from, v_until, v_removed
          from public.bd_company_members m
          where m.company_id = p_company_id and m.user_id = profile_ids[1];
          if not found then
            v_status := 'error';
            v_code := 'not_member';
          else
            v_employee := profile_ids[1];
            if v_active then
              v_end := v_until;
            else
              v_end := v_removed;
              if v_until is not null and (v_end is null or v_until < v_end) then
                v_end := v_until;
              end if;
            end if;
            if (v_from is not null and v_date < v_from) or (v_end is not null and v_date > v_end) then
              v_status := 'error';
              v_code := 'outside_employment';
              v_employee := null;
            end if;
          end if;
        end if;
      end if;

      if v_status = 'ready' then
        select l.company_id, l.entry_source, l.employee_corrected_at, l.voided_at
          into ex
        from public.bd_day_logs l
        where l.employee_user_id = v_employee and l.work_date = v_date;
        if found then
          if ex.company_id <> p_company_id then
            v_status := 'error';
            v_code := 'other_company';
          elsif ex.entry_source = 'hr' and ex.employee_corrected_at is null and ex.voided_at is null then
            v_status := 'skip';
            v_code := 'skipped_already_imported';
          else
            v_status := 'skip';
            v_code := 'skipped_employee';
          end if;
          v_employee := null;
        end if;
      end if;
    end if;

    insert into bd_import_work (idx, email, work_date, day_type, overnight, half, note, status, code, employee_id)
    values (rec.idx, v_email, v_date, v_type, v_overnight, v_half, nullif(v_note, ''), v_status, v_code, v_employee);
  end loop;

  update bd_import_work w
     set status = 'error',
         code = 'duplicate_in_file',
         employee_id = null
   where w.email <> ''
     and w.work_date is not null
     and exists (
       select 1 from bd_import_work o
       where o.idx <> w.idx and o.email = w.email and o.work_date = w.work_date
     );

  for rec in
    select * from bd_import_work where status = 'ready' order by idx
  loop
    begin
      insert into public.bd_day_logs (
        company_id, employee_user_id, work_date, day_type,
        overnight_away_for_work, day_share, note,
        entry_source, imported_by, imported_at, import_batch_id
      ) values (
        p_company_id, rec.employee_id, rec.work_date, rec.day_type::public.bd_day_type,
        coalesce(rec.overnight, false),
        case when rec.half then 0.5 else 1.0 end,
        rec.note,
        'hr', uid, now(), batch_id
      );
      update bd_import_work set status = 'imported', code = null where idx = rec.idx;
    exception when unique_violation then
      update bd_import_work
         set status = 'skip', code = 'skipped_employee', employee_id = null
       where idx = rec.idx;
    end;
  end loop;

  select
    count(*) filter (where status = 'imported'),
    count(*) filter (where status = 'skip'),
    count(*) filter (where status = 'error')
  into imported, skipped, errored
  from bd_import_work;

  update public.bd_day_import_batches
     set imported_count = imported,
         skipped_count = skipped,
         error_count = errored
   where id = batch_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'index', w.idx,
    'status', case w.status when 'imported' then 'imported' when 'skip' then 'skipped' else 'error' end,
    'code', w.code,
    'email', nullif(w.email, ''),
    'work_date', to_char(w.work_date, 'YYYY-MM-DD')
  ) order by w.idx), '[]'::jsonb)
  into rows_json
  from bd_import_work w;

  return jsonb_build_object(
    'batch_id', batch_id,
    'imported', imported,
    'skipped', skipped,
    'errors', errored,
    'rows', rows_json
  );
end;
$$;

revoke all on function public.bd_import_company_day_logs(uuid, jsonb) from public, anon;
grant execute on function public.bd_import_company_day_logs(uuid, jsonb) to authenticated, service_role;

comment on function public.bd_import_company_day_logs(uuid, jsonb) is
  'HR or owner imports historical days for members of one company. Does not overwrite an existing day. Marks new rows entry_source = hr.';

-- HR list gains provenance. Notes stay off this function. Return type changed, so drop first.
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
  corrected_at timestamptz,
  employee_label text,
  entry_source text,
  imported_at timestamptz,
  employee_confirmed_at timestamptz,
  employee_corrected_at timestamptz
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
             l.voided_at, l.prior_day_type, l.corrected_at, l.employee_label,
             l.entry_source, l.imported_at, l.employee_confirmed_at, l.employee_corrected_at
      from public.bd_day_logs l
      where l.company_id = cid
        and (employee is null or l.employee_user_id = employee)
      order by l.work_date desc, l.employee_user_id nulls last;
  elsif employee is null or employee = uid then
    return query
      select l.employee_user_id, l.work_date, l.day_type, l.overnight_away_for_work, l.day_share,
             l.voided_at, l.prior_day_type, l.corrected_at, l.employee_label,
             l.entry_source, l.imported_at, l.employee_confirmed_at, l.employee_corrected_at
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

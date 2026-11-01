-- AR3-03: account deletion must not wipe the employer's day logs or notice proof.
-- Detach those rows (nullable FK + label/email snapshot), then let the profile go.

alter table public.bd_day_logs
  add column if not exists employee_label text;

comment on column public.bd_day_logs.employee_label is
  'Display label kept when the employee account is deleted (AR3-03). Used by HR after employee_user_id is null.';

alter table public.bd_consents
  add column if not exists subject_email text,
  add column if not exists subject_label text;

comment on column public.bd_consents.subject_email is
  'Email snapshot kept when the account is deleted, as proof the notice was shown (AR3-03).';
comment on column public.bd_consents.subject_label is
  'Display-name snapshot kept with subject_email on account deletion.';

-- Allow detach.
alter table public.bd_day_logs alter column employee_user_id drop not null;
alter table public.bd_consents alter column user_id drop not null;

-- Re-point FKs: SET NULL instead of CASCADE for employer-held rows.
alter table public.bd_day_logs drop constraint if exists bd_day_logs_employee_user_id_fkey;
alter table public.bd_day_logs
  add constraint bd_day_logs_employee_user_id_fkey
  foreign key (employee_user_id) references public.bd_profiles (id) on delete set null;

alter table public.bd_consents drop constraint if exists bd_consents_user_id_fkey;
alter table public.bd_consents
  add constraint bd_consents_user_id_fkey
  foreign key (user_id) references public.bd_profiles (id) on delete set null;

-- Invites that name a deleted inviter must not block the delete.
alter table public.bd_invitations drop constraint if exists bd_invitations_invited_by_fkey;
alter table public.bd_invitations
  add constraint bd_invitations_invited_by_fkey
  foreign key (invited_by) references public.bd_profiles (id) on delete set null;

-- Stamp labels before the profile row disappears (SET NULL runs after this).
create or replace function public.bd_detach_employer_records_on_profile_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  label text;
begin
  label := nullif(trim(coalesce(old.display_name, '')), '');
  if label is null then
    label := nullif(trim(coalesce(old.email, '')), '');
  end if;
  if label is null then
    label := 'Deleted account';
  end if;

  update public.bd_day_logs
     set employee_label = coalesce(nullif(trim(employee_label), ''), label)
   where employee_user_id = old.id;

  update public.bd_consents
     set subject_email = coalesce(nullif(trim(subject_email), ''), nullif(trim(old.email), '')),
         subject_label = coalesce(nullif(trim(subject_label), ''), label)
   where user_id = old.id;

  return old;
end;
$$;

drop trigger if exists bd_profiles_detach_employer_records on public.bd_profiles;
create trigger bd_profiles_detach_employer_records
  before delete on public.bd_profiles
  for each row execute function public.bd_detach_employer_records_on_profile_delete();

-- HR list includes detached rows (null employee_user_id) with the kept label.
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
  employee_label text
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
             l.voided_at, l.prior_day_type, l.corrected_at, l.employee_label
      from public.bd_day_logs l
      where l.company_id = cid
        and (employee is null or l.employee_user_id = employee)
      order by l.work_date desc, l.employee_user_id nulls last;
  elsif employee is null or employee = uid then
    return query
      select l.employee_user_id, l.work_date, l.day_type, l.overnight_away_for_work, l.day_share,
             l.voided_at, l.prior_day_type, l.corrected_at, l.employee_label
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

-- HR can still list notice proof for the company after the subject account is gone.
drop policy if exists bd_consents_select on public.bd_consents;
create policy bd_consents_select on public.bd_consents for select using (
  user_id = auth.uid()
  or public.bd_is_hr_or_owner(company_id)
);

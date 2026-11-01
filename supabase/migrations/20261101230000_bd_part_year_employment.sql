-- A3-R2: DE–CH protocol point 5(g) part-year cut (5×months + 1×weeks).
alter table public.bd_company_members
  add column if not exists employment_full_months int
  check (employment_full_months is null or employment_full_months between 0 and 12),
  add column if not exists employment_full_weeks int
  check (employment_full_weeks is null or employment_full_weeks between 0 and 51);

grant update (employment_full_months, employment_full_weeks) on public.bd_company_members to authenticated;

create or replace function public.bd_update_member_part_year(
  p_company_id uuid,
  p_employment_full_months int,
  p_employment_full_weeks int
)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not authenticated'; end if;
  update public.bd_company_members
    set employment_full_months = p_employment_full_months,
        employment_full_weeks = p_employment_full_weeks
    where company_id = p_company_id and user_id = uid and active;
  if not found then raise exception 'not a member of this company' using errcode = '42501'; end if;
end;
$$;

revoke all on function public.bd_update_member_part_year(uuid, int, int) from public, anon;
grant execute on function public.bd_update_member_part_year(uuid, int, int) to authenticated, service_role;

comment on column public.bd_company_members.employment_full_months is
  'Full months of employment in the calendar year for DE–CH protocol point 5(g).';
comment on column public.bd_company_members.employment_full_weeks is
  'Extra full weeks beyond employment_full_months for DE–CH protocol point 5(g).';

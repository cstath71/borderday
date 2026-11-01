-- audit-2 H3: KonsVerCHEV §9(2) cuts the Germany–Switzerland 60 days by contract days, not by
-- employment %. Additive: the column, an HR column grant, and a new self-service RPC, so the existing
-- bd_update_member_profile keeps its signature while the site deploys.

alter table public.bd_company_members
  add column if not exists contract_days_per_year int
  check (contract_days_per_year is null or contract_days_per_year between 1 and 366);

-- RLS on bd_members_update decides which rows; this only adds the column to what HR may write.
grant update (contract_days_per_year) on public.bd_company_members to authenticated;

create or replace function public.bd_update_member_contract_days(
  p_company_id uuid,
  p_contract_days_per_year int
)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not authenticated'; end if;
  update public.bd_company_members
    set contract_days_per_year = p_contract_days_per_year
    where company_id = p_company_id and user_id = uid and active;
  if not found then raise exception 'not a member of this company' using errcode = '42501'; end if;
end;
$$;

revoke all on function public.bd_update_member_contract_days(uuid, int) from public, anon;
grant execute on function public.bd_update_member_contract_days(uuid, int) to authenticated, service_role;

comment on column public.bd_company_members.contract_days_per_year is
  'Working days per year in the contract, for staff working only on certain days. Germany–Switzerland only (KonsVerCHEV §9(2)).';

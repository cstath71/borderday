-- FR→BE legacy: frontier worker before 1 Jan 2012 (optional 30-day border-zone counter until 2033).
-- Additive column; replace profile RPC to accept the new flag. Frontend keeps working before and after.

alter table public.bd_company_members
  add column if not exists frontier_before_2012 boolean not null default false;

grant update (employment_percent, a1_in_place, a1_valid_until, frontier_before_2012)
  on public.bd_company_members to authenticated;

-- New parameter changes the signature: drop the previous 4-arg function first.
drop function if exists public.bd_update_member_profile(uuid, int, boolean, date);

create or replace function public.bd_update_member_profile(
  p_company_id uuid,
  p_employment_percent int,
  p_a1_in_place boolean,
  p_a1_valid_until date,
  p_frontier_before_2012 boolean default false
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
        a1_valid_until = p_a1_valid_until,
        frontier_before_2012 = coalesce(p_frontier_before_2012, false)
    where company_id = p_company_id and user_id = uid and active;
  if not found then raise exception 'not a member of this company' using errcode = '42501'; end if;
end;
$$;

revoke all on function public.bd_update_member_profile(uuid, int, boolean, date, boolean) from public, anon;
grant execute on function public.bd_update_member_profile(uuid, int, boolean, date, boolean) to authenticated, service_role;

comment on column public.bd_company_members.frontier_before_2012 is
  'FR→BE: was a frontier worker before 1 Jan 2012 (optional 30-day regime until 2033).';

-- A2-02 / AR3-18 / AR3-30: HR viewers may not remove, reactivate or change roles.
-- Profile-column updates by HR stay allowed; role/active mutations are owner-only.
-- Trigger runs as INVOKER so current_user stays authenticated and auth.uid() is the actor.
-- SECURITY DEFINER RPCs (bd_accept_invite) still bypass: their DML runs as the function
-- owner, so current_user <> 'authenticated' and we return early.

create or replace function public.bd_members_block_hr_role_active()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  actor_role public.bd_company_role;
begin
  -- Cascades / service_role (no JWT) and SECURITY DEFINER RPC DML (current_user ≠ authenticated).
  if auth.uid() is null or current_user <> 'authenticated' then
    return new;
  end if;
  if new.role is not distinct from old.role and new.active is not distinct from old.active then
    return new;
  end if;
  select m.role into actor_role
  from public.bd_company_members m
  where m.company_id = old.company_id and m.user_id = auth.uid() and m.active;
  if actor_role is distinct from 'owner' then
    raise exception 'only an owner may change role or active' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists bd_members_block_hr_role_active on public.bd_company_members;
create trigger bd_members_block_hr_role_active
  before update on public.bd_company_members
  for each row execute function public.bd_members_block_hr_role_active();

comment on function public.bd_members_block_hr_role_active() is
  'A2-02: HR viewers keep profile edits; only owners flip role or active (remove/reactivate/promote). SECURITY DEFINER RPCs bypass via current_user.';

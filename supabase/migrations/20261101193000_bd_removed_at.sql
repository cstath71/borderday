-- F32: stamp when a member was soft-deactivated so HR can show former employees with retained day logs.
alter table public.bd_company_members
  add column if not exists removed_at timestamptz;

comment on column public.bd_company_members.removed_at is
  'Set when active becomes false (soft-deactivate). Day logs are retained under company retention; never deleted on remove.';

-- Keep removed_at in sync with active flips (including older rows that only set active).
create or replace function public.bd_company_members_removed_at()
returns trigger
language plpgsql
as $$
begin
  if new.active is false and (tg_op = 'INSERT' or old.active is distinct from false) then
    new.removed_at := coalesce(new.removed_at, now());
  elsif new.active is true then
    new.removed_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists bd_company_members_removed_at on public.bd_company_members;
create trigger bd_company_members_removed_at
  before insert or update of active, removed_at on public.bd_company_members
  for each row execute function public.bd_company_members_removed_at();

-- Backfill existing inactive members.
update public.bd_company_members
set removed_at = coalesce(removed_at, joined_at, now())
where active is false and removed_at is null;

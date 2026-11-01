-- DO NOT APPLY THIS FILE TO A DATABASE THAT HAS BORDERDAY TABLES (audit-2 A3-32).
-- This is the old non-prefixed schema, never deployed. The live schema starts at 20261031140000 (bd_*).
-- A later `supabase db push` would add unused tables and a policy exposing every pending invite.
-- The guard below stops that with a rollback. Mark it as applied instead:
--   supabase migration repair --status applied 20261031120000
-- Fresh local databases still run it, so the migration chain and the tests are unchanged.
do $guard$
begin
  if to_regclass('public.bd_companies') is not null then
    raise exception 'Legacy migration 20261031120000 must not run here. Run: supabase migration repair --status applied 20261031120000';
  end if;
end
$guard$;

-- BorderDay employer-first schema (GDPR / Swiss nLPD oriented)
-- Designed for Supabase EU. Apply with: supabase db reset (local) or db push (approved cloud only).
-- No GPS / location columns by design. Day types + dates + counts only.

create extension if not exists "pgcrypto";

-- Roles stored on membership (not user_metadata — see Supabase security checklist).
create type public.company_role as enum ('owner', 'hr_viewer', 'employee');
create type public.day_type as enum ('telework', 'onsite', 'third_country', 'non_working');
create type public.invite_status as enum ('pending', 'accepted', 'revoked', 'expired');

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  data_retention_months int not null default 24
    check (data_retention_months between 1 and 120)
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now()
);

create table public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.company_role not null,
  border_pack_id text, -- employee chooses; null until set
  annual_working_days int check (annual_working_days is null or (annual_working_days between 1 and 366)),
  joined_at timestamptz not null default now(),
  unique (company_id, user_id)
);

create index company_members_company_idx on public.company_members (company_id);
create index company_members_user_idx on public.company_members (user_id);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  email text not null,
  role public.company_role not null default 'employee',
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  status public.invite_status not null default 'pending',
  invited_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '14 days')
);

create index invitations_token_idx on public.invitations (token);
create index invitations_company_idx on public.invitations (company_id);

-- Day logs: type + date only. NEVER location / GPS / IP geolocation.
create table public.day_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  employee_user_id uuid not null references public.profiles (id) on delete cascade,
  work_date date not null,
  day_type public.day_type not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_user_id, work_date)
);

create index day_logs_company_idx on public.day_logs (company_id);
create index day_logs_employee_idx on public.day_logs (employee_user_id, work_date);

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  consent_version text not null,
  text_lang text not null check (text_lang in ('en', 'fr', 'de', 'it')),
  accepted_at timestamptz not null default now(),
  unique (user_id, company_id, consent_version)
);

-- Helpers (security definer in private schema pattern — keep in public for local simplicity,
-- but policies use them carefully; cloud deploy should move to private schema).
create or replace function public.is_company_member(cid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.company_members m
    where m.company_id = cid and m.user_id = auth.uid()
  );
$$;

create or replace function public.member_role(cid uuid)
returns public.company_role
language sql
stable
security definer
set search_path = public
as $$
  select m.role from public.company_members m
  where m.company_id = cid and m.user_id = auth.uid()
  limit 1;
$$;

create or replace function public.is_hr_or_owner(cid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.company_members m
    where m.company_id = cid
      and m.user_id = auth.uid()
      and m.role in ('owner', 'hr_viewer')
  );
$$;

alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.company_members enable row level security;
alter table public.invitations enable row level security;
alter table public.day_logs enable row level security;
alter table public.consents enable row level security;

-- profiles
create policy profiles_select_self on public.profiles
  for select using (id = auth.uid() or exists (
    select 1 from public.company_members me
    join public.company_members them on them.company_id = me.company_id
    where me.user_id = auth.uid() and them.user_id = profiles.id
      and me.role in ('owner', 'hr_viewer')
  ));
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid());
create policy profiles_insert_self on public.profiles
  for insert with check (id = auth.uid());

-- companies
create policy companies_select_member on public.companies
  for select using (public.is_company_member(id));
create policy companies_update_owner on public.companies
  for update using (public.member_role(id) = 'owner');
-- insert via edge/service or after signup RPC; allow authenticated create then self-add as owner in same txn
create policy companies_insert_authenticated on public.companies
  for insert with check (auth.uid() is not null);

-- company_members
create policy members_select_same_company on public.company_members
  for select using (
    user_id = auth.uid()
    or public.is_hr_or_owner(company_id)
  );
create policy members_insert_hr on public.company_members
  for insert with check (
    public.is_hr_or_owner(company_id)
    or (user_id = auth.uid() and role = 'owner') -- bootstrap: creator adds self as owner
  );
create policy members_update_hr on public.company_members
  for update using (
    public.is_hr_or_owner(company_id)
    or user_id = auth.uid() -- employee may set own border_pack / annual days
  );
create policy members_delete_owner on public.company_members
  for delete using (public.member_role(company_id) = 'owner');

-- invitations
create policy invites_select_hr on public.invitations
  for select using (
    public.is_hr_or_owner(company_id)
    or (status = 'pending' and expires_at > now()) -- token holders validated in app by token lookup RPC
  );
create policy invites_insert_hr on public.invitations
  for insert with check (public.is_hr_or_owner(company_id));
create policy invites_update_hr on public.invitations
  for update using (public.is_hr_or_owner(company_id));

-- day_logs: employee full access to own rows; HR/owner SELECT only (no location column exists)
create policy day_logs_select on public.day_logs
  for select using (
    employee_user_id = auth.uid()
    or public.is_hr_or_owner(company_id)
  );
create policy day_logs_insert_self on public.day_logs
  for insert with check (
    employee_user_id = auth.uid()
    and public.is_company_member(company_id)
  );
create policy day_logs_update_self on public.day_logs
  for update using (employee_user_id = auth.uid());
create policy day_logs_delete_self on public.day_logs
  for delete using (employee_user_id = auth.uid());

-- consents
create policy consents_select on public.consents
  for select using (
    user_id = auth.uid() or public.is_hr_or_owner(company_id)
  );
create policy consents_insert_self on public.consents
  for insert with check (user_id = auth.uid());

comment on table public.day_logs is
  'Workday classification only. No GPS, IP geolocation, or address fields. HR sees day_type + work_date.';
comment on column public.companies.data_retention_months is
  'Default retention window for day logs (months). Documented in privacy notice.';

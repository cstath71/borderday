-- BorderDay employer-first schema on shared fig-mail (EU). All objects prefixed bd_.
-- No GPS / location columns. Day types + dates + counts only.

create extension if not exists "pgcrypto";

do $$ begin
  create type public.bd_company_role as enum ('owner', 'hr_viewer', 'employee');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.bd_day_type as enum ('telework', 'onsite', 'third_country', 'non_working');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.bd_invite_status as enum ('pending', 'accepted', 'revoked', 'expired');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.bd_sub_status as enum ('none', 'trialing', 'active', 'past_due', 'canceled', 'incomplete');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.bd_plan_kind as enum ('company', 'individual');
exception when duplicate_object then null; end $$;

create table if not exists public.bd_companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  data_retention_months int not null default 24
    check (data_retention_months between 1 and 120),
  stripe_customer_id text unique,
  subscription_status public.bd_sub_status not null default 'none',
  plan_kind public.bd_plan_kind not null default 'company',
  seat_count int not null default 0 check (seat_count >= 0),
  current_period_end timestamptz,
  trial_ends_at timestamptz
);

create table if not exists public.bd_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.bd_company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.bd_companies (id) on delete cascade,
  user_id uuid not null references public.bd_profiles (id) on delete cascade,
  role public.bd_company_role not null,
  border_pack_id text,
  annual_working_days int check (annual_working_days is null or (annual_working_days between 1 and 366)),
  active boolean not null default true,
  joined_at timestamptz not null default now(),
  unique (company_id, user_id)
);

create index if not exists bd_company_members_company_idx on public.bd_company_members (company_id);
create index if not exists bd_company_members_user_idx on public.bd_company_members (user_id);

create table if not exists public.bd_invitations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.bd_companies (id) on delete cascade,
  email text not null,
  role public.bd_company_role not null default 'employee',
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  status public.bd_invite_status not null default 'pending',
  invited_by uuid references public.bd_profiles (id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '14 days')
);

create index if not exists bd_invitations_token_idx on public.bd_invitations (token);
create index if not exists bd_invitations_company_idx on public.bd_invitations (company_id);

create table if not exists public.bd_day_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.bd_companies (id) on delete cascade,
  employee_user_id uuid not null references public.bd_profiles (id) on delete cascade,
  work_date date not null,
  day_type public.bd_day_type not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_user_id, work_date)
);

create index if not exists bd_day_logs_company_idx on public.bd_day_logs (company_id);
create index if not exists bd_day_logs_employee_idx on public.bd_day_logs (employee_user_id, work_date);

create table if not exists public.bd_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.bd_profiles (id) on delete cascade,
  company_id uuid not null references public.bd_companies (id) on delete cascade,
  consent_version text not null,
  text_lang text not null check (text_lang in ('en', 'fr', 'de', 'it')),
  accepted_at timestamptz not null default now(),
  unique (user_id, company_id, consent_version)
);

-- Individual (non-company) day logs for personal plan — same no-GPS rule
create table if not exists public.bd_personal_day_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.bd_profiles (id) on delete cascade,
  work_date date not null,
  day_type public.bd_day_type not null,
  note text,
  border_pack_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, work_date)
);

create table if not exists public.bd_subscriptions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.bd_companies (id) on delete cascade,
  user_id uuid references public.bd_profiles (id) on delete cascade,
  plan_kind public.bd_plan_kind not null,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status public.bd_sub_status not null default 'none',
  seat_quantity int not null default 1,
  price_id text,
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  updated_at timestamptz not null default now(),
  check (
    (plan_kind = 'company' and company_id is not null)
    or (plan_kind = 'individual' and user_id is not null)
  )
);

create index if not exists bd_subscriptions_company_idx on public.bd_subscriptions (company_id);
create index if not exists bd_subscriptions_user_idx on public.bd_subscriptions (user_id);

create or replace function public.bd_is_company_member(cid uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.bd_company_members m
    where m.company_id = cid and m.user_id = auth.uid() and m.active
  );
$$;

create or replace function public.bd_member_role(cid uuid)
returns public.bd_company_role
language sql stable security definer set search_path = public
as $$
  select m.role from public.bd_company_members m
  where m.company_id = cid and m.user_id = auth.uid() and m.active
  limit 1;
$$;

create or replace function public.bd_is_hr_or_owner(cid uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.bd_company_members m
    where m.company_id = cid
      and m.user_id = auth.uid()
      and m.active
      and m.role in ('owner', 'hr_viewer')
  );
$$;

create or replace function public.bd_active_seat_count(cid uuid)
returns int
language sql stable security definer set search_path = public
as $$
  select count(*)::int from public.bd_company_members m
  where m.company_id = cid and m.active and m.role = 'employee';
$$;

-- Sync company.seat_count from active employees
create or replace function public.bd_sync_seat_count()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  cid uuid;
begin
  cid := coalesce(new.company_id, old.company_id);
  update public.bd_companies c
    set seat_count = public.bd_active_seat_count(cid)
    where c.id = cid;
  return coalesce(new, old);
end;
$$;

drop trigger if exists bd_members_seat_sync on public.bd_company_members;
create trigger bd_members_seat_sync
  after insert or update or delete on public.bd_company_members
  for each row execute function public.bd_sync_seat_count();

-- Auto-create profile on signup
create or replace function public.bd_handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.bd_profiles (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email,''), '@', 1))
  )
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists bd_on_auth_user_created on auth.users;
create trigger bd_on_auth_user_created
  after insert on auth.users
  for each row execute function public.bd_handle_new_user();

-- Invite lookup by token (no open select of all pending invites)
create or replace function public.bd_get_invite_by_token(invite_token text)
returns table (
  id uuid,
  company_id uuid,
  company_name text,
  email text,
  role public.bd_company_role,
  status public.bd_invite_status,
  expires_at timestamptz
)
language sql stable security definer set search_path = public
as $$
  select i.id, i.company_id, c.name, i.email, i.role, i.status, i.expires_at
  from public.bd_invitations i
  join public.bd_companies c on c.id = i.company_id
  where i.token = invite_token
  limit 1;
$$;

create or replace function public.bd_accept_invite(invite_token text, consent_version text, text_lang text)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  inv public.bd_invitations%rowtype;
  uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not authenticated'; end if;
  select * into inv from public.bd_invitations
    where token = invite_token and status = 'pending' and expires_at > now();
  if not found then raise exception 'invite not found or expired'; end if;

  insert into public.bd_company_members (company_id, user_id, role)
  values (inv.company_id, uid, inv.role)
  on conflict (company_id, user_id) do update set role = excluded.role, active = true;

  insert into public.bd_consents (user_id, company_id, consent_version, text_lang)
  values (uid, inv.company_id, consent_version, text_lang)
  on conflict (user_id, company_id, consent_version) do nothing;

  update public.bd_invitations set status = 'accepted' where id = inv.id;
  return inv.company_id;
end;
$$;

create or replace function public.bd_create_company(company_name text)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
  cid uuid;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  insert into public.bd_companies (name) values (company_name) returning id into cid;
  insert into public.bd_company_members (company_id, user_id, role)
  values (cid, uid, 'owner');
  return cid;
end;
$$;

alter table public.bd_companies enable row level security;
alter table public.bd_profiles enable row level security;
alter table public.bd_company_members enable row level security;
alter table public.bd_invitations enable row level security;
alter table public.bd_day_logs enable row level security;
alter table public.bd_consents enable row level security;
alter table public.bd_personal_day_logs enable row level security;
alter table public.bd_subscriptions enable row level security;

-- Drop old policies if re-applying
do $$ declare r record; begin
  for r in select policyname, tablename from pg_policies where schemaname='public' and tablename like 'bd_%'
  loop execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename); end loop;
end $$;

create policy bd_profiles_select on public.bd_profiles for select using (
  id = auth.uid() or exists (
    select 1 from public.bd_company_members me
    join public.bd_company_members them on them.company_id = me.company_id
    where me.user_id = auth.uid() and them.user_id = bd_profiles.id
      and me.role in ('owner', 'hr_viewer') and me.active
  )
);
create policy bd_profiles_update on public.bd_profiles for update using (id = auth.uid());
create policy bd_profiles_insert on public.bd_profiles for insert with check (id = auth.uid());

create policy bd_companies_select on public.bd_companies for select using (public.bd_is_company_member(id));
create policy bd_companies_update on public.bd_companies for update using (public.bd_member_role(id) = 'owner');

create policy bd_members_select on public.bd_company_members for select using (
  user_id = auth.uid() or public.bd_is_hr_or_owner(company_id)
);
create policy bd_members_insert on public.bd_company_members for insert with check (
  public.bd_is_hr_or_owner(company_id) or (user_id = auth.uid() and role = 'owner')
);
create policy bd_members_update on public.bd_company_members for update using (
  public.bd_is_hr_or_owner(company_id) or user_id = auth.uid()
);
create policy bd_members_delete on public.bd_company_members for delete using (public.bd_member_role(company_id) = 'owner');

create policy bd_invites_select on public.bd_invitations for select using (public.bd_is_hr_or_owner(company_id));
create policy bd_invites_insert on public.bd_invitations for insert with check (public.bd_is_hr_or_owner(company_id));
create policy bd_invites_update on public.bd_invitations for update using (public.bd_is_hr_or_owner(company_id));

create policy bd_day_logs_select on public.bd_day_logs for select using (
  employee_user_id = auth.uid() or public.bd_is_hr_or_owner(company_id)
);
create policy bd_day_logs_insert on public.bd_day_logs for insert with check (
  employee_user_id = auth.uid() and public.bd_is_company_member(company_id)
);
create policy bd_day_logs_update on public.bd_day_logs for update using (employee_user_id = auth.uid());
create policy bd_day_logs_delete on public.bd_day_logs for delete using (employee_user_id = auth.uid());

create policy bd_consents_select on public.bd_consents for select using (
  user_id = auth.uid() or public.bd_is_hr_or_owner(company_id)
);
create policy bd_consents_insert on public.bd_consents for insert with check (user_id = auth.uid());

create policy bd_personal_select on public.bd_personal_day_logs for select using (user_id = auth.uid());
create policy bd_personal_insert on public.bd_personal_day_logs for insert with check (user_id = auth.uid());
create policy bd_personal_update on public.bd_personal_day_logs for update using (user_id = auth.uid());
create policy bd_personal_delete on public.bd_personal_day_logs for delete using (user_id = auth.uid());

create policy bd_subs_select_company on public.bd_subscriptions for select using (
  (company_id is not null and public.bd_is_hr_or_owner(company_id))
  or (user_id is not null and user_id = auth.uid())
);

comment on table public.bd_day_logs is
  'Workday classification only. No GPS, IP geolocation, or address fields.';
comment on table public.bd_companies is
  'Employer tenant. Stripe fields updated by bd-stripe-webhook edge function (service role).';

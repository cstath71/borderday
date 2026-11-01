-- audit-2 A3-13: the DPA says creating a company account accepts it, but nothing recorded which text
-- was in force. This stores the version, the server time and who created the company.
-- Whether this formation route is enough is a question for a lawyer: this only keeps the evidence.
-- Companies created before this migration stay null: nothing is backfilled.

alter table public.bd_companies
  add column if not exists dpa_accepted_version text
    check (dpa_accepted_version is null or dpa_accepted_version ~ '^\d{4}-\d{2}-\d{2}$'),
  add column if not exists dpa_accepted_at timestamptz,
  add column if not exists dpa_accepted_by uuid references auth.users (id) on delete set null;

-- bd_companies uses column grants, so clients can neither read nor set these.

-- A separate function, so bd_create_company keeps its signature during deployment.
create or replace function public.bd_create_company_with_dpa(company_name text, dpa_version text)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  cid uuid;
begin
  if dpa_version is null or dpa_version !~ '^\d{4}-\d{2}-\d{2}$' then
    raise exception 'dpa version required';
  end if;
  cid := public.bd_create_company(company_name);
  update public.bd_companies
  set dpa_accepted_version = dpa_version, dpa_accepted_at = now(), dpa_accepted_by = auth.uid()
  where id = cid;
  return cid;
end;
$$;

revoke all on function public.bd_create_company_with_dpa(text, text) from public, anon;
grant execute on function public.bd_create_company_with_dpa(text, text) to authenticated, service_role;

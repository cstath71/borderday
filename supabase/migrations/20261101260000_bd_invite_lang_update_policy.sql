-- Allow HR to refresh lang on a still-pending invite (reuse / re-send with a different locale).
-- Status-only revoke/expire stays valid; pending rows may update lang only (column grant limits writes).
drop policy if exists bd_invites_update on public.bd_invitations;
create policy bd_invites_update on public.bd_invitations for update
  using (
    public.bd_member_role(company_id) = 'owner'
    or (public.bd_is_hr_or_owner(company_id) and role <> 'owner')
  )
  with check (
    status in ('revoked', 'expired')
    or (status = 'pending' and lang in ('en', 'fr', 'de', 'it', 'nl'))
  );

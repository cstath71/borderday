-- Fix AR3 invite revive hole from 20261101260000: WITH CHECK allowed status='pending'
-- on any row, so a revoked invite could be set back to pending. Restrict USING to
-- pending rows only (lang refresh or revoke/expire). Accepted/revoked/expired cannot
-- be updated by clients.
drop policy if exists bd_invites_update on public.bd_invitations;
create policy bd_invites_update on public.bd_invitations for update
  using (
    status = 'pending'
    and (
      public.bd_member_role(company_id) = 'owner'
      or (public.bd_is_hr_or_owner(company_id) and role <> 'owner')
    )
  )
  with check (
    status in ('revoked', 'expired')
    or (status = 'pending' and lang in ('en', 'fr', 'de', 'it', 'nl'))
  );

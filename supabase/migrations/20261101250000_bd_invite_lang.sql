-- A2-06: store the invite's UI language so resend/email use the invitee's language, not HR's current UI lang.
alter table public.bd_invitations
  add column if not exists lang text not null default 'en';

alter table public.bd_invitations
  drop constraint if exists bd_invitations_lang_check;
alter table public.bd_invitations
  add constraint bd_invitations_lang_check
  check (lang in ('en', 'fr', 'de', 'it', 'nl'));

-- Allow authenticated insert of lang with the other invite columns.
grant insert (company_id, email, role, invited_by, lang) on public.bd_invitations to authenticated;

grant update (status, lang) on public.bd_invitations to authenticated;

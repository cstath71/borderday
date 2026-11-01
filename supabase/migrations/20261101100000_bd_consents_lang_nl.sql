-- A3-02: Dutch invites could not be accepted. Join passes the page language to bd_accept_invite,
-- and 'nl' failed bd_consents_text_lang_check, rolling back the whole accept.
-- Only widens the allowed set, so every existing row still passes.
-- public.consents (20261031120000) has the same check but is an unused table that is not deployed,
-- so it is left alone: altering it here would fail on production.
alter table public.bd_consents drop constraint if exists bd_consents_text_lang_check;
alter table public.bd_consents
  add constraint bd_consents_text_lang_check check (text_lang in ('en', 'fr', 'de', 'it', 'nl'));

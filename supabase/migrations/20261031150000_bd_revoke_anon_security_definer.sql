-- BorderDay: tighten EXECUTE on SECURITY DEFINER functions (advisor WARN).
-- Keep intentional RPCs for authenticated; invite lookup stays anon (pre-login).

REVOKE ALL ON FUNCTION public.bd_handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.bd_handle_new_user() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bd_handle_new_user() TO postgres, service_role;

REVOKE ALL ON FUNCTION public.bd_sync_seat_count() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.bd_sync_seat_count() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bd_sync_seat_count() TO postgres, service_role;

REVOKE ALL ON FUNCTION public.bd_is_company_member(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.bd_is_company_member(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.bd_is_company_member(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.bd_is_hr_or_owner(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.bd_is_hr_or_owner(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.bd_is_hr_or_owner(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.bd_member_role(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.bd_member_role(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.bd_member_role(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.bd_active_seat_count(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.bd_active_seat_count(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.bd_active_seat_count(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.bd_create_company(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.bd_create_company(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.bd_create_company(text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.bd_accept_invite(text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.bd_accept_invite(text, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.bd_accept_invite(text, text, text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.bd_get_invite_by_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bd_get_invite_by_token(text) TO anon, authenticated, service_role;

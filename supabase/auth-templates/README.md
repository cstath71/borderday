# Auth email templates (F23)

Preferred path: enable the **Send Email Hook** pointing at edge function `bd-auth-send-email`
(with `SEND_EMAIL_HOOK_SECRET` matching the dashboard hook secret, and Resend keys already on the project).
That sends confirmation / magic-link / recovery / email-change / reauth mail in EN/FR/DE/IT/NL
from `user_metadata.lang` (set at signup) or the `/fr/`-style path in `redirect_to`.

Fallback without the hook: paste the `*.html` / `*.subject.txt` files into
Authentication → Email Templates in the Supabase dashboard (Go templates branch on `.Data.lang`).
Subjects that use Go `if` may need the hook for full locale subjects on every mailer.

# Google OAuth for BorderDay (Gus must create)

Auth is **email + Google only** (no Apple). App callback path: `/auth/callback`.

## 1. Google Cloud Console

1. Open https://console.cloud.google.com/ → select or create a project (e.g. `BorderDay`).
2. APIs & Services → **OAuth consent screen**
   - User type: **External**
   - App name: `BorderDay`
   - User support email: your Google account email
   - Authorized domains: `borderday.com`, `supabase.co`
   - Developer contact: your email
   - Scopes: `openid`, `email`, `profile` (default)
   - Test users: add yourself while in Testing
3. APIs & Services → **Credentials** → Create credentials → **OAuth client ID**
   - Application type: **Web application**
   - Name: `BorderDay web`
   - **Authorized JavaScript origins** (exact):
     - `https://borderday.com`
     - `https://www.borderday.com` (if you use www)
     - `https://uufmlmwgvoqhhtqgrclu.supabase.co`
     - `http://localhost:5173` (local Vite)
   - **Authorized redirect URIs** (exact — this is the critical one):
     - `https://uufmlmwgvoqhhtqgrclu.supabase.co/auth/v1/callback`
   - Copy **Client ID** and **Client secret**.

Do **not** put the Google client secret in the GitHub repo. It goes only in Supabase Dashboard.

## 2. Supabase Dashboard (fig-mail project `uufmlmwgvoqhhtqgrclu`)

1. Authentication → **URL Configuration**
   - Site URL: `https://borderday.com`
   - Redirect URLs (allow list):
     - `https://borderday.com/**`
     - `https://borderday.com/auth/callback`
     - `https://www.borderday.com/**`
     - `https://www.borderday.com/auth/callback`
     - `http://localhost:5173/**`
     - `http://localhost:5173/auth/callback`
2. Authentication → **Providers** → **Google** → Enable
   - Client ID: paste from Google
   - Client Secret: paste from Google
3. Authentication → **Providers** → **Email** → Enable
   - Confirm email: on (recommended)
   - Magic link: on

After that, Sign in with Google and magic-link/password email work end-to-end.

## 3. What the app already does

- `signInWithOAuth({ provider: 'google', options: { redirectTo: origin + '/auth/callback' } })`
- PKCE flow; `/auth/callback` route exchanges the code for a session
- Until Google is enabled, the UI shows a “Google not ready” hint (no crash)

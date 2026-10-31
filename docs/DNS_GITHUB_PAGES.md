# DNS for borderday.com → GitHub Pages

GitHub Pages is enabled with custom domain `borderday.com` (CNAME file in repo).
GoDaddy MCP cannot edit DNS — set these in GoDaddy DNS for `borderday.com`:

## Apex (borderday.com)

Type A, name `@`, TTL 600, values (all four):
- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

## www

Type CNAME, name `www`, value `cstath71.github.io.`

After DNS propagates, in GitHub → Settings → Pages: verify domain and turn on **Enforce HTTPS**.

Until DNS points here, `https://cstath71.github.io/borderday/` redirects to `borderday.com` (because of the CNAME) and will fail if the apex is not yet on GitHub.

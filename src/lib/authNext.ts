const KEY = 'bd-auth-next';

/** Only same-origin paths: `//host` and `/\host` would navigate off the site. */
export function safeNext(raw: string | null | undefined, fallback: string): string {
  if (raw && /^\/(?![/\\])/.test(raw)) return raw;
  return fallback;
}

/** Magic links and OAuth leave the page and return via /auth/callback, so keep `next` across that. */
export function rememberNext(next: string | null): void {
  if (!next || typeof localStorage === 'undefined') return;
  localStorage.setItem(KEY, next);
}

export function takeRememberedNext(): string | null {
  if (typeof localStorage === 'undefined') return null;
  const value = localStorage.getItem(KEY);
  localStorage.removeItem(KEY);
  return value;
}

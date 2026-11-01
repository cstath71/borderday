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

/** Reading does not clear it: a callback effect can run twice, and the second run must find the same value. */
export function peekRememberedNext(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(KEY);
}

export function forgetRememberedNext(): void {
  if (typeof localStorage !== 'undefined') localStorage.removeItem(KEY);
}

export function takeRememberedNext(): string | null {
  const value = peekRememberedNext();
  forgetRememberedNext();
  return value;
}

/** The page after sign-in when nothing asked for a specific one. */
export function defaultAuthDestination(lang: string): string {
  return `/${lang}/account`;
}

/** The URL's own next wins, as it survives a change of device. The language comes from the URL or from next. */
export function callbackDestination(opts: { urlNext: string | null; remembered: string | null; lang: string | null }): string {
  const fromNext = /^\/(en|fr|de|it|nl)(\/|$)/.exec(opts.urlNext ?? opts.remembered ?? '')?.[1];
  const fallback = defaultAuthDestination(opts.lang ?? fromNext ?? 'en');
  return safeNext(opts.urlNext, safeNext(opts.remembered, fallback));
}

// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { authCallbackUrl } from '../src/lib/supabase';
import { callbackDestination, defaultAuthDestination, forgetRememberedNext, peekRememberedNext, rememberNext } from '../src/lib/authNext';

describe('E14: auth callback URL', () => {
  it('carries language and next, encoded', () => {
    expect(authCallbackUrl('fr', '/fr/join/tok')).toBe(`${window.location.origin}/fr/auth/callback?next=%2Ffr%2Fjoin%2Ftok`);
  });
  it('still works bare', () => {
    expect(authCallbackUrl()).toBe(`${window.location.origin}/auth/callback`);
  });
});

describe('E2: where sign-in lands', () => {
  beforeEach(() => localStorage.clear());

  it('with nothing asked for, the account page rather than company signup', () => {
    expect(defaultAuthDestination('en')).toBe('/en/account');
    expect(callbackDestination({ urlNext: null, remembered: null, lang: 'fr' })).toBe('/fr/account');
  });
  it('next in the URL wins over this browser’s memory', () => {
    expect(callbackDestination({ urlNext: '/en/join/a', remembered: '/en/account', lang: 'en' })).toBe('/en/join/a');
  });
  it('falls back to the remembered page, for a provider that drops the query', () => {
    expect(callbackDestination({ urlNext: null, remembered: '/de/join/a', lang: null })).toBe('/de/join/a');
  });
  it('an unsafe next goes nowhere, and an unprefixed callback takes the language from next', () => {
    expect(callbackDestination({ urlNext: '//evil.example', remembered: null, lang: 'en' })).toBe('/en/account');
    expect(callbackDestination({ urlNext: '/it/app', remembered: null, lang: null })).toBe('/it/app');
    expect(callbackDestination({ urlNext: null, remembered: null, lang: null })).toBe('/en/account');
  });
  it('reading does not consume it, so a second effect run lands in the same place', () => {
    rememberNext('/en/account');
    expect(peekRememberedNext()).toBe('/en/account');
    expect(peekRememberedNext()).toBe('/en/account');
    forgetRememberedNext();
    expect(peekRememberedNext()).toBeNull();
  });
});

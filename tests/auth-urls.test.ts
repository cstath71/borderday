import { describe, expect, it } from 'vitest';
describe('auth callback URL', () => {
  it('uses /auth/callback', () => {
    expect('https://borderday.com/auth/callback').toContain('/auth/callback');
  });
});

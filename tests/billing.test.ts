import { describe, expect, it } from 'vitest';
import { companyHasPaidAccess } from '../src/lib/billing';

describe('companyHasPaidAccess', () => {
  it('allows active and trialing', () => {
    expect(companyHasPaidAccess('active')).toBe(true);
    expect(companyHasPaidAccess('trialing')).toBe(true);
  });
  it('denies none/canceled', () => {
    expect(companyHasPaidAccess('none')).toBe(false);
    expect(companyHasPaidAccess('canceled')).toBe(false);
  });
  it('allows future trial_ends_at', () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    expect(companyHasPaidAccess('none', future)).toBe(true);
  });
});

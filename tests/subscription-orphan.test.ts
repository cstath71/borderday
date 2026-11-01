import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { normalizePlanKind, subscriptionWriteAction } from '../supabase/functions/_shared/subscriptionOrphan';

const root = resolve(__dirname, '..');

describe('AR3-10 subscription orphan / plan normalisation', () => {
  it('normalizes only company|individual (or empty fallback)', () => {
    expect(normalizePlanKind('company', false)).toBe('company');
    expect(normalizePlanKind('individual', true)).toBe('individual');
    expect(normalizePlanKind('', true)).toBe('company');
    expect(normalizePlanKind(null, false)).toBe('individual');
    expect(normalizePlanKind('enterprise', true)).toBeNull();
    expect(normalizePlanKind('Company', true)).toBeNull();
  });

  it('acks when a company plan has no live company row', () => {
    expect(
      subscriptionWriteAction({
        plan: 'company',
        companyId: 'c1',
        userId: null,
        companyExists: false,
        userExists: false,
      }),
    ).toBe('orphan_ack');
    expect(
      subscriptionWriteAction({
        plan: 'company',
        companyId: null,
        userId: null,
        companyExists: false,
        userExists: false,
      }),
    ).toBe('orphan_ack');
  });

  it('acks when an individual plan has no live user', () => {
    expect(
      subscriptionWriteAction({
        plan: 'individual',
        companyId: null,
        userId: 'u1',
        companyExists: false,
        userExists: false,
      }),
    ).toBe('orphan_ack');
    expect(
      subscriptionWriteAction({
        plan: 'individual',
        companyId: null,
        userId: null,
        companyExists: false,
        userExists: true,
      }),
    ).toBe('orphan_ack');
  });

  it('allows a normal company or individual upsert', () => {
    expect(
      subscriptionWriteAction({
        plan: 'company',
        companyId: 'c1',
        userId: null,
        companyExists: true,
        userExists: false,
      }),
    ).toBe('upsert');
    expect(
      subscriptionWriteAction({
        plan: 'individual',
        companyId: null,
        userId: 'u1',
        companyExists: false,
        userExists: true,
      }),
    ).toBe('upsert');
  });
});

describe('AR3-13 webhook verify_jwt config + handler orphan ack', () => {
  it('records verify_jwt = false for bd-stripe-webhook in config.toml', () => {
    const cfg = readFileSync(resolve(root, 'supabase/config.toml'), 'utf8');
    expect(cfg).toMatch(/\[functions\.bd-stripe-webhook\][\s\S]*?verify_jwt\s*=\s*false/);
  });

  it('webhook returns early on deleted company instead of null-company upsert', () => {
    const src = readFileSync(resolve(root, 'supabase/functions/bd-stripe-webhook/index.ts'), 'utf8');
    expect(src).toContain('subscriptionOrphan');
    expect(src).toContain('company_deleted');
    expect(src).toContain('user_deleted');
    expect(src).toContain('invalid_plan');
    // Must not clear companyId then upsert with plan still company.
    expect(src).not.toMatch(/companyId = undefined;\s*\n\s*\} else \{/);
  });

  it('checkout rejects a plan that is not company or individual', () => {
    const src = readFileSync(resolve(root, 'supabase/functions/bd-create-checkout/index.ts'), 'utf8');
    expect(src).toContain('Invalid plan');
    expect(src).toMatch(/body\.plan !== "company" && body\.plan !== "individual"/);
  });
});

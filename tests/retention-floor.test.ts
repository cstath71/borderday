import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { RETENTION_MONTHS_MAX, RETENTION_MONTHS_MIN, clampRetentionMonths } from '../src/company/dashboardMath';
import { getDict } from '../src/i18n';

describe('AR3-19 retention floor + AR3-08 closure docs', () => {
  it('clamps below 13 up to the floor', () => {
    expect(clampRetentionMonths(1)).toBe(RETENTION_MONTHS_MIN);
    expect(clampRetentionMonths(12)).toBe(13);
    expect(clampRetentionMonths(13)).toBe(13);
    expect(clampRetentionMonths(24)).toBe(24);
    expect(clampRetentionMonths(200)).toBe(RETENTION_MONTHS_MAX);
  });

  it('employees see the company retention value in company mode', () => {
    const app = readFileSync('src/pages/AppPage.tsx', 'utf8');
    expect(app).toContain('companyRetentionNote');
    expect(app).toContain('dataRetentionMonths');
    for (const lang of ['en', 'fr', 'de', 'it', 'nl'] as const) {
      expect(getDict(lang).app.companyRetentionNote).toContain('{months}');
    }
  });

  it('migration raises the DB check and extends the purge job', () => {
    const sql = readFileSync('supabase/migrations/20261101240000_bd_retention_floor_and_closure.sql', 'utf8');
    expect(sql).toContain('between 13 and 120');
    expect(sql).toContain('bd_contract_requests');
    expect(sql).toContain('bd_stripe_events');
    expect(sql).toContain('closed_at');
    expect(sql).toContain("interval '36 months'");
  });
});

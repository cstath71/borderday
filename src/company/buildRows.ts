import type { BorderId, DayType } from '../borders/types';
import { summarizeEmployee, type EmployeeDashboardRow } from './dashboardMath';
import type { CompanyRole } from './types';

export interface RowMember {
  userId: string;
  role: CompanyRole;
  active?: boolean;
  displayName: string;
  email: string;
  borderPackId: BorderId | null;
  annualWorkingDays: number | null;
  employmentPercent?: number | null;
  contractDaysPerYear?: number | null;
  a1InPlace?: boolean;
  frontierBefore2012?: boolean;
  a1ValidUntil?: string | null;
}

export interface RowLog {
  employeeUserId: string;
  workDate: string;
  dayType: DayType;
  overnightAway?: boolean;
  dayShare?: 0.5 | 1;
  /** Soft-voided days stay in the employer record but do not count. */
  voidedAt?: string | null;
  /** Present after the employee account was deleted (AR3-03). */
  employeeLabel?: string | null;
}

export function buildEmployeeRow(
  member: RowMember,
  logs: RowLog[],
  year: number,
  isDemo = false,
): EmployeeDashboardRow {
  return summarizeEmployee({
    userId: member.userId,
    displayName: member.displayName,
    email: member.email,
    borderPackId: member.borderPackId,
    annualWorkingDays: member.annualWorkingDays,
    profile: {
      employmentPercent: member.employmentPercent,
      contractDaysPerYear: member.contractDaysPerYear,
      a1InPlace: member.a1InPlace,
      frontierBefore2012: member.frontierBefore2012,
      a1ValidUntil: member.a1ValidUntil,
    },
    logs,
    year,
    isDemo,
  });
}

/** Pure: callers load members and logs from companyApi (or from the mock under /demo). */
export function buildDashboardRows(opts: {
  members: RowMember[];
  logs: RowLog[];
  year: number;
  isDemo?: boolean;
  /** When true, include soft-deactivated employees (F32 former employees). Default active-only. */
  includeInactive?: boolean;
}): EmployeeDashboardRow[] {
  const byEmployee = new Map<string, RowLog[]>();
  for (const log of opts.logs) {
    if (log.voidedAt) continue;
    const list = byEmployee.get(log.employeeUserId);
    if (list) list.push(log);
    else byEmployee.set(log.employeeUserId, [log]);
  }
  return opts.members
    .filter((m) => m.role === 'employee' && (opts.includeInactive ? true : m.active !== false))
    .map((m) => buildEmployeeRow(m, byEmployee.get(m.userId) ?? [], opts.year, opts.isDemo));
}

/** Active employees only (default dashboard list). */
export function buildActiveDashboardRows(opts: {
  members: RowMember[];
  logs: RowLog[];
  year: number;
  isDemo?: boolean;
}): EmployeeDashboardRow[] {
  return buildDashboardRows(opts);
}

/** Soft-deactivated employees with retained day history (F32). */
export function buildFormerDashboardRows(opts: {
  members: RowMember[];
  logs: RowLog[];
  year: number;
  isDemo?: boolean;
}): EmployeeDashboardRow[] {
  const byEmployee = new Map<string, RowLog[]>();
  for (const log of opts.logs) {
    if (log.voidedAt) continue;
    const list = byEmployee.get(log.employeeUserId);
    if (list) list.push(log);
    else byEmployee.set(log.employeeUserId, [log]);
  }
  return opts.members
    .filter((m) => m.role === 'employee' && m.active === false)
    .map((m) => buildEmployeeRow(m, byEmployee.get(m.userId) ?? [], opts.year, opts.isDemo));
}

/** Day logs left after the employee account was deleted (AR3-03). Grouped by kept label. */
export function buildDetachedDashboardRows(opts: {
  logs: RowLog[];
  year: number;
  isDemo?: boolean;
}): EmployeeDashboardRow[] {
  const byLabel = new Map<string, RowLog[]>();
  for (const log of opts.logs) {
    if (log.employeeUserId) continue;
    if (log.voidedAt) continue;
    const label = (log.employeeLabel || '').trim() || 'Deleted account';
    const list = byLabel.get(label);
    if (list) list.push(log);
    else byLabel.set(label, [log]);
  }
  return [...byLabel.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, logs], i) =>
      buildEmployeeRow(
        {
          userId: `detached:${i}:${label}`,
          role: 'employee',
          active: false,
          displayName: label,
          email: '',
          borderPackId: null,
          annualWorkingDays: null,
        },
        logs,
        opts.year,
        opts.isDemo,
      ),
    );
}

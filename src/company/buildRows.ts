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
    const list = byEmployee.get(log.employeeUserId);
    if (list) list.push(log);
    else byEmployee.set(log.employeeUserId, [log]);
  }
  return opts.members
    .filter((m) => m.role === 'employee' && m.active === false)
    .map((m) => buildEmployeeRow(m, byEmployee.get(m.userId) ?? [], opts.year, opts.isDemo));
}

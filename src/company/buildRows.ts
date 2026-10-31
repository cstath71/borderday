import { summarizeEmployee, type EmployeeDashboardRow } from './dashboardMath';
import {
  getCompany,
  listCompanyEmployees,
  listDayLogsForEmployee,
} from '../lib/supabaseMock';

export function buildDashboardRows(companyId: string, year: number): {
  rows: EmployeeDashboardRow[];
  isDemo: boolean;
} {
  const company = getCompany(companyId);
  const isDemo = !!company?.isDemo;
  const employees = listCompanyEmployees(companyId);
  const rows = employees.map(({ member, profile }) => {
    const logs = listDayLogsForEmployee(companyId, member.userId);
    return summarizeEmployee({
      userId: member.userId,
      displayName: profile.displayName,
      email: profile.email,
      borderPackId: member.borderPackId,
      annualWorkingDays: member.annualWorkingDays,
      logs,
      year,
      isDemo,
    });
  });
  return { rows, isDemo };
}

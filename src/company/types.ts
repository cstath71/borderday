import type { BorderId, DayType } from '../borders/types';

export type CompanyRole = 'owner' | 'hr_viewer' | 'employee';
export type InviteStatus = 'pending' | 'accepted' | 'revoked' | 'expired';

export interface Company {
  id: string;
  name: string;
  createdAt: string;
  dataRetentionMonths: number;
  /** When true, UI must label rows as demo data. */
  isDemo?: boolean;
}

export interface Profile {
  id: string;
  email: string;
  displayName: string;
}

export interface CompanyMember {
  id: string;
  companyId: string;
  userId: string;
  role: CompanyRole;
  borderPackId: BorderId | null;
  annualWorkingDays: number | null;
  joinedAt: string;
  employmentPercent?: number | null;
  a1InPlace?: boolean;
  a1ValidUntil?: string | null;
  frontierBefore2012?: boolean;
}

export interface Invitation {
  id: string;
  companyId: string;
  email: string;
  role: CompanyRole;
  token: string;
  status: InviteStatus;
  invitedBy: string | null;
  createdAt: string;
  expiresAt: string;
}

export interface DayLog {
  id: string;
  companyId: string;
  employeeUserId: string;
  workDate: string; // YYYY-MM-DD
  dayType: DayType;
  note?: string;
  overnightAway?: boolean;
}

export interface Consent {
  id: string;
  userId: string;
  companyId: string;
  consentVersion: string;
  textLang: string;
  acceptedAt: string;
}

export interface Session {
  userId: string;
  email: string;
}

export interface TenantDb {
  companies: Company[];
  profiles: Profile[];
  members: CompanyMember[];
  invitations: Invitation[];
  dayLogs: DayLog[];
  consents: Consent[];
  session: Session | null;
}

// Proof of which notice text someone acknowledged. Bump it when company.noticeBody changes.
export const CONSENT_VERSION = '2026-10-31-v3';

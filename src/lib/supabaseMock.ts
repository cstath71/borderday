/**
 * Local tenant mock behind the labelled /demo routes only (see src/pages/demo/DemoRoutes.tsx).
 * Production pages use companyApi.ts. Mirrors the bd_* RLS rules for the demo.
 * Never talks to a cloud Supabase project.
 */
import type { BorderId, DayType } from '../borders/types';
import {
  CONSENT_VERSION,
  type Company,
  type CompanyMember,
  type CompanyRole,
  type Consent,
  type DayLog,
  type Invitation,
  type Profile,
  type Session,
  type TenantDb,
} from '../company/types';

const STORAGE_KEY = 'borderday-tenant-v1';

function uid(): string {
  return crypto.randomUUID();
}

function nowIso(): string {
  return new Date().toISOString();
}

function emptyDb(): TenantDb {
  return {
    companies: [],
    profiles: [],
    members: [],
    invitations: [],
    dayLogs: [],
    consents: [],
    session: null,
  };
}

let memory: TenantDb = emptyDb();

function load(): TenantDb {
  if (typeof localStorage === 'undefined') return memory;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return memory;
    memory = JSON.parse(raw) as TenantDb;
    return memory;
  } catch {
    return memory;
  }
}

function save(db: TenantDb): void {
  memory = db;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }
}

/** Test helper: replace entire DB (also clears localStorage when available). */
export function resetMockDb(seed?: TenantDb): void {
  memory = seed ?? emptyDb();
  if (typeof localStorage !== 'undefined') {
    if (seed) localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    else localStorage.removeItem(STORAGE_KEY);
  }
}

export function getBackendMode(): 'local-mock' {
  return 'local-mock';
}

function requireSession(db: TenantDb): Session {
  if (!db.session) throw new RlsError('not authenticated');
  return db.session;
}

export class RlsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RlsError';
  }
}

function memberOf(db: TenantDb, companyId: string, userId: string): CompanyMember | undefined {
  return db.members.find((m) => m.companyId === companyId && m.userId === userId);
}

function isHrOrOwner(db: TenantDb, companyId: string, userId: string): boolean {
  const m = memberOf(db, companyId, userId);
  return !!m && (m.role === 'owner' || m.role === 'hr_viewer');
}

export function signIn(email: string, displayName?: string): Session {
  const db = load();
  const normalized = email.trim().toLowerCase();
  let profile = db.profiles.find((p) => p.email === normalized);
  if (!profile) {
    profile = { id: uid(), email: normalized, displayName: displayName ?? normalized.split('@')[0] };
    db.profiles.push(profile);
  } else if (displayName) {
    profile.displayName = displayName;
  }
  db.session = { userId: profile.id, email: profile.email };
  save(db);
  return db.session;
}

export function signOut(): void {
  const db = load();
  db.session = null;
  save(db);
}

export function currentSession(): Session | null {
  return load().session;
}

export function createCompany(name: string): { company: Company; membership: CompanyMember } {
  const db = load();
  const session = requireSession(db);
  const company: Company = {
    id: uid(),
    name: name.trim(),
    createdAt: nowIso(),
    dataRetentionMonths: 24,
    isDemo: false,
  };
  const membership: CompanyMember = {
    id: uid(),
    companyId: company.id,
    userId: session.userId,
    role: 'owner',
    borderPackId: null,
    annualWorkingDays: null,
    joinedAt: nowIso(),
  };
  db.companies.push(company);
  db.members.push(membership);
  save(db);
  return { company, membership };
}

export function listMyCompanies(): Company[] {
  const db = load();
  const session = requireSession(db);
  const ids = new Set(db.members.filter((m) => m.userId === session.userId).map((m) => m.companyId));
  return db.companies.filter((c) => ids.has(c.id));
}

export function getCompany(companyId: string): Company | null {
  const db = load();
  const session = requireSession(db);
  if (!memberOf(db, companyId, session.userId)) throw new RlsError('company isolation');
  return db.companies.find((c) => c.id === companyId) ?? null;
}

export function myMembership(companyId: string): CompanyMember | null {
  const db = load();
  const session = requireSession(db);
  return memberOf(db, companyId, session.userId) ?? null;
}

export function createInvitation(
  companyId: string,
  email: string,
  role: CompanyRole = 'employee',
): Invitation {
  const db = load();
  const session = requireSession(db);
  if (!isHrOrOwner(db, companyId, session.userId)) throw new RlsError('HR or owner required');
  if (role === 'owner' && memberOf(db, companyId, session.userId)?.role !== 'owner') {
    throw new RlsError('only owner can invite owner');
  }
  const inv: Invitation = {
    id: uid(),
    companyId,
    email: email.trim().toLowerCase(),
    role,
    token: uid().replace(/-/g, '') + uid().replace(/-/g, '').slice(0, 16),
    status: 'pending',
    invitedBy: session.userId,
    createdAt: nowIso(),
    expiresAt: new Date(Date.now() + 14 * 864e5).toISOString(),
  };
  db.invitations.push(inv);
  save(db);
  return inv;
}

/** Token peek — mirrors invite select for pending tokens (no session required for join page). */
export function peekInvitation(token: string): (Invitation & { companyName: string }) | null {
  const db = load();
  const inv = db.invitations.find((i) => i.token === token);
  if (!inv || inv.status !== 'pending') return null;
  if (new Date(inv.expiresAt).getTime() < Date.now()) return null;
  const company = db.companies.find((c) => c.id === inv.companyId);
  if (!company) return null;
  return { ...inv, companyName: company.name };
}

export function listInvitations(companyId: string): Invitation[] {
  const db = load();
  const session = requireSession(db);
  if (!isHrOrOwner(db, companyId, session.userId)) throw new RlsError('HR or owner required');
  return db.invitations.filter((i) => i.companyId === companyId);
}

export function acceptInvitation(
  token: string,
  opts?: { displayName?: string; borderPackId?: BorderId; annualWorkingDays?: number },
): CompanyMember {
  const db = load();
  const session = requireSession(db);
  const inv = db.invitations.find((i) => i.token === token);
  if (!inv || inv.status !== 'pending') throw new RlsError('invalid invite');
  if (new Date(inv.expiresAt).getTime() < Date.now()) throw new RlsError('invite expired');
  if (session.email !== inv.email) throw new RlsError('invite email mismatch');

  const profile = db.profiles.find((p) => p.id === session.userId)!;
  if (opts?.displayName) profile.displayName = opts.displayName;

  let membership = memberOf(db, inv.companyId, session.userId);
  if (!membership) {
    membership = {
      id: uid(),
      companyId: inv.companyId,
      userId: session.userId,
      role: inv.role,
      borderPackId: opts?.borderPackId ?? null,
      annualWorkingDays: opts?.annualWorkingDays ?? null,
      joinedAt: nowIso(),
    };
    db.members.push(membership);
  }
  inv.status = 'accepted';
  save(db);
  return membership;
}

export function recordConsent(companyId: string, textLang: string): Consent {
  const db = load();
  const session = requireSession(db);
  if (!memberOf(db, companyId, session.userId)) throw new RlsError('company isolation');
  const existing = db.consents.find(
    (c) =>
      c.userId === session.userId &&
      c.companyId === companyId &&
      c.consentVersion === CONSENT_VERSION,
  );
  if (existing) return existing;
  const consent: Consent = {
    id: uid(),
    userId: session.userId,
    companyId,
    consentVersion: CONSENT_VERSION,
    textLang,
    acceptedAt: nowIso(),
  };
  db.consents.push(consent);
  save(db);
  return consent;
}

export function updateMemberSelf(
  companyId: string,
  patch: { borderPackId?: BorderId | null; annualWorkingDays?: number | null; displayName?: string },
): CompanyMember {
  const db = load();
  const session = requireSession(db);
  const m = memberOf(db, companyId, session.userId);
  if (!m) throw new RlsError('company isolation');
  if (patch.borderPackId !== undefined) m.borderPackId = patch.borderPackId;
  if (patch.annualWorkingDays !== undefined) m.annualWorkingDays = patch.annualWorkingDays;
  if (patch.displayName) {
    const p = db.profiles.find((x) => x.id === session.userId);
    if (p) p.displayName = patch.displayName;
  }
  save(db);
  return m;
}

export function upsertDayLog(
  companyId: string,
  workDate: string,
  dayType: DayType,
  note?: string,
): DayLog {
  const db = load();
  const session = requireSession(db);
  if (!memberOf(db, companyId, session.userId)) throw new RlsError('company isolation');
  let row = db.dayLogs.find(
    (d) => d.employeeUserId === session.userId && d.workDate === workDate,
  );
  if (row) {
    row.dayType = dayType;
    row.note = note;
  } else {
    row = {
      id: uid(),
      companyId,
      employeeUserId: session.userId,
      workDate,
      dayType,
      note,
    };
    db.dayLogs.push(row);
  }
  save(db);
  return row;
}

export function deleteOwnDayLogs(companyId: string): number {
  const db = load();
  const session = requireSession(db);
  if (!memberOf(db, companyId, session.userId)) throw new RlsError('company isolation');
  const before = db.dayLogs.length;
  db.dayLogs = db.dayLogs.filter(
    (d) => !(d.companyId === companyId && d.employeeUserId === session.userId),
  );
  save(db);
  return before - db.dayLogs.length;
}

export function listDayLogsForEmployee(
  companyId: string,
  employeeUserId: string,
): DayLog[] {
  const db = load();
  const session = requireSession(db);
  const self = employeeUserId === session.userId;
  const hr = isHrOrOwner(db, companyId, session.userId);
  if (!self && !hr) throw new RlsError('day log access denied');
  if (!memberOf(db, companyId, session.userId)) throw new RlsError('company isolation');
  // Strip anything beyond day type + date (note visible to HR as text only — no location)
  return db.dayLogs
    .filter((d) => d.companyId === companyId && d.employeeUserId === employeeUserId)
    .map((d) => ({
      id: d.id,
      companyId: d.companyId,
      employeeUserId: d.employeeUserId,
      workDate: d.workDate,
      dayType: d.dayType,
      // HR may see optional note (no location); employees see same
      note: d.note,
    }));
}

export function listCompanyEmployees(companyId: string): Array<{
  member: CompanyMember;
  profile: Profile;
}> {
  const db = load();
  const session = requireSession(db);
  if (!isHrOrOwner(db, companyId, session.userId)) throw new RlsError('HR or owner required');
  return db.members
    .filter((m) => m.companyId === companyId && m.role === 'employee')
    .map((member) => {
      const profile = db.profiles.find((p) => p.id === member.userId)!;
      return { member, profile };
    });
}

export function listAllMembers(companyId: string): Array<{ member: CompanyMember; profile: Profile }> {
  const db = load();
  const session = requireSession(db);
  if (!isHrOrOwner(db, companyId, session.userId)) throw new RlsError('HR or owner required');
  return db.members
    .filter((m) => m.companyId === companyId)
    .map((member) => ({
      member,
      profile: db.profiles.find((p) => p.id === member.userId)!,
    }));
}

/**
 * Seed a clearly labeled DEMO company for screenshots / local preview.
 * Idempotent by company name.
 */
export function seedDemoCompany(): { companyId: string } {
  const db = load();
  const existing = db.companies.find((c) => c.isDemo);
  if (existing) {
    // ensure session is demo owner if possible
    const owner = db.members.find((m) => m.companyId === existing.id && m.role === 'owner');
    if (owner) {
      const p = db.profiles.find((x) => x.id === owner.userId)!;
      db.session = { userId: p.id, email: p.email };
      save(db);
    }
    return { companyId: existing.id };
  }

  const owner: Profile = {
    id: uid(),
    email: 'hr.demo@borderday.example',
    displayName: 'Demo HR Owner',
  };
  const company: Company = {
    id: uid(),
    name: 'DEMO — Acme Cross-Border SA',
    createdAt: nowIso(),
    dataRetentionMonths: 24,
    isDemo: true,
  };
  const ownerMember: CompanyMember = {
    id: uid(),
    companyId: company.id,
    userId: owner.id,
    role: 'owner',
    borderPackId: null,
    annualWorkingDays: null,
    joinedAt: nowIso(),
  };

  const employees: Array<{
    email: string;
    name: string;
    border: BorderId;
    days: Array<[string, DayType]>;
    annual: number;
  }> = [
    {
      email: 'alice.demo@borderday.example',
      name: 'Alice Demo (Geneva)',
      border: 'geneva_fr',
      annual: 240,
      days: [
        ['2026-01-05', 'telework'],
        ['2026-01-06', 'telework'],
        ['2026-01-07', 'onsite'],
        ['2026-01-08', 'onsite'],
        ['2026-01-09', 'onsite'],
      ],
    },
    {
      email: 'bruno.demo@borderday.example',
      name: 'Bruno Demo (Luxembourg)',
      border: 'luxembourg_fr',
      annual: 220,
      days: Array.from({ length: 28 }, (_, i) => {
        const d = String(i + 1).padStart(2, '0');
        return [`2026-03-${d}`, 'telework'] as [string, DayType];
      }),
    },
    {
      email: 'chiara.demo@borderday.example',
      name: 'Chiara Demo (Ticino)',
      border: 'ticino_it',
      annual: 240,
      days: [
        ['2026-02-02', 'telework'],
        ['2026-02-03', 'onsite'],
        ['2026-02-04', 'onsite'],
        ['2026-02-05', 'third_country'],
      ],
    },
  ];

  db.profiles.push(owner);
  db.companies.push(company);
  db.members.push(ownerMember);

  for (const e of employees) {
    const p: Profile = { id: uid(), email: e.email, displayName: e.name };
    db.profiles.push(p);
    db.members.push({
      id: uid(),
      companyId: company.id,
      userId: p.id,
      role: 'employee',
      borderPackId: e.border,
      annualWorkingDays: e.annual,
      joinedAt: nowIso(),
    });
    for (const [workDate, dayType] of e.days) {
      db.dayLogs.push({
        id: uid(),
        companyId: company.id,
        employeeUserId: p.id,
        workDate,
        dayType,
      });
    }
  }

  // Pending invite for screenshots
  db.invitations.push({
    id: uid(),
    companyId: company.id,
    email: 'newhire.demo@borderday.example',
    role: 'employee',
    token: 'demo-invite-token-borderday',
    status: 'pending',
    invitedBy: owner.id,
    createdAt: nowIso(),
    expiresAt: new Date(Date.now() + 14 * 864e5).toISOString(),
  });

  db.session = { userId: owner.id, email: owner.email };
  save(db);
  return { companyId: company.id };
}

/** Cross-tenant probe for tests — attempts forbidden reads. */
export function __test_rawDb(): TenantDb {
  return load();
}

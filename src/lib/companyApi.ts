/**
 * Real Supabase API for BorderDay tenants (bd_* tables).
 * The labelled /demo routes use supabaseMock.ts; nothing else may.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { companyHasPaidAccess } from './billing';
import { supabase } from './supabase';
import type { Invitation, CompanyRole, InviteStatus } from '../company/types';
import type { BorderId, DayEntry, DayType } from '../borders/types';

/** PostgREST caps responses (default max-rows 1000); longer lists must be paged or counters undercount. */
const PAGE_SIZE = 1000;

function client(): SupabaseClient {
  if (!supabase) throw new Error('Supabase not configured');
  return supabase;
}

async function currentUserId(): Promise<string | null> {
  const { data } = await client().auth.getUser();
  return data.user?.id ?? null;
}

async function allPages<T>(
  fetchPage: (from: number, to: number) => PromiseLike<{ data: unknown; error: unknown }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await fetchPage(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const page = (data ?? []) as T[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}

/**
 * Phase 2 columns and RPCs are additive, and the site can deploy before the migration has run.
 * "Column or function does not exist" then falls back to the old shape instead of breaking /app.
 */
const SCHEMA_LAG_CODES = new Set(['42703', '42883', 'PGRST202', 'PGRST204']);

export function isSchemaLag(error: unknown): boolean {
  return SCHEMA_LAG_CODES.has((error as { code?: string } | null)?.code ?? '');
}

const MEMBER_PROFILE_COLUMNS =
  'employment_percent, a1_in_place, a1_valid_until, frontier_before_2012';

export interface MemberProfile {
  employmentPercent: number | null;
  a1InPlace: boolean;
  a1ValidUntil: string | null;
  frontierBefore2012?: boolean;
}

function mapProfile(m: any): MemberProfile {
  return {
    employmentPercent: m.employment_percent ?? null,
    a1InPlace: m.a1_in_place ?? false,
    a1ValidUntil: m.a1_valid_until ?? null,
    frontierBefore2012: m.frontier_before_2012 ?? false,
  };
}

export function isHrRole(role: CompanyRole | null | undefined): boolean {
  return role === 'owner' || role === 'hr_viewer';
}

// ---- Companies -------------------------------------------------------------

export interface MyCompany {
  id: string;
  name: string;
  role: CompanyRole;
  subscription_status: string;
  trial_ends_at: string | null;
  seat_count: number;
  borderPackId: BorderId | null;
  annualWorkingDays: number | null;
  profile: MemberProfile;
}

export async function createCompany(name: string): Promise<{ companyId: string }> {
  const { data, error } = await client().rpc('bd_create_company', { company_name: name });
  if (error) throw error;
  return { companyId: data as string };
}

export async function listMyCompanies(): Promise<MyCompany[]> {
  if (!supabase) return [];
  const userId = await currentUserId();
  if (!userId) return [];
  const base =
    'role, border_pack_id, annual_working_days, bd_companies(id, name, subscription_status, trial_ends_at, seat_count)';
  // HR can read every member row of their company, so filter to the caller's own.
  const query = (columns: string) =>
    supabase!.from('bd_company_members').select(columns).eq('user_id', userId).eq('active', true);
  const PROFILE_WITHOUT_FRONTIER = 'employment_percent, a1_in_place, a1_valid_until';
  let { data, error }: { data: any; error: unknown } = await query(`${base}, ${MEMBER_PROFILE_COLUMNS}`);
  if (isSchemaLag(error)) ({ data, error } = await query(`${base}, ${PROFILE_WITHOUT_FRONTIER}`));
  if (isSchemaLag(error)) ({ data, error } = await query(base));
  if (error) throw error;
  return (data || []).map((m: any) => ({
    id: m.bd_companies.id,
    name: m.bd_companies.name,
    role: m.role as CompanyRole,
    subscription_status: m.bd_companies.subscription_status,
    trial_ends_at: m.bd_companies.trial_ends_at,
    seat_count: m.bd_companies.seat_count,
    borderPackId: m.border_pack_id,
    annualWorkingDays: m.annual_working_days,
    profile: mapProfile(m),
  }));
}

export async function getCompany(companyId: string) {
  const { data, error } = await client()
    .from('bd_companies')
    .select('id, name, subscription_status, trial_ends_at, seat_count, current_period_end, data_retention_months')
    .eq('id', companyId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ---- Members ---------------------------------------------------------------

export interface CompanyMemberRow {
  id: string;
  userId: string;
  role: CompanyRole;
  borderPackId: BorderId | null;
  annualWorkingDays: number | null;
  active: boolean;
  joinedAt: string;
  email: string;
  displayName: string;
  employmentPercent: number | null;
  a1InPlace: boolean;
  a1ValidUntil: string | null;
  frontierBefore2012: boolean;
}

export async function updateCompanyRetention(companyId: string, months: number) {
  const n = Math.min(120, Math.max(1, Math.round(months)));
  const { error } = await client()
    .from('bd_companies')
    .update({ data_retention_months: n })
    .eq('id', companyId);
  if (error) throw error;
  return n;
}

export async function listMembers(companyId: string): Promise<CompanyMemberRow[]> {
  const base = 'id, role, border_pack_id, annual_working_days, active, user_id, joined_at, bd_profiles(email, display_name)';
  const query = (columns: string) => client().from('bd_company_members').select(columns).eq('company_id', companyId);
  const PROFILE_WITHOUT_FRONTIER = 'employment_percent, a1_in_place, a1_valid_until';
  let { data, error }: { data: any; error: unknown } = await query(`${base}, ${MEMBER_PROFILE_COLUMNS}`);
  if (isSchemaLag(error)) ({ data, error } = await query(`${base}, ${PROFILE_WITHOUT_FRONTIER}`));
  if (isSchemaLag(error)) ({ data, error } = await query(base));
  if (error) throw error;
  return (data || []).map((m: any) => ({
    id: m.id,
    userId: m.user_id,
    role: m.role,
    borderPackId: m.border_pack_id,
    annualWorkingDays: m.annual_working_days,
    active: m.active,
    joinedAt: m.joined_at,
    email: m.bd_profiles?.email ?? '',
    displayName: m.bd_profiles?.display_name || m.bd_profiles?.email || '',
    ...mapProfile(m),
  }));
}

export async function myMembership(
  companyId: string,
): Promise<{ role: CompanyRole; borderPackId: BorderId | null; annualWorkingDays: number | null } | null> {
  const userId = await currentUserId();
  if (!userId) return null;
  const { data, error } = await client()
    .from('bd_company_members')
    .select('role, border_pack_id, annual_working_days')
    .eq('company_id', companyId)
    .eq('user_id', userId)
    .eq('active', true)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    role: data.role as CompanyRole,
    borderPackId: data.border_pack_id as BorderId | null,
    annualWorkingDays: data.annual_working_days,
  };
}

/** Sets both values. Goes through an RPC because employees have no direct update on member rows. */
export async function updateMemberSelf(
  companyId: string,
  patch: { borderPackId: BorderId | null; annualWorkingDays: number | null },
): Promise<void> {
  const { error } = await client().rpc('bd_update_member_self', {
    p_company_id: companyId,
    p_border_pack_id: patch.borderPackId,
    p_annual_working_days: patch.annualWorkingDays,
  });
  if (error) throw error;
}

/** The caller's own employment % and A1 record. Same reason for an RPC as updateMemberSelf. */
export async function updateMyProfile(companyId: string, profile: MemberProfile): Promise<void> {
  const { error } = await client().rpc('bd_update_member_profile', {
    p_company_id: companyId,
    p_employment_percent: profile.employmentPercent,
    p_a1_in_place: profile.a1InPlace,
    p_a1_valid_until: profile.a1ValidUntil,
    p_frontier_before_2012: !!profile.frontierBefore2012,
  });
  if (error) throw error;
}

/** HR recording an employee's employment % and A1. RLS and column grants decide who may. */
export async function updateEmployeeProfile(
  companyId: string,
  employeeUserId: string,
  profile: MemberProfile,
): Promise<void> {
  const { data, error } = await client()
    .from('bd_company_members')
    .update({
      employment_percent: profile.employmentPercent,
      a1_in_place: profile.a1InPlace,
      a1_valid_until: profile.a1ValidUntil,
      frontier_before_2012: !!profile.frontierBefore2012,
    })
    .eq('company_id', companyId)
    .eq('user_id', employeeUserId)
    .select('id');
  if (error) throw error;
  // RLS hides a forbidden row instead of raising, so "nothing updated" is the refusal.
  if (!data?.length) throw new Error('profile update denied');
}

export async function updateMyDisplayName(displayName: string): Promise<void> {
  const userId = await currentUserId();
  if (!userId) throw new Error('not authenticated');
  const { error } = await client().from('bd_profiles').update({ display_name: displayName }).eq('id', userId);
  if (error) throw error;
}

// ---- Invitations -----------------------------------------------------------

function mapInvite(row: any): Invitation {
  return {
    id: row.id,
    companyId: row.company_id,
    email: row.email,
    role: row.role,
    token: row.token,
    status: row.status,
    invitedBy: row.invited_by,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}

/** Why bd-send-invite refused to email: no paid or trial access, or a send limit. */
export type InviteEmailBlock = 'no_access' | 'rate_limited';

export async function createInvite(
  companyId: string,
  email: string,
  role: CompanyRole = 'employee',
  lang = 'en',
): Promise<{ invite: Invitation; emailed: boolean; emailBlock: InviteEmailBlock | null }> {
  const c = client();
  const { data, error } = await c
    .from('bd_invitations')
    .insert({ company_id: companyId, email: email.trim().toLowerCase(), role, invited_by: await currentUserId() })
    .select('*')
    .single();
  if (error) throw error;
  // The invite exists either way; HR can always share the link if the email is dry-run or fails.
  const sent = await c.functions.invoke('bd-send-invite', { body: { invitationId: data.id, companyId, lang } });
  const status = (sent.error as { context?: { status?: number } } | null)?.context?.status;
  return {
    invite: mapInvite(data),
    emailed: !sent.error && sent.data?.sent === true,
    emailBlock: status === 402 ? 'no_access' : status === 429 ? 'rate_limited' : null,
  };
}

export async function listInvites(companyId: string, status?: InviteStatus): Promise<Invitation[]> {
  let q = client()
    .from('bd_invitations')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map(mapInvite);
}

export interface InvitePeek {
  id: string;
  companyId: string;
  companyName: string;
  email: string;
  role: CompanyRole;
  status: InviteStatus;
  expiresAt: string;
}

export async function getInviteByToken(token: string): Promise<InvitePeek | null> {
  const { data, error } = await client().rpc('bd_get_invite_by_token', { invite_token: token });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return {
    id: row.id,
    companyId: row.company_id,
    companyName: row.company_name,
    email: row.email,
    role: row.role,
    status: row.status,
    expiresAt: row.expires_at,
  };
}

export function isInviteOpen(invite: Pick<InvitePeek, 'status' | 'expiresAt'>, now = Date.now()): boolean {
  return invite.status === 'pending' && new Date(invite.expiresAt).getTime() > now;
}

export function sameEmail(a: string | null | undefined, b: string | null | undefined): boolean {
  return !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();
}

export async function acceptInvite(token: string, consentVersion: string, textLang: string): Promise<string> {
  const c = client();
  const { data, error } = await c.rpc('bd_accept_invite', {
    invite_token: token,
    consent_version: consentVersion,
    text_lang: textLang,
  });
  if (error) throw error;
  const companyId = data as string;
  // Seat count trigger already ran; align Stripe flat↔per-seat if subscribed.
  void c.functions.invoke('bd-sync-company-billing', { body: { companyId } });
  return companyId;
}

/** Explicitly re-sync company Stripe item to current seat_count (flat ≤7 / per-seat ≥8). */
export async function syncCompanyBilling(companyId: string) {
  const { data, error } = await client().functions.invoke('bd-sync-company-billing', {
    body: { companyId },
  });
  if (error) throw error;
  return data as {
    available?: boolean;
    synced?: boolean;
    changed?: boolean;
    mode?: string;
    quantity?: number;
    seats?: number;
    message?: string;
  };
}

// ---- Company day logs ------------------------------------------------------

export interface DayLogView {
  employeeUserId: string;
  workDate: string;
  dayType: DayType;
  overnightAway: boolean;
  dayShare: 0.5 | 1;
}

/**
 * Before Phase 2/3 migrations the overnight / day_share columns may be missing.
 * Clearing defaults is harmless to drop; setting a non-default must fail visibly.
 */
async function upsertWithDayAttrs(
  attrs: { overnightAway?: boolean; dayShare?: 0.5 | 1 },
  run: (extra: { overnight_away_for_work?: boolean; day_share?: number }) => PromiseLike<{ error: unknown }>,
): Promise<void> {
  const overnight = !!attrs.overnightAway;
  const share = attrs.dayShare === 0.5 ? 0.5 : 1;
  let { error } = await run({ overnight_away_for_work: overnight, day_share: share });
  if (isSchemaLag(error)) {
    // Drop day_share only when it was the default (1). A set half-day must fail visibly.
    if (share === 0.5) throw error;
    ({ error } = await run({ overnight_away_for_work: overnight }));
    if (isSchemaLag(error) && !overnight) ({ error } = await run({}));
  }
  if (error) throw error;
}

export async function upsertDayLog(opts: {
  companyId: string;
  workDate: string;
  dayType: DayType;
  overnightAway?: boolean;
  dayShare?: 0.5 | 1;
}): Promise<void> {
  const userId = await currentUserId();
  if (!userId) throw new Error('not authenticated');
  await upsertWithDayAttrs(
    { overnightAway: opts.overnightAway, dayShare: opts.dayShare },
    (extra) =>
      client()
        .from('bd_day_logs')
        .upsert(
          {
            company_id: opts.companyId,
            employee_user_id: userId,
            work_date: opts.workDate,
            day_type: opts.dayType,
            updated_at: new Date().toISOString(),
            ...extra,
          },
          { onConflict: 'employee_user_id,work_date' },
        ),
  );
}

/** HR and self both read through the RPCs: employee, date, day type and overnight flag, never `note`. */
export async function listDayLogs(companyId: string, employeeUserId?: string): Promise<DayLogView[]> {
  type Row = {
    employee_user_id: string;
    work_date: string;
    day_type: DayType;
    overnight_away_for_work?: boolean;
    day_share?: number;
  };
  const read = (rpc: 'bd_list_day_records' | 'bd_list_day_types') =>
    allPages<Row>((from, to) =>
      client()
        .rpc(rpc, { cid: companyId, employee: employeeUserId ?? null })
        .range(from, to),
    );
  const rows = await read('bd_list_day_records').catch((e) => {
    if (isSchemaLag(e)) return read('bd_list_day_types');
    throw e;
  });
  return rows.map((r) => ({
    employeeUserId: r.employee_user_id,
    workDate: r.work_date,
    dayType: r.day_type,
    overnightAway: !!r.overnight_away_for_work,
    dayShare: r.day_share === 0.5 ? 0.5 : 1,
  }));
}

export async function deleteMyDayLogs(companyId: string): Promise<void> {
  const userId = await currentUserId();
  if (!userId) throw new Error('not authenticated');
  const { error } = await client()
    .from('bd_day_logs')
    .delete()
    .eq('company_id', companyId)
    .eq('employee_user_id', userId);
  if (error) throw error;
}

// ---- Individual plan -------------------------------------------------------

export async function hasIndividualAccess(): Promise<boolean> {
  const userId = await currentUserId();
  if (!userId) return false;
  const { data, error } = await client()
    .from('bd_subscriptions')
    .select('status, trial_ends_at')
    .eq('plan_kind', 'individual')
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []).some((s) => companyHasPaidAccess(s.status, s.trial_ends_at));
}

export async function listPersonalDayLogs(): Promise<Array<DayEntry & { borderPackId: BorderId | null }>> {
  const userId = await currentUserId();
  if (!userId) return [];
  type Row = {
    work_date: string;
    day_type: DayType;
    border_pack_id: BorderId | null;
    overnight_away_for_work?: boolean;
    day_share?: number;
  };
  const read = (columns: string) =>
    allPages<Row>((from, to) =>
      client()
        .from('bd_personal_day_logs')
        .select(columns)
        .eq('user_id', userId)
        .order('work_date', { ascending: true })
        .range(from, to),
    );
  const base = 'work_date, day_type, border_pack_id';
  const withOvernight = `${base}, overnight_away_for_work`;
  const withShare = `${withOvernight}, day_share`;
  const rows = await read(withShare).catch((e) => {
    if (!isSchemaLag(e)) throw e;
    return read(withOvernight).catch((e2) => {
      if (isSchemaLag(e2)) return read(base);
      throw e2;
    });
  });
  return rows.map((r) => ({
    date: r.work_date,
    type: r.day_type,
    borderPackId: r.border_pack_id,
    overnightAway: !!r.overnight_away_for_work,
    dayShare: r.day_share === 0.5 ? 0.5 : 1,
  }));
}

export async function upsertPersonalDayLog(opts: {
  workDate: string;
  dayType: DayType;
  borderPackId: BorderId | null;
  overnightAway?: boolean;
  dayShare?: 0.5 | 1;
}): Promise<void> {
  const userId = await currentUserId();
  if (!userId) throw new Error('not authenticated');
  await upsertWithDayAttrs(
    { overnightAway: opts.overnightAway, dayShare: opts.dayShare },
    (extra) =>
      client()
        .from('bd_personal_day_logs')
        .upsert(
          {
            user_id: userId,
            work_date: opts.workDate,
            day_type: opts.dayType,
            border_pack_id: opts.borderPackId,
            updated_at: new Date().toISOString(),
            ...extra,
          },
          { onConflict: 'user_id,work_date' },
        ),
  );
}

export async function deleteMyPersonalDayLogs(): Promise<void> {
  const userId = await currentUserId();
  if (!userId) throw new Error('not authenticated');
  const { error } = await client().from('bd_personal_day_logs').delete().eq('user_id', userId);
  if (error) throw error;
}

// ---- /app access -----------------------------------------------------------

export type AppAccess =
  | { mode: 'company'; company: MyCompany }
  | { mode: 'individual' }
  /** unpaidCompany: the caller belongs to this company, but it has no active subscription. */
  | { mode: 'preview'; unpaidCompany: string | null };

/**
 * Membership only unlocks /app when that company is paid. Otherwise anyone could create a
 * free company and get the paid product. Employee memberships win over HR ones.
 */
export function pickAppAccess(companies: MyCompany[], individualPaid: boolean): AppAccess {
  const paid = companies
    .filter((c) => companyHasPaidAccess(c.subscription_status, c.trial_ends_at))
    .sort((a, b) => Number(b.role === 'employee') - Number(a.role === 'employee'));
  if (paid[0]) return { mode: 'company', company: paid[0] };
  if (individualPaid) return { mode: 'individual' };
  return { mode: 'preview', unpaidCompany: companies[0]?.name ?? null };
}

export async function resolveAppAccess(): Promise<AppAccess> {
  const [companies, individualPaid] = await Promise.all([listMyCompanies(), hasIndividualAccess()]);
  return pickAppAccess(companies, individualPaid);
}

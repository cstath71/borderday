/**
 * Real Supabase API for BorderDay tenants (bd_* tables).
 * The labelled /demo routes use supabaseMock.ts; nothing else may.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { clampRetentionMonths } from '../company/dashboardMath';
import { companyHasPaidAccess, planIsCancellable } from './billing';
import { supabase } from './supabase';
import { DPA_VERSION, type Invitation, type CompanyRole, type InviteStatus } from '../company/types';
import type { BorderId, DayEntry, DayType } from '../borders/types';
import type { ImportRpcResult, ImportRpcRow } from './dayImport';

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
  'employment_percent, a1_in_place, a1_valid_until, frontier_before_2012, contract_days_per_year, employment_full_months, employment_full_weeks';
const MEMBER_PROFILE_WITH_EMPLOYMENT_DATES = `employed_from, employed_until, ${MEMBER_PROFILE_COLUMNS}`;
const PROFILE_WITHOUT_PART_YEAR =
  'employment_percent, a1_in_place, a1_valid_until, frontier_before_2012, contract_days_per_year';
const PROFILE_WITHOUT_CONTRACT_DAYS = 'employment_percent, a1_in_place, a1_valid_until, frontier_before_2012';
const PROFILE_WITHOUT_FRONTIER = 'employment_percent, a1_in_place, a1_valid_until';

/** Newest columns first, so the site keeps working while a migration is still to run. */
async function selectWithProfileFallback(
  base: string,
  query: (columns: string) => PromiseLike<{ data: unknown; error: unknown }>,
): Promise<any> {
  let { data, error } = await query(`${base}, ${MEMBER_PROFILE_WITH_EMPLOYMENT_DATES}`);
  if (isSchemaLag(error)) ({ data, error } = await query(`${base}, ${MEMBER_PROFILE_COLUMNS}`));
  if (isSchemaLag(error)) ({ data, error } = await query(`${base}, ${PROFILE_WITHOUT_PART_YEAR}`));
  if (isSchemaLag(error)) ({ data, error } = await query(`${base}, ${PROFILE_WITHOUT_CONTRACT_DAYS}`));
  if (isSchemaLag(error)) ({ data, error } = await query(`${base}, ${PROFILE_WITHOUT_FRONTIER}`));
  if (isSchemaLag(error)) ({ data, error } = await query(base));
  if (error) throw error;
  return data;
}

export interface MemberProfile {
  employmentPercent: number | null;
  contractDaysPerYear?: number | null;
  employmentFullMonths?: number | null;
  employmentFullWeeks?: number | null;
  a1InPlace: boolean;
  a1ValidUntil: string | null;
  frontierBefore2012?: boolean;
  /** Null when the column is not deployed yet, or when HR has not set a bound. */
  employedFrom?: string | null;
  employedUntil?: string | null;
}

function mapProfile(m: any): MemberProfile {
  return {
    employmentPercent: m.employment_percent ?? null,
    contractDaysPerYear: m.contract_days_per_year ?? null,
    employmentFullMonths: m.employment_full_months ?? null,
    employmentFullWeeks: m.employment_full_weeks ?? null,
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
  dataRetentionMonths: number;
  borderPackId: BorderId | null;
  annualWorkingDays: number | null;
  profile: MemberProfile;
}

export async function createCompany(name: string): Promise<{ companyId: string }> {
  const { data, error } = await client().rpc('bd_create_company_with_dpa', { company_name: name, dpa_version: DPA_VERSION });
  if (error) throw error;
  return { companyId: data as string };
}

export async function listMyCompanies(): Promise<MyCompany[]> {
  if (!supabase) return [];
  const userId = await currentUserId();
  if (!userId) return [];
  const base =
    'role, border_pack_id, annual_working_days, bd_companies(id, name, subscription_status, trial_ends_at, seat_count, data_retention_months)';
  // HR can read every member row of their company, so filter to the caller's own.
  const query = (columns: string) =>
    supabase!.from('bd_company_members').select(columns).eq('user_id', userId).eq('active', true);
  const data = await selectWithProfileFallback(base, query);
  return (data || []).map((m: any) => ({
    id: m.bd_companies.id,
    name: m.bd_companies.name,
    role: m.role as CompanyRole,
    subscription_status: m.bd_companies.subscription_status,
    trial_ends_at: m.bd_companies.trial_ends_at,
    dataRetentionMonths: m.bd_companies.data_retention_months ?? 24,
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
  /** When soft-deactivated (F32). Null while active. */
  removedAt: string | null;
  joinedAt: string;
  email: string;
  displayName: string;
  employmentPercent: number | null;
  a1InPlace: boolean;
  a1ValidUntil: string | null;
  frontierBefore2012: boolean;
  contractDaysPerYear?: number | null;
  /** First / last employment day for historical import. Null means that bound is open. */
  employedFrom: string | null;
  employedUntil: string | null;
}

export async function updateCompanyRetention(companyId: string, months: number) {
  const n = clampRetentionMonths(months);
  const { error } = await client()
    .from('bd_companies')
    .update({ data_retention_months: n })
    .eq('id', companyId);
  if (error) throw error;
  return n;
}

export async function listMembers(companyId: string): Promise<CompanyMemberRow[]> {
  const base = 'id, role, border_pack_id, annual_working_days, active, removed_at, user_id, joined_at, bd_profiles(email, display_name)';
  const query = (columns: string) => client().from('bd_company_members').select(columns).eq('company_id', companyId);
  const data = await selectWithProfileFallback(base, query);
  return (data || []).map((m: any) => ({
    id: m.id,
    userId: m.user_id,
    role: m.role,
    borderPackId: m.border_pack_id,
    annualWorkingDays: m.annual_working_days,
    active: m.active,
    removedAt: m.removed_at ?? null,
    joinedAt: m.joined_at,
    employedFrom: m.employed_from ?? null,
    employedUntil: m.employed_until ?? null,
    email: m.bd_profiles?.email ?? '',
    displayName: m.bd_profiles?.display_name?.trim() || m.bd_profiles?.email || '',
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
  if (profile.contractDaysPerYear !== undefined) {
    const { error: daysError } = await client().rpc('bd_update_member_contract_days', {
      p_company_id: companyId,
      p_contract_days_per_year: profile.contractDaysPerYear,
    });
    if (daysError && !(isSchemaLag(daysError) && profile.contractDaysPerYear === null)) throw daysError;
  }
  if (profile.employmentFullMonths !== undefined || profile.employmentFullWeeks !== undefined) {
    const { error: pyError } = await client().rpc('bd_update_member_part_year', {
      p_company_id: companyId,
      p_employment_full_months: profile.employmentFullMonths ?? null,
      p_employment_full_weeks: profile.employmentFullWeeks ?? null,
    });
    if (
      pyError &&
      !(
        isSchemaLag(pyError) &&
        (profile.employmentFullMonths == null || profile.employmentFullMonths === undefined) &&
        (profile.employmentFullWeeks == null || profile.employmentFullWeeks === undefined)
      )
    )
      throw pyError;
  }
}

/**
 * HR recording an employee's employment %, A1 and working-days base. RLS and column grants decide
 * who may. annualWorkingDays null means "follow employment %"; undefined leaves it unchanged.
 */
export async function updateEmployeeProfile(
  companyId: string,
  employeeUserId: string,
  profile: MemberProfile & { annualWorkingDays?: number | null },
): Promise<void> {
  const fields = {
    employment_percent: profile.employmentPercent,
    a1_in_place: profile.a1InPlace,
    a1_valid_until: profile.a1ValidUntil,
    frontier_before_2012: !!profile.frontierBefore2012,
    ...(profile.annualWorkingDays === undefined ? {} : { annual_working_days: profile.annualWorkingDays }),
  };
  const extra: Record<string, number | string | null> = {};
  if (profile.contractDaysPerYear !== undefined) extra.contract_days_per_year = profile.contractDaysPerYear;
  if (profile.employmentFullMonths !== undefined) extra.employment_full_months = profile.employmentFullMonths;
  if (profile.employmentFullWeeks !== undefined) extra.employment_full_weeks = profile.employmentFullWeeks;
  if (profile.employedFrom !== undefined) extra.employed_from = profile.employedFrom;
  if (profile.employedUntil !== undefined) extra.employed_until = profile.employedUntil;
  const run = (patch: Record<string, number | string | null>) =>
    client()
      .from('bd_company_members')
      .update({ ...fields, ...patch })
      .eq('company_id', companyId)
      .eq('user_id', employeeUserId)
      .select('id');
  let { data, error } = await run(extra);
  // Clearing a value the database cannot hold yet is harmless; setting one must fail visibly.
  if (isSchemaLag(error) && profile.employedFrom == null && profile.employedUntil == null) {
    const rest = { ...extra };
    delete rest.employed_from;
    delete rest.employed_until;
    ({ data, error } = await run(rest));
    if (isSchemaLag(error)) {
      const clearing =
        (profile.contractDaysPerYear == null || profile.contractDaysPerYear === undefined) &&
        (profile.employmentFullMonths == null || profile.employmentFullMonths === undefined) &&
        (profile.employmentFullWeeks == null || profile.employmentFullWeeks === undefined);
      if (clearing) ({ data, error } = await run({}));
      else if ('employment_full_months' in rest || 'employment_full_weeks' in rest) {
        const withoutPy = { ...rest };
        delete withoutPy.employment_full_months;
        delete withoutPy.employment_full_weeks;
        ({ data, error } = await run(withoutPy));
        if (isSchemaLag(error) && (profile.contractDaysPerYear == null || profile.contractDaysPerYear === undefined)) {
          ({ data, error } = await run({}));
        }
      }
    }
  }
  if (error) throw error;
  // RLS hides a forbidden row instead of raising, so "nothing updated" is the refusal.
  if (!data?.length) throw new Error('profile update denied');
}

/**
 * Leavers: the owner role stays out of reach here, and HR's own row is refused by RLS. An owner
 * could lock themselves out otherwise, as bd_members_update allows owners every row.
 */
export function canDeactivateMember(
  actor: { userId: string; role: CompanyRole },
  target: { userId: string; role: CompanyRole },
): boolean {
  // A2-02: remove/reactivate/promote are owner-only (RLS trigger + UI).
  return actor.role === 'owner' && target.role !== 'owner' && target.userId !== actor.userId;
}

/**
 * Ends a member's access; day logs stay under the company's retention setting. Then aligns Stripe
 * with the seat count the database trigger has already updated. billingSynced false means the
 * member is gone but the subscription was not confirmed as updated.
 */
export async function deactivateMember(companyId: string, memberUserId: string): Promise<{ billingSynced: boolean }> {
  const { data, error } = await client()
    .from('bd_company_members')
    .update({ active: false })
    .eq('company_id', companyId)
    .eq('user_id', memberUserId)
    .neq('role', 'owner')
    .select('id');
  if (error) throw error;
  // RLS hides a forbidden row instead of raising, so "nothing updated" is the refusal.
  if (!data?.length) throw new Error('deactivation denied');
  try {
    const sync = await syncCompanyBilling(companyId);
    return { billingSynced: sync?.available !== false };
  } catch {
    return { billingSynced: false };
  }
}

export async function updateMyDisplayName(displayName: string): Promise<void> {
  const userId = await currentUserId();
  if (!userId) throw new Error('not authenticated');
  const { error } = await client().from('bd_profiles').update({ display_name: displayName.trim() }).eq('id', userId);
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
    lang: row.lang || 'en',
  };
}

/** Why bd-send-invite refused to email: no paid or trial access, or a send limit. */
export type InviteEmailBlock = 'no_access' | 'rate_limited';

export type CreateInviteError = 'already_member' | 'pending_exists';

export async function createInvite(
  companyId: string,
  email: string,
  role: CompanyRole = 'employee',
  lang = 'en',
): Promise<{ invite: Invitation; emailed: boolean; emailBlock: InviteEmailBlock | null; reused?: boolean }> {
  const c = client();
  const normalized = email.trim().toLowerCase();

  // F8: refuse when this address is already an active member (including self-invite).
  const members = await listMembers(companyId);
  if (members.some((m) => m.active && m.email.trim().toLowerCase() === normalized)) {
    throw Object.assign(new Error('already_member'), { code: 'already_member' as CreateInviteError });
  }

  // F10: reuse a pending invite for the same address instead of minting a new token.
  const pending = await listInvites(companyId, 'pending');
  let existing = pending.find((i) => i.email.trim().toLowerCase() === normalized);
  if (existing) {
    // Keep stored invite language in sync with the language HR chose for this send.
    if (existing.lang !== lang) {
      await c.from('bd_invitations').update({ lang }).eq('id', existing.id).eq('company_id', companyId);
      existing = { ...existing, lang };
    }
    return { invite: existing, reused: true, ...(await resendInvite(companyId, existing.id, lang)) };
  }

  const { data, error } = await c
    .from('bd_invitations')
    .insert({ company_id: companyId, email: normalized, role, invited_by: await currentUserId(), lang })
    .select('*')
    .single();
  if (error) throw error;
  // The invite exists either way; HR can always share the link if the email is dry-run or fails.
  return { invite: mapInvite(data), ...(await resendInvite(companyId, data.id, lang)) };
}

export type ResendResult = { emailed: boolean; emailBlock: InviteEmailBlock | null };

/** Emails an existing invite: same token, and the same plan check and send limits as the first email. */
export async function resendInvite(companyId: string, invitationId: string, lang = 'en'): Promise<ResendResult> {
  const sent = await client().functions.invoke('bd-send-invite', { body: { invitationId, companyId, lang } });
  const status = (sent.error as { context?: { status?: number } } | null)?.context?.status;
  return {
    emailed: !sent.error && sent.data?.sent === true,
    emailBlock: status === 402 ? 'no_access' : status === 429 ? 'rate_limited' : null,
  };
}

/** Only a pending invite can be revoked. RLS keeps owner invites to owners. */
export async function revokeInvite(companyId: string, inviteId: string): Promise<void> {
  const { data, error } = await client()
    .from('bd_invitations')
    .update({ status: 'revoked' })
    .eq('id', inviteId)
    .eq('company_id', companyId)
    .eq('status', 'pending')
    .select('id');
  if (error) throw error;
  if (!data?.length) throw new Error('revoke denied');
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
  /** Set when the employee cleared the day; employer row kept (A2-01 / AR3-02). */
  voidedAt?: string | null;
  priorDayType?: DayType | null;
  correctedAt?: string | null;
  /** Kept when the employee account is deleted (AR3-03). */
  employeeLabel?: string | null;
  /** employee: the person logged it. hr: HR imported it. Missing on an old RPC means employee. */
  entrySource?: 'employee' | 'hr';
  importedAt?: string | null;
  employeeConfirmedAt?: string | null;
  employeeCorrectedAt?: string | null;
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

function noteColumn(note: string | undefined): { note?: string | null } {
  return note === undefined ? {} : { note: note.trim() || null };
}

/** The date is held by the caller's other company: the database refuses to move it (A3-30). */
export function isDayLogOtherCompany(e: unknown): boolean {
  return (e as { code?: string } | null)?.code === 'BD001';
}

export async function upsertDayLog(opts: {
  companyId: string;
  workDate: string;
  dayType: DayType;
  overnightAway?: boolean;
  dayShare?: 0.5 | 1;
  /** Undefined leaves a saved note as it is; empty clears it. */
  note?: string;
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
            // Re-log after a soft void: clear the void; trigger stamps corrected_at.
            voided_at: null,
            ...noteColumn(opts.note),
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
    voided_at?: string | null;
    prior_day_type?: DayType | null;
    corrected_at?: string | null;
    employee_label?: string | null;
    entry_source?: 'employee' | 'hr' | null;
    imported_at?: string | null;
    employee_confirmed_at?: string | null;
    employee_corrected_at?: string | null;
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
    voidedAt: r.voided_at ?? null,
    priorDayType: r.prior_day_type ?? null,
    correctedAt: r.corrected_at ?? null,
    employeeLabel: r.employee_label ?? null,
    entrySource: r.entry_source === 'hr' ? 'hr' : 'employee',
    importedAt: r.imported_at ?? null,
    employeeConfirmedAt: r.employee_confirmed_at ?? null,
    employeeCorrectedAt: r.employee_corrected_at ?? null,
  }));
}

export async function importCompanyDayLogs(companyId: string, rows: ImportRpcRow[]): Promise<ImportRpcResult> {
  const { data, error } = await client().rpc('bd_import_company_day_logs', {
    p_company_id: companyId,
    p_rows: rows,
  });
  if (error) throw error;
  return data as ImportRpcResult;
}

/** The employee agrees an HR-imported day is right. A later edit still wins. */
export async function confirmImportedDay(companyId: string, workDate: string): Promise<void> {
  const { error } = await client().rpc('bd_confirm_imported_day', {
    p_company_id: companyId,
    p_work_date: workDate,
  });
  if (error) throw error;
}

/**
 * The caller's own private notes. A direct read, so RLS limits it to their own rows, unlike the RPC
 * above that HR shares, which never returns a note.
 */
export async function listMyDayNotes(companyId: string): Promise<Map<string, string>> {
  const userId = await currentUserId();
  if (!userId) return new Map();
  const rows = await allPages<{ work_date: string; note: string }>((from, to) =>
    client()
      .from('bd_day_logs')
      .select('work_date, note')
      .eq('company_id', companyId)
      .eq('employee_user_id', userId)
      .not('note', 'is', null)
      .order('work_date', { ascending: true })
      .range(from, to),
  );
  return new Map(rows.map((r) => [r.work_date, r.note]));
}

export interface FormerCompany {
  companyId: string;
  company: string;
  dayCount: number;
  firstDate: string;
  lastDate: string;
}

/** Companies the caller has left but still holds logged days in (E24). */
export async function listFormerCompanies(): Promise<FormerCompany[]> {
  const { data, error } = await client().rpc('bd_my_day_log_companies');
  if (isSchemaLag(error)) return [];
  if (error) throw error;
  type Row = { company_id: string; company_name: string; active: boolean; day_count: number; first_date: string; last_date: string };
  return ((data ?? []) as Row[])
    .filter((r) => !r.active)
    .map((r) => ({
      companyId: r.company_id,
      company: r.company_name,
      dayCount: Number(r.day_count),
      firstDate: r.first_date,
      lastDate: r.last_date,
    }));
}

export type OwnDay = { date: string; type: DayType; overnightAway: boolean; dayShare: 0.5 | 1; note?: string };

/** The caller's own days in one company, notes included. RLS allows this after they have left it. */
export async function listMyDaysIn(companyId: string): Promise<OwnDay[]> {
  const userId = await currentUserId();
  if (!userId) return [];
  type Row = { work_date: string; day_type: DayType; overnight_away_for_work: boolean; day_share: number; note: string | null };
  const rows = await allPages<Row>((from, to) =>
    client()
      .from('bd_day_logs')
      .select('work_date, day_type, overnight_away_for_work, day_share, note')
      .eq('company_id', companyId)
      .eq('employee_user_id', userId)
      .is('employee_cleared_at', null)
      .is('voided_at', null)
      .order('work_date', { ascending: true })
      .range(from, to),
  );
  return rows.map((r) => ({
    date: r.work_date,
    type: r.day_type,
    overnightAway: !!r.overnight_away_for_work,
    dayShare: r.day_share === 0.5 ? 0.5 : 1,
    ...(r.note ? { note: r.note } : {}),
  }));
}

/** F26 / A2-01: soft-void one day in the live company log (employer keeps the row). */
export async function deleteMyDayLog(companyId: string, workDate: string): Promise<void> {
  const userId = await currentUserId();
  if (!userId) throw new Error('not authenticated');
  const { error } = await client().rpc('bd_void_my_day_log', {
    p_company_id: companyId,
    p_work_date: workDate,
  });
  if (error) throw error;
}

/** F26: remove one day from the individual plan log. */
export async function deleteMyPersonalDayLog(workDate: string): Promise<void> {
  const userId = await currentUserId();
  if (!userId) throw new Error('not authenticated');
  const { error } = await client()
    .from('bd_personal_day_logs')
    .delete()
    .eq('user_id', userId)
    .eq('work_date', workDate);
  if (error) throw error;
}

export async function deleteMyDayLogs(companyId: string): Promise<void> {
  const userId = await currentUserId();
  if (!userId) throw new Error('not authenticated');
  // E24: leavers clear only their own copy (notes wiped, company row kept under retention).
  // A2-01 / AR3-02: active members may not bulk-wipe employer rows.
  const { data: mem, error: memErr } = await client()
    .from('bd_company_members')
    .select('active')
    .eq('company_id', companyId)
    .eq('user_id', userId)
    .maybeSingle();
  if (memErr) throw memErr;
  if (!mem?.active) {
    const { error } = await client().rpc('bd_clear_my_day_log_copy', { p_company_id: companyId });
    if (error) throw error;
    return;
  }
  throw new Error('bulk_clear_not_allowed');
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

export interface OwnAccountRecords {
  displayName: string | null;
  noticeRecords: Array<{ companyId: string; version: string; language: string; acceptedAt: string }>;
  subscriptions: Array<{
    planKind: string;
    status: string;
    currentPeriodEnd: string | null;
    trialEndsAt: string | null;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
  }>;
}

/** The caller's own profile, notice records and individual subscriptions, for the account export. */
export async function getOwnAccountRecords(userId: string): Promise<OwnAccountRecords> {
  const c = client();
  const [profile, notices, subs] = await Promise.all([
    c.from('bd_profiles').select('display_name').eq('id', userId).maybeSingle(),
    c.from('bd_consents').select('company_id, consent_version, text_lang, accepted_at').eq('user_id', userId),
    c
      .from('bd_subscriptions')
      .select('plan_kind, status, current_period_end, trial_ends_at, stripe_customer_id, stripe_subscription_id')
      .eq('user_id', userId),
  ]);
  if (profile.error) throw profile.error;
  if (notices.error) throw notices.error;
  if (subs.error) throw subs.error;
  return {
    displayName: profile.data?.display_name ?? null,
    noticeRecords: (notices.data || []).map((n) => ({
      companyId: n.company_id,
      version: n.consent_version,
      language: n.text_lang,
      acceptedAt: n.accepted_at,
    })),
    subscriptions: (subs.data || []).map((s) => ({
      planKind: s.plan_kind,
      status: s.status,
      currentPeriodEnd: s.current_period_end,
      trialEndsAt: s.trial_ends_at,
      stripeCustomerId: s.stripe_customer_id,
      stripeSubscriptionId: s.stripe_subscription_id,
    })),
  };
}

/** Any individual plan not yet cancelled, including past_due: see planIsCancellable. */
export async function hasCancellableIndividualPlan(): Promise<boolean> {
  const userId = await currentUserId();
  if (!userId) return false;
  const { data, error } = await client()
    .from('bd_subscriptions')
    .select('status')
    .eq('plan_kind', 'individual')
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []).some((s) => planIsCancellable(s.status));
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
    note?: string | null;
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
  const base = 'work_date, day_type, border_pack_id, note';
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
    ...(r.note ? { note: r.note } : {}),
  }));
}

export async function upsertPersonalDayLog(opts: {
  workDate: string;
  dayType: DayType;
  borderPackId: BorderId | null;
  overnightAway?: boolean;
  dayShare?: 0.5 | 1;
  /** Undefined leaves a saved note as it is; empty clears it. */
  note?: string;
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
            ...noteColumn(opts.note),
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

/**
 * Real Supabase API for BorderDay company tenants (bd_* tables).
 * DEMO / offline preview still uses supabaseMock.ts.
 */
import { supabase, supabaseConfigured } from './supabase';
import type { CompanyRole } from '../company/types';
import type { DayType } from '../borders/types';

export function getBackendMode(): 'supabase' | 'unconfigured' {
  return supabaseConfigured ? 'supabase' : 'unconfigured';
}

export async function createCompany(name: string): Promise<{ companyId: string }> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.rpc('bd_create_company', { company_name: name });
  if (error) throw error;
  return { companyId: data as string };
}

export async function listMyCompanies(): Promise<Array<{ id: string; name: string; role: CompanyRole; subscription_status: string; seat_count: number }>> {
  if (!supabase) return [];
  const { data: mems, error } = await supabase
    .from('bd_company_members')
    .select('role, company_id, bd_companies(id, name, subscription_status, seat_count)')
    .eq('active', true);
  if (error) throw error;
  return (mems || []).map((m: any) => ({
    id: m.bd_companies.id,
    name: m.bd_companies.name,
    role: m.role as CompanyRole,
    subscription_status: m.bd_companies.subscription_status,
    seat_count: m.bd_companies.seat_count,
  }));
}

export async function getCompany(companyId: string) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('bd_companies').select('*').eq('id', companyId).single();
  if (error) throw error;
  return data;
}

export async function listMembers(companyId: string) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('bd_company_members')
    .select('id, role, border_pack_id, annual_working_days, active, user_id, joined_at, bd_profiles(email, display_name)')
    .eq('company_id', companyId);
  if (error) throw error;
  return data || [];
}

export async function createInvite(companyId: string, email: string, role: CompanyRole = 'employee') {
  if (!supabase) throw new Error('Supabase not configured');
  const { data: user } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('bd_invitations')
    .insert({ company_id: companyId, email, role, invited_by: user.user?.id ?? null })
    .select('*')
    .single();
  if (error) throw error;
  // Fire-and-forget invite email (edge fn dry-runs until Resend domain ready)
  void supabase.functions.invoke('bd-send-invite', {
    body: { invitationId: data.id, companyId },
  });
  return data;
}

export async function getInviteByToken(token: string) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.rpc('bd_get_invite_by_token', { invite_token: token });
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function acceptInvite(token: string, consentVersion: string, textLang: string) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.rpc('bd_accept_invite', {
    invite_token: token,
    consent_version: consentVersion,
    text_lang: textLang,
  });
  if (error) throw error;
  const companyId = data as string;
  // Seat count trigger already ran; align Stripe flat↔per-seat if subscribed.
  void supabase.functions.invoke('bd-sync-company-billing', { body: { companyId } });
  return companyId;
}

/** Explicitly re-sync company Stripe item to current seat_count (flat ≤7 / per-seat ≥8). */
export async function syncCompanyBilling(companyId: string) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.functions.invoke('bd-sync-company-billing', {
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

export async function upsertDayLog(opts: {
  companyId: string;
  workDate: string;
  dayType: DayType;
  note?: string;
}) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('not authenticated');
  const { data, error } = await supabase
    .from('bd_day_logs')
    .upsert(
      {
        company_id: opts.companyId,
        employee_user_id: user.user.id,
        work_date: opts.workDate,
        day_type: opts.dayType,
        note: opts.note ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'employee_user_id,work_date' },
    )
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function listDayLogs(companyId: string, employeeUserId?: string) {
  if (!supabase) throw new Error('Supabase not configured');
  let q = supabase.from('bd_day_logs').select('*').eq('company_id', companyId).order('work_date', { ascending: false });
  if (employeeUserId) q = q.eq('employee_user_id', employeeUserId);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

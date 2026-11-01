import { supabase } from './supabase';

export type ContractRequestKind = 'withdrawal' | 'cancellation';
export type ReceiptOutcome = 'sent' | 'dry_run' | 'failed' | 'limited';

export type ContractRequestResult =
  | { ok: true; id: string; receivedAt: string; receipt: ReceiptOutcome }
  | { ok: false };

/** Never throws: anything but a recorded request sends the person to the email route instead. */
export async function submitContractRequest(request: {
  kind: ContractRequestKind;
  name: string;
  email: string;
  orderReference: string;
  orderDate: string;
  lang: string;
}): Promise<ContractRequestResult> {
  if (!supabase) return { ok: false };
  try {
    const { data, error } = await supabase.functions.invoke('bd-contract-request', { body: request });
    if (error || data?.recorded !== true || !data.id || !data.receivedAt) return { ok: false };
    return { ok: true, id: data.id, receivedAt: data.receivedAt, receipt: data.receipt };
  } catch {
    return { ok: false };
  }
}

/** Date and time on the site's reference clock, in the page's language. */
export function formatReceivedAt(iso: string, locale: string): { date: string; time: string } {
  const at = new Date(iso);
  return {
    date: new Intl.DateTimeFormat(locale, { timeZone: 'Europe/Zurich', dateStyle: 'long' }).format(at),
    time: new Intl.DateTimeFormat(locale, { timeZone: 'Europe/Zurich', timeStyle: 'medium' }).format(at),
  };
}

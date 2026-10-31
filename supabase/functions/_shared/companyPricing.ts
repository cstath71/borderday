/**
 * BorderDay company billing: €5 / active employee / month, floor €39 / month.
 * Yearly = 10 × monthly (2 months free).
 *
 * Seats 1–7 → flat minimum (qty 1).
 * Seats ≥ 8 → per-seat price × seats (8 × €5 = €40 ≥ €39).
 */
export const COMPANY_FLAT_MAX_SEATS = 7;
export const COMPANY_SEAT_UNIT_EUR_MONTH = 5;
export const COMPANY_MIN_EUR_MONTH = 39;
export const COMPANY_MIN_EUR_YEAR = 390; // 10 × 39
export const COMPANY_SEAT_EUR_YEAR = 50; // 10 × 5

export type BillingInterval = 'month' | 'year';
export type CompanyBillingMode = 'flat_minimum' | 'per_seat';

export type CompanyBillingSelection = {
  mode: CompanyBillingMode;
  quantity: number;
  /** Conceptual price kind used to pick Stripe price IDs / env keys. */
  priceKind: 'min' | 'seat';
  /** Active employee seats used for the decision (floored at 0). */
  seats: number;
  /** Amount that would be charged in EUR for the interval (for tests / display). */
  amountEur: number;
};

/** Resolve which company price + quantity to bill for a given active seat count. */
export function resolveCompanyBilling(
  activeSeats: number,
  interval: BillingInterval,
): CompanyBillingSelection {
  const seats = Math.max(0, Math.floor(Number(activeSeats) || 0));
  if (seats <= COMPANY_FLAT_MAX_SEATS) {
    return {
      mode: 'flat_minimum',
      quantity: 1,
      priceKind: 'min',
      seats,
      amountEur: interval === 'year' ? COMPANY_MIN_EUR_YEAR : COMPANY_MIN_EUR_MONTH,
    };
  }
  return {
    mode: 'per_seat',
    quantity: seats,
    priceKind: 'seat',
    seats,
    amountEur:
      interval === 'year'
        ? seats * COMPANY_SEAT_EUR_YEAR
        : seats * COMPANY_SEAT_UNIT_EUR_MONTH,
  };
}

/** True when this Stripe price id is one of the flat-minimum company prices. */
export function isCompanyFlatMinimumPrice(
  priceId: string | null | undefined,
  minMonthId: string | null | undefined,
  minYearId: string | null | undefined,
): boolean {
  if (!priceId) return false;
  return priceId === minMonthId || priceId === minYearId;
}

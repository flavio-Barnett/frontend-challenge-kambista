import type { CurrencyCode } from '~/shared/format/money';

export const CURRENCIES = [
  'USD',
  'PEN',
] as const satisfies readonly CurrencyCode[];

export type Currency = (typeof CURRENCIES)[number];

export function otherCurrency(currency: Currency): Currency {
  return currency === 'USD' ? 'PEN' : 'USD';
}

const LOCALE = 'es-PE';

const CURRENCY_SYMBOLS = {
  USD: 'US$',
  PEN: 'S/',
} as const;

export type CurrencyCode = keyof typeof CURRENCY_SYMBOLS;

const amountFormat = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const rateFormat = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

export function formatMoney(amount: number, currency: CurrencyCode): string {
  return `${CURRENCY_SYMBOLS[currency]} ${amountFormat.format(amount)}`;
}

export function formatCents(cents: number, currency: CurrencyCode): string {
  return formatMoney(cents / 100, currency);
}

export function formatRate(rate: number): string {
  return rateFormat.format(rate);
}

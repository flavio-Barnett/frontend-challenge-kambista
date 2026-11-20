export const MAX_AMOUNT_CENTS = 999_999_999;

const AMOUNT_PATTERN = /^(\d+)(?:\.(\d*))?$/;
const MAX_DECIMALS = 2;

export type AmountIssue =
  'required' | 'malformed' | 'too-many-decimals' | 'not-positive' | 'too-large';

export type AmountReading =
  { ok: true; cents: number } | { ok: false; issue: AmountIssue };

export function sanitizeAmountInput(input: string): string {
  const withDotSeparator = input.includes('.')
    ? input.replaceAll(',', '')
    : input.replaceAll(',', '.');
  const [integerPart = '', ...fractionParts] = withDotSeparator
    .replace(/[^\d.]/g, '')
    .split('.');
  if (fractionParts.length === 0) {
    return integerPart;
  }
  const fraction = fractionParts.join('').slice(0, MAX_DECIMALS);
  return `${integerPart || '0'}.${fraction}`;
}

export function readAmount(input: string): AmountReading {
  const normalized = input.trim().replace(',', '.');
  if (normalized === '') {
    return { ok: false, issue: 'required' };
  }
  const match = AMOUNT_PATTERN.exec(normalized);
  if (!match) {
    return { ok: false, issue: 'malformed' };
  }
  const [, integerPart = '', fractionPart = ''] = match;
  if (fractionPart.length > MAX_DECIMALS) {
    return { ok: false, issue: 'too-many-decimals' };
  }
  const integerDigits = integerPart.replace(/^0+/, '');
  if (integerDigits.length > String(MAX_AMOUNT_CENTS).length - MAX_DECIMALS) {
    return { ok: false, issue: 'too-large' };
  }
  const cents = Number(
    `${integerDigits || '0'}${fractionPart.padEnd(MAX_DECIMALS, '0')}`,
  );
  if (cents === 0) {
    return { ok: false, issue: 'not-positive' };
  }
  if (cents > MAX_AMOUNT_CENTS) {
    return { ok: false, issue: 'too-large' };
  }
  return { ok: true, cents };
}

export function centsToAmount(cents: number): number {
  return cents / 100;
}

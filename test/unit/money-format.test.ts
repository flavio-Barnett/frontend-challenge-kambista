import { describe, expect, it } from 'vitest';
import {
  formatCents,
  formatMoney,
  formatRate,
} from '../../app/shared/format/money';

describe('formatMoney', () => {
  it.each([
    [1000, 'USD', 'US$ 1,000.00'],
    [0.03, 'USD', 'US$ 0.03'],
    [9_999_999.99, 'USD', 'US$ 9,999,999.99'],
  ] as const)('formats %d %s as %s', (amount, currency, expected) => {
    expect(formatMoney(amount, currency)).toBe(expected);
  });
});

describe('formatCents', () => {
  it('formats an amount in cents', () => {
    expect(formatCents(37_390, 'PEN')).toBe('S/ 373.90');
  });
});

describe('formatRate', () => {
  it.each([
    [3.739, '3.739'],
    [4, '4.000'],
  ])('formats %d with three decimals', (rate, expected) => {
    expect(formatRate(rate)).toBe(expected);
  });
});

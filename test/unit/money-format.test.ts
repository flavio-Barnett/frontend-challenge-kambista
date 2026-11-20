import { describe, expect, it } from 'vitest';
import { formatMoney, formatRate } from '../../app/shared/format/money';

describe('formatMoney', () => {
  it.each([
    [3352, 'PEN', 'S/ 3,352.00'],
    [1000, 'USD', 'US$ 1,000.00'],
    [373.9, 'PEN', 'S/ 373.90'],
    [0.03, 'USD', 'US$ 0.03'],
    [9_999_999.99, 'USD', 'US$ 9,999,999.99'],
  ] as const)('formats %d %s as %s', (amount, currency, expected) => {
    expect(formatMoney(amount, currency)).toBe(expected);
  });
});

describe('formatRate', () => {
  it.each([
    [3.739, '3.739'],
    [3.7, '3.700'],
    [4, '4.000'],
  ])('formats %d with three decimals', (rate, expected) => {
    expect(formatRate(rate)).toBe(expected);
  });
});

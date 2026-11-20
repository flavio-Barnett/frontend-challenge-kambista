import { describe, expect, it } from 'vitest';
import { MAX_AMOUNT_CENTS } from '../../app/features/transactions/domain/amount';
import { quote } from '../../app/features/transactions/domain/quote';

const RATES = { compra: 3.728, venta: 3.739 };

describe('quote', () => {
  it('converts dollars to soles with the venta rate', () => {
    expect(
      quote({ cents: 10_000, from: 'USD', to: 'PEN', rates: RATES }),
    ).toEqual({
      convertedCents: 37_390,
      appliedRate: 3.739,
      rateSide: 'venta',
    });
  });

  it('converts soles to dollars with the compra rate', () => {
    expect(
      quote({ cents: 10_000, from: 'PEN', to: 'USD', rates: RATES }),
    ).toEqual({
      convertedCents: 2_682,
      appliedRate: 3.728,
      rateSide: 'compra',
    });
  });

  it.each([
    ['0.01 USD at 3.415 (0.03415)', 1, 'USD', 3.415, 3],
    ['0.02 USD at 3.425 (0.0685)', 2, 'USD', 3.425, 7],
    ['1 PEN at 3.408 (0.29342…)', 100, 'PEN', 3.408, 29],
    ['1 PEN at 4 (0.25)', 100, 'PEN', 4, 25],
    ['0.10 USD at 3.725 (0.3725)', 10, 'USD', 3.725, 37],
    ['0.10 USD at 3.735 (0.3735 rounds half up)', 10, 'USD', 3.735, 37],
    ['1.10 USD at 3.735 (4.1085 rounds half up)', 110, 'USD', 3.735, 411],
  ] as const)('rounds %s half up', (_, cents, from, rate, expected) => {
    const rates = { compra: rate, venta: rate };
    expect(
      quote({ cents, from, to: from === 'USD' ? 'PEN' : 'USD', rates })
        ?.convertedCents,
    ).toBe(expected);
  });

  it('rounds half up where floating point math would round down', () => {
    expect(
      quote({
        cents: 115,
        from: 'USD',
        to: 'PEN',
        rates: { compra: 1, venta: 3.5 },
      })?.convertedCents,
    ).toBe(403);
  });

  it('handles rates with more than three decimals', () => {
    expect(
      quote({
        cents: 10_000,
        from: 'USD',
        to: 'PEN',
        rates: { compra: 1, venta: 3.73951 },
      })?.convertedCents,
    ).toBe(37_395);
  });

  it('converts the maximum amount without losing precision', () => {
    expect(
      quote({ cents: MAX_AMOUNT_CENTS, from: 'USD', to: 'PEN', rates: RATES })
        ?.convertedCents,
    ).toBe(3_738_999_996);
    expect(
      quote({ cents: MAX_AMOUNT_CENTS, from: 'PEN', to: 'USD', rates: RATES })
        ?.convertedCents,
    ).toBe(268_240_343);
  });

  it('returns no quote for the same currency or an unusable rate', () => {
    expect(
      quote({ cents: 100, from: 'USD', to: 'USD', rates: RATES }),
    ).toBeNull();
    expect(
      quote({
        cents: 100,
        from: 'PEN',
        to: 'USD',
        rates: { compra: 0, venta: 1 },
      }),
    ).toBeNull();
  });
});

import type { Currency } from './currency';

export interface Rates {
  compra: number;
  venta: number;
}

export type RateSide = keyof Rates;

export interface Quote {
  convertedCents: number;
  appliedRate: number;
  rateSide: RateSide;
}

interface QuoteRequest {
  cents: number;
  from: Currency;
  to: Currency;
  rates: Rates;
}

interface ScaledRate {
  units: bigint;
  scale: bigint;
}

const DECIMAL_PATTERN = /^(\d+)(?:\.(\d+))?$/;

function scaleRate(rate: number): ScaledRate | null {
  const match = DECIMAL_PATTERN.exec(String(rate));
  if (!match) {
    return null;
  }
  const [, integerPart = '', fractionPart = ''] = match;
  const units = BigInt(`${integerPart}${fractionPart}`);
  if (units === 0n) {
    return null;
  }
  return { units, scale: 10n ** BigInt(fractionPart.length) };
}

function divideRoundingHalfUp(numerator: bigint, denominator: bigint): bigint {
  return (2n * numerator + denominator) / (2n * denominator);
}

export function quote({ cents, from, to, rates }: QuoteRequest): Quote | null {
  if (from === to) {
    return null;
  }
  const rateSide: RateSide = from === 'USD' ? 'venta' : 'compra';
  const appliedRate = rates[rateSide];
  const scaled = scaleRate(appliedRate);
  if (!scaled) {
    return null;
  }
  const amount = BigInt(cents);
  const converted =
    from === 'USD'
      ? divideRoundingHalfUp(amount * scaled.units, scaled.scale)
      : divideRoundingHalfUp(amount * scaled.scale, scaled.units);
  return { convertedCents: Number(converted), appliedRate, rateSide };
}

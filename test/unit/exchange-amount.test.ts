import { describe, expect, it } from 'vitest';
import {
  MAX_AMOUNT_CENTS,
  readAmount,
  sanitizeAmountInput,
} from '../../app/features/transactions/domain/amount';

describe('readAmount', () => {
  it.each([
    ['100', 10_000],
    ['100.5', 10_050],
    ['100,5', 10_050],
    [' 0.01 ', 1],
    ['007.25', 725],
    ['100.', 10_000],
    ['9999999.99', MAX_AMOUNT_CENTS],
  ])('reads %j as %i cents', (input, cents) => {
    expect(readAmount(input)).toEqual({ ok: true, cents });
  });

  it.each([
    ['', 'required'],
    ['   ', 'required'],
    ['-5', 'malformed'],
    ['1e3', 'malformed'],
    ['.5', 'malformed'],
    ['1,000.50', 'malformed'],
    ['1.234', 'too-many-decimals'],
    ['0', 'not-positive'],
    ['10000000', 'too-large'],
    ['00000000010000000', 'too-large'],
  ])('rejects %j as %s', (input, issue) => {
    expect(readAmount(input)).toEqual({ ok: false, issue });
  });
});

describe('sanitizeAmountInput', () => {
  it.each([
    ['1a0b0', '100'],
    ['12,50', '12.50'],
    ['1.2.3', '1.23'],
    ['$ 1,000.50', '1000.50'],
    ['-5e3', '53'],
    ['.5', '0.5'],
    ['1.234', '1.23'],
    ['10.', '10.'],
  ])('turns %j into %j', (input, sanitized) => {
    expect(sanitizeAmountInput(input)).toBe(sanitized);
  });
});

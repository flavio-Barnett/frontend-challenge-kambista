import { describe, expect, it } from 'vitest';
import {
  isValidRange,
  limaToday,
  matchingPreset,
  presetRange,
} from '../../app/features/transactions/domain/history-range';

describe('limaToday', () => {
  it.each([
    ['2026-11-20T04:59:59.000Z', '2026-11-19'],
    ['2026-11-20T05:00:00.000Z', '2026-11-20'],
    ['2026-01-01T03:00:00.000Z', '2025-12-31'],
  ])('reads %s as the Lima day %s', (instant, day) => {
    expect(limaToday(new Date(instant))).toBe(day);
  });
});

describe('presetRange', () => {
  it.each([
    ['last-7-days', '2026-11-20', '2026-11-14'],
    ['last-30-days', '2026-11-20', '2026-10-22'],
    ['this-month', '2026-11-20', '2026-11-01'],
    ['last-7-days', '2026-01-03', '2025-12-28'],
  ] as const)('%s ending on %s starts on %s', (preset, today, startDate) => {
    expect(presetRange(preset, today)).toEqual({ startDate, endDate: today });
  });

  it('recognizes the preset a range comes from', () => {
    const range = { startDate: '2026-10-22', endDate: '2026-11-20' };

    expect(matchingPreset(range, '2026-11-20')).toBe('last-30-days');
    expect(
      matchingPreset({ ...range, startDate: '2026-10-23' }, '2026-11-20'),
    ).toBeNull();
  });
});

describe('isValidRange', () => {
  const today = '2026-11-20';

  it.each([
    ['2026-11-01', '2026-11-20'],
    ['2026-11-20', '2026-11-20'],
  ])('accepts %s to %s', (startDate, endDate) => {
    expect(isValidRange({ startDate, endDate }, today)).toBe(true);
  });

  it.each([
    ['', '2026-11-20'],
    ['2026-02-30', '2026-11-20'],
    ['20-11-2026', '2026-11-20'],
    ['2026-11-21', '2026-11-20'],
    ['2026-11-01', '2026-11-21'],
  ])('rejects %j to %j', (startDate, endDate) => {
    expect(isValidRange({ startDate, endDate }, today)).toBe(false);
  });
});

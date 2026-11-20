import { describe, expect, it } from 'vitest';
import {
  readHistoryQuery,
  toHistoryQuery,
} from '../../app/features/transactions/domain/history-query';

const TODAY = '2026-11-20';
const DEFAULT_RANGE = { startDate: '2026-10-22', endDate: TODAY };

describe('readHistoryQuery', () => {
  it('reads a valid range and page', () => {
    expect(
      readHistoryQuery(
        { startDate: '2026-11-01', endDate: '2026-11-10', page: '3' },
        TODAY,
      ),
    ).toEqual({
      range: { startDate: '2026-11-01', endDate: '2026-11-10' },
      page: 3,
    });
  });

  it.each([
    [{}],
    [{ startDate: '2026-11-01' }],
    [{ startDate: '2026-11-10', endDate: '2026-11-01' }],
    [{ startDate: '2026-11-01', endDate: '2026-12-01' }],
    [{ startDate: 'hoy', endDate: '2026-11-01' }],
    [{ startDate: ['2026-11-01'], endDate: '2026-11-10' }],
  ])('falls back to the last 30 days for %j', (query) => {
    expect(readHistoryQuery({ ...query, page: '4' }, TODAY)).toEqual({
      range: DEFAULT_RANGE,
      page: 1,
    });
  });

  it.each(['0', '-2', '99999'])(
    'starts on the first page for page %j',
    (page) => {
      expect(readHistoryQuery({ ...DEFAULT_RANGE, page }, TODAY).page).toBe(1);
    },
  );
});

describe('toHistoryQuery', () => {
  it('leaves the page out on the first page', () => {
    expect(toHistoryQuery({ range: DEFAULT_RANGE, page: 1 })).toEqual(
      DEFAULT_RANGE,
    );
    expect(toHistoryQuery({ range: DEFAULT_RANGE, page: 2 })).toEqual({
      ...DEFAULT_RANGE,
      page: '2',
    });
  });
});

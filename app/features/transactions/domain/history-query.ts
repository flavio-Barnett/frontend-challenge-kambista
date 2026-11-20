import {
  DEFAULT_PRESET,
  isValidRange,
  presetRange,
  type HistoryRange,
} from './history-range';

export interface HistoryFilters {
  range: HistoryRange;
  page: number;
}

export type HistoryQuery = Record<string, string>;

const PAGE_PATTERN = /^[1-9]\d{0,3}$/;

function readText(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function readPage(value: unknown): number {
  const text = readText(value);
  return PAGE_PATTERN.test(text) ? Number(text) : 1;
}

export function readHistoryQuery(
  query: Record<string, unknown>,
  today: string,
): HistoryFilters {
  const range = {
    startDate: readText(query.startDate),
    endDate: readText(query.endDate),
  };
  if (!isValidRange(range, today)) {
    return { range: presetRange(DEFAULT_PRESET, today), page: 1 };
  }
  return { range, page: readPage(query.page) };
}

export function toHistoryQuery({ range, page }: HistoryFilters): HistoryQuery {
  const query: HistoryQuery = {
    startDate: range.startDate,
    endDate: range.endDate,
  };
  if (page > 1) {
    query.page = String(page);
  }
  return query;
}

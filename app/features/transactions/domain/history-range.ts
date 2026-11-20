export interface HistoryRange {
  startDate: string;
  endDate: string;
}

export const HISTORY_PRESETS = [
  { id: 'last-7-days', label: 'Últimos 7 días' },
  { id: 'last-30-days', label: 'Últimos 30 días' },
  { id: 'this-month', label: 'Este mes' },
] as const;

export type HistoryPreset = (typeof HISTORY_PRESETS)[number]['id'];

export const DEFAULT_PRESET: HistoryPreset = 'last-30-days';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const limaDayFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Lima',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function limaToday(now: Date = new Date()): string {
  return limaDayFormat.format(now);
}

function shiftDays(day: string, days: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  return new Date(date.getTime() + days * ONE_DAY_MS)
    .toISOString()
    .slice(0, 10);
}

export function presetRange(
  preset: HistoryPreset,
  today: string,
): HistoryRange {
  switch (preset) {
    case 'last-7-days':
      return { startDate: shiftDays(today, -6), endDate: today };
    case 'last-30-days':
      return { startDate: shiftDays(today, -29), endDate: today };
    case 'this-month':
      return { startDate: `${today.slice(0, 8)}01`, endDate: today };
  }
}

export function matchingPreset(
  range: HistoryRange,
  today: string,
): HistoryPreset | null {
  const match = HISTORY_PRESETS.find(({ id }) => {
    const candidate = presetRange(id, today);
    return (
      candidate.startDate === range.startDate &&
      candidate.endDate === range.endDate
    );
  });
  return match?.id ?? null;
}

export function isCalendarDay(value: string): boolean {
  if (!DATE_PATTERN.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

export function isValidRange(range: HistoryRange, today: string): boolean {
  return (
    isCalendarDay(range.startDate) &&
    isCalendarDay(range.endDate) &&
    range.startDate <= range.endDate &&
    range.endDate <= today
  );
}

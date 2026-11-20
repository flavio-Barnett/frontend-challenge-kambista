import type { Ref } from 'vue';
import { parseDate, type DateValue } from '@internationalized/date';
import { limaToday, type HistoryRange } from '../domain/history-range';

export interface CalendarRange {
  start: DateValue | undefined;
  end: DateValue | undefined;
}

export function useRangeCalendar(range: Ref<HistoryRange>) {
  const open = ref(false);
  const draft = shallowRef<CalendarRange | null>(null);
  const maxDay = shallowRef(parseDate(limaToday()));

  watch(open, (isOpen) => {
    if (!isOpen) {
      return;
    }
    maxDay.value = parseDate(limaToday());
    draft.value = {
      start: parseDate(range.value.startDate),
      end: parseDate(range.value.endDate),
    };
  });

  function pick(days: CalendarRange | null): void {
    draft.value = days;
    if (!days?.start || !days.end) {
      return;
    }
    range.value = {
      startDate: days.start.toString(),
      endDate: days.end.toString(),
    };
    open.value = false;
  }

  return { open, draft, maxDay, pick };
}

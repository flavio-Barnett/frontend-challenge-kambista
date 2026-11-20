import { limaToday, type HistoryRange } from '../domain/history-range';
import {
  readHistoryQuery,
  toHistoryQuery,
  type HistoryFilters,
} from '../domain/history-query';

export function useHistoryFilters() {
  const route = useRoute();
  const router = useRouter();

  const filters = computed(() => readHistoryQuery(route.query, limaToday()));

  function update(next: HistoryFilters, replace = false): Promise<unknown> {
    const location = { query: toHistoryQuery(next) };
    return replace ? router.replace(location) : router.push(location);
  }

  const range = computed({
    get: () => filters.value.range,
    set: (next: HistoryRange) => void update({ range: next, page: 1 }),
  });

  const page = computed({
    get: () => filters.value.page,
    set: (next: number) => void update({ range: range.value, page: next }),
  });

  function correctPage(next: number): Promise<unknown> {
    return update({ range: range.value, page: next }, true);
  }

  return { filters, range, page, correctPage };
}

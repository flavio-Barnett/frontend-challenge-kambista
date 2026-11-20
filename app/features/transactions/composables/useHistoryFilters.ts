import { limaToday, type HistoryRange } from '../domain/history-range';
import { readHistoryQuery, toHistoryQuery } from '../domain/history-query';

export function useHistoryFilters() {
  const route = useRoute();
  const router = useRouter();

  const filters = computed(() => readHistoryQuery(route.query, limaToday()));

  const range = computed({
    get: () => filters.value.range,
    set: (next: HistoryRange) =>
      void router.push({ query: toHistoryQuery({ range: next, page: 1 }) }),
  });

  return { filters, range };
}

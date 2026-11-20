import { useHistoryFilters } from './useHistoryFilters';
import {
  HISTORY_PAGE_SIZE,
  useTransactionHistory,
} from './useTransactionHistory';

export function useHistoryPage() {
  const { filters, range, page, correctPage } = useHistoryFilters();
  const { items, total, status, error, retry } = useTransactionHistory(filters);

  const lastPage = computed(() =>
    Math.max(1, Math.ceil(total.value / HISTORY_PAGE_SIZE)),
  );
  const pageOutOfRange = computed(
    () => status.value === 'ready' && page.value > lastPage.value,
  );
  const loading = computed(
    () => status.value === 'loading' || pageOutOfRange.value,
  );
  const isEmpty = computed(() => status.value === 'ready' && total.value === 0);

  watch(pageOutOfRange, (outOfRange) => {
    if (outOfRange) {
      void correctPage(lastPage.value);
    }
  });

  return {
    range,
    page,
    items,
    total,
    status,
    error,
    retry,
    loading,
    isEmpty,
    pageSize: HISTORY_PAGE_SIZE,
  };
}

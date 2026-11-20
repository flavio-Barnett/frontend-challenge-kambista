import { useHistoryFilters } from './useHistoryFilters';
import { useTransactionHistory } from './useTransactionHistory';

export function useHistoryPage() {
  const { filters, range } = useHistoryFilters();
  const { items, total, status, error, retry } = useTransactionHistory(filters);

  const loading = computed(() => status.value === 'loading');
  const isEmpty = computed(() => status.value === 'ready' && total.value === 0);

  return { range, items, status, error, retry, loading, isEmpty };
}

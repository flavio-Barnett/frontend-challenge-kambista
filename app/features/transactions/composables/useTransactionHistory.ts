import type { Ref } from 'vue';
import { toUserMessage } from '~/shared/errors/to-user-message';
import { getTransactionHistory, type Transaction } from '../api/transactions';
import type { HistoryFilters } from '../domain/history-query';

export const HISTORY_PAGE_SIZE = 10;

export type HistoryStatus = 'loading' | 'ready' | 'error';

export function useTransactionHistory(filters: Ref<HistoryFilters>) {
  const api = useNuxtApp().$api;

  const items = ref<Transaction[]>([]);
  const total = ref(0);
  const status = ref<HistoryStatus>('loading');
  const error = ref<string | null>(null);

  let controller: AbortController | undefined;

  async function load(): Promise<void> {
    controller?.abort();
    const current = new AbortController();
    controller = current;
    status.value = 'loading';
    error.value = null;
    try {
      const page = await getTransactionHistory(api, {
        ...filters.value.range,
        page: filters.value.page,
        limit: HISTORY_PAGE_SIZE,
        signal: current.signal,
      });
      if (current.signal.aborted) return;
      items.value = page.items;
      total.value = page.total;
      status.value = 'ready';
    } catch (failure) {
      if (current.signal.aborted) return;
      status.value = 'error';
      error.value = toUserMessage(failure);
    }
  }

  watch(
    [
      () => filters.value.range.startDate,
      () => filters.value.range.endDate,
      () => filters.value.page,
    ],
    load,
    { immediate: true },
  );

  onBeforeUnmount(() => controller?.abort());

  return { items, total, status, error, retry: load };
}

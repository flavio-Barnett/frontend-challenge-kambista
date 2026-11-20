import { toUserMessage } from '~/shared/errors/to-user-message';
import { isFetchFailure } from '~/shared/http/fetch-failure';
import { getCurrentRate, type ExchangeRate } from '../api/exchange-rates';

export const RATE_REFRESH_INTERVAL_MS = 30_000;

export type RateStatus = 'loading' | 'ready' | 'unavailable' | 'error';

function isRateUnavailable(error: unknown): boolean {
  return isFetchFailure(error) && error.response?.status === 503;
}

export function useCurrentRate() {
  const api = useNuxtApp().$api;

  const rate = ref<ExchangeRate | null>(null);
  const status = ref<RateStatus>('loading');
  const error = ref<string | null>(null);
  const pending = ref(false);
  const lastUpdated = computed(() =>
    rate.value ? new Date(rate.value.lastCheckedAt) : null,
  );

  let timer: ReturnType<typeof setInterval> | undefined;
  let latestRequest = 0;

  async function refresh(): Promise<void> {
    const request = ++latestRequest;
    pending.value = true;
    try {
      const current = await getCurrentRate(api);
      if (request !== latestRequest) return;
      rate.value = current;
      status.value = 'ready';
      error.value = null;
    } catch (failure) {
      if (request !== latestRequest) return;
      rate.value = null;
      status.value = isRateUnavailable(failure) ? 'unavailable' : 'error';
      error.value = toUserMessage(failure);
    } finally {
      if (request === latestRequest) pending.value = false;
    }
  }

  function startPolling(): void {
    stopPolling();
    timer = setInterval(refresh, RATE_REFRESH_INTERVAL_MS);
  }

  function stopPolling(): void {
    clearInterval(timer);
    timer = undefined;
  }

  function onVisibilityChange(): void {
    if (document.visibilityState === 'hidden') {
      stopPolling();
      return;
    }
    void refresh();
    startPolling();
  }

  onMounted(() => {
    void refresh();
    if (document.visibilityState === 'visible') {
      startPolling();
    }
    document.addEventListener('visibilitychange', onVisibilityChange);
  });

  onBeforeUnmount(() => {
    stopPolling();
    document.removeEventListener('visibilitychange', onVisibilityChange);
  });

  return { rate, status, error, pending, lastUpdated, refresh };
}

import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { flushPromises } from '@vue/test-utils';
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import type { ExchangeRate } from '~/features/exchange-rates/api/exchange-rates';
import {
  RATE_REFRESH_INTERVAL_MS,
  useCurrentRate,
} from '~/features/exchange-rates/composables/useCurrentRate';

const unregisterEndpoints: Array<() => void> = [];
const mounted: Array<{ unmount: () => void }> = [];

function rate(venta: number): ExchangeRate {
  return {
    compra: 3.728,
    venta,
    fecha: '2026-11-19',
    validFrom: '2026-11-19T14:00:00.000Z',
    lastCheckedAt: '2026-11-19T14:00:30.000Z',
  };
}

function rateEndpoint(handler: () => unknown): void {
  const url = `${useRuntimeConfig().public.apiBaseUrl}/v1/exchange-rates/current`;
  unregisterEndpoints.push(registerEndpoint(url, handler));
}

async function mountCurrentRate() {
  let current!: ReturnType<typeof useCurrentRate>;
  const wrapper = await mountSuspended(
    defineComponent({
      setup() {
        current = useCurrentRate();
        return () => h('div');
      },
    }),
  );
  mounted.push(wrapper);
  return { current, wrapper };
}

function setVisibility(state: DocumentVisibilityState): void {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    value: state,
  });
  document.dispatchEvent(new Event('visibilitychange'));
}

afterEach(() => {
  mounted.splice(0).forEach((wrapper) => wrapper.unmount());
  setVisibility('visible');
  unregisterEndpoints.splice(0).forEach((unregister) => unregister());
  vi.useRealTimers();
});

describe('useCurrentRate', () => {
  it('loads the current rate', async () => {
    rateEndpoint(() => rate(3.739));

    const { current } = await mountCurrentRate();

    await vi.waitFor(() => expect(current.status.value).toBe('ready'));
    expect(current.rate.value?.venta).toBe(3.739);
    expect(current.lastUpdated.value).toEqual(
      new Date('2026-11-19T14:00:30.000Z'),
    );
  });

  it('refreshes the rate every 30 seconds and stops when unmounted', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    const ventas = [3.739, 3.741, 3.745];
    let calls = 0;
    rateEndpoint(() => rate(ventas[calls++] ?? 0));

    const { current, wrapper } = await mountCurrentRate();
    await vi.waitFor(() => expect(current.rate.value?.venta).toBe(3.739));

    vi.advanceTimersByTime(RATE_REFRESH_INTERVAL_MS);
    await vi.waitFor(() => expect(current.rate.value?.venta).toBe(3.741));

    wrapper.unmount();
    vi.advanceTimersByTime(RATE_REFRESH_INTERVAL_MS);
    await flushPromises();
    expect(calls).toBe(2);
  });

  it('pauses while the tab is hidden and refreshes when it comes back', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    const ventas = [3.739, 3.741];
    let calls = 0;
    rateEndpoint(() => rate(ventas[calls++] ?? 0));

    const { current } = await mountCurrentRate();
    await vi.waitFor(() => expect(current.rate.value?.venta).toBe(3.739));

    setVisibility('hidden');
    vi.advanceTimersByTime(RATE_REFRESH_INTERVAL_MS * 2);
    await flushPromises();
    expect(calls).toBe(1);

    setVisibility('visible');
    await vi.waitFor(() => expect(current.rate.value?.venta).toBe(3.741));
  });

  it('recovers the rate when retrying after a failure', async () => {
    let fails = true;
    rateEndpoint(() =>
      fails ? Response.json({ success: false }, { status: 500 }) : rate(3.739),
    );

    const { current } = await mountCurrentRate();
    await vi.waitFor(() => expect(current.status.value).toBe('error'));

    fails = false;
    await current.refresh();

    expect(current.status.value).toBe('ready');
    expect(current.error.value).toBeNull();
  });

  it('explains that the rate is not available when the API answers 503', async () => {
    rateEndpoint(() =>
      Response.json(
        {
          success: false,
          error: { code: 'EXCHANGE_RATE_NOT_AVAILABLE', message: 'No rate' },
        },
        { status: 503 },
      ),
    );

    const { current } = await mountCurrentRate();

    await vi.waitFor(() => expect(current.status.value).toBe('unavailable'));
    expect(current.rate.value).toBeNull();
    expect(current.error.value).toContain('no tenemos el tipo de cambio');
  });
});

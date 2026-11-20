import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import RateTicker from '~/features/exchange-rates/components/RateTicker.vue';

const RATE = {
  compra: 3.728,
  venta: 3.7,
  fecha: '2026-11-19',
  validFrom: '2026-11-19T14:00:00.000Z',
  lastCheckedAt: '2026-11-19T14:00:30.000Z',
};

describe('RateTicker', () => {
  it('shows both rates with three decimals and the update time in Lima', async () => {
    const ticker = await mountSuspended(RateTicker, {
      props: {
        rate: RATE,
        status: 'ready',
        error: null,
        pending: false,
        lastUpdated: new Date(RATE.lastCheckedAt),
      },
    });

    expect(ticker.text()).toContain('3.728');
    expect(ticker.text()).toContain('3.700');
    expect(ticker.text()).toMatch(/Actualizado a las 9:00\sa\.\sm\./);
    expect(ticker.find('[aria-live], [role="status"]').exists()).toBe(false);
  });

  it('offers a retry when the rate could not be loaded', async () => {
    const ticker = await mountSuspended(RateTicker, {
      props: {
        rate: null,
        status: 'error',
        error: 'No pudimos conectar con el servidor.',
        pending: false,
        lastUpdated: null,
      },
    });

    expect(ticker.find('[role="status"]').text()).toBe(
      'No pudimos conectar con el servidor.',
    );
    const retry = ticker.find('button');
    expect(retry.text()).toBe('Reintentar');
    await retry.trigger('click');
    expect(ticker.emitted('retry')).toHaveLength(1);
  });

  it('explains when there is no rate without offering a retry', async () => {
    const ticker = await mountSuspended(RateTicker, {
      props: {
        rate: null,
        status: 'unavailable',
        error: 'Por ahora no tenemos el tipo de cambio disponible.',
        pending: false,
        lastUpdated: null,
      },
    });

    expect(ticker.text()).toContain('no tenemos el tipo de cambio');
    expect(ticker.find('button').exists()).toBe(false);
  });
});

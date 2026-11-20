import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import { parseDate } from '@internationalized/date';
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import { useSessionStore } from '~/features/auth/stores/session';
import type { Transaction } from '~/features/transactions/api/transactions';
import TransactionHistory from '~/features/transactions/components/TransactionHistory.vue';
import { useRangeCalendar } from '~/features/transactions/composables/useRangeCalendar';
import { useTransactionHistory } from '~/features/transactions/composables/useTransactionHistory';
import type { HistoryFilters } from '~/features/transactions/domain/history-query';

const HISTORY_PATH = '/v1/transactions/history';

const unregisterEndpoints: Array<() => void> = [];
const mounted: Array<{ unmount: () => void }> = [];

function transaction(id: string): Transaction {
  return {
    id,
    monedaOrigen: 'USD',
    monedaDestino: 'PEN',
    monto: 100,
    montoCambiado: 373.9,
    tipoCambio: 3.739,
    fecha: '2026-11-19T23:20:00.000Z',
  };
}

function historyEndpoint(
  handler: (query: URLSearchParams) => unknown,
): ReturnType<typeof vi.fn> {
  const requests = vi.fn((query: URLSearchParams) => handler(query));
  const url = `${useRuntimeConfig().public.apiBaseUrl}${HISTORY_PATH}`;
  unregisterEndpoints.push(
    registerEndpoint(url, (event: { path: string }) =>
      requests(new URL(event.path, 'http://localhost').searchParams),
    ),
  );
  return requests;
}

function page(items: Transaction[], total: number): Response {
  return Response.json(items, {
    headers: { 'X-Total-Count': String(total) },
  });
}

async function mountHistory(route = '/history') {
  const wrapper = await mountSuspended(TransactionHistory, { route });
  mounted.push(wrapper);
  return wrapper;
}

beforeEach(() => {
  useSessionStore().$patch({
    user: { id: 'user-1', nombre: 'Ana', email: 'ana@correo.com', rol: 'user' },
    accessToken: 'token',
    status: 'authenticated',
  });
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-20T15:00:00.000Z'));
});

afterEach(async () => {
  mounted.splice(0).forEach((wrapper) => wrapper.unmount());
  unregisterEndpoints.splice(0).forEach((unregister) => unregister());
  vi.useRealTimers();
  await useRouter().replace('/');
});

describe('Transaction history', () => {
  it('shows the last 30 days in Lima time by default', async () => {
    const requests = historyEndpoint(() =>
      page([transaction('a'), transaction('b')], 2),
    );

    const history = await mountHistory();

    await vi.waitFor(() => expect(history.findAll('tbody tr')).toHaveLength(2));
    const query = Object.fromEntries(requests.mock.calls[0]![0]);
    expect(query).toEqual({
      startDate: '2026-10-22',
      endDate: '2026-11-20',
      page: '1',
      limit: '10',
    });
    const row = history.find('tbody tr').text();
    expect(row).toContain('19 nov. 2026');
    expect(row).toContain('6:20 p. m.');
    expect(row).toContain('US$ 100.00');
    expect(row).toContain('S/ 373.90');
    expect(row).toContain('3.739');
    expect(history.text()).toContain('Mostrando 1–2 de 2');
  });

  it('reads the dates and the page from the address', async () => {
    const requests = historyEndpoint(() =>
      page([transaction('k'), transaction('l')], 12),
    );

    const history = await mountHistory(
      '/history?startDate=2026-11-01&endDate=2026-11-10&page=2',
    );

    await vi.waitFor(() =>
      expect(history.text()).toContain('Mostrando 11–12 de 12'),
    );
    expect(Object.fromEntries(requests.mock.calls[0]![0])).toMatchObject({
      startDate: '2026-11-01',
      endDate: '2026-11-10',
      page: '2',
    });
  });

  it('ignores dates in the address that are not valid', async () => {
    const requests = historyEndpoint(() => page([], 0));

    await mountHistory('/history?startDate=2026-11-10&endDate=2026-11-01');

    await vi.waitFor(() => expect(requests).toHaveBeenCalled());
    expect(Object.fromEntries(requests.mock.calls[0]![0])).toMatchObject({
      startDate: '2026-10-22',
      endDate: '2026-11-20',
      page: '1',
    });
  });

  it('applies a quick range and goes back to the first page', async () => {
    historyEndpoint(() => page([transaction('a')], 30));
    const history = await mountHistory(
      '/history?startDate=2026-11-01&endDate=2026-11-10&page=2',
    );

    await history
      .findAll('button')
      .find((button) => button.text() === 'Últimos 7 días')!
      .trigger('click');

    await vi.waitFor(() =>
      expect(useRoute().query).toEqual({
        startDate: '2026-11-14',
        endDate: '2026-11-20',
      }),
    );
  });

  it('invites to make an exchange when there is nothing in the range', async () => {
    historyEndpoint(() => page([], 0));

    const history = await mountHistory();

    await vi.waitFor(() =>
      expect(history.text()).toContain('No hiciste cambios en estas fechas'),
    );
    expect(history.find('a[href="/exchange"]').text()).toContain(
      'Hacer un cambio',
    );
  });

  it('offers a retry when the history could not be loaded', async () => {
    let fails = true;
    historyEndpoint(() =>
      fails
        ? Response.json({ success: false }, { status: 500 })
        : page([transaction('a')], 1),
    );
    const history = await mountHistory();
    const retryButton = () =>
      history
        .findAll('button')
        .find((button) => button.text() === 'Reintentar');
    await vi.waitFor(() => expect(retryButton()).toBeDefined());
    expect(history.find('section [role="alert"]').text()).toContain(
      'Algo salió mal',
    );

    fails = false;
    await retryButton()!.trigger('click');

    await vi.waitFor(() => expect(history.findAll('tbody tr')).toHaveLength(1));
  });

  it('moves to the last page when the page asked for is past the end', async () => {
    historyEndpoint((query) =>
      query.get('page') === '3' ? page([transaction('u')], 21) : page([], 21),
    );

    await mountHistory(
      '/history?startDate=2026-11-01&endDate=2026-11-10&page=9',
    );

    await vi.waitFor(() => expect(useRoute().query.page).toBe('3'));
  });
  it('changes the page and keeps the dates', async () => {
    historyEndpoint(() => page([transaction('a')], 30));
    const history = await mountHistory(
      '/history?startDate=2026-11-01&endDate=2026-11-10',
    );
    await vi.waitFor(() =>
      expect(history.text()).toContain('Mostrando 1–10 de 30'),
    );

    await history
      .findAll('button')
      .find((button) => button.text() === '2')!
      .trigger('click');

    await vi.waitFor(() =>
      expect(useRoute().query).toEqual({
        startDate: '2026-11-01',
        endDate: '2026-11-10',
        page: '2',
      }),
    );
  });

  it('counts from the page when the total header is missing', async () => {
    historyEndpoint(() =>
      Response.json([transaction('k'), transaction('l'), transaction('m')]),
    );

    const history = await mountHistory(
      '/history?startDate=2026-11-01&endDate=2026-11-10&page=2',
    );

    await vi.waitFor(() =>
      expect(history.text()).toContain('Mostrando 11–13 de 13'),
    );
    expect(useRoute().query.page).toBe('2');
  });

  it('names the date picker with the chosen range', async () => {
    historyEndpoint(() => page([], 0));

    const history = await mountHistory(
      '/history?startDate=2026-11-01&endDate=2026-11-10',
    );

    const picker = history.find('button[aria-haspopup="dialog"]');
    expect(picker.attributes('aria-label')).toBeUndefined();
    expect(picker.text()).toContain('Desde1 nov. 2026');
    expect(picker.text()).toContain('Hasta10 nov. 2026');
  });
});

describe('useTransactionHistory', () => {
  it('keeps only the answer for the latest filters', async () => {
    let releaseOldAnswer!: () => void;
    const oldAnswer = new Promise<void>((resolve) => {
      releaseOldAnswer = resolve;
    });
    historyEndpoint(async (query) => {
      if (query.get('page') === '1') {
        await oldAnswer;
        return page([transaction('old')], 1);
      }
      return page([transaction('new')], 1);
    });
    const filters = ref<HistoryFilters>({
      range: { startDate: '2026-11-01', endDate: '2026-11-10' },
      page: 1,
    });
    let history!: ReturnType<typeof useTransactionHistory>;
    const wrapper = await mountSuspended(
      defineComponent({
        setup() {
          history = useTransactionHistory(filters);
          return () => h('div');
        },
      }),
    );
    mounted.push(wrapper);

    filters.value = { ...filters.value, page: 2 };
    await vi.waitFor(() =>
      expect(history.items.value.map(({ id }) => id)).toEqual(['new']),
    );
    releaseOldAnswer();
    await flushPromises();

    expect(history.items.value.map(({ id }) => id)).toEqual(['new']);
    expect(history.status.value).toBe('ready');
  });
});

describe('useRangeCalendar', () => {
  async function mountCalendar() {
    const range = ref({ startDate: '2026-11-01', endDate: '2026-11-10' });
    let calendar!: ReturnType<typeof useRangeCalendar>;
    const wrapper = await mountSuspended(
      defineComponent({
        setup() {
          calendar = useRangeCalendar(range);
          return () => h('div');
        },
      }),
    );
    mounted.push(wrapper);
    return { range, calendar };
  }

  it('starts from the current range and does not allow future days', async () => {
    const { calendar } = await mountCalendar();

    calendar.open.value = true;
    await nextTick();

    expect(calendar.draft.value?.start?.toString()).toBe('2026-11-01');
    expect(calendar.draft.value?.end?.toString()).toBe('2026-11-10');
    expect(calendar.maxDay.value.toString()).toBe('2026-11-20');
  });

  it('applies the range and closes only once both days are chosen', async () => {
    const { range, calendar } = await mountCalendar();
    calendar.open.value = true;
    await nextTick();

    calendar.pick({ start: parseDate('2026-11-05'), end: undefined });
    expect(calendar.open.value).toBe(true);
    expect(range.value.startDate).toBe('2026-11-01');

    calendar.pick({
      start: parseDate('2026-11-05'),
      end: parseDate('2026-11-12'),
    });
    expect(range.value).toEqual({
      startDate: '2026-11-05',
      endDate: '2026-11-12',
    });
    expect(calendar.open.value).toBe(false);
  });
});

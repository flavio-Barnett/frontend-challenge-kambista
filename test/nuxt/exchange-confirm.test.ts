import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import { readBody } from 'h3';
import type { ExchangeRate } from '~/features/exchange-rates/api/exchange-rates';
import type { Transaction } from '~/features/transactions/api/transactions';
import ExchangeWorkspace from '~/features/transactions/components/ExchangeWorkspace.vue';

const RATE: ExchangeRate = {
  compra: 3.728,
  venta: 3.739,
  fecha: '2026-11-19',
  validFrom: '2026-11-19T14:00:00.000Z',
  lastCheckedAt: '2026-11-19T14:00:30.000Z',
};

const TRANSACTION: Transaction = {
  id: '6aff6a8dca19d75ae7d57ce8',
  monedaOrigen: 'USD',
  monedaDestino: 'PEN',
  monto: 100,
  montoCambiado: 374.1,
  tipoCambio: 3.741,
  fecha: '2026-11-19T21:15:00.000Z',
};

const RATE_UNAVAILABLE = {
  success: false,
  error: { code: 'EXCHANGE_RATE_NOT_AVAILABLE', message: 'No rate' },
};

const unregisterEndpoints: Array<() => void> = [];
const mounted: Array<{ unmount: () => void }> = [];

function transactionsEndpoint(
  handler: (event: Parameters<typeof readBody>[0]) => unknown,
): void {
  const url = `${useRuntimeConfig().public.apiBaseUrl}/v1/transactions`;
  unregisterEndpoints.push(registerEndpoint(url, { method: 'POST', handler }));
}

function bodyText(): string {
  return document.body.textContent ?? '';
}

function button(label: string): HTMLButtonElement {
  const match = [...document.body.querySelectorAll('button')].find(
    (element) => element.textContent?.trim() === label,
  );
  if (!match) {
    throw new Error(`Button "${label}" not found`);
  }
  return match;
}

async function openConfirmation(amount = '100') {
  const workspace = await mountSuspended(ExchangeWorkspace, {
    props: { rate: RATE },
  });
  mounted.push(workspace);
  await workspace.find('input[inputmode="decimal"]').setValue(amount);
  await workspace.find('form').trigger('submit');
  await vi.waitFor(() => {
    expect(bodyText()).toContain('Confirma tu cambio');
  });
  return workspace;
}

afterEach(() => {
  mounted.splice(0).forEach((wrapper) => wrapper.unmount());
  unregisterEndpoints.splice(0).forEach((unregister) => unregister());
});

describe('Exchange confirmation', () => {
  it('shows the same estimate and rate before confirming', async () => {
    await openConfirmation();

    expect(bodyText()).toContain('US$ 100.00');
    expect(bodyText()).toContain('3.739');
    expect(bodyText()).toContain('S/ 373.90');
    expect(bodyText()).toContain('tipo de cambio vigente al momento');
  });

  it('sends only the currencies and the amount, then shows what the API registered', async () => {
    let body: unknown;
    transactionsEndpoint(async (event) => {
      body = await readBody(event);
      return Response.json(TRANSACTION, { status: 201 });
    });
    await openConfirmation();

    button('Confirmar cambio').click();

    await vi.waitFor(() => {
      expect(bodyText()).toContain('¡Listo! Registramos tu cambio');
    });
    expect(body).toEqual({
      monedaOrigen: 'USD',
      monedaDestino: 'PEN',
      monto: 100,
    });
    expect(bodyText()).toContain('S/ 374.10');
    expect(bodyText()).toContain('3.741');
    expect(bodyText()).toContain('E7D57CE8');
  });

  it('closes and clears the form to start another exchange', async () => {
    transactionsEndpoint(() => Response.json(TRANSACTION, { status: 201 }));
    const workspace = await openConfirmation();
    button('Confirmar cambio').click();
    await vi.waitFor(() => {
      expect(bodyText()).toContain('¡Listo! Registramos tu cambio');
    });

    button('Hacer otro cambio').click();

    await vi.waitFor(() => {
      expect(bodyText()).not.toContain('Registramos tu cambio');
    });
    const input = workspace.find<HTMLInputElement>(
      'input[inputmode="decimal"]',
    );
    expect(input.element.value).toBe('');
    expect(workspace.find('output').text()).toBe('—');
    expect(workspace.text()).not.toContain('Ingresa el monto');
  });

  it('shows the error inside the confirmation and lets the person retry', async () => {
    transactionsEndpoint(() =>
      Response.json(RATE_UNAVAILABLE, { status: 503 }),
    );
    await openConfirmation();

    button('Confirmar cambio').click();

    await vi.waitFor(() => {
      expect(
        document.body.querySelector('[role="alert"]')?.textContent,
      ).toContain('no tenemos el tipo de cambio');
    });

    unregisterEndpoints.splice(0).forEach((unregister) => unregister());
    transactionsEndpoint(() => Response.json(TRANSACTION, { status: 201 }));
    button('Confirmar cambio').click();

    await vi.waitFor(() => {
      expect(bodyText()).toContain('¡Listo! Registramos tu cambio');
    });
  });

  it('sends a single request and cannot be dismissed while confirming', async () => {
    let requests = 0;
    let respond!: () => void;
    const answered = new Promise<void>((resolve) => {
      respond = resolve;
    });
    transactionsEndpoint(async () => {
      requests += 1;
      await answered;
      return Response.json(TRANSACTION, { status: 201 });
    });
    await openConfirmation();

    button('Confirmar cambio').click();
    await vi.waitFor(() => {
      expect(button('Cancelar').disabled).toBe(true);
    });
    button('Confirmar cambio').click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(document.body.querySelector('[data-slot="close"]')).toBeNull();
    expect(bodyText()).toContain('Confirma tu cambio');

    respond();
    await vi.waitFor(() => {
      expect(bodyText()).toContain('¡Listo! Registramos tu cambio');
    });
    expect(requests).toBe(1);
  });
});

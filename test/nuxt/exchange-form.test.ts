import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import type { ExchangeRate } from '~/features/exchange-rates/api/exchange-rates';
import ExchangeWorkspace from '~/features/transactions/components/ExchangeWorkspace.vue';

const RATE: ExchangeRate = {
  compra: 3.728,
  venta: 3.739,
  fecha: '2026-11-19',
  validFrom: '2026-11-19T14:00:00.000Z',
  lastCheckedAt: '2026-11-19T14:00:30.000Z',
};

const REQUIRED_MESSAGE = 'Ingresa el monto que quieres cambiar.';

const mounted: Array<{ unmount: () => void }> = [];

async function mountWorkspace() {
  const workspace = await mountSuspended(ExchangeWorkspace, {
    props: { rate: RATE },
  });
  mounted.push(workspace);
  return workspace;
}

afterEach(() => {
  mounted.splice(0).forEach((wrapper) => wrapper.unmount());
});

describe('Exchange form', () => {
  it('estimates the amount to receive with the rate that applies', async () => {
    const workspace = await mountWorkspace();

    await workspace.find('input[inputmode="decimal"]').setValue('100');

    expect(workspace.find('output').text()).toBe('S/ 373.90');
  });

  it('keeps only digits and a single dot in the amount field', async () => {
    const workspace = await mountWorkspace();
    const amount = workspace.find<HTMLInputElement>(
      'input[inputmode="decimal"]',
    );

    await amount.setValue('1a0,5x0');

    expect(amount.element.value).toBe('10.50');
    expect(workspace.find('output').text()).toBe('S/ 39.26');
  });

  it('does not let the amount have more than 2 decimals', async () => {
    const workspace = await mountWorkspace();
    const amount = workspace.find<HTMLInputElement>(
      'input[inputmode="decimal"]',
    );

    await amount.setValue('10.505');

    expect(amount.element.value).toBe('10.50');
    expect(workspace.text()).not.toContain('decimales');
  });

  it('swaps the currencies and recalculates the estimate', async () => {
    const workspace = await mountWorkspace();
    await workspace.find('input[inputmode="decimal"]').setValue('100');

    await workspace
      .find('button[aria-label="Invertir monedas"]')
      .trigger('click');

    expect(workspace.find('output').text()).toBe('US$ 26.82');
  });

  it('gives each control its own id so the label points to the amount', async () => {
    const workspace = await mountWorkspace();
    const ids = workspace
      .findAll('input, button[role="combobox"]')
      .map((control) => control.attributes('id'))
      .filter((id): id is string => Boolean(id));
    const amount = workspace.find('input[inputmode="decimal"]');
    const labelTargets = workspace
      .findAll('label')
      .map((label) => label.attributes('for'));

    expect(new Set(ids).size).toBe(ids.length);
    expect(labelTargets).toContain(amount.attributes('id'));
  });

  it('shows no error before the person interacts', async () => {
    const workspace = await mountWorkspace();

    await workspace
      .find('button[aria-label="Invertir monedas"]')
      .trigger('click');

    expect(workspace.text()).not.toContain(REQUIRED_MESSAGE);
  });

  it('asks for the amount after leaving the field empty', async () => {
    const workspace = await mountWorkspace();

    await workspace.find('input[inputmode="decimal"]').trigger('blur');

    await vi.waitFor(() => {
      expect(workspace.text()).toContain(REQUIRED_MESSAGE);
    });
  });

  it('asks for the amount when trying to continue without it', async () => {
    const workspace = await mountWorkspace();

    await workspace.find('form').trigger('submit');

    await vi.waitFor(() => {
      expect(workspace.text()).toContain(REQUIRED_MESSAGE);
    });
    expect(document.body.textContent).not.toContain('Confirma tu cambio');
  });
});

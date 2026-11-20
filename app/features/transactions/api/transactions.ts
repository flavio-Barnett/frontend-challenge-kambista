import type { ApiClient } from '~/shared/http/api-client';
import type { Currency } from '../domain/currency';

export interface NewTransaction {
  monedaOrigen: Currency;
  monedaDestino: Currency;
  monto: number;
}

export interface Transaction extends NewTransaction {
  id: string;
  montoCambiado: number;
  tipoCambio: number;
  fecha: string;
}

export function createTransaction(
  api: ApiClient,
  { monedaOrigen, monedaDestino, monto }: NewTransaction,
): Promise<Transaction> {
  return api<Transaction>('/v1/transactions', {
    method: 'POST',
    body: { monedaOrigen, monedaDestino, monto },
  });
}

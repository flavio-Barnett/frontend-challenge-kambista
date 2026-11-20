import type { ApiClient } from '~/shared/http/api-client';
import type { Currency } from '../domain/currency';
import type { HistoryRange } from '../domain/history-range';

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

export interface HistoryPageRequest extends HistoryRange {
  page: number;
  limit: number;
  signal?: AbortSignal;
}

export interface TransactionHistoryPage {
  items: Transaction[];
  total: number;
}

const TOTAL_COUNT_HEADER = 'X-Total-Count';
const TOTAL_COUNT_PATTERN = /^\d+$/;

export async function getTransactionHistory(
  api: ApiClient,
  { startDate, endDate, page, limit, signal }: HistoryPageRequest,
): Promise<TransactionHistoryPage> {
  const { data, headers } = await api.raw<Transaction[]>(
    '/v1/transactions/history',
    { query: { startDate, endDate, page, limit }, signal },
  );
  const items = data ?? [];
  const totalHeader = headers.get(TOTAL_COUNT_HEADER) ?? '';
  const total = TOTAL_COUNT_PATTERN.test(totalHeader)
    ? Number(totalHeader)
    : (page - 1) * limit + items.length;
  return { items, total };
}

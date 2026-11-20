import { toUserMessage } from '~/shared/errors/to-user-message';
import { createTransaction, type Transaction } from '../api/transactions';
import { centsToAmount } from '../domain/amount';
import type { ExchangePreview } from '../domain/exchange-preview';

export function useExchangeSubmission() {
  const api = useNuxtApp().$api;

  const pending = ref(false);
  const error = ref<string | null>(null);
  const transaction = ref<Transaction | null>(null);

  async function submit({ cents, from, to }: ExchangePreview): Promise<void> {
    if (pending.value) {
      return;
    }
    pending.value = true;
    error.value = null;
    try {
      transaction.value = await createTransaction(api, {
        monedaOrigen: from,
        monedaDestino: to,
        monto: centsToAmount(cents),
      });
    } catch (failure) {
      error.value = toUserMessage(failure);
    } finally {
      pending.value = false;
    }
  }

  function clear(): void {
    error.value = null;
    transaction.value = null;
  }

  return { pending, error, transaction, submit, clear };
}

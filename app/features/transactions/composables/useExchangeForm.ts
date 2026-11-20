import type { Ref } from 'vue';
import type { ExchangeRate } from '~/features/exchange-rates/api/exchange-rates';
import { readAmount } from '../domain/amount';
import { otherCurrency } from '../domain/currency';
import type { ExchangePreview } from '../domain/exchange-preview';
import { quote } from '../domain/quote';
import type { ExchangeFormState } from '../schemas/exchange.schema';

export function useExchangeForm(rate: Readonly<Ref<ExchangeRate | null>>) {
  const state = reactive<ExchangeFormState>({
    amount: '',
    from: 'USD',
    to: 'PEN',
  });

  const preview = computed<ExchangePreview | null>(() => {
    const reading = readAmount(state.amount);
    if (!reading.ok || !rate.value) {
      return null;
    }
    const estimate = quote({
      cents: reading.cents,
      from: state.from,
      to: state.to,
      rates: rate.value,
    });
    if (!estimate) {
      return null;
    }
    return {
      cents: reading.cents,
      from: state.from,
      to: state.to,
      quote: estimate,
    };
  });

  watch(
    () => state.from,
    (from) => {
      if (state.to === from) {
        state.to = otherCurrency(from);
      }
    },
  );

  watch(
    () => state.to,
    (to) => {
      if (state.from === to) {
        state.from = otherCurrency(to);
      }
    },
  );

  function swap(): void {
    [state.from, state.to] = [state.to, state.from];
  }

  function reset(): void {
    state.amount = '';
  }

  return { state, preview, swap, reset };
}

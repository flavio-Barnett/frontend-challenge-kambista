import type { Ref } from 'vue';
import { sanitizeAmountInput } from '../domain/amount';

interface AmountField {
  inputRef?: HTMLInputElement | null;
}

export function useAmountInput(amount: Ref<string>, fieldRefKey: string) {
  const field = useTemplateRef<AmountField>(fieldRefKey);

  function update(value: string | number): void {
    const raw = String(value);
    const sanitized = sanitizeAmountInput(raw);
    amount.value = sanitized;
    const input = field.value?.inputRef;
    if (!input || input.value === sanitized) {
      return;
    }
    const caret = sanitizeAmountInput(
      raw.slice(0, input.selectionStart ?? raw.length),
    ).length;
    input.value = sanitized;
    input.setSelectionRange(caret, caret);
  }

  return { update };
}

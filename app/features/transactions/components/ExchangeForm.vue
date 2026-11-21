<script setup lang="ts">
import { formatCents } from '~/shared/format/money';
import { useAmountInput } from '../composables/useAmountInput';
import { CURRENCIES, type Currency } from '../domain/currency';
import type { ExchangePreview } from '../domain/exchange-preview';
import { exchangeSchema } from '../schemas/exchange.schema';

const props = defineProps<{
  preview: ExchangePreview | null;
  disabled: boolean;
}>();

defineEmits<{ submit: []; swap: [] }>();

const amount = defineModel<string>('amount', { required: true });
const from = defineModel<Currency>('from', { required: true });
const to = defineModel<Currency>('to', { required: true });

const state = reactive({ amount, from, to });

const currencies = [...CURRENCIES];

const { update: updateAmount } = useAmountInput(amount, 'amountField');

const estimatedAmount = computed(() =>
  props.preview
    ? formatCents(props.preview.quote.convertedCents, props.preview.to)
    : '—',
);
</script>

<template>
  <section
    aria-labelledby="exchange-form-title"
    class="flex flex-col gap-6 rounded-xl border border-hairline bg-card p-5 shadow-card sm:p-7"
  >
    <h2 id="exchange-form-title" class="text-lg font-semibold">
      ¿Cuánto quieres cambiar?
    </h2>

    <UForm
      :schema="exchangeSchema"
      :state="state"
      novalidate
      class="flex flex-col gap-6"
      @submit="$emit('submit')"
    >
      <div class="flex flex-col items-center gap-2">
        <div class="flex w-full items-start gap-2">
          <UFormField label="Envías" name="amount" class="min-w-0 flex-1">
            <UInput
              ref="amountField"
              :model-value="state.amount"
              inputmode="decimal"
              autocomplete="off"
              placeholder="0.00"
              size="xl"
              class="w-full"
              :ui="{ base: 'font-mono text-lg' }"
              @update:model-value="updateAmount"
            />
          </UFormField>
          <UFormField label="Moneda" name="from" class="w-28">
            <USelect
              v-model="state.from"
              :items="currencies"
              size="xl"
              class="w-full"
            />
          </UFormField>
        </div>

        <UButton
          icon="i-lucide-arrow-up-down"
          aria-label="Invertir monedas"
          color="neutral"
          variant="soft"
          square
          class="size-11 justify-center p-0"
          @click="$emit('swap')"
        />

        <div class="flex w-full items-start gap-2">
          <div class="flex min-w-0 flex-1 flex-col gap-2">
            <span class="text-sm font-medium">Recibes aprox.</span>
            <output
              aria-live="polite"
              class="flex h-11 items-center rounded-md bg-subtle px-4 font-mono text-lg font-medium"
            >
              {{ estimatedAmount }}
            </output>
          </div>
          <UFormField label="Moneda" name="to" class="w-28">
            <USelect
              v-model="state.to"
              :items="currencies"
              size="xl"
              class="w-full"
            />
          </UFormField>
        </div>
      </div>

      <UButton type="submit" label="Cambiar ahora" block :disabled="disabled" />
    </UForm>
  </section>
</template>

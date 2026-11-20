<script setup lang="ts">
import { formatMoney, formatRate } from '~/shared/format/money';
import { centsToAmount } from '../domain/amount';
import type { ExchangePreview } from '../domain/exchange-preview';
import type { RateSide } from '../domain/quote';

defineProps<{ preview: ExchangePreview }>();

const RATE_SIDE_REASONS: Readonly<Record<RateSide, string>> = {
  venta: 'Venta, porque envías dólares',
  compra: 'Compra, porque envías soles',
};
</script>

<template>
  <dl class="flex flex-col divide-y divide-hairline">
    <div class="flex items-baseline justify-between gap-4 py-3">
      <dt class="text-muted">Envías</dt>
      <dd class="font-mono font-medium">
        {{ formatMoney(centsToAmount(preview.cents), preview.from) }}
      </dd>
    </div>
    <div class="flex items-baseline justify-between gap-4 py-3">
      <dt class="shrink-0 text-muted">Tipo de cambio</dt>
      <dd class="flex flex-col items-end gap-0.5 text-end">
        <span class="font-mono font-medium">{{
          formatRate(preview.quote.appliedRate)
        }}</span>
        <span class="text-sm text-muted">{{
          RATE_SIDE_REASONS[preview.quote.rateSide]
        }}</span>
      </dd>
    </div>
    <div class="flex items-baseline justify-between gap-4 py-3">
      <dt class="text-muted">Recibes aprox.</dt>
      <dd class="font-mono text-xl font-semibold">
        {{
          formatMoney(centsToAmount(preview.quote.convertedCents), preview.to)
        }}
      </dd>
    </div>
  </dl>
</template>

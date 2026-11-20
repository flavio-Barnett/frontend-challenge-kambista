<script setup lang="ts">
import { formatDateTime } from '~/shared/format/date-time';
import { formatMoney, formatRate } from '~/shared/format/money';
import type { Transaction } from '../api/transactions';

const props = defineProps<{ transaction: Transaction }>();

const SHORT_ID_LENGTH = 8;

const details = useTemplateRef('details');
const shortId = computed(() =>
  props.transaction.id.slice(-SHORT_ID_LENGTH).toUpperCase(),
);

onMounted(() => details.value?.focus());
</script>

<template>
  <section
    ref="details"
    tabindex="-1"
    aria-label="Detalle de tu cambio"
    class="focus:outline-none"
  >
    <dl class="flex flex-col divide-y divide-hairline">
      <div class="flex items-baseline justify-between gap-4 py-3">
        <dt class="text-muted">Enviaste</dt>
        <dd class="font-mono font-medium">
          {{ formatMoney(transaction.monto, transaction.monedaOrigen) }}
        </dd>
      </div>
      <div class="flex items-baseline justify-between gap-4 py-3">
        <dt class="text-muted">Recibiste</dt>
        <dd class="font-mono text-xl font-semibold">
          {{
            formatMoney(transaction.montoCambiado, transaction.monedaDestino)
          }}
        </dd>
      </div>
      <div class="flex items-baseline justify-between gap-4 py-3">
        <dt class="text-muted">Tipo de cambio aplicado</dt>
        <dd class="font-mono">{{ formatRate(transaction.tipoCambio) }}</dd>
      </div>
      <div class="flex items-baseline justify-between gap-4 py-3">
        <dt class="text-muted">Fecha</dt>
        <dd class="text-end">
          {{ formatDateTime(new Date(transaction.fecha)) }}
        </dd>
      </div>
      <div class="flex items-baseline justify-between gap-4 py-3">
        <dt class="text-muted">N.º de operación</dt>
        <dd class="font-mono" :title="transaction.id">{{ shortId }}</dd>
      </div>
    </dl>
  </section>
</template>

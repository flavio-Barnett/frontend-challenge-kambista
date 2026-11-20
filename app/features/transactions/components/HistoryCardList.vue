<script setup lang="ts">
import { formatDate, formatTime } from '~/shared/format/date-time';
import { formatMoney, formatRate } from '~/shared/format/money';
import type { Transaction } from '../api/transactions';
import TransactionOperation from './TransactionOperation.vue';

defineProps<{ items: Transaction[]; loading: boolean; skeletonRows: number }>();
</script>

<template>
  <ul v-if="loading" aria-busy="true" class="flex flex-col gap-3">
    <li v-for="row in skeletonRows" :key="row">
      <USkeleton class="h-28 w-full rounded-lg" />
    </li>
  </ul>
  <ul v-else class="flex flex-col gap-3">
    <li
      v-for="transaction in items"
      :key="transaction.id"
      class="flex flex-col gap-3 rounded-lg border border-hairline p-4"
    >
      <div class="flex items-center justify-between gap-4">
        <TransactionOperation
          :from="transaction.monedaOrigen"
          :to="transaction.monedaDestino"
        />
        <span class="flex flex-col items-end text-sm text-muted">
          <span class="whitespace-nowrap">{{
            formatDate(new Date(transaction.fecha))
          }}</span>
          <span class="whitespace-nowrap">{{
            formatTime(new Date(transaction.fecha))
          }}</span>
        </span>
      </div>
      <dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt class="text-muted">Enviaste</dt>
        <dd class="text-end font-mono">
          {{ formatMoney(transaction.monto, transaction.monedaOrigen) }}
        </dd>
        <dt class="text-muted">Recibiste</dt>
        <dd class="text-end font-mono font-medium">
          {{
            formatMoney(transaction.montoCambiado, transaction.monedaDestino)
          }}
        </dd>
        <dt class="text-muted">Tipo de cambio</dt>
        <dd class="text-end font-mono">
          {{ formatRate(transaction.tipoCambio) }}
        </dd>
      </dl>
    </li>
  </ul>
</template>

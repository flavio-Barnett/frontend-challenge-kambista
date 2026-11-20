<script setup lang="ts">
import { formatDate, formatTime } from '~/shared/format/date-time';
import { formatMoney, formatRate } from '~/shared/format/money';
import type { Transaction } from '../api/transactions';
import TransactionOperation from './TransactionOperation.vue';

defineProps<{ items: Transaction[]; loading: boolean; skeletonRows: number }>();
</script>

<template>
  <table class="w-full text-start">
    <caption class="sr-only">
      Tus cambios en las fechas elegidas
    </caption>
    <thead>
      <tr class="border-b border-hairline text-sm text-muted">
        <th scope="col" class="py-3 pe-4 text-start font-medium">
          Fecha y hora
        </th>
        <th scope="col" class="px-4 py-3 text-start font-medium">Operación</th>
        <th scope="col" class="px-4 py-3 text-end font-medium">Enviaste</th>
        <th scope="col" class="px-4 py-3 text-end font-medium">Recibiste</th>
        <th scope="col" class="py-3 ps-4 text-end font-medium">
          Tipo de cambio
        </th>
      </tr>
    </thead>
    <tbody v-if="loading" aria-busy="true">
      <tr
        v-for="row in skeletonRows"
        :key="row"
        class="border-b border-hairline last:border-0"
      >
        <td v-for="cell in 5" :key="cell" class="py-4 pe-4">
          <USkeleton class="h-5 w-full rounded-sm" />
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr
        v-for="transaction in items"
        :key="transaction.id"
        class="border-b border-hairline last:border-0"
      >
        <td class="py-4 pe-4">
          <span class="flex flex-col">
            <span>{{ formatDate(new Date(transaction.fecha)) }}</span>
            <span class="text-sm text-muted">{{
              formatTime(new Date(transaction.fecha))
            }}</span>
          </span>
        </td>
        <td class="px-4 py-4">
          <TransactionOperation
            :from="transaction.monedaOrigen"
            :to="transaction.monedaDestino"
          />
        </td>
        <td class="px-4 py-4 text-end font-mono">
          {{ formatMoney(transaction.monto, transaction.monedaOrigen) }}
        </td>
        <td class="px-4 py-4 text-end font-mono font-medium">
          {{
            formatMoney(transaction.montoCambiado, transaction.monedaDestino)
          }}
        </td>
        <td class="py-4 ps-4 text-end font-mono">
          {{ formatRate(transaction.tipoCambio) }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

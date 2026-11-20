<script setup lang="ts">
import ExchangeWorkspace from '~/features/transactions/components/ExchangeWorkspace.vue';
import RateTicker from '~/features/exchange-rates/components/RateTicker.vue';
import { useCurrentRate } from '~/features/exchange-rates/composables/useCurrentRate';

definePageMeta({ title: 'Cambiar' });

const { rate, status, error, pending, lastUpdated, refresh } = useCurrentRate();
</script>

<template>
  <div class="flex w-full flex-col gap-8">
    <header class="flex flex-col gap-1">
      <h1 class="font-display text-[28px]/[34px] font-bold tracking-tight">
        Cambia tus dólares o soles
      </h1>
      <p class="text-muted">Mira cuánto recibes antes de confirmar.</p>
    </header>

    <ExchangeWorkspace :rate="rate">
      <template #rate>
        <RateTicker
          :rate="rate"
          :status="status"
          :error="error"
          :pending="pending"
          :last-updated="lastUpdated"
          @retry="refresh"
        />
      </template>
    </ExchangeWorkspace>
  </div>
</template>

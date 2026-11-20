<script setup lang="ts">
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
      <p class="text-muted">Mira el tipo de cambio del día.</p>
    </header>

    <div class="grid gap-4 lg:grid-cols-12 lg:gap-6">
      <RateTicker
        :rate="rate"
        :status="status"
        :error="error"
        :pending="pending"
        :last-updated="lastUpdated"
        class="lg:col-span-5"
        @retry="refresh"
      />
    </div>
  </div>
</template>

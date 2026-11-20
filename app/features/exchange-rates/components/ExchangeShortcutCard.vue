<script setup lang="ts">
import { formatRate } from '~/shared/format/money';
import type { ExchangeRate } from '../api/exchange-rates';

defineProps<{ rate: ExchangeRate | null; loading: boolean }>();
</script>

<template>
  <NuxtLink
    to="/exchange"
    class="group flex h-full items-start gap-4 rounded-xl border border-hairline bg-card p-5 shadow-card transition-shadow hover:shadow-pop focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:gap-5 sm:p-7 md:min-h-40"
  >
    <span
      class="flex size-12 shrink-0 items-center justify-center rounded-full bg-maiz-100 text-accent"
    >
      <UIcon name="i-lucide-arrow-left-right" class="size-6" />
    </span>
    <div class="flex flex-1 flex-col gap-3">
      <div class="flex flex-col gap-1">
        <h2 class="text-lg font-semibold">Cambia tus dólares o soles</h2>
        <p class="text-muted">
          Mira cuánto recibes con el tipo de cambio del día.
        </p>
      </div>
      <USkeleton v-if="loading" class="h-5 w-48 rounded-sm" />
      <p v-else-if="rate" class="text-sm text-muted">
        Compra
        <span class="font-mono text-default">{{
          formatRate(rate.compra)
        }}</span>
        · Venta
        <span class="font-mono text-default">{{ formatRate(rate.venta) }}</span>
      </p>
    </div>
    <span
      class="flex items-center gap-1 self-center text-sm font-semibold text-accent"
      aria-hidden="true"
    >
      Ir
      <UIcon
        name="i-lucide-arrow-right"
        class="size-4 transition-transform group-hover:translate-x-0.5"
      />
    </span>
  </NuxtLink>
</template>

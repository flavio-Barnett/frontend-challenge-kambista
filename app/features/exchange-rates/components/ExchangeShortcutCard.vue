<script setup lang="ts">
import { formatRate } from '~/shared/format/money';
import ShortcutCard from '~/shared/ui/ShortcutCard.vue';
import type { ExchangeRate } from '../api/exchange-rates';

defineProps<{ rate: ExchangeRate | null; loading: boolean }>();
</script>

<template>
  <ShortcutCard
    to="/exchange"
    icon="i-lucide-arrow-left-right"
    title="Cambia tus dólares o soles"
    description="Mira cuánto recibes con el tipo de cambio del día."
  >
    <USkeleton v-if="loading" class="h-5 w-48 rounded-sm" />
    <p v-else-if="rate" class="text-sm text-muted">
      Compra
      <span class="font-mono text-default">{{ formatRate(rate.compra) }}</span>
      · Venta
      <span class="font-mono text-default">{{ formatRate(rate.venta) }}</span>
    </p>
  </ShortcutCard>
</template>

<script setup lang="ts">
import { formatTime } from '~/shared/format/date-time';
import { formatRate } from '~/shared/format/money';
import type { ExchangeRate } from '../api/exchange-rates';
import type { RateStatus } from '../composables/useCurrentRate';

defineProps<{
  rate: ExchangeRate | null;
  status: RateStatus;
  error: string | null;
  pending: boolean;
  lastUpdated: Date | null;
}>();

defineEmits<{ retry: [] }>();
</script>

<template>
  <section
    aria-labelledby="rate-ticker-title"
    class="flex h-full flex-col gap-5 rounded-xl border border-hairline bg-card p-5 shadow-card sm:p-7"
  >
    <h2 id="rate-ticker-title" class="text-lg font-semibold">
      Tipo de cambio de hoy
    </h2>

    <div class="flex flex-col gap-4">
      <div
        v-if="status === 'loading'"
        class="grid grid-cols-2 gap-4"
        aria-busy="true"
      >
        <span class="sr-only">Cargando el tipo de cambio</span>
        <USkeleton class="h-16 rounded-md" />
        <USkeleton class="h-16 rounded-md" />
      </div>

      <template v-else-if="rate">
        <dl class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <dt class="text-sm font-medium text-muted">Compra</dt>
            <dd class="font-mono text-[28px]/[34px] font-medium">
              {{ formatRate(rate.compra) }}
            </dd>
            <dd class="text-sm text-muted">Cuando envías soles</dd>
          </div>
          <div class="flex flex-col gap-1">
            <dt class="text-sm font-medium text-muted">Venta</dt>
            <dd class="font-mono text-[28px]/[34px] font-medium">
              {{ formatRate(rate.venta) }}
            </dd>
            <dd class="text-sm text-muted">Cuando envías dólares</dd>
          </div>
        </dl>
        <p
          v-if="lastUpdated"
          class="flex items-center gap-2 text-sm text-muted"
        >
          <span class="size-2 rounded-full bg-maiz-500" aria-hidden="true" />
          Actualizado a las {{ formatTime(lastUpdated) }}
        </p>
      </template>

      <div
        v-else
        class="flex flex-col items-start gap-3 rounded-md bg-subtle p-4"
      >
        <p role="status" class="flex items-start gap-2">
          <UIcon
            :name="
              status === 'unavailable' ? 'i-lucide-clock' : 'i-lucide-wifi-off'
            "
            class="mt-0.5 size-5 shrink-0 text-muted"
          />
          <span>{{ error }}</span>
        </p>
        <UButton
          v-if="status === 'error'"
          label="Reintentar"
          color="neutral"
          variant="soft"
          icon="i-lucide-refresh-cw"
          :loading="pending"
          @click="$emit('retry')"
        />
      </div>
    </div>
  </section>
</template>

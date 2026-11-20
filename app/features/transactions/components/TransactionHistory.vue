<script setup lang="ts">
import { useHistoryPage } from '../composables/useHistoryPage';
import HistoryCardList from './HistoryCardList.vue';
import HistoryFilters from './HistoryFilters.vue';
import HistoryPagination from './HistoryPagination.vue';
import HistoryTable from './HistoryTable.vue';

const SKELETON_ROWS = 5;

const {
  range,
  page,
  items,
  total,
  status,
  error,
  retry,
  loading,
  isEmpty,
  pageSize,
} = useHistoryPage();
</script>

<template>
  <section
    aria-label="Historial de cambios"
    class="flex flex-col gap-6 rounded-xl border border-hairline bg-card p-5 shadow-card sm:p-7"
  >
    <HistoryFilters v-model:range="range" />

    <div
      v-if="status === 'error'"
      class="flex flex-col items-start gap-3 rounded-md bg-subtle p-4"
    >
      <p role="alert" class="flex items-start gap-2">
        <UIcon
          name="i-lucide-circle-alert"
          class="mt-0.5 size-5 shrink-0 text-muted"
        />
        <span>{{ error }}</span>
      </p>
      <UButton
        label="Reintentar"
        color="neutral"
        variant="soft"
        icon="i-lucide-refresh-cw"
        @click="retry"
      />
    </div>

    <div
      v-else-if="isEmpty"
      class="flex flex-col items-center gap-4 rounded-md bg-subtle px-4 py-10 text-center"
    >
      <span
        class="flex size-12 items-center justify-center rounded-full bg-maiz-100 text-accent"
      >
        <UIcon name="i-lucide-receipt-text" class="size-6" />
      </span>
      <div class="flex flex-col gap-1">
        <p class="text-lg font-semibold">No hiciste cambios en estas fechas</p>
        <p class="text-muted">Prueba con otras fechas o haz un cambio ahora.</p>
      </div>
      <UButton
        label="Hacer un cambio"
        to="/exchange"
        icon="i-lucide-arrow-left-right"
      />
    </div>

    <template v-else>
      <HistoryTable
        :items="items"
        :loading="loading"
        :skeleton-rows="SKELETON_ROWS"
        class="hidden md:table"
      />
      <HistoryCardList
        :items="items"
        :loading="loading"
        :skeleton-rows="SKELETON_ROWS"
        class="md:hidden"
      />
      <HistoryPagination
        v-if="total > 0"
        v-model:page="page"
        :total="total"
        :page-size="pageSize"
        :disabled="loading"
      />
    </template>
  </section>
</template>

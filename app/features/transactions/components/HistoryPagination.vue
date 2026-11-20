<script setup lang="ts">
const props = defineProps<{
  total: number;
  pageSize: number;
  disabled: boolean;
}>();

const page = defineModel<number>('page', { required: true });

const firstShown = computed(() => (page.value - 1) * props.pageSize + 1);
const lastShown = computed(() =>
  Math.min(page.value * props.pageSize, props.total),
);
</script>

<template>
  <div class="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
    <p class="text-sm text-muted" aria-live="polite">
      Mostrando {{ firstShown }}–{{ lastShown }} de {{ total }}
    </p>
    <UPagination
      v-if="total > pageSize"
      v-model:page="page"
      :total="total"
      :items-per-page="pageSize"
      :sibling-count="1"
      :disabled="disabled"
      color="neutral"
      variant="ghost"
      active-color="neutral"
      active-variant="solid"
    />
  </div>
</template>

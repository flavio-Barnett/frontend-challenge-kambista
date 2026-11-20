<script setup lang="ts">
import type { Currency } from '../domain/currency';

defineProps<{ from: Currency; to: Currency }>();
</script>

<template>
  <span class="inline-flex items-center gap-1.5 font-medium">
    {{ from }}
    <UIcon name="i-lucide-arrow-right" class="size-4 text-muted" />
    <span class="sr-only">a</span>
    {{ to }}
  </span>
</template>

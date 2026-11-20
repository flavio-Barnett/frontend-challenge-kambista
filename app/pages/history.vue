<script setup lang="ts">
import TransactionHistory from '~/features/transactions/components/TransactionHistory.vue';

definePageMeta({ title: 'Historial' });
</script>

<template>
  <div class="flex w-full flex-col gap-8">
    <header class="flex flex-col gap-1">
      <h1 class="font-display text-[28px]/[34px] font-bold tracking-tight">
        Historial
      </h1>
      <p class="text-muted">Revisa los cambios que hiciste.</p>
    </header>

    <TransactionHistory />
  </div>
</template>

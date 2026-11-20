<script setup lang="ts">
import type { ExchangeRate } from '~/features/exchange-rates/api/exchange-rates';
import { useExchangeForm } from '../composables/useExchangeForm';
import ExchangeForm from './ExchangeForm.vue';

const props = defineProps<{ rate: ExchangeRate | null }>();

const { state, preview, swap } = useExchangeForm(toRef(props, 'rate'));
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-12 lg:gap-6">
    <div class="lg:col-span-5 lg:col-start-8 lg:row-start-1">
      <slot name="rate" />
    </div>
    <ExchangeForm
      v-model:amount="state.amount"
      v-model:from="state.from"
      v-model:to="state.to"
      :preview="preview"
      :disabled="!rate"
      class="lg:col-span-7 lg:col-start-1 lg:row-start-1"
      @swap="swap"
    />
  </div>
</template>

<script setup lang="ts">
import type { ExchangeRate } from '~/features/exchange-rates/api/exchange-rates';
import { useExchangeForm } from '../composables/useExchangeForm';
import type { ExchangePreview } from '../domain/exchange-preview';
import ExchangeConfirmModal from './ExchangeConfirmModal.vue';
import ExchangeForm from './ExchangeForm.vue';

const props = defineProps<{ rate: ExchangeRate | null }>();

const { state, preview, swap, reset } = useExchangeForm(toRef(props, 'rate'));

const confirming = ref(false);
const confirmedPreview = ref<ExchangePreview | null>(null);

function review(): void {
  if (!preview.value) {
    return;
  }
  confirmedPreview.value = preview.value;
  confirming.value = true;
}
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
      @submit="review"
    />
    <ExchangeConfirmModal
      v-model:open="confirming"
      :preview="confirmedPreview"
      @restart="reset"
    />
  </div>
</template>

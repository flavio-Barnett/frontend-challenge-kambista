<script setup lang="ts">
import { useExchangeSubmission } from '../composables/useExchangeSubmission';
import type { ExchangePreview } from '../domain/exchange-preview';
import ExchangeResult from './ExchangeResult.vue';
import ExchangeSummaryList from './ExchangeSummaryList.vue';

const props = defineProps<{ preview: ExchangePreview | null }>();

const emit = defineEmits<{ restart: [] }>();

const open = defineModel<boolean>('open', { required: true });

const { pending, error, transaction, submit, clear } = useExchangeSubmission();

const title = computed(() =>
  transaction.value ? '¡Listo! Registramos tu cambio' : 'Confirma tu cambio',
);
const description = computed(() =>
  transaction.value
    ? 'Estos son los datos de tu operación.'
    : 'Revisa los datos antes de confirmar.',
);

watch(open, (isOpen) => {
  if (isOpen) {
    clear();
    return;
  }
  if (transaction.value) {
    emit('restart');
  }
});

function confirm(): void {
  if (props.preview) {
    void submit(props.preview);
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="title"
    :description="description"
    :dismissible="!pending"
    :close="!pending"
    :ui="{
      content: 'rounded-xl',
      footer: 'flex-col-reverse gap-3 sm:flex-row sm:justify-end',
    }"
  >
    <template #body>
      <ExchangeResult v-if="transaction" :transaction="transaction" />
      <div v-else-if="preview" class="flex flex-col gap-4">
        <ExchangeSummaryList :preview="preview" />
        <p class="text-sm text-muted">
          El monto final se calcula con el tipo de cambio vigente al momento de
          confirmar.
        </p>
        <UAlert
          v-if="error"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-alert"
          :title="error"
          role="alert"
        />
      </div>
    </template>

    <template #footer>
      <template v-if="transaction">
        <UButton
          label="Ver historial"
          to="/history"
          color="neutral"
          variant="soft"
          icon="i-lucide-history"
          class="w-full justify-center sm:w-auto"
        />
        <UButton
          label="Hacer otro cambio"
          icon="i-lucide-repeat"
          class="w-full justify-center sm:w-auto"
          @click="open = false"
        />
      </template>
      <template v-else>
        <UButton
          label="Cancelar"
          color="neutral"
          variant="soft"
          class="w-full justify-center sm:w-auto"
          :disabled="pending"
          @click="open = false"
        />
        <UButton
          label="Confirmar cambio"
          class="w-full justify-center sm:w-auto"
          :loading="pending"
          @click="confirm"
        />
      </template>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useSessionStore } from '~/features/auth/stores/session';
import ExchangeShortcutCard from '~/features/exchange-rates/components/ExchangeShortcutCard.vue';
import { useCurrentRate } from '~/features/exchange-rates/composables/useCurrentRate';
import { firstName } from '~/shared/format/person-name';
import ShortcutCard from '~/shared/ui/ShortcutCard.vue';

definePageMeta({ title: 'Inicio' });

const session = useSessionStore();
const greetingName = computed(() => firstName(session.user?.nombre ?? ''));

const { rate, status } = useCurrentRate();
</script>

<template>
  <div class="flex w-full flex-col gap-8">
    <header class="flex flex-col gap-1">
      <h1 class="font-display text-[28px]/[34px] font-bold tracking-tight">
        ¡Hola, {{ greetingName }}!
      </h1>
      <p class="text-muted">¿Qué quieres hacer hoy?</p>
    </header>

    <ul class="grid gap-4 md:grid-cols-2">
      <li>
        <ExchangeShortcutCard :rate="rate" :loading="status === 'loading'" />
      </li>
      <li>
        <ShortcutCard
          to="/history"
          icon="i-lucide-history"
          title="Revisa tus operaciones"
          description="Encuentra tus cambios anteriores por fecha."
        />
      </li>
    </ul>
  </div>
</template>

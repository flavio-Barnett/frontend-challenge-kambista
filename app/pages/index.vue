<script setup lang="ts">
import { useSessionStore } from '~/features/auth/stores/session';
import ExchangeShortcutCard from '~/features/exchange-rates/components/ExchangeShortcutCard.vue';
import { useCurrentRate } from '~/features/exchange-rates/composables/useCurrentRate';
import { firstName } from '~/shared/format/person-name';

definePageMeta({ title: 'Inicio' });

const session = useSessionStore();
const greetingName = computed(() => firstName(session.user?.nombre ?? ''));

const { rate, status } = useCurrentRate();

const upcomingModules = [
  {
    icon: 'i-lucide-history',
    title: 'Revisa tus operaciones',
    description: 'Encuentra tus cambios anteriores por fecha.',
  },
];
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
      <li
        v-for="module in upcomingModules"
        :key="module.title"
        class="flex items-start gap-4 rounded-xl border border-hairline bg-card p-5 shadow-card sm:gap-5 sm:p-7 md:min-h-40"
      >
        <span
          class="flex size-12 shrink-0 items-center justify-center rounded-full bg-maiz-100 text-accent"
        >
          <UIcon :name="module.icon" class="size-6" />
        </span>
        <div class="flex flex-col gap-3">
          <div class="flex flex-col gap-1">
            <h2 class="text-lg font-semibold">{{ module.title }}</h2>
            <p class="text-muted">{{ module.description }}</p>
          </div>
          <UBadge
            label="Próximamente"
            color="neutral"
            variant="subtle"
            size="sm"
            class="self-start"
          />
        </div>
      </li>
    </ul>
  </div>
</template>

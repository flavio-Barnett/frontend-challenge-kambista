<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';
import { formatPersonName, initials } from '~/shared/format/person-name';
import { useLogout } from '../composables/useLogout';
import { useSessionStore } from '../stores/session';

const session = useSessionStore();
const { logOut } = useLogout();

const displayName = computed(() =>
  formatPersonName(session.user?.nombre ?? ''),
);

const items: DropdownMenuItem[] = [
  { label: 'Cerrar sesión', icon: 'i-lucide-log-out', onSelect: logOut },
];
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'end', collisionPadding: 12 }"
    :ui="{ content: 'min-w-60' }"
  >
    <UButton
      color="neutral"
      variant="ghost"
      :avatar="{
        text: initials(displayName),
        alt: displayName,
        size: 'lg',
        ui: {
          root: 'bg-andino-900',
          fallback: 'text-sm font-semibold text-white',
        },
      }"
      trailing-icon="i-lucide-chevron-down"
      aria-label="Menú de usuario"
      class="h-10 rounded-full px-0.5 md:px-2"
      :ui="{ trailingIcon: 'hidden text-dimmed md:inline-flex' }"
    >
      <span class="hidden max-w-40 truncate font-medium md:inline">
        {{ displayName }}
      </span>
    </UButton>

    <template #content-top>
      <div class="flex flex-col gap-1 px-3 py-2.5">
        <span class="flex items-center gap-2">
          <span class="truncate font-medium">{{ displayName }}</span>
          <UBadge
            v-if="session.isAdmin"
            label="Admin"
            size="sm"
            color="secondary"
            variant="subtle"
          />
        </span>
        <span class="truncate text-sm text-muted">
          {{ session.user?.email }}
        </span>
      </div>
      <USeparator />
    </template>
  </UDropdownMenu>
</template>

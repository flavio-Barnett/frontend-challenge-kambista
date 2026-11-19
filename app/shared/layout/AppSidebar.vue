<script setup lang="ts">
import { appNavigation } from '~/shared/navigation/app-navigation';
</script>

<template>
  <UDashboardSidebar
    collapsible
    :default-size="16"
    :min-size="14"
    :max-size="20"
    :collapsed-size="4.5"
    :ui="{
      root: 'border-e border-hairline bg-subtle',
      header: 'border-b border-hairline',
      content: 'w-72 max-w-[85vw] bg-subtle',
    }"
  >
    <template #header="{ collapsed }">
      <NuxtLink to="/" aria-label="Ir al inicio" class="flex items-center">
        <img
          v-if="collapsed"
          src="/brand/qolqa-mark.svg"
          alt="Qolqa"
          width="32"
          height="32"
          class="size-8"
        />
        <img
          v-else
          src="/brand/qolqa-logo.svg"
          alt="Qolqa"
          width="113"
          height="40"
          class="h-8 w-auto"
        />
      </NuxtLink>
    </template>

    <template #default="{ collapsed }">
      <UNavigationMenu
        :collapsed="collapsed"
        :items="appNavigation"
        orientation="vertical"
        color="neutral"
      />
    </template>
  </UDashboardSidebar>
</template>

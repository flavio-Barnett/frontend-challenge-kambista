<script setup lang="ts">
import UserMenu from '~/features/auth/components/UserMenu.vue';
import AppSidebar from '~/shared/layout/AppSidebar.vue';

const route = useRoute();
const title = computed(() => route.meta.title ?? 'Qolqa');

useHead({ title: () => `${title.value} · Qolqa` });
</script>

<template>
  <UDashboardGroup unit="rem" storage="local">
    <AppSidebar />

    <UDashboardPanel :ui="{ root: 'bg-page' }">
      <template #header>
        <UDashboardNavbar :ui="{ root: 'bg-card' }">
          <template #title>
            <img
              src="/brand/qolqa-logo.svg"
              alt="Qolqa"
              width="113"
              height="40"
              class="h-7 w-auto lg:hidden"
            />
            <span class="hidden lg:inline">{{ title }}</span>
          </template>

          <template #right>
            <UserMenu />
          </template>
        </UDashboardNavbar>
      </template>

      <template #body>
        <slot />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>

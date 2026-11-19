<script setup lang="ts">
import AuthBrandPanel from '~/features/auth/components/AuthBrandPanel.vue';
</script>

<template>
  <div class="grid min-h-dvh md:grid-cols-2">
    <div class="hidden md:block">
      <AuthBrandPanel />
    </div>

    <main
      class="flex flex-col items-center justify-center bg-page px-4 py-12 lg:px-12"
    >
      <div class="flex w-full max-w-[400px] flex-col gap-10 xl:max-w-[420px]">
        <img
          src="/brand/qolqa-logo.svg"
          alt="Qolqa"
          width="158"
          height="56"
          class="self-center md:hidden"
        />
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
defineProps<{ to: string; icon: string; title: string; description: string }>();
</script>

<template>
  <NuxtLink
    :to="to"
    class="group flex h-full items-start gap-4 rounded-xl border border-hairline bg-card p-5 shadow-card transition-shadow hover:shadow-pop focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:gap-5 sm:p-7 md:min-h-40"
  >
    <span
      class="flex size-12 shrink-0 items-center justify-center rounded-full bg-maiz-100 text-accent"
    >
      <UIcon :name="icon" class="size-6" />
    </span>
    <div class="flex flex-1 flex-col gap-3">
      <div class="flex flex-col gap-1">
        <h2 class="text-lg font-semibold">{{ title }}</h2>
        <p class="text-muted">{{ description }}</p>
      </div>
      <slot />
    </div>
    <span
      class="flex items-center gap-1 self-center text-sm font-semibold text-accent"
      aria-hidden="true"
    >
      Ir
      <UIcon
        name="i-lucide-arrow-right"
        class="size-4 transition-transform group-hover:translate-x-0.5"
      />
    </span>
  </NuxtLink>
</template>

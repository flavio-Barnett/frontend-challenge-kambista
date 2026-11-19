<script setup lang="ts">
interface Feature {
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: 'i-lucide-trending-up',
    title: 'Precio siempre al día',
    description: 'Ves el tipo de cambio del momento, sin sorpresas.',
  },
  {
    icon: 'i-lucide-arrow-left-right',
    title: 'Cambia en segundos',
    description: 'De dólares a soles o de soles a dólares, fácil y rápido.',
  },
  {
    icon: 'i-lucide-history',
    title: 'Tus operaciones a mano',
    description: 'Revisa tus cambios cuando quieras.',
  },
];
</script>

<template>
  <aside
    class="flex h-full items-center justify-center bg-linear-to-b from-andino-900 from-40% to-andino-700 px-12 py-16 text-white xl:px-20"
  >
    <div class="flex w-full max-w-md flex-col gap-10 xl:gap-12">
      <img
        src="/brand/qolqa-logo-reverse.svg"
        alt="Qolqa"
        width="237"
        height="84"
        class="h-12 w-auto self-start xl:h-14"
      />

      <div class="flex flex-col gap-3">
        <h2
          class="font-display text-[28px]/[34px] font-bold tracking-tight xl:text-[32px]/[40px]"
        >
          Cambia tus dólares sin sorpresas
        </h2>
        <p class="text-sm text-andino-200 xl:text-base">
          El tipo de cambio claro y tus operaciones siempre a la vista.
        </p>
      </div>

      <ul class="flex flex-col gap-6 xl:gap-7">
        <li
          v-for="feature in features"
          :key="feature.title"
          class="flex items-start gap-4"
        >
          <span
            class="flex size-11 shrink-0 items-center justify-center rounded-full bg-maiz-500/15 text-maiz-400"
          >
            <UIcon :name="feature.icon" class="size-5" />
          </span>
          <div class="flex flex-col gap-0.5">
            <p class="font-semibold xl:text-lg">{{ feature.title }}</p>
            <p class="text-sm text-andino-200 xl:text-[15px]">
              {{ feature.description }}
            </p>
          </div>
        </li>
      </ul>
    </div>
  </aside>
</template>

<template>
  <main class="mx-auto flex min-h-screen max-w-xl flex-col gap-8 px-4 py-16">
    <img src="/brand/qolqa-logo.svg" alt="Qolqa" width="158" height="56" />

    <section class="flex flex-col gap-4 rounded-xl bg-card p-6 shadow-card">
      <h1 class="font-display text-[40px]/[44px] font-bold tracking-tight">
        Cambia dólares sin sorpresas
      </h1>
      <p class="text-muted">
        Tipo de cambio claro y tu plata siempre a la vista.
      </p>
      <dl class="grid grid-cols-2 gap-4">
        <div>
          <dt class="text-sm text-muted">Recibes</dt>
          <dd class="font-mono text-2xl font-medium">S/ 3,739.00</dd>
        </div>
        <div>
          <dt class="flex items-center gap-1 text-sm text-muted">
            <UIcon name="i-lucide-arrow-up-down" class="size-4" />
            Venta
          </dt>
          <dd class="font-mono text-2xl font-medium">3.739</dd>
        </div>
      </dl>
      <div class="flex flex-wrap gap-3">
        <UButton label="Cambiar ahora" size="lg" />
        <UButton label="Ver operaciones" color="neutral" variant="soft" />
      </div>
    </section>
  </main>
</template>

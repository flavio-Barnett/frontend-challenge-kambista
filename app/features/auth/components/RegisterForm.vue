<script setup lang="ts">
import { useRegisterForm } from '../composables/useRegisterForm';
import { registerSchema } from '../schemas/register.schema';
import PasswordInput from './PasswordInput.vue';

const { state, pending, apiError, submit } = useRegisterForm();
</script>

<template>
  <div class="flex flex-col gap-6">
    <h1
      class="font-display text-[28px]/[34px] font-bold tracking-tight xl:text-[32px]/[40px]"
    >
      Crea tu cuenta
    </h1>

    <UAlert
      v-if="apiError"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :title="apiError"
      role="alert"
    />

    <UForm
      :schema="registerSchema"
      :state="state"
      novalidate
      class="flex flex-col gap-5"
      @submit="submit($event.data)"
    >
      <UFormField label="Nombre" name="nombre">
        <UInput
          v-model="state.nombre"
          placeholder="Escribe tu nombre"
          autocomplete="name"
          size="xl"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Correo" name="email">
        <UInput
          v-model="state.email"
          type="email"
          placeholder="Escribe tu correo"
          autocomplete="email"
          size="xl"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Contraseña" name="password" hint="Mínimo 8 caracteres">
        <PasswordInput v-model="state.password" autocomplete="new-password" />
      </UFormField>

      <UButton
        type="submit"
        label="Crear cuenta"
        block
        :loading="pending"
        class="mt-2"
      />
    </UForm>

    <p class="text-center text-sm text-muted">
      ¿Ya tienes cuenta?
      <ULink to="/login" class="font-semibold text-accent hover:underline">
        Inicia sesión
      </ULink>
    </p>
  </div>
</template>

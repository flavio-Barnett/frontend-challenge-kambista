<script setup lang="ts">
import { useLoginForm } from '../composables/useLoginForm';
import { loginSchema } from '../schemas/login.schema';
import PasswordInput from './PasswordInput.vue';

const { state, pending, apiError, submit } = useLoginForm();
</script>

<template>
  <div class="flex flex-col gap-6">
    <h1
      class="font-display text-[28px]/[34px] font-bold tracking-tight xl:text-[32px]/[40px]"
    >
      Inicia sesión
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
      :schema="loginSchema"
      :state="state"
      novalidate
      class="flex flex-col gap-5"
      @submit="submit($event.data)"
    >
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

      <UFormField label="Contraseña" name="password">
        <PasswordInput
          v-model="state.password"
          autocomplete="current-password"
        />
      </UFormField>

      <UButton
        type="submit"
        label="Iniciar sesión"
        block
        :loading="pending"
        class="mt-2"
      />
    </UForm>

    <p class="text-center text-sm text-muted">
      ¿No tienes cuenta?
      <ULink to="/register" class="font-semibold text-accent hover:underline">
        Regístrate aquí
      </ULink>
    </p>
  </div>
</template>

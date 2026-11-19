<script setup lang="ts">
defineProps<{
  autocomplete: 'current-password' | 'new-password';
}>();

const password = defineModel<string>({ required: true });
const visible = ref(false);
</script>

<template>
  <UInput
    v-model="password"
    :type="visible ? 'text' : 'password'"
    :autocomplete="autocomplete"
    size="xl"
    class="w-full"
    :ui="{ trailing: 'pe-1' }"
  >
    <template #trailing>
      <UButton
        color="neutral"
        variant="link"
        size="sm"
        :icon="visible ? 'i-lucide-eye-off' : 'i-lucide-eye'"
        :aria-label="visible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
        :aria-pressed="visible"
        @click="visible = !visible"
      />
    </template>
  </UInput>
</template>

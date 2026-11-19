<script setup lang="ts">
import LoginForm from '~/features/auth/components/LoginForm.vue';

definePageMeta({ layout: 'auth', guestOnly: true });
useHead({ title: 'Inicia sesión · Qolqa' });
</script>

<template>
  <LoginForm />
</template>

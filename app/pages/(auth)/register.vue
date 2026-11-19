<script setup lang="ts">
import RegisterForm from '~/features/auth/components/RegisterForm.vue';

definePageMeta({ layout: 'auth', guestOnly: true });
useHead({ title: 'Crea tu cuenta · Qolqa' });
</script>

<template>
  <RegisterForm />
</template>

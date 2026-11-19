export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  telemetry: false,
  devtools: { enabled: false },
  modules: ['@nuxt/ui', '@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Qolqa',
      htmlAttrs: { lang: 'es' },
    },
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: 'http://localhost:3000',
    },
  },
  devServer: {
    port: 3001,
  },
  typescript: {
    strict: true,
    typeCheck: false,
  },
});

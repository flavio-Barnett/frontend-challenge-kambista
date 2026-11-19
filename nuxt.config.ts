export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  telemetry: false,
  devtools: { enabled: false },
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
  ],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Qolqa',
      htmlAttrs: { lang: 'es' },
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/brand/qolqa-mark.svg' },
      ],
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
  ui: {
    colorMode: false,
  },
  fonts: {
    defaults: {
      subsets: ['latin'],
      styles: ['normal'],
    },
    families: [
      { name: 'Geist', provider: 'google', weights: [400, 500, 600] },
      { name: 'Geist Mono', provider: 'google', weights: [500] },
      { name: 'Bricolage Grotesque', provider: 'google', weights: [600, 700] },
    ],
  },
  icon: {
    provider: 'none',
    serverBundle: false,
    clientBundle: {
      scan: true,
    },
  },
});

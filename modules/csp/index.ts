import { addNitroPlugin, createResolver, defineNuxtModule } from '@nuxt/kit';

export default defineNuxtModule({
  meta: { name: 'csp' },
  setup() {
    const { resolve } = createResolver(import.meta.url);
    addNitroPlugin(resolve('./runtime/server/csp'));
  },
});

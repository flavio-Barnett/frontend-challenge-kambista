import { useSessionStore } from '~/features/auth/stores/session';
import { createApiClient, type ApiClient } from '~/shared/http/api-client';

export default defineNuxtPlugin({
  name: 'api-client',
  dependsOn: ['pinia'],
  setup(nuxtApp) {
    const session = () => useSessionStore(nuxtApp.$pinia);

    const api: ApiClient = createApiClient({
      baseURL: useRuntimeConfig().public.apiBaseUrl,
      session: {
        accessToken: () => session().accessToken,
        refresh: () => session().refreshAccessToken(),
        expire: async () => {
          session().clear();
          await nuxtApp.runWithContext(() =>
            navigateTo({
              path: '/login',
              query: { redirect: nuxtApp.$router.currentRoute.value.fullPath },
            }),
          );
        },
      },
    });

    return { provide: { api } };
  },
});

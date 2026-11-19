import { useSessionStore } from '~/features/auth/stores/session';

export default defineNuxtRouteMiddleware(async (to) => {
  const session = useSessionStore();

  if (session.status === 'unknown') {
    await session.restore();
  }

  if (to.meta.guestOnly) {
    return session.isAuthenticated ? navigateTo('/') : undefined;
  }

  if (!session.isAuthenticated) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } });
  }
});

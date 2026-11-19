import { useSessionStore } from '../stores/session';

export function useLogout() {
  const session = useSessionStore();
  const pending = ref(false);

  async function logOut(): Promise<void> {
    pending.value = true;
    try {
      await session.logout();
      await navigateTo('/login');
    } finally {
      pending.value = false;
    }
  }

  return { pending, logOut };
}

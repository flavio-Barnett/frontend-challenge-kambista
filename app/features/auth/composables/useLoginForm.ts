import { toUserMessage } from '~/shared/errors/to-user-message';
import { safeRedirect } from '~/shared/navigation/safe-redirect';
import type { LoginInput } from '../schemas/login.schema';
import { useSessionStore } from '../stores/session';

export function useLoginForm() {
  const session = useSessionStore();
  const route = useRoute();

  const state = reactive<LoginInput>({ email: '', password: '' });
  const pending = ref(false);
  const error = ref<string | null>(null);

  async function submit(credentials: LoginInput): Promise<void> {
    pending.value = true;
    error.value = null;
    try {
      await session.logIn(credentials);
      await navigateTo(safeRedirect(route.query.redirect));
    } catch (failure) {
      error.value = toUserMessage(failure);
    } finally {
      state.password = '';
      pending.value = false;
    }
  }

  return { state, pending, error, submit };
}

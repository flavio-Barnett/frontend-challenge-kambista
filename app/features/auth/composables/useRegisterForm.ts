import { toUserMessage } from '~/shared/errors/to-user-message';
import { safeRedirect } from '~/shared/navigation/safe-redirect';
import type { RegisterInput } from '../schemas/register.schema';
import { useSessionStore } from '../stores/session';

export function useRegisterForm() {
  const session = useSessionStore();
  const route = useRoute();

  const state = reactive<RegisterInput>({
    nombre: '',
    email: '',
    password: '',
  });
  const pending = ref(false);
  const apiError = ref<string | null>(null);

  async function submit(input: RegisterInput): Promise<void> {
    pending.value = true;
    apiError.value = null;
    try {
      await session.register(input);
      await navigateTo(safeRedirect(route.query.redirect));
    } catch (error) {
      apiError.value = toUserMessage(error);
    } finally {
      state.password = '';
      pending.value = false;
    }
  }

  return { state, pending, apiError, submit };
}

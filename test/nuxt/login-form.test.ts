import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import LoginForm from '~/features/auth/components/LoginForm.vue';

const unregisterEndpoints: Array<() => void> = [];

afterEach(() => {
  unregisterEndpoints.splice(0).forEach((unregister) => unregister());
});

describe('LoginForm', () => {
  it('shows a generic message and clears the password when the credentials are wrong', async () => {
    unregisterEndpoints.push(
      registerEndpoint(
        `${useRuntimeConfig().public.apiBaseUrl}/v1/auth/login`,
        () =>
          Response.json(
            {
              success: false,
              error: {
                code: 'INVALID_CREDENTIALS',
                message: 'Email o contraseña incorrectos',
              },
            },
            { status: 401 },
          ),
      ),
    );
    const form = await mountSuspended(LoginForm);

    await form.find('input[type="email"]').setValue('ana@correo.com');
    await form
      .find('input[autocomplete="current-password"]')
      .setValue('clave-123');
    await form.find('form').trigger('submit');

    await vi.waitFor(() => {
      expect(form.find('[role="alert"]').text()).toContain(
        'Correo o contraseña incorrectos',
      );
    });
    const password = form.find<HTMLInputElement>(
      'input[autocomplete="current-password"]',
    );
    expect(password.element.value).toBe('');
  });
});

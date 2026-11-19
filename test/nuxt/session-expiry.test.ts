import { afterEach, describe, expect, it, vi } from 'vitest';
import { mockNuxtImport, registerEndpoint } from '@nuxt/test-utils/runtime';
import { useSessionStore } from '~/features/auth/stores/session';

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }));

mockNuxtImport('navigateTo', () => navigateToMock);

const unregisterEndpoints: Array<() => void> = [];

function rejectWith401(path: string): void {
  const url = `${useRuntimeConfig().public.apiBaseUrl}${path}`;
  unregisterEndpoints.push(
    registerEndpoint(url, () =>
      Response.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '' } },
        { status: 401 },
      ),
    ),
  );
}

afterEach(() => {
  unregisterEndpoints.splice(0).forEach((unregister) => unregister());
  navigateToMock.mockReset();
});

describe('expired session', () => {
  it('clears the session and redirects to the login when the refresh fails', async () => {
    rejectWith401('/v1/transactions');
    rejectWith401('/v1/auth/refresh');
    const session = useSessionStore();
    session.$patch({
      user: {
        id: 'user-1',
        nombre: 'Ana',
        email: 'ana@correo.com',
        rol: 'user',
      },
      accessToken: 'expired',
      status: 'authenticated',
    });
    const currentPath = useRouter().currentRoute.value.fullPath;

    await expect(useNuxtApp().$api('/v1/transactions')).rejects.toThrow();

    expect(session.status).toBe('anonymous');
    expect(session.accessToken).toBeNull();
    expect(navigateToMock).toHaveBeenCalledWith({
      path: '/login',
      query: { redirect: currentPath },
    });
  });
});

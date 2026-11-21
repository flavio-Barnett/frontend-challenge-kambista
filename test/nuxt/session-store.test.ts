import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { registerEndpoint } from '@nuxt/test-utils/runtime';
import { useSessionStore } from '~/features/auth/stores/session';
import type { SessionUser } from '~/features/auth/api/auth';

const USER: SessionUser = {
  id: 'user-1',
  nombre: 'Ana Quispe',
  email: 'ana@correo.com',
  rol: 'admin',
};

const unregisterEndpoints: Array<() => void> = [];

function apiEndpoint(
  path: string,
  handler: (event: { headers: Headers }) => unknown,
): void {
  const url = `${useRuntimeConfig().public.apiBaseUrl}${path}`;
  unregisterEndpoints.push(registerEndpoint(url, handler));
}

function errorResponse(status: number, code: string): Response {
  return Response.json(
    { success: false, error: { code, message: code } },
    { status },
  );
}

beforeEach(() => {
  useSessionStore().$patch({
    user: null,
    accessToken: null,
    status: 'unknown',
  });
});

afterEach(() => {
  unregisterEndpoints.splice(0).forEach((unregister) => unregister());
});

describe('session store', () => {
  it('restores the session with the refresh cookie and the current user', async () => {
    apiEndpoint('/v1/auth/refresh', () => ({ access_token: 'restored' }));
    apiEndpoint('/v1/auth/me', (event) =>
      event.headers.get('authorization') === 'Bearer restored'
        ? USER
        : errorResponse(401, 'INVALID_ACCESS_TOKEN'),
    );
    const session = useSessionStore();

    await session.restore();

    expect(session.status).toBe('authenticated');
    expect(session.user).toEqual(USER);
    expect(session.isAuthenticated).toBe(true);
    expect(session.isAdmin).toBe(true);
  });

  it('becomes anonymous when the refresh is rejected', async () => {
    apiEndpoint('/v1/auth/refresh', () =>
      errorResponse(401, 'INVALID_REFRESH_TOKEN'),
    );
    const session = useSessionStore();

    await session.restore();

    expect(session.status).toBe('anonymous');
    expect(session.user).toBeNull();
    expect(session.accessToken).toBeNull();
  });

  it('clears the session on logout even if the API call fails', async () => {
    apiEndpoint('/v1/auth/logout', () => errorResponse(500, 'INTERNAL_ERROR'));
    const session = useSessionStore();
    session.$patch({
      user: USER,
      accessToken: 'token',
      status: 'authenticated',
    });

    await session.logOut();

    expect(session.status).toBe('anonymous');
    expect(session.user).toBeNull();
    expect(session.accessToken).toBeNull();
  });
});

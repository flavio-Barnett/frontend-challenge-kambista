import { afterEach, describe, expect, it, vi } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import type { RouteMeta } from 'vue-router';
import authMiddleware from '~/middleware/auth.global';
import { useSessionStore } from '~/features/auth/stores/session';

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }));

mockNuxtImport('navigateTo', () => navigateToMock);

const GUEST_ONLY = { guestOnly: true };

function visit(path: string, meta: RouteMeta = {}) {
  const router = useRouter();
  const { name, ...target } = router.resolve(path);
  return authMiddleware(
    { ...target, name: name ?? undefined, meta: { ...target.meta, ...meta } },
    router.currentRoute.value,
  );
}

function signIn(): void {
  useSessionStore().$patch({
    user: { id: 'user-1', nombre: 'Ana', email: 'ana@correo.com', rol: 'user' },
    accessToken: 'token',
    status: 'authenticated',
  });
}

function signOut(): void {
  useSessionStore().$patch({
    user: null,
    accessToken: null,
    status: 'anonymous',
  });
}

afterEach(() => {
  navigateToMock.mockReset();
});

describe('auth route guard', () => {
  it('sends anonymous visitors of a private page to the login with a redirect', async () => {
    signOut();

    await visit('/?tab=historial');

    expect(navigateToMock).toHaveBeenCalledWith({
      path: '/login',
      query: { redirect: '/?tab=historial' },
    });
  });

  it('lets anonymous visitors open the guest pages', async () => {
    signOut();

    await visit('/login', GUEST_ONLY);
    await visit('/register', GUEST_ONLY);

    expect(navigateToMock).not.toHaveBeenCalled();
  });

  it('sends authenticated users away from the guest pages', async () => {
    signIn();

    await visit('/register', GUEST_ONLY);

    expect(navigateToMock).toHaveBeenCalledWith('/');
  });

  it('lets authenticated users open private pages', async () => {
    signIn();

    await visit('/');

    expect(navigateToMock).not.toHaveBeenCalled();
  });

  it('restores an unknown session before deciding', async () => {
    const session = useSessionStore();
    session.$patch({ status: 'unknown' });
    const restore = vi
      .spyOn(session, 'restore')
      .mockImplementation(async () => {
        signIn();
      });

    await visit('/');

    expect(restore).toHaveBeenCalledTimes(1);
    expect(navigateToMock).not.toHaveBeenCalled();
    restore.mockRestore();
  });
});

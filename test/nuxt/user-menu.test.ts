import { describe, expect, it, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import UserMenu from '~/features/auth/components/UserMenu.vue';
import { useSessionStore } from '~/features/auth/stores/session';
import type { SessionUser } from '~/features/auth/api/auth';

function signIn(user: SessionUser): void {
  useSessionStore().$patch({
    user,
    accessToken: 'access-token',
    status: 'authenticated',
  });
}

async function openMenu(
  menu: Awaited<ReturnType<typeof mountSuspended>>,
): Promise<string> {
  await menu.find('button').trigger('keydown', { key: 'Enter' });
  await vi.waitFor(() => {
    expect(document.body.textContent).toContain('Cerrar sesión');
  });
  return document.body.textContent ?? '';
}

describe('UserMenu', () => {
  it('shows the initials and the name in proper case', async () => {
    signIn({
      id: 'user-1',
      nombre: 'ANA MARÍA QUISPE',
      email: 'ana@correo.com',
      rol: 'user',
    });

    const menu = await mountSuspended(UserMenu);

    expect(menu.text()).toContain('AM');
    expect(menu.text()).toContain('Ana María Quispe');
  });

  it('lists the email and the logout action without the admin badge for users', async () => {
    signIn({
      id: 'user-1',
      nombre: 'Ana Quispe',
      email: 'ana@correo.com',
      rol: 'user',
    });

    const content = await openMenu(await mountSuspended(UserMenu));

    expect(content).toContain('ana@correo.com');
    expect(content).not.toContain('Admin');
  });

  it('marks administrators with a badge', async () => {
    signIn({
      id: 'admin-1',
      nombre: 'Luis Rojas',
      email: 'luis@correo.com',
      rol: 'admin',
    });

    const content = await openMenu(await mountSuspended(UserMenu));

    expect(content).toContain('Admin');
  });
});

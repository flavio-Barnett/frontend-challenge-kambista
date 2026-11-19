import { defineStore } from 'pinia';
import type { LoginInput } from '../schemas/login.schema';
import type { RegisterInput } from '../schemas/register.schema';

export type Role = 'user' | 'admin';

export interface SessionUser {
  id: string;
  nombre: string;
  email: string;
  rol: Role;
}

export type SessionStatus = 'unknown' | 'authenticated' | 'anonymous';

interface AuthResponse {
  access_token: string;
  usuario: SessionUser;
}

interface AccessTokenResponse {
  access_token: string;
}

export const useSessionStore = defineStore('session', () => {
  const api = useNuxtApp().$api;

  const user = ref<SessionUser | null>(null);
  const accessToken = ref<string | null>(null);
  const status = ref<SessionStatus>('unknown');

  const isAuthenticated = computed(() => status.value === 'authenticated');
  const isAdmin = computed(() => user.value?.rol === 'admin');

  let pendingRestore: Promise<void> | null = null;

  function authenticate(response: AuthResponse): void {
    accessToken.value = response.access_token;
    user.value = response.usuario;
    status.value = 'authenticated';
  }

  function clear(): void {
    user.value = null;
    accessToken.value = null;
    status.value = 'anonymous';
  }

  async function login(credentials: LoginInput): Promise<void> {
    authenticate(
      await api<AuthResponse>('/v1/auth/login', {
        method: 'POST',
        body: { ...credentials },
      }),
    );
  }

  async function register(input: RegisterInput): Promise<void> {
    authenticate(
      await api<AuthResponse>('/v1/auth/register', {
        method: 'POST',
        body: { ...input },
      }),
    );
  }

  async function refreshAccessToken(): Promise<void> {
    const response = await api<AccessTokenResponse>('/v1/auth/refresh', {
      method: 'POST',
    });
    accessToken.value = response.access_token;
  }

  async function recoverSession(): Promise<void> {
    try {
      await refreshAccessToken();
      user.value = await api<SessionUser>('/v1/auth/me');
      status.value = 'authenticated';
    } catch {
      clear();
    }
  }

  function restore(): Promise<void> {
    pendingRestore ??= recoverSession().finally(() => {
      pendingRestore = null;
    });
    return pendingRestore;
  }

  async function logout(): Promise<void> {
    await Promise.allSettled([api('/v1/auth/logout', { method: 'POST' })]);
    clear();
  }

  return {
    user,
    accessToken,
    status,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    restore,
    refreshAccessToken,
    clear,
  };
});

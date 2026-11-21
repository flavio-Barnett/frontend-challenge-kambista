import { defineStore } from 'pinia';
import * as authApi from '../api/auth';
import type { AuthResponse, SessionUser } from '../api/auth';
import type { LoginInput } from '../schemas/login.schema';
import type { RegisterInput } from '../schemas/register.schema';

export type SessionStatus = 'unknown' | 'authenticated' | 'anonymous';

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

  async function logIn(credentials: LoginInput): Promise<void> {
    authenticate(await authApi.logIn(api, credentials));
  }

  async function register(input: RegisterInput): Promise<void> {
    authenticate(await authApi.register(api, input));
  }

  async function refreshAccessToken(): Promise<void> {
    const response = await authApi.refreshAccessToken(api);
    accessToken.value = response.access_token;
  }

  async function recoverSession(): Promise<void> {
    try {
      await refreshAccessToken();
      user.value = await authApi.getCurrentUser(api);
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

  async function logOut(): Promise<void> {
    await Promise.allSettled([authApi.logOut(api)]);
    clear();
  }

  return {
    user,
    accessToken,
    status,
    isAuthenticated,
    isAdmin,
    logIn,
    register,
    logOut,
    restore,
    refreshAccessToken,
    clear,
  };
});

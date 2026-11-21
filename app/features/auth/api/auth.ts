import type { ApiClient } from '~/shared/http/api-client';
import type { LoginInput } from '../schemas/login.schema';
import type { RegisterInput } from '../schemas/register.schema';

export type Role = 'user' | 'admin';

export interface SessionUser {
  id: string;
  nombre: string;
  email: string;
  rol: Role;
}

export interface AuthResponse {
  access_token: string;
  usuario: SessionUser;
}

export interface AccessTokenResponse {
  access_token: string;
}

export function logIn(
  api: ApiClient,
  { email, password }: LoginInput,
): Promise<AuthResponse> {
  return api<AuthResponse>('/v1/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function register(
  api: ApiClient,
  { nombre, email, password }: RegisterInput,
): Promise<AuthResponse> {
  return api<AuthResponse>('/v1/auth/register', {
    method: 'POST',
    body: { nombre, email, password },
  });
}

export function refreshAccessToken(
  api: ApiClient,
): Promise<AccessTokenResponse> {
  return api<AccessTokenResponse>('/v1/auth/refresh', { method: 'POST' });
}

export function getCurrentUser(api: ApiClient): Promise<SessionUser> {
  return api<SessionUser>('/v1/auth/me');
}

export async function logOut(api: ApiClient): Promise<void> {
  await api('/v1/auth/logout', { method: 'POST' });
}

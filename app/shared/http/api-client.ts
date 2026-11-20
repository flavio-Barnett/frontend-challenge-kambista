import { isUnauthorized } from './fetch-failure';

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: Record<string, unknown>;
  query?: Record<string, string | number | undefined>;
  signal?: AbortSignal;
}

export interface ApiResponse<T> {
  data: T | undefined;
  headers: Headers;
}

export interface ApiClient {
  <T>(path: string, options?: ApiRequestOptions): Promise<T>;
  raw<T>(path: string, options?: ApiRequestOptions): Promise<ApiResponse<T>>;
}

export interface ApiSession {
  accessToken(): string | null;
  refresh(): Promise<void>;
  expire(): Promise<void>;
}

interface ApiClientOptions {
  baseURL: string;
  session: ApiSession;
}

const AUTH_PATH_PREFIX = '/v1/auth/';

const SESSION_PATHS = new Set([
  '/v1/auth/login',
  '/v1/auth/register',
  '/v1/auth/refresh',
  '/v1/auth/logout',
]);

export function createApiClient({
  baseURL,
  session,
}: ApiClientOptions): ApiClient {
  let pendingRefresh: Promise<void> | null = null;

  const request = $fetch.create({
    baseURL,
    onRequest({ request: path, options }) {
      const token = session.accessToken();
      if (token) {
        options.headers.set('Authorization', `Bearer ${token}`);
      }
      if (typeof path === 'string' && path.startsWith(AUTH_PATH_PREFIX)) {
        options.credentials = 'include';
      }
    },
  });

  function refreshOnce(): Promise<void> {
    pendingRefresh ??= session.refresh().finally(() => {
      pendingRefresh = null;
    });
    return pendingRefresh;
  }

  async function withSessionRetry<R>(
    path: string,
    send: () => Promise<R>,
  ): Promise<R> {
    try {
      return await send();
    } catch (error) {
      if (!isUnauthorized(error) || SESSION_PATHS.has(path)) {
        throw error;
      }
      try {
        await refreshOnce();
      } catch {
        await session.expire();
        throw error;
      }
      return send();
    }
  }

  function api<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    return withSessionRetry(path, () => request<T>(path, options));
  }

  async function raw<T>(
    path: string,
    options: ApiRequestOptions = {},
  ): Promise<ApiResponse<T>> {
    const response = await withSessionRetry(path, () =>
      request.raw<T>(path, options),
    );
    return { data: response._data, headers: response.headers };
  }

  return Object.assign(api, { raw });
}

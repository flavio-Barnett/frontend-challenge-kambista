import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerEndpoint } from '@nuxt/test-utils/runtime';
import { createApiClient, type ApiSession } from '~/shared/http/api-client';

const EXPIRED_TOKEN = 'expired-token';
const FRESH_TOKEN = 'fresh-token';

const unregisterEndpoints: Array<() => void> = [];

function endpoint(...args: Parameters<typeof registerEndpoint>): void {
  unregisterEndpoints.push(registerEndpoint(...args));
}

function unauthorized(): Response {
  return Response.json(
    {
      success: false,
      error: { code: 'INVALID_ACCESS_TOKEN', message: 'Token inválido' },
    },
    { status: 401 },
  );
}

function acceptOnly(token: string, body: unknown) {
  return (event: { headers: Headers }) =>
    event.headers.get('authorization') === `Bearer ${token}`
      ? body
      : unauthorized();
}

function fakeSession(initialToken: string | null) {
  let token = initialToken;
  const session = {
    accessToken: () => token,
    refresh: vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      token = FRESH_TOKEN;
    }),
    expire: vi.fn(async () => {
      token = null;
    }),
  } satisfies ApiSession;
  return session;
}

afterEach(() => {
  unregisterEndpoints.splice(0).forEach((unregister) => unregister());
});

describe('api client', () => {
  it('sends the access token as a bearer token', async () => {
    const authorization = vi.fn();
    endpoint('/v1/profile', (event: { headers: Headers }) => {
      authorization(event.headers.get('authorization'));
      return { ok: true };
    });
    const api = createApiClient({
      baseURL: '',
      session: fakeSession(FRESH_TOKEN),
    });

    await api('/v1/profile');

    expect(authorization).toHaveBeenCalledWith(`Bearer ${FRESH_TOKEN}`);
  });

  it('refreshes once and retries the request after a 401', async () => {
    const handler = vi.fn(acceptOnly(FRESH_TOKEN, { id: 'tx-1' }));
    endpoint('/v1/transactions', handler);
    const session = fakeSession(EXPIRED_TOKEN);
    const api = createApiClient({ baseURL: '', session });

    await expect(api('/v1/transactions')).resolves.toEqual({ id: 'tx-1' });

    expect(session.refresh).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('shares one refresh between concurrent 401 responses', async () => {
    endpoint('/v1/transactions', acceptOnly(FRESH_TOKEN, ['tx-1']));
    endpoint('/v1/rates', acceptOnly(FRESH_TOKEN, { venta: 3.739 }));
    const session = fakeSession(EXPIRED_TOKEN);
    const api = createApiClient({ baseURL: '', session });

    await Promise.all([
      api('/v1/transactions'),
      api('/v1/rates'),
      api('/v1/transactions'),
    ]);

    expect(session.refresh).toHaveBeenCalledTimes(1);
  });

  it('does not retry a request that stays unauthorized after the refresh', async () => {
    const handler = vi.fn(unauthorized);
    endpoint('/v1/transactions', handler);
    const session = fakeSession(EXPIRED_TOKEN);
    const api = createApiClient({ baseURL: '', session });

    await expect(api('/v1/transactions')).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(handler).toHaveBeenCalledTimes(2);
    expect(session.refresh).toHaveBeenCalledTimes(1);
  });

  it('does not refresh when a session endpoint answers 401', async () => {
    endpoint('/v1/auth/login', unauthorized);
    const session = fakeSession(null);
    const api = createApiClient({ baseURL: '', session });

    await expect(
      api('/v1/auth/login', { method: 'POST', body: {} }),
    ).rejects.toMatchObject({ response: { status: 401 } });

    expect(session.refresh).not.toHaveBeenCalled();
  });

  it('expires the session when the refresh fails', async () => {
    endpoint('/v1/transactions', unauthorized);
    const session = fakeSession(EXPIRED_TOKEN);
    session.refresh.mockRejectedValueOnce(new Error('refresh rejected'));
    const api = createApiClient({ baseURL: '', session });

    await expect(api('/v1/transactions')).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(session.expire).toHaveBeenCalledTimes(1);
  });
});

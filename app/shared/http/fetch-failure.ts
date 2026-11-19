export interface FetchFailure extends Error {
  readonly response?: { readonly status: number };
  readonly data?: unknown;
}

export function isFetchFailure(error: unknown): error is FetchFailure {
  return error instanceof Error && error.name === 'FetchError';
}

export function isUnauthorized(error: unknown): boolean {
  return isFetchFailure(error) && error.response?.status === 401;
}

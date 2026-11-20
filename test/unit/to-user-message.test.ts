import { describe, expect, it } from 'vitest';
import {
  NETWORK_ERROR_MESSAGE,
  UNEXPECTED_ERROR_MESSAGE,
  toUserMessage,
} from '../../app/shared/errors/to-user-message';

function fetchError(status?: number, data?: unknown): Error {
  return Object.assign(new Error('request failed'), {
    name: 'FetchError',
    response: status === undefined ? undefined : { status },
    data,
  });
}

function apiError(status: number, code: string, message = code): Error {
  return fetchError(status, { success: false, error: { code, message } });
}

describe('toUserMessage', () => {
  it('explains a network failure', () => {
    expect(toUserMessage(fetchError())).toBe(NETWORK_ERROR_MESSAGE);
  });

  it('hides which credential was wrong', () => {
    expect(toUserMessage(apiError(401, 'INVALID_CREDENTIALS'))).toBe(
      'Correo o contraseña incorrectos. Revisa tus datos e intenta de nuevo.',
    );
  });

  it('asks to wait after too many login attempts', () => {
    expect(toUserMessage(apiError(429, 'TOO_MANY_LOGIN_ATTEMPTS'))).toContain(
      'Espera unos minutos',
    );
  });

  it('explains that the email is already registered', () => {
    expect(toUserMessage(apiError(409, 'EMAIL_ALREADY_REGISTERED'))).toContain(
      'Ya existe una cuenta con este correo',
    );
  });

  it.each([
    ['SAME_CURRENCY', 400, 'Elige monedas distintas'],
    ['INVALID_AMOUNT', 400, 'Revisa el monto'],
    ['EXCHANGE_RATE_NOT_AVAILABLE', 503, 'no tenemos el tipo de cambio'],
    ['INVALID_DATE_RANGE', 400, 'Revisa las fechas'],
  ])('explains the exchange error %s', (code, status, expected) => {
    expect(toUserMessage(apiError(status, code))).toContain(expected);
  });

  it('shows the API message for a validation error', () => {
    expect(
      toUserMessage(apiError(400, 'VALIDATION_ERROR', 'El email no es válido')),
    ).toBe('El email no es válido');
  });

  it.each([
    ['an unknown code', apiError(500, 'INTERNAL_ERROR')],
    ['a body without the error format', fetchError(502, '<html>')],
    ['an error that is not a request failure', new TypeError('boom')],
  ])('falls back to a generic message for %s', (_, error) => {
    expect(toUserMessage(error)).toBe(UNEXPECTED_ERROR_MESSAGE);
  });
});

import { isFetchFailure } from '../http/fetch-failure';

interface ApiErrorBody {
  code: string;
  message: string;
}

export const NETWORK_ERROR_MESSAGE =
  'No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.';

export const UNEXPECTED_ERROR_MESSAGE =
  'Algo salió mal de nuestro lado. Intenta de nuevo en unos minutos.';

const MESSAGES_BY_CODE: Readonly<Record<string, string>> = {
  INVALID_CREDENTIALS:
    'Correo o contraseña incorrectos. Revisa tus datos e intenta de nuevo.',
  TOO_MANY_LOGIN_ATTEMPTS:
    'Hiciste demasiados intentos. Espera unos minutos antes de volver a intentar.',
  EMAIL_ALREADY_REGISTERED:
    'Ya existe una cuenta con este correo. Inicia sesión o usa otro correo.',
  SAME_CURRENCY: 'Elige monedas distintas para hacer el cambio.',
  INVALID_AMOUNT:
    'Revisa el monto: debe ser mayor a 0, con máximo 2 decimales y hasta 9,999,999.99.',
  EXCHANGE_RATE_NOT_AVAILABLE:
    'Por ahora no tenemos el tipo de cambio disponible. Intenta de nuevo en unos minutos.',
  INVALID_DATE_RANGE:
    'Revisa las fechas elegidas: deben ser días válidos y la fecha de inicio no puede ser posterior a la de fin.',
};

const CODES_WITH_API_MESSAGE = new Set([
  'VALIDATION_ERROR',
  'INVALID_EMAIL',
  'INVALID_USER_NAME',
]);

function readApiErrorBody(data: unknown): ApiErrorBody | null {
  if (typeof data !== 'object' || data === null || !('error' in data)) {
    return null;
  }
  const { error } = data;
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof error.code === 'string' &&
    typeof error.message === 'string'
  ) {
    return { code: error.code, message: error.message };
  }
  return null;
}

export function toUserMessage(error: unknown): string {
  if (!isFetchFailure(error)) {
    return UNEXPECTED_ERROR_MESSAGE;
  }
  if (!error.response) {
    return NETWORK_ERROR_MESSAGE;
  }
  const body = readApiErrorBody(error.data);
  if (!body) {
    return UNEXPECTED_ERROR_MESSAGE;
  }
  if (CODES_WITH_API_MESSAGE.has(body.code)) {
    return body.message;
  }
  return MESSAGES_BY_CODE[body.code] ?? UNEXPECTED_ERROR_MESSAGE;
}

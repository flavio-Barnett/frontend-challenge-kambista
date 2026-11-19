import { z } from 'zod';

export const PASSWORD_MIN_BYTES = 8;
export const PASSWORD_MAX_BYTES = 72;

const EMAIL_MAX_LENGTH = 254;

const utf8 = new TextEncoder();

function byteLength(value: string): number {
  return utf8.encode(value).length;
}

export const emailField = z
  .string()
  .trim()
  .min(1, 'Escribe tu correo.')
  .max(EMAIL_MAX_LENGTH, 'El correo es demasiado largo. Usa uno más corto.')
  .pipe(z.email('Escribe un correo válido, por ejemplo nombre@correo.com.'));

export const passwordWithinMaxBytes = z
  .string()
  .refine(
    (value) => byteLength(value) <= PASSWORD_MAX_BYTES,
    `Usa como máximo ${PASSWORD_MAX_BYTES} caracteres.`,
  );

export const newPasswordField = passwordWithinMaxBytes.refine(
  (value) => byteLength(value) >= PASSWORD_MIN_BYTES,
  `Usa al menos ${PASSWORD_MIN_BYTES} caracteres.`,
);

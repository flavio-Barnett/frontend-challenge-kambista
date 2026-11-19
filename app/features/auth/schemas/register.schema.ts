import { z } from 'zod';
import { emailField, newPasswordField } from './fields';

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 80;

export const registerSchema = z.object({
  nombre: z
    .string()
    .max(NAME_MAX_LENGTH, `Usa como máximo ${NAME_MAX_LENGTH} caracteres.`)
    .trim()
    .min(NAME_MIN_LENGTH, 'Escribe tu nombre, con al menos 2 caracteres.'),
  email: emailField,
  password: newPasswordField,
});

export type RegisterInput = z.output<typeof registerSchema>;

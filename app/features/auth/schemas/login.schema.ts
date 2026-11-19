import { z } from 'zod';
import { emailField, passwordWithinMaxBytes } from './fields';

export const loginSchema = z.object({
  email: emailField,
  password: z
    .string()
    .min(1, 'Escribe tu contraseña.')
    .pipe(passwordWithinMaxBytes),
});

export type LoginInput = z.output<typeof loginSchema>;

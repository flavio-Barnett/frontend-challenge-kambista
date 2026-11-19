import { describe, expect, it } from 'vitest';
import { loginSchema } from '../../app/features/auth/schemas/login.schema';
import { registerSchema } from '../../app/features/auth/schemas/register.schema';

const VALID_REGISTRATION = {
  nombre: 'Ana Quispe',
  email: 'ana@correo.com',
  password: 'clave-123',
};

function registrationErrors(overrides: Partial<typeof VALID_REGISTRATION>) {
  const result = registerSchema.safeParse({
    ...VALID_REGISTRATION,
    ...overrides,
  });
  return result.success
    ? []
    : result.error.issues.map((issue) => issue.path[0]);
}

describe('registerSchema', () => {
  it('accepts a valid registration and trims the name and the email', () => {
    expect(
      registerSchema.parse({
        ...VALID_REGISTRATION,
        nombre: '  Ana Quispe ',
        email: ' ana@correo.com ',
      }),
    ).toEqual(VALID_REGISTRATION);
  });

  it.each([
    ['7 bytes', 'a'.repeat(7), ['password']],
    ['8 bytes', 'a'.repeat(8), []],
    ['72 bytes', 'a'.repeat(72), []],
    ['73 bytes', 'a'.repeat(73), ['password']],
    ['37 two-byte characters (74 bytes)', 'ñ'.repeat(37), ['password']],
  ])('validates a password of %s', (_, password, errors) => {
    expect(registrationErrors({ password })).toEqual(errors);
  });

  it.each([
    ['a single character', 'A', ['nombre']],
    ['only spaces', '    ', ['nombre']],
    ['two characters', 'Al', []],
    ['80 characters', 'a'.repeat(80), []],
    ['81 characters', 'a'.repeat(81), ['nombre']],
  ])('validates a name with %s', (_, nombre, errors) => {
    expect(registrationErrors({ nombre })).toEqual(errors);
  });

  it.each(['', 'ana', 'ana@correo', `${'a'.repeat(250)}@correo.com`])(
    'rejects the email "%s"',
    (email) => {
      expect(registrationErrors({ email })).toEqual(['email']);
    },
  );
});

describe('loginSchema', () => {
  it('accepts any non-empty password up to 72 bytes', () => {
    expect(
      loginSchema.safeParse({ email: 'ana@correo.com', password: 'x' }).success,
    ).toBe(true);
  });

  it.each([
    ['an empty password', ''],
    ['a password over 72 bytes', 'a'.repeat(73)],
  ])('rejects %s', (_, password) => {
    expect(
      loginSchema.safeParse({ email: 'ana@correo.com', password }).success,
    ).toBe(false);
  });
});

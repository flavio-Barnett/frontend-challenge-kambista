import { describe, expect, it } from 'vitest';
import { exchangeSchema } from '../../app/features/transactions/schemas/exchange.schema';

function firstIssue(
  input: unknown,
): { path: PropertyKey[]; message: string } | undefined {
  const result = exchangeSchema.safeParse(input);
  return result.success ? undefined : result.error.issues[0];
}

describe('exchangeSchema', () => {
  it('turns a valid amount into the number sent to the API', () => {
    expect(
      exchangeSchema.parse({ amount: '1250,5', from: 'USD', to: 'PEN' }),
    ).toEqual({ amount: 1250.5, from: 'USD', to: 'PEN' });
  });

  it.each([
    ['', 'Ingresa el monto que quieres cambiar.'],
    ['0', 'El monto debe ser mayor a 0.'],
    ['1.234', 'Usa como máximo 2 decimales.'],
    ['10000000', 'El monto máximo es 9,999,999.99.'],
    ['diez', 'Escribe solo números, por ejemplo 1250.50.'],
  ])('rejects the amount %j', (amount, message) => {
    expect(firstIssue({ amount, from: 'USD', to: 'PEN' })).toMatchObject({
      path: ['amount'],
      message,
    });
  });

  it('asks for different currencies on the destination field', () => {
    expect(firstIssue({ amount: '100', from: 'PEN', to: 'PEN' })).toMatchObject(
      {
        path: ['to'],
        message: 'Elige monedas distintas.',
      },
    );
  });
});

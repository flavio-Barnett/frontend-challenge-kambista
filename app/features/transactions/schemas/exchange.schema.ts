import { z } from 'zod';
import { centsToAmount, readAmount, type AmountIssue } from '../domain/amount';
import { CURRENCIES } from '../domain/currency';

const AMOUNT_MESSAGES: Readonly<Record<AmountIssue, string>> = {
  required: 'Ingresa el monto que quieres cambiar.',
  malformed: 'Escribe solo números, por ejemplo 1250.50.',
  'too-many-decimals': 'Usa como máximo 2 decimales.',
  'not-positive': 'El monto debe ser mayor a 0.',
  'too-large': 'El monto máximo es 9,999,999.99.',
};

const currencyField = z.enum(CURRENCIES, 'Elige una moneda.');

export const exchangeSchema = z
  .object({
    amount: z.string().transform((value, ctx) => {
      const reading = readAmount(value);
      if (!reading.ok) {
        ctx.addIssue({
          code: 'custom',
          message: AMOUNT_MESSAGES[reading.issue],
        });
        return z.NEVER;
      }
      return centsToAmount(reading.cents);
    }),
    from: currencyField,
    to: currencyField,
  })
  .refine((data) => data.from !== data.to, {
    message: 'Elige monedas distintas.',
    path: ['to'],
  });

export type ExchangeFormState = z.input<typeof exchangeSchema>;

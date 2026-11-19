import { describe, expect, it } from 'vitest';
import {
  firstName,
  formatPersonName,
  initials,
} from '../../app/shared/format/person-name';

describe('person name formatting', () => {
  it.each([
    ['FABIOLA', 'Fabiola'],
    ['ana maría QUISPE', 'Ana María Quispe'],
    ['  luis   rojas ', 'Luis Rojas'],
  ])('formats %j as %j', (name, formatted) => {
    expect(formatPersonName(name)).toBe(formatted);
  });

  it('keeps only the first name for greetings', () => {
    expect(firstName('ÑUSTA VILLANUEVA')).toBe('Ñusta');
  });

  it('builds up to two initials', () => {
    expect(initials('ana maría quispe')).toBe('AM');
    expect(initials('Fabiola')).toBe('F');
  });
});

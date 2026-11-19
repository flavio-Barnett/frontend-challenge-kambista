import { describe, expect, it } from 'vitest';
import { safeRedirect } from '../../app/shared/navigation/safe-redirect';

describe('safeRedirect', () => {
  it.each(['/', '/historial', '/historial?desde=2026-01-01#tabla'])(
    'keeps the internal path %s',
    (path) => {
      expect(safeRedirect(path)).toBe(path);
    },
  );

  it.each([
    ['a protocol-relative URL', '//evil.com'],
    ['an absolute URL', 'https://evil.com'],
    ['a backslash trick', '/\\evil.com'],
    ['a relative path', 'historial'],
    ['a javascript URL', 'javascript:alert(1)'],
    ['a path with a tab before the slash', '/\t/evil.com'],
    ['an empty value', ''],
    ['a missing value', undefined],
    ['a repeated query value', ['/historial', '/']],
  ])('falls back to / for %s', (_, target) => {
    expect(safeRedirect(target)).toBe('/');
  });
});

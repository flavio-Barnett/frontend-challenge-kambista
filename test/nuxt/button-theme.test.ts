import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { UButton } from '#components';

describe('Qolqa button theme', () => {
  it('draws the 2px offset focus ring with the focus token', async () => {
    const button = await mountSuspended(UButton, {
      props: { label: 'Ver operaciones', color: 'neutral', variant: 'soft' },
    });

    expect(button.classes()).toEqual(
      expect.arrayContaining([
        'bg-subtle',
        'focus-visible:outline-2',
        'focus-visible:outline-offset-2',
        'focus-visible:outline-focus',
      ]),
    );
    expect(button.classes()).not.toContain('focus-visible:outline-3');
  });
});

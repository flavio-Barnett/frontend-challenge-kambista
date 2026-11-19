import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { UButton } from '#components';

describe('Qolqa button theme', () => {
  it('maps the primary color to the maiz scale', () => {
    expect(useAppConfig().ui.colors.primary).toBe('maiz');
  });

  it('renders the primary CTA as a 48px maiz pill with dark text', async () => {
    const button = await mountSuspended(UButton, {
      props: { label: 'Cambiar ahora' },
    });
    const classes = button.classes();

    expect(classes).toEqual(
      expect.arrayContaining([
        'bg-primary',
        'text-on-brand',
        'rounded-full',
        'h-12',
      ]),
    );
    expect(classes).not.toContain('text-inverted');
    expect(classes).not.toContain('rounded-md');
  });

  it('uses the 56px height for the large size', async () => {
    const button = await mountSuspended(UButton, {
      props: { label: 'Cambiar ahora', size: 'lg' },
    });

    expect(button.classes()).toContain('h-14');
  });

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

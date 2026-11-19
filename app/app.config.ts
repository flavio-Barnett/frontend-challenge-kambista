export default defineAppConfig({
  ui: {
    colors: {
      primary: 'maiz',
      secondary: 'andino',
      success: 'selva',
      info: 'lago',
      warning: 'maiz',
      error: 'achiote',
      neutral: 'arena',
    },
    input: {
      variants: {
        size: {
          xl: {
            base: 'h-11 px-4 py-0 gap-2 text-base',
          },
        },
      },
    },
    navigationMenu: {
      compoundVariants: [
        {
          variant: 'pill',
          active: true,
          highlight: false,
          class: { link: 'font-semibold before:bg-card before:shadow-card' },
        },
        {
          variant: 'pill',
          active: false,
          disabled: false,
          class: { link: 'hover:before:bg-card/60' },
        },
      ],
    },
    button: {
      slots: {
        base: 'rounded-full font-semibold',
      },
      variants: {
        size: {
          md: {
            base: 'h-12 px-6 py-0 gap-2 text-[15px]',
          },
          lg: {
            base: 'h-14 px-8 py-0 gap-2 text-[17px]',
          },
        },
      },
      compoundVariants: [
        {
          color: 'primary',
          variant: 'solid',
          class: 'text-on-brand hover:bg-primary-600 active:bg-primary-600',
        },
        {
          color: 'neutral',
          variant: 'soft',
          class:
            'text-default bg-subtle hover:bg-neutral-200 active:bg-neutral-200',
        },
        {
          variant: ['solid', 'outline', 'soft', 'subtle', 'ghost', 'link'],
          class:
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
        },
      ],
    },
  },
});

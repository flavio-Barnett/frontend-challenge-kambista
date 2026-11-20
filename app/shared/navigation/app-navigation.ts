import type { NavigationMenuItem } from '@nuxt/ui';

export const appNavigation: NavigationMenuItem[] = [
  { label: 'Inicio', icon: 'i-lucide-house', to: '/' },
  { label: 'Cambiar', icon: 'i-lucide-arrow-left-right', to: '/exchange' },
  { label: 'Historial', icon: 'i-lucide-history', to: '/history' },
];

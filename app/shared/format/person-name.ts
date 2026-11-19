const LOCALE = 'es-PE';

function capitalize(word: string): string {
  const lower = word.toLocaleLowerCase(LOCALE);
  return lower.charAt(0).toLocaleUpperCase(LOCALE) + lower.slice(1);
}

function words(name: string): string[] {
  return name.trim().split(/\s+/).filter(Boolean);
}

export function formatPersonName(name: string): string {
  return words(name).map(capitalize).join(' ');
}

export function firstName(name: string): string {
  return capitalize(words(name)[0] ?? '');
}

export function initials(name: string): string {
  return words(name)
    .slice(0, 2)
    .map((word) => word.charAt(0).toLocaleUpperCase(LOCALE))
    .join('');
}

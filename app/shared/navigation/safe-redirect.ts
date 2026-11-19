const FALLBACK_PATH = '/';

function isUnsafeCharacter(character: string): boolean {
  const code = character.charCodeAt(0);
  return character === '\\' || code < 0x20 || code === 0x7f;
}

export function safeRedirect(target: unknown): string {
  if (
    typeof target !== 'string' ||
    !target.startsWith('/') ||
    target.startsWith('//') ||
    [...target].some(isUnsafeCharacter)
  ) {
    return FALLBACK_PATH;
  }
  return target;
}

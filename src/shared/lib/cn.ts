export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

const FONT_FAMILIES = new Set(['display', 'display-extra', 'display-semibold', 'body', 'medium', 'semibold', 'bold']);
const TEXT_ALIGN = new Set(['left', 'center', 'right', 'justify']);

function textClassGroup(token: string): string | null {
  const base = token.includes(':') ? token.slice(token.lastIndexOf(':') + 1) : token;
  if (base.startsWith('font-')) {
    return FONT_FAMILIES.has(base.slice(5)) ? 'font-family' : 'font-weight';
  }
  if (base.startsWith('text-')) {
    const value = base.slice(5);
    if (value.startsWith('[')) {
      return 'font-size';
    }
    if (TEXT_ALIGN.has(value)) {
      return 'text-align';
    }
    return 'text-color';
  }
  if (base.startsWith('leading-')) {
    return 'leading';
  }
  if (base.startsWith('tracking-')) {
    return 'tracking';
  }
  return null;
}

export function mergeTextClasses(base: string, override?: string): string {
  if (!override) {
    return base;
  }
  const overrideTokens = override.split(/\s+/).filter(Boolean);
  const overridden = new Set(overrideTokens.map(textClassGroup).filter((group): group is string => group !== null));
  const kept = base.split(/\s+/).filter((token) => {
    const group = textClassGroup(token);
    return group === null || !overridden.has(group);
  });
  return [...kept, ...overrideTokens].join(' ');
}

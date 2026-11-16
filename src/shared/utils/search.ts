const CHAR_MAP: Record<string, string> = {
  ç: 'c',
  ğ: 'g',
  ı: 'i',
  i: 'i',
  ö: 'o',
  ş: 's',
  ü: 'u',
  â: 'a',
  î: 'i',
  û: 'u',
};

export function turkishLowerCase(value: string): string {
  return value.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
}

export function turkishUpperCase(value: string): string {
  return value.replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase();
}

const TURKISH_LETTERS = /[çğıöşüÇĞİÖŞÜ]/;

export function brandUpperCase(value: string): string {
  return TURKISH_LETTERS.test(value) ? turkishUpperCase(value) : value.toUpperCase();
}

export function normalizeForSearch(value: string): string {
  return turkishLowerCase(value)
    .replace(/[çğıiöşüâîû]/g, (char) => CHAR_MAP[char] ?? char)
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchesSearch(query: string, fields: (string | null | undefined)[]): boolean {
  const terms = normalizeForSearch(query).split(' ').filter(Boolean);
  if (terms.length === 0) {
    return true;
  }
  const haystack = normalizeForSearch(fields.filter(Boolean).join(' '));
  return terms.every((term) => haystack.includes(term));
}

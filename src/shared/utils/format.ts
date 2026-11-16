import { turkishUpperCase } from './search';

function groupThousands(value: string): string {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatCurrency(amount: number): string {
  const negative = amount < 0;
  const absolute = Math.abs(amount);
  const rounded = Math.round(absolute * 100) / 100;
  const integerPart = Math.trunc(rounded);
  const fraction = Math.round((rounded - integerPart) * 100);
  const text = fraction > 0 ? `${groupThousands(String(integerPart))},${String(fraction).padStart(2, '0')}` : groupThousands(String(integerPart));
  return `${negative ? '-' : ''}₺${text}`;
}

export function parseCurrencyInput(value: string): number | null {
  const cleaned = value.replace(/[₺\s]/g, '');
  if (cleaned.length === 0) {
    return null;
  }
  if (!/^\d{1,3}(\.\d{3})*(,\d{1,2})?$|^\d+(,\d{1,2})?$/.test(cleaned)) {
    return null;
  }
  const normalized = cleaned.replace(/\./g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatCurrencyInput(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return '';
  }
  return formatCurrency(amount).replace('₺', '');
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) {
    return '0 KB';
  }
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  const first = parts[0].charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
  return turkishUpperCase(`${first}${last}`);
}

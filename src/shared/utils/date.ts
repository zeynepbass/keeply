export type IsoDate = string;

const ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DISPLAY_PATTERN = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
const MS_PER_DAY = 86_400_000;

export const MONTHS_SHORT = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
export const MONTHS_LONG = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];

interface DateParts {
  year: number;
  month: number;
  day: number;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function isValidParts({ year, month, day }: DateParts): boolean {
  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month) && year >= 1900 && year <= 2200;
}

function toParts(value: IsoDate): DateParts {
  const match = ISO_PATTERN.exec(value);
  if (!match) {
    throw new RangeError(`Geçersiz tarih: ${value}`);
  }
  const parts = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  if (!isValidParts(parts)) {
    throw new RangeError(`Geçersiz tarih: ${value}`);
  }
  return parts;
}

function fromParts({ year, month, day }: DateParts): IsoDate {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function toUtcDayNumber(value: IsoDate): number {
  const { year, month, day } = toParts(value);
  return Date.UTC(year, month - 1, day) / MS_PER_DAY;
}

export function isIsoDate(value: unknown): value is IsoDate {
  if (typeof value !== 'string') {
    return false;
  }
  const match = ISO_PATTERN.exec(value);
  return !!match && isValidParts({ year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) });
}

export function toIsoDate(date: Date): IsoDate {
  return fromParts({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });
}

export function today(now: Date = new Date()): IsoDate {
  return toIsoDate(now);
}

export function isoToLocalDate(value: IsoDate, hour = 0, minute = 0): Date {
  const { year, month, day } = toParts(value);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

export function addDays(value: IsoDate, amount: number): IsoDate {
  const dayNumber = toUtcDayNumber(value) + amount;
  const date = new Date(dayNumber * MS_PER_DAY);
  return fromParts({ year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() });
}

export function addMonths(value: IsoDate, amount: number): IsoDate {
  const { year, month, day } = toParts(value);
  const monthIndex = year * 12 + (month - 1) + amount;
  const nextYear = Math.floor(monthIndex / 12);
  const nextMonth = (monthIndex % 12) + 1;
  return fromParts({ year: nextYear, month: nextMonth, day: Math.min(day, daysInMonth(nextYear, nextMonth)) });
}

export function differenceInDays(later: IsoDate, earlier: IsoDate): number {
  return toUtcDayNumber(later) - toUtcDayNumber(earlier);
}

export function compareIsoDates(a: IsoDate, b: IsoDate): number {
  return toUtcDayNumber(a) - toUtcDayNumber(b);
}

export function formatDate(value: IsoDate): string {
  const { year, month, day } = toParts(value);
  return `${day} ${MONTHS_SHORT[month - 1]} ${year}`;
}

export function formatDateLong(value: IsoDate): string {
  const { year, month, day } = toParts(value);
  return `${day} ${MONTHS_LONG[month - 1]} ${year}`;
}

export function formatDateNumeric(value: IsoDate): string {
  const { year, month, day } = toParts(value);
  return `${pad(day)}.${pad(month)}.${year}`;
}

export function parseDisplayDate(value: string): IsoDate | null {
  const match = DISPLAY_PATTERN.exec(value.trim());
  if (!match) {
    return null;
  }
  const parts = { day: Number(match[1]), month: Number(match[2]), year: Number(match[3]) };
  return isValidParts(parts) ? fromParts(parts) : null;
}

export function formatRelativeTime(timestamp: string, now: Date = new Date()): string {
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) {
    return 'Az önce';
  }
  if (minutes < 60) {
    return `${minutes} dakika önce`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24 && toIsoDate(date) === toIsoDate(now)) {
    return `${hours} saat önce`;
  }
  const days = differenceInDays(toIsoDate(now), toIsoDate(date));
  if (days <= 1) {
    return days === 1 ? 'Dün' : `${hours} saat önce`;
  }
  if (days < 30) {
    return `${days} gün önce`;
  }
  return formatDate(toIsoDate(date));
}

export function getGreeting(now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour >= 5 && hour < 12) {
    return 'Günaydın';
  }
  if (hour >= 12 && hour < 18) {
    return 'İyi günler';
  }
  if (hour >= 18 && hour < 23) {
    return 'İyi akşamlar';
  }
  return 'İyi geceler';
}

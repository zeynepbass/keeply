import {
  addDays,
  addMonths,
  differenceInDays,
  formatDate,
  formatDateNumeric,
  formatRelativeTime,
  getGreeting,
  isIsoDate,
  parseDisplayDate,
  toIsoDate,
} from './date';

describe('date utilities', () => {
  it('adds months and clamps to the end of shorter months', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonths('2028-01-31', 1)).toBe('2028-02-29');
    expect(addMonths('2026-10-12', 24)).toBe('2028-10-12');
    expect(addMonths('2024-02-29', 12)).toBe('2025-02-28');
    expect(addMonths('2026-11-30', 3)).toBe('2027-02-28');
  });

  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-10-12', 14)).toBe('2026-10-26');
    expect(addDays('2026-12-25', 10)).toBe('2027-01-04');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('counts calendar days independent of daylight saving changes', () => {
    expect(differenceInDays('2026-03-30', '2026-03-28')).toBe(2);
    expect(differenceInDays('2026-10-26', '2026-10-24')).toBe(2);
    expect(differenceInDays('2028-10-12', '2026-10-12')).toBe(731);
    expect(differenceInDays('2026-01-01', '2026-01-02')).toBe(-1);
  });

  it('converts local dates without shifting the day', () => {
    expect(toIsoDate(new Date(2026, 10, 16, 23, 59))).toBe('2026-11-16');
    expect(toIsoDate(new Date(2026, 0, 1, 0, 0))).toBe('2026-01-01');
  });

  it('validates and parses dates', () => {
    expect(isIsoDate('2026-02-29')).toBe(false);
    expect(isIsoDate('2028-02-29')).toBe(true);
    expect(isIsoDate('2026-13-01')).toBe(false);
    expect(parseDisplayDate('12.10.2026')).toBe('2026-10-12');
    expect(parseDisplayDate('31.04.2026')).toBeNull();
    expect(parseDisplayDate('abc')).toBeNull();
  });

  it('formats dates in Turkish', () => {
    expect(formatDate('2026-10-12')).toBe('12 Eki 2026');
    expect(formatDate('2026-08-01')).toBe('1 Ağu 2026');
    expect(formatDateNumeric('2026-03-05')).toBe('05.03.2026');
  });

  it('describes relative time in Turkish', () => {
    const now = new Date(2026, 10, 16, 15, 0);
    expect(formatRelativeTime(new Date(2026, 10, 16, 14, 59, 30).toISOString(), now)).toBe('Az önce');
    expect(formatRelativeTime(new Date(2026, 10, 16, 13, 0).toISOString(), now)).toBe('2 saat önce');
    expect(formatRelativeTime(new Date(2026, 10, 15, 20, 0).toISOString(), now)).toBe('Dün');
    expect(formatRelativeTime(new Date(2026, 10, 13, 10, 0).toISOString(), now)).toBe('3 gün önce');
  });

  it('greets by time of day', () => {
    expect(getGreeting(new Date(2026, 0, 1, 8))).toBe('Günaydın');
    expect(getGreeting(new Date(2026, 0, 1, 14))).toBe('İyi günler');
    expect(getGreeting(new Date(2026, 0, 1, 20))).toBe('İyi akşamlar');
    expect(getGreeting(new Date(2026, 0, 1, 2))).toBe('İyi geceler');
  });
});

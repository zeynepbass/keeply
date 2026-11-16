import { formatCurrency, formatFileSize, getInitials, parseCurrencyInput } from './format';
import { brandUpperCase, matchesSearch, normalizeForSearch } from './search';

describe('format utilities', () => {
  it('formats Turkish lira amounts', () => {
    expect(formatCurrency(42999)).toBe('₺42.999');
    expect(formatCurrency(1299.9)).toBe('₺1.299,90');
    expect(formatCurrency(0)).toBe('₺0');
    expect(formatCurrency(1250000.5)).toBe('₺1.250.000,50');
  });

  it('parses currency input', () => {
    expect(parseCurrencyInput('42.999')).toBe(42999);
    expect(parseCurrencyInput('1.299,90')).toBe(1299.9);
    expect(parseCurrencyInput('850')).toBe(850);
    expect(parseCurrencyInput('')).toBeNull();
    expect(parseCurrencyInput('12,3,4')).toBeNull();
    expect(parseCurrencyInput('abc')).toBeNull();
  });

  it('formats file sizes', () => {
    expect(formatFileSize(1258291)).toBe('1,2 MB');
    expect(formatFileSize(2048)).toBe('2 KB');
    expect(formatFileSize(0)).toBe('0 KB');
  });

  it('builds initials with Turkish casing', () => {
    expect(getInitials('elif yılmaz')).toBe('EY');
    expect(getInitials('İpek')).toBe('İ');
    expect(getInitials('ilker ışık')).toBe('İI');
  });
});

describe('search utilities', () => {
  it('normalizes Turkish characters', () => {
    expect(normalizeForSearch('Saç Kurutma Makinesi')).toBe('sac kurutma makinesi');
    expect(normalizeForSearch('IŞIK İPEK')).toBe('isik ipek');
  });

  it('uppercases brand names respecting their origin', () => {
    expect(brandUpperCase('Philips')).toBe('PHILIPS');
    expect(brandUpperCase('Arçelik')).toBe('ARÇELİK');
    expect(brandUpperCase('Beko')).toBe('BEKO');
  });

  it('matches every term across fields', () => {
    expect(matchesSearch('bulasik bosch', ['Bulaşık Makinesi', 'Bosch'])).toBe(true);
    expect(matchesSearch('samsung', ['Bulaşık Makinesi', 'Bosch'])).toBe(false);
    expect(matchesSearch('  ', ['herhangi'])).toBe(true);
  });
});

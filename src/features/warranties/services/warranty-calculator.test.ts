import type { Product } from '@/features/products/types';

import { groupWarranties } from '../hooks/use-warranties';
import { calculateWarrantyEndDate, getWarranty, getWarrantyStatus, getWarrantyStatusOf } from './warranty-calculator';

const product = (overrides: Partial<Product> = {}): Product => ({
  id: 'p1',
  name: 'Galaxy S24',
  brand: 'Samsung',
  model: null,
  category: 'electronics',
  imageUri: null,
  price: null,
  purchaseDate: '2026-10-12',
  storeName: 'Teknosa',
  salesChannel: 'online',
  hasWarranty: true,
  warrantyMonths: 24,
  warrantyStartDate: '2026-10-12',
  warrantyEndDate: '2028-10-12',
  returnDeadline: null,
  notes: null,
  createdAt: '2026-10-12T10:00:00.000Z',
  updatedAt: '2026-10-12T10:00:00.000Z',
  ...overrides,
});

describe('warranty calculator', () => {
  it('calculates end dates by calendar months', () => {
    expect(calculateWarrantyEndDate('2026-10-12', 24)).toBe('2028-10-12');
    expect(calculateWarrantyEndDate('2026-01-31', 1)).toBe('2026-02-28');
    expect(calculateWarrantyEndDate('2024-02-29', 12)).toBe('2025-02-28');
    expect(calculateWarrantyEndDate('2026-12-31', 18)).toBe('2028-06-30');
  });

  it('rejects invalid durations', () => {
    expect(() => calculateWarrantyEndDate('2026-10-12', 0)).toThrow(RangeError);
    expect(() => calculateWarrantyEndDate('2026-10-12', 1.5)).toThrow(RangeError);
  });

  it('derives status around the 30 day threshold and the end date itself', () => {
    expect(getWarrantyStatus('2026-12-17', '2026-11-16')).toBe('active');
    expect(getWarrantyStatus('2026-12-16', '2026-11-16')).toBe('expiring');
    expect(getWarrantyStatus('2026-11-16', '2026-11-16')).toBe('expiring');
    expect(getWarrantyStatus('2026-11-15', '2026-11-16')).toBe('expired');
  });

  it('builds warranty details with remaining days and elapsed ratio', () => {
    const warranty = getWarranty(product(), '2027-10-12');
    expect(warranty).toMatchObject({ status: 'active', remainingDays: 366, months: 24 });
    expect(warranty?.elapsedRatio).toBeCloseTo(365 / 731, 5);
    expect(getWarranty(product(), '2029-01-01')).toMatchObject({ status: 'expired', remainingDays: 0, elapsedRatio: 1 });
    expect(getWarranty(product(), '2026-01-01')?.elapsedRatio).toBe(0);
  });

  it('returns no warranty for products without one', () => {
    const none = product({ hasWarranty: false, warrantyMonths: null, warrantyStartDate: null, warrantyEndDate: null });
    expect(getWarranty(none, '2026-11-16')).toBeNull();
    expect(getWarrantyStatusOf(none, '2026-11-16')).toBe('none');
  });

  it('groups warranties by status in a useful order', () => {
    const groups = groupWarranties(
      [
        product({ id: 'a', warrantyEndDate: '2028-10-12' }),
        product({ id: 'b', warrantyEndDate: '2026-12-01' }),
        product({ id: 'c', warrantyEndDate: '2026-11-20' }),
        product({ id: 'd', warrantyEndDate: '2026-01-01' }),
        product({ id: 'e', warrantyEndDate: '2026-10-01' }),
      ],
      '2026-11-16',
    );
    expect(groups.active.map((item) => item.product.id)).toEqual(['a']);
    expect(groups.expiring.map((item) => item.product.id)).toEqual(['c', 'b']);
    expect(groups.expired.map((item) => item.product.id)).toEqual(['e', 'd']);
  });
});

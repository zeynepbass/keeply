import type { Product } from '@/features/products/types';

import { groupReturnDeadlines } from '../hooks/use-return-deadlines';
import { calculateDefaultReturnDeadline, getReturnDeadline, getReturnStatus } from './return-calculator';

const product = (id: string, returnDeadline: string | null): Product => ({
  id,
  name: id,
  brand: 'Nike',
  model: null,
  category: 'fashion',
  imageUri: null,
  price: null,
  purchaseDate: '2026-11-01',
  storeName: 'Boyner',
  salesChannel: 'in_store',
  hasWarranty: false,
  warrantyMonths: null,
  warrantyStartDate: null,
  warrantyEndDate: null,
  returnDeadline,
  notes: null,
  createdAt: '2026-11-01T10:00:00.000Z',
  updatedAt: '2026-11-01T10:00:00.000Z',
});

describe('return deadline calculator', () => {
  it('defaults to 14 days after purchase across month ends', () => {
    expect(calculateDefaultReturnDeadline('2026-10-12')).toBe('2026-10-26');
    expect(calculateDefaultReturnDeadline('2026-12-25')).toBe('2027-01-08');
    expect(calculateDefaultReturnDeadline('2026-02-20', 30)).toBe('2026-03-22');
  });

  it('marks the last three days as urgent and keeps the deadline day open', () => {
    expect(getReturnStatus('2026-11-20', '2026-11-16')).toBe('open');
    expect(getReturnStatus('2026-11-19', '2026-11-16')).toBe('urgent');
    expect(getReturnStatus('2026-11-16', '2026-11-16')).toBe('urgent');
    expect(getReturnStatus('2026-11-15', '2026-11-16')).toBe('closed');
  });

  it('builds deadline details', () => {
    expect(getReturnDeadline(product('a', '2026-11-20'), '2026-11-16')).toMatchObject({ remainingDays: 4, status: 'open' });
    expect(getReturnDeadline(product('a', '2026-11-10'), '2026-11-16')).toMatchObject({ remainingDays: 0, status: 'closed' });
    expect(getReturnDeadline(product('a', null), '2026-11-16')).toBeNull();
  });

  it('groups upcoming and closed deadlines', () => {
    const groups = groupReturnDeadlines(
      [product('a', '2026-11-30'), product('b', '2026-11-17'), product('c', '2026-11-10'), product('d', '2026-11-12'), product('e', null)],
      '2026-11-16',
    );
    expect(groups.upcoming.map((item) => item.product.id)).toEqual(['b', 'a']);
    expect(groups.closed.map((item) => item.product.id)).toEqual(['d', 'c']);
  });
});

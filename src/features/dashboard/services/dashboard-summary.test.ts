import type { Product } from '@/features/products/types';

import { buildDashboardSummary } from './dashboard-summary';

function make(id: string, overrides: Partial<Product>): Product {
  return {
    id,
    name: id,
    brand: 'Marka',
    model: null,
    category: 'electronics',
    imageUri: null,
    price: 100,
    purchaseDate: '2026-01-01',
    storeName: 'Mağaza',
    salesChannel: 'in_store',
    hasWarranty: true,
    warrantyMonths: 24,
    warrantyStartDate: '2026-01-01',
    warrantyEndDate: '2028-01-01',
    returnDeadline: null,
    notes: null,
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z',
    ...overrides,
  };
}

const reference = '2026-11-16';

describe('buildDashboardSummary', () => {
  const products = [
    make('aktif', { createdAt: '2026-11-15T10:00:00.000Z' }),
    make('yakinda-2', { warrantyEndDate: '2026-12-13', createdAt: '2026-10-01T10:00:00.000Z' }),
    make('yakinda-1', { warrantyEndDate: '2026-11-30', createdAt: '2026-09-01T10:00:00.000Z' }),
    make('bugun-bitiyor', { warrantyEndDate: reference, createdAt: '2026-08-01T10:00:00.000Z' }),
    make('dolmus', { warrantyEndDate: '2026-11-03', returnDeadline: '2026-11-01' }),
    make('garantisiz', { hasWarranty: false, warrantyMonths: null, warrantyStartDate: null, warrantyEndDate: null, returnDeadline: '2026-11-20' }),
    make('iade-bugun', { returnDeadline: reference }),
  ];

  it('counts products, warranties and open returns', () => {
    const summary = buildDashboardSummary(products, reference);
    expect(summary.totalProducts).toBe(7);
    expect(summary.activeWarranties).toBe(5);
    expect(summary.expiringWarranties).toBe(3);
    expect(summary.upcomingReturns).toBe(2);
  });

  it('orders expiring warranties and returns by date', () => {
    const summary = buildDashboardSummary(products, reference);
    expect(summary.expiring.map((item) => item.product.id)).toEqual(['bugun-bitiyor', 'yakinda-1', 'yakinda-2']);
    expect(summary.expiring[0].warranty.remainingDays).toBe(0);
    expect(summary.returns.map((item) => item.product.id)).toEqual(['iade-bugun', 'garantisiz']);
  });

  it('lists the most recently added products', () => {
    const summary = buildDashboardSummary(products, reference, 2);
    expect(summary.recentProducts.map((product) => product.id)).toEqual(['aktif', 'yakinda-2']);
  });

  it('handles an empty product list', () => {
    expect(buildDashboardSummary([], reference)).toMatchObject({ totalProducts: 0, expiring: [], returns: [], recentProducts: [] });
  });
});

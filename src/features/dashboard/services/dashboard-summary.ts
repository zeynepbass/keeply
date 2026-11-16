import type { Product } from '@/features/products/types';
import { getReturnDeadline, sortByDeadline } from '@/features/returns/services/return-calculator';
import type { ReturnDeadline } from '@/features/returns/types';
import { getWarranty, sortByEndDate } from '@/features/warranties/services/warranty-calculator';
import type { Warranty } from '@/features/warranties/types';
import type { IsoDate } from '@/shared/utils/date';

export interface DashboardSummary {
  totalProducts: number;
  activeWarranties: number;
  expiringWarranties: number;
  upcomingReturns: number;
  expiring: { product: Product; warranty: Warranty }[];
  returns: { product: Product; deadline: ReturnDeadline }[];
  recentProducts: Product[];
}

export function buildDashboardSummary(products: Product[], referenceDate: IsoDate, limit = 3): DashboardSummary {
  const byId = new Map(products.map((product) => [product.id, product]));
  const warranties = products.map((product) => getWarranty(product, referenceDate)).filter((item): item is Warranty => item !== null);
  const deadlines = products
    .map((product) => getReturnDeadline(product, referenceDate))
    .filter((item): item is ReturnDeadline => item !== null && item.status !== 'closed');

  const expiring = sortByEndDate(warranties.filter((warranty) => warranty.status === 'expiring')).map((warranty) => ({
    product: byId.get(warranty.productId) as Product,
    warranty,
  }));

  return {
    totalProducts: products.length,
    activeWarranties: warranties.filter((warranty) => warranty.status !== 'expired').length,
    expiringWarranties: expiring.length,
    upcomingReturns: deadlines.length,
    expiring: expiring.slice(0, limit),
    returns: sortByDeadline(deadlines)
      .slice(0, limit)
      .map((deadline) => ({ product: byId.get(deadline.productId) as Product, deadline })),
    recentProducts: [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit),
  };
}

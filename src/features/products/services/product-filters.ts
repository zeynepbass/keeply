import { getWarranty, getWarrantyStatusOf } from '@/features/warranties/services/warranty-calculator';
import { compareIsoDates, type IsoDate } from '@/shared/utils/date';
import { matchesSearch } from '@/shared/utils/search';

import { CATEGORY_META } from '../constants/categories';
import type { Product, ProductFilters, ProductSort } from '../types';

export const DEFAULT_FILTERS: ProductFilters = {
  query: '',
  category: 'all',
  warrantyStatus: 'all',
  sort: 'recent',
};

export function sortProducts(products: Product[], sort: ProductSort, referenceDate: IsoDate): Product[] {
  const sorted = [...products];
  switch (sort) {
    case 'name':
      return sorted.sort((a, b) => `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`, 'tr'));
    case 'price_desc':
      return sorted.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    case 'warranty_end':
      return sorted.sort((a, b) => {
        const aEnd = getWarranty(a, referenceDate)?.endDate;
        const bEnd = getWarranty(b, referenceDate)?.endDate;
        if (!aEnd && !bEnd) {
          return 0;
        }
        if (!aEnd) {
          return 1;
        }
        if (!bEnd) {
          return -1;
        }
        return compareIsoDates(aEnd, bEnd);
      });
    case 'recent':
    default:
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export function filterProducts(products: Product[], filters: ProductFilters, referenceDate: IsoDate): Product[] {
  const filtered = products.filter((product) => {
    if (filters.category !== 'all' && product.category !== filters.category) {
      return false;
    }
    if (filters.warrantyStatus !== 'all' && getWarrantyStatusOf(product, referenceDate) !== filters.warrantyStatus) {
      return false;
    }
    return matchesSearch(filters.query, [
      product.name,
      product.brand,
      product.model,
      product.storeName,
      CATEGORY_META[product.category].label,
      product.notes,
    ]);
  });
  return sortProducts(filtered, filters.sort, referenceDate);
}

export function countActiveFilters(filters: ProductFilters): number {
  return (filters.category !== 'all' ? 1 : 0) + (filters.warrantyStatus !== 'all' ? 1 : 0);
}

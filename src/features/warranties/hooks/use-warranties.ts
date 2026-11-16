import { useMemo } from 'react';

import { useProducts } from '@/features/products/hooks/use-products';
import type { Product } from '@/features/products/types';
import { today } from '@/shared/utils/date';

import { getWarranty, sortByEndDate } from '../services/warranty-calculator';
import type { Warranty } from '../types';

export interface WarrantyItem {
  product: Product;
  warranty: Warranty;
}

export interface WarrantyGroups {
  active: WarrantyItem[];
  expiring: WarrantyItem[];
  expired: WarrantyItem[];
}

export function groupWarranties(products: Product[], referenceDate: string): WarrantyGroups {
  const byId = new Map(products.map((product) => [product.id, product]));
  const warranties = sortByEndDate(products.map((product) => getWarranty(product, referenceDate)).filter((item): item is Warranty => item !== null));
  const toItem = (warranty: Warranty): WarrantyItem => ({ product: byId.get(warranty.productId) as Product, warranty });
  return {
    active: warranties.filter((warranty) => warranty.status === 'active').map(toItem),
    expiring: warranties.filter((warranty) => warranty.status === 'expiring').map(toItem),
    expired: warranties
      .filter((warranty) => warranty.status === 'expired')
      .reverse()
      .map(toItem),
  };
}

export function useWarranties() {
  const products = useProducts();
  const referenceDate = today();
  const groups = useMemo(() => groupWarranties(products.data ?? [], referenceDate), [products.data, referenceDate]);
  return { ...products, groups, referenceDate };
}

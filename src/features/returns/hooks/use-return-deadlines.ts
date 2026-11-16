import { useMemo } from 'react';

import { useProducts } from '@/features/products/hooks/use-products';
import type { Product } from '@/features/products/types';
import { today } from '@/shared/utils/date';

import { getReturnDeadline, sortByDeadline } from '../services/return-calculator';
import type { ReturnDeadline } from '../types';

export interface ReturnItem {
  product: Product;
  deadline: ReturnDeadline;
}

export interface ReturnGroups {
  upcoming: ReturnItem[];
  closed: ReturnItem[];
}

export function groupReturnDeadlines(products: Product[], referenceDate: string): ReturnGroups {
  const byId = new Map(products.map((product) => [product.id, product]));
  const deadlines = sortByDeadline(
    products.map((product) => getReturnDeadline(product, referenceDate)).filter((item): item is ReturnDeadline => item !== null),
  );
  const toItem = (deadline: ReturnDeadline): ReturnItem => ({ product: byId.get(deadline.productId) as Product, deadline });
  return {
    upcoming: deadlines.filter((deadline) => deadline.status !== 'closed').map(toItem),
    closed: deadlines
      .filter((deadline) => deadline.status === 'closed')
      .reverse()
      .map(toItem),
  };
}

export function useReturnDeadlines() {
  const products = useProducts();
  const referenceDate = today();
  const groups = useMemo(() => groupReturnDeadlines(products.data ?? [], referenceDate), [products.data, referenceDate]);
  return { ...products, groups, referenceDate };
}

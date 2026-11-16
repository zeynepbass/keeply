import { turkishLowerCase } from '@/shared/utils/search';

import type { Product } from '../types';

export function getProductTitle(product: Pick<Product, 'brand' | 'name'>): string {
  const brand = product.brand.trim();
  const name = product.name.trim();
  if (!brand || turkishLowerCase(name).startsWith(turkishLowerCase(brand))) {
    return name;
  }
  return `${brand} ${name}`;
}

import type { Product } from '@/features/products/types';
import { addMonths, compareIsoDates, differenceInDays, type IsoDate } from '@/shared/utils/date';

import type { Warranty, WarrantyStatus } from '../types';

export const EXPIRING_THRESHOLD_DAYS = 30;

export function calculateWarrantyEndDate(startDate: IsoDate, months: number): IsoDate {
  if (!Number.isInteger(months) || months <= 0) {
    throw new RangeError('Garanti süresi pozitif bir ay sayısı olmalı.');
  }
  return addMonths(startDate, months);
}

export function getWarrantyStatus(endDate: IsoDate, referenceDate: IsoDate): Exclude<WarrantyStatus, 'none'> {
  const remaining = differenceInDays(endDate, referenceDate);
  if (remaining < 0) {
    return 'expired';
  }
  return remaining <= EXPIRING_THRESHOLD_DAYS ? 'expiring' : 'active';
}

type WarrantyFields = Pick<Product, 'id' | 'hasWarranty' | 'warrantyMonths' | 'warrantyStartDate' | 'warrantyEndDate'>;

export function getWarranty(product: WarrantyFields, referenceDate: IsoDate): Warranty | null {
  if (!product.hasWarranty || !product.warrantyStartDate || !product.warrantyEndDate || !product.warrantyMonths) {
    return null;
  }
  const total = Math.max(1, differenceInDays(product.warrantyEndDate, product.warrantyStartDate));
  const elapsed = differenceInDays(referenceDate, product.warrantyStartDate);
  return {
    productId: product.id,
    startDate: product.warrantyStartDate,
    endDate: product.warrantyEndDate,
    months: product.warrantyMonths,
    status: getWarrantyStatus(product.warrantyEndDate, referenceDate),
    remainingDays: Math.max(0, differenceInDays(product.warrantyEndDate, referenceDate)),
    elapsedRatio: Math.min(1, Math.max(0, elapsed / total)),
  };
}

export function getWarrantyStatusOf(product: WarrantyFields, referenceDate: IsoDate): WarrantyStatus {
  return getWarranty(product, referenceDate)?.status ?? 'none';
}

export function sortByEndDate(warranties: Warranty[]): Warranty[] {
  return [...warranties].sort((a, b) => compareIsoDates(a.endDate, b.endDate));
}

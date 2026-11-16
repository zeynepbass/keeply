import type { Product } from '@/features/products/types';
import { addDays, compareIsoDates, differenceInDays, type IsoDate } from '@/shared/utils/date';

import type { ReturnDeadline, ReturnStatus } from '../types';

export const DEFAULT_RETURN_WINDOW_DAYS = 14;
export const URGENT_RETURN_THRESHOLD_DAYS = 3;

export function calculateDefaultReturnDeadline(purchaseDate: IsoDate, windowDays = DEFAULT_RETURN_WINDOW_DAYS): IsoDate {
  return addDays(purchaseDate, windowDays);
}

export function getReturnStatus(deadline: IsoDate, referenceDate: IsoDate): ReturnStatus {
  const remaining = differenceInDays(deadline, referenceDate);
  if (remaining < 0) {
    return 'closed';
  }
  return remaining <= URGENT_RETURN_THRESHOLD_DAYS ? 'urgent' : 'open';
}

type ReturnFields = Pick<Product, 'id' | 'purchaseDate' | 'returnDeadline'>;

export function getReturnDeadline(product: ReturnFields, referenceDate: IsoDate): ReturnDeadline | null {
  if (!product.returnDeadline) {
    return null;
  }
  return {
    productId: product.id,
    purchaseDate: product.purchaseDate,
    deadline: product.returnDeadline,
    status: getReturnStatus(product.returnDeadline, referenceDate),
    remainingDays: Math.max(0, differenceInDays(product.returnDeadline, referenceDate)),
  };
}

export function sortByDeadline(deadlines: ReturnDeadline[]): ReturnDeadline[] {
  return [...deadlines].sort((a, b) => compareIsoDates(a.deadline, b.deadline));
}

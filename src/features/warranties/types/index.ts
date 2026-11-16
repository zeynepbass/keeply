import type { IsoDate } from '@/shared/utils/date';

export type WarrantyStatus = 'active' | 'expiring' | 'expired' | 'none';

export interface Warranty {
  productId: string;
  startDate: IsoDate;
  endDate: IsoDate;
  months: number;
  status: Exclude<WarrantyStatus, 'none'>;
  remainingDays: number;
  elapsedRatio: number;
}

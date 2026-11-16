import type { IsoDate } from '@/shared/utils/date';

export type ReturnStatus = 'open' | 'urgent' | 'closed';

export interface ReturnDeadline {
  productId: string;
  purchaseDate: IsoDate;
  deadline: IsoDate;
  status: ReturnStatus;
  remainingDays: number;
}

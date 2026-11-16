import type { IsoDate } from '@/shared/utils/date';

export interface ServiceRecord {
  id: string;
  productId: string;
  date: IsoDate;
  provider: string;
  problem: string;
  repairDetails: string | null;
  cost: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ServiceRecordInput = Omit<ServiceRecord, 'id' | 'createdAt' | 'updatedAt'>;

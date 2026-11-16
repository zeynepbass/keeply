import { activityService } from '@/features/activity/services/activity-service';
import { documentService } from '@/features/documents/services/document-service';
import { t } from '@/shared/i18n';
import { AppError } from '@/shared/lib/errors';
import { createId } from '@/shared/lib/id';
import { createCollection } from '@/shared/lib/storage';
import { compareIsoDates } from '@/shared/utils/date';

import type { ServiceRecord, ServiceRecordInput } from '../types';

export const serviceRecordRepository = createCollection<ServiceRecord>('service-records', t.common.notFound);

function normalize(input: ServiceRecordInput): ServiceRecordInput {
  return {
    ...input,
    provider: input.provider.trim(),
    problem: input.problem.trim(),
    repairDetails: input.repairDetails?.trim() || null,
    notes: input.notes?.trim() || null,
  };
}

export function sortServiceRecords(records: ServiceRecord[]): ServiceRecord[] {
  return [...records].sort((a, b) => compareIsoDates(b.date, a.date) || b.createdAt.localeCompare(a.createdAt));
}

export function totalServiceCost(records: ServiceRecord[]): number {
  return records.reduce((sum, record) => sum + (record.cost ?? 0), 0);
}

export const serviceRecordService = {
  async list(userId: string): Promise<ServiceRecord[]> {
    return sortServiceRecords(await serviceRecordRepository.list(userId));
  },

  async create(userId: string, input: ServiceRecordInput, productTitle: string): Promise<ServiceRecord> {
    const now = new Date().toISOString();
    const record: ServiceRecord = { id: createId(), ...normalize(input), createdAt: now, updatedAt: now };
    await serviceRecordRepository.insert(userId, record);
    await activityService.log(userId, 'service_added', productTitle, record.productId);
    return record;
  },

  async update(userId: string, recordId: string, input: ServiceRecordInput): Promise<ServiceRecord> {
    return serviceRecordRepository.update(userId, recordId, { ...normalize(input), updatedAt: new Date().toISOString() });
  },

  async remove(userId: string, recordId: string): Promise<void> {
    const record = await serviceRecordRepository.get(userId, recordId);
    if (!record) {
      throw new AppError('not_found', t.common.notFound);
    }
    await documentService.removeWhere(userId, (document) => document.serviceRecordId === recordId);
    await serviceRecordRepository.remove(userId, recordId);
  },

  async removeForProduct(userId: string, productId: string): Promise<void> {
    await serviceRecordRepository.removeWhere(userId, (record) => record.productId === productId);
  },
};

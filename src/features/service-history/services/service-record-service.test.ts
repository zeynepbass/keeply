import AsyncStorage from '@react-native-async-storage/async-storage';

import { activityService } from '@/features/activity/services/activity-service';
import { documentRepository } from '@/features/documents/services/document-service';
import { t } from '@/shared/i18n';

import { serviceRecordSchema, toServiceRecordInput } from '../schemas/service-record-schema';
import { serviceRecordService, totalServiceCost } from './service-record-service';

const USER = 'user-1';

const values = {
  date: '2026-08-10',
  provider: ' Arçelik Yetkili Servisi ',
  problem: 'Soğutmuyor',
  repairDetails: '',
  costText: '1.250,50',
  notes: '',
};

describe('service history', () => {
  beforeEach(() => AsyncStorage.clear());

  it('validates service record forms in Turkish', () => {
    const result = serviceRecordSchema.safeParse({ ...values, provider: '', problem: '', costText: 'abc', date: '2099-01-01' });
    expect(result.success).toBe(false);
    const messages = result.success ? [] : result.error.issues.map((issue) => issue.message);
    expect(messages).toEqual(
      expect.arrayContaining([t.validation.providerRequired, t.validation.problemRequired, t.validation.priceInvalid]),
    );
  });

  it('maps form values to a record input', () => {
    expect(toServiceRecordInput('p1', values)).toEqual({
      productId: 'p1',
      date: '2026-08-10',
      provider: 'Arçelik Yetkili Servisi',
      problem: 'Soğutmuyor',
      repairDetails: null,
      cost: 1250.5,
      notes: null,
    });
  });

  it('lists records newest first and sums costs', async () => {
    await serviceRecordService.create(USER, toServiceRecordInput('p1', values), 'Arçelik Buzdolabı');
    await serviceRecordService.create(USER, toServiceRecordInput('p1', { ...values, date: '2026-10-01', costText: '' }), 'Arçelik Buzdolabı');
    await serviceRecordService.create(USER, toServiceRecordInput('p1', { ...values, date: '2025-01-05', costText: '300' }), 'Arçelik Buzdolabı');
    const records = await serviceRecordService.list(USER);
    expect(records.map((record) => record.date)).toEqual(['2026-10-01', '2026-08-10', '2025-01-05']);
    expect(totalServiceCost(records)).toBe(1550.5);
    expect((await activityService.list(USER)).filter((activity) => activity.kind === 'service_added')).toHaveLength(3);
  });

  it('removes attached documents with the record', async () => {
    const record = await serviceRecordService.create(USER, toServiceRecordInput('p1', values), 'Arçelik Buzdolabı');
    await documentRepository.insert(USER, {
      id: 'd1',
      productId: 'p1',
      serviceRecordId: record.id,
      type: 'other',
      name: 'servis_fisi.pdf',
      uri: 'file:///cache/servis_fisi.pdf',
      mimeType: 'application/pdf',
      size: 100,
      createdAt: '2026-08-10T10:00:00.000Z',
    });
    await serviceRecordService.remove(USER, record.id);
    expect(await serviceRecordService.list(USER)).toEqual([]);
    expect(await documentRepository.list(USER)).toEqual([]);
  });
});

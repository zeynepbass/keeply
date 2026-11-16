import { activityRepository } from '@/features/activity/services/activity-service';
import type { Activity } from '@/features/activity/types';
import { authService } from '@/features/auth/services/auth-service';
import type { User } from '@/features/auth/types';
import { documentRepository } from '@/features/documents/services/document-service';
import type { Document } from '@/features/documents/types';
import { productRepository } from '@/features/products/services/product-repository';
import { serviceRecordRepository } from '@/features/service-history/services/service-record-service';
import type { ServiceRecord } from '@/features/service-history/types';
import { calculateWarrantyEndDate } from '@/features/warranties/services/warranty-calculator';
import type { Product } from '@/features/products/types';
import { createId } from '@/shared/lib/id';
import { fileStorage } from '@/shared/services/file-storage';
import { addDays, today } from '@/shared/utils/date';

import { DEMO_DOCUMENTS, DEMO_PRODUCTS, DEMO_SERVICE_RECORDS } from './demo-data';
import { buildSamplePdf } from './sample-pdf';

export const DEMO_ACCOUNT = {
  name: 'Elif Yılmaz',
  email: 'demo@keeply.app',
  password: 'KeeplyDemo2026',
};

function hoursAgo(hours: number, now: Date): string {
  return new Date(now.getTime() - hours * 3_600_000).toISOString();
}

async function seed(userId: string, now: Date = new Date()): Promise<void> {
  const reference = today(now);
  const productIds = new Map<string, string>();
  const activities: Activity[] = [];

  const products: Product[] = DEMO_PRODUCTS.map((demo) => {
    const input = demo.input(reference);
    const id = createId();
    productIds.set(demo.key, id);
    const createdAt = hoursAgo(demo.addedHoursAgo, now);
    activities.push({ id: createId(), kind: 'product_added', productId: id, subject: `${input.brand} ${input.name}`, createdAt });
    return {
      ...input,
      id,
      warrantyEndDate: input.warrantyStartDate && input.warrantyMonths ? calculateWarrantyEndDate(input.warrantyStartDate, input.warrantyMonths) : null,
      createdAt,
      updatedAt: createdAt,
    };
  });

  const documents: Document[] = [];
  for (const demo of DEMO_DOCUMENTS) {
    const id = createId();
    const stored = await fileStorage.writeText(userId, 'documents', `${id}.pdf`, buildSamplePdf(demo.lines));
    const productId = productIds.get(demo.productKey) ?? null;
    const createdAt = hoursAgo(demo.hoursAgo, now);
    documents.push({
      id,
      productId,
      serviceRecordId: null,
      type: demo.type,
      name: demo.name,
      uri: stored.uri,
      mimeType: 'application/pdf',
      size: stored.size,
      createdAt,
    });
    const owner = products.find((item) => item.id === productId);
    activities.push({
      id: createId(),
      kind: demo.type === 'receipt' ? 'receipt_added' : 'document_added',
      productId,
      subject: owner ? `${owner.brand} ${owner.name}` : demo.name,
      createdAt,
    });
  }

  const serviceRecords: ServiceRecord[] = DEMO_SERVICE_RECORDS.map((demo) => {
    const productId = productIds.get(demo.productKey) as string;
    const createdAt = hoursAgo(demo.daysAgo * 24, now);
    const owner = products.find((item) => item.id === productId);
    activities.push({ id: createId(), kind: 'service_added', productId, subject: owner ? `${owner.brand} ${owner.name}` : '', createdAt });
    return {
      id: createId(),
      productId,
      date: addDays(reference, -demo.daysAgo),
      provider: demo.provider,
      problem: demo.problem,
      repairDetails: demo.repairDetails,
      cost: demo.cost,
      notes: demo.notes,
      createdAt,
      updatedAt: createdAt,
    };
  });

  await productRepository.replaceAll(userId, products);
  await serviceRecordRepository.replaceAll(userId, serviceRecords);
  await documentRepository.replaceAll(userId, documents);
  await activityRepository.replaceAll(userId, activities);
}

export const demoService = {
  async signIn(): Promise<User> {
    if (await authService.accountExists(DEMO_ACCOUNT.email)) {
      return authService.login(DEMO_ACCOUNT.email, DEMO_ACCOUNT.password);
    }
    const user = await authService.register(DEMO_ACCOUNT, { isDemo: true });
    await seed(user.id);
    return user;
  },
  seed,
};

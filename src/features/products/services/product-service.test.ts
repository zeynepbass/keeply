import AsyncStorage from '@react-native-async-storage/async-storage';

import { activityService } from '@/features/activity/services/activity-service';
import { documentRepository } from '@/features/documents/services/document-service';

import type { ProductInput } from '../types';
import { productService } from './product-service';

const USER = 'user-1';

const input: ProductInput = {
  name: ' Galaxy S24 ',
  brand: 'Samsung',
  model: '',
  category: 'electronics',
  imageUri: null,
  price: 42999,
  purchaseDate: '2026-10-12',
  storeName: 'Teknosa',
  salesChannel: 'online',
  hasWarranty: true,
  warrantyMonths: 24,
  warrantyStartDate: '2026-10-12',
  returnDeadline: '2026-10-26',
  notes: null,
};

describe('productService', () => {
  beforeEach(() => AsyncStorage.clear());

  it('creates a product, calculates its warranty end and logs the activity', async () => {
    const product = await productService.create(USER, input);
    expect(product).toMatchObject({ name: 'Galaxy S24', model: null, warrantyEndDate: '2028-10-12' });
    const activities = await activityService.list(USER);
    expect(activities).toHaveLength(1);
    expect(activities[0]).toMatchObject({ kind: 'product_added', productId: product.id });
  });

  it('drops warranty data when the product has no warranty', async () => {
    const product = await productService.create(USER, { ...input, hasWarranty: false });
    expect(product).toMatchObject({ hasWarranty: false, warrantyMonths: null, warrantyStartDate: null, warrantyEndDate: null });
  });

  it('updates a product and recalculates the warranty end', async () => {
    const product = await productService.create(USER, input);
    const updated = await productService.update(USER, product.id, { ...input, warrantyMonths: 36 });
    expect(updated.warrantyEndDate).toBe('2029-10-12');
    expect((await productService.get(USER, product.id)).warrantyMonths).toBe(36);
  });

  it('removes a product with its documents and activities', async () => {
    const product = await productService.create(USER, input);
    const other = await productService.create(USER, { ...input, name: 'Bulaşık Makinesi', brand: 'Bosch' });
    await documentRepository.insert(USER, {
      id: 'd1',
      productId: product.id,
      serviceRecordId: null,
      type: 'invoice',
      name: 'fatura.pdf',
      uri: 'file:///cache/fatura.pdf',
      mimeType: 'application/pdf',
      size: 1000,
      createdAt: '2026-10-12T10:00:00.000Z',
    });
    await productService.remove(USER, product.id);
    await expect(productService.get(USER, product.id)).rejects.toMatchObject({ code: 'not_found' });
    expect(await documentRepository.list(USER)).toEqual([]);
    expect((await activityService.list(USER)).every((activity) => activity.productId === other.id)).toBe(true);
  });

  it('keeps users isolated', async () => {
    await productService.create(USER, input);
    expect(await productService.list('user-2')).toEqual([]);
  });
});

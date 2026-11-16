import { t } from '@/shared/i18n';
import { today } from '@/shared/utils/date';

import type { Product } from '../types';
import { createEmptyProductForm, fromProduct, productFormSchema, toProductInput, type ProductFormValues } from './product-schema';

function valid(overrides: Partial<ProductFormValues> = {}): ProductFormValues {
  return {
    ...createEmptyProductForm('2026-10-12'),
    name: 'Galaxy S24',
    brand: 'Samsung',
    storeName: 'Teknosa',
    priceText: '42.999',
    ...overrides,
  };
}

function messages(values: ProductFormValues): string[] {
  const result = productFormSchema.safeParse(values);
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
}

describe('product form schema', () => {
  it('accepts a complete product', () => {
    expect(messages(valid())).toEqual([]);
  });

  it('requires name, brand and store', () => {
    expect(messages(valid({ name: ' ', brand: '', storeName: '' }))).toEqual([
      t.validation.productNameRequired,
      t.validation.brandRequired,
      t.validation.storeRequired,
    ]);
  });

  it('validates price, custom warranty months and dates', () => {
    expect(messages(valid({ priceText: '12,3,4' }))).toContain(t.validation.priceInvalid);
    expect(messages(valid({ warrantyPreset: 'custom', customMonths: '0' }))).toContain(t.validation.warrantyMonthsInvalid);
    expect(messages(valid({ warrantyPreset: 'custom', customMonths: '18' }))).toEqual([]);
    expect(messages(valid({ hasWarranty: false, warrantyPreset: 'custom', customMonths: '' }))).toEqual([]);
    expect(messages(valid({ returnDeadline: '2026-10-01' }))).toContain(t.validation.returnBeforePurchase);
    expect(messages(valid({ purchaseDate: '2099-01-01' }))).toContain(t.validation.purchaseDateFuture);
  });

  it('maps form values to product input', () => {
    const input = toProductInput(valid({ priceText: '1.299,90', model: '  ', notes: ' Not ' }));
    expect(input).toMatchObject({
      price: 1299.9,
      model: null,
      notes: 'Not',
      hasWarranty: true,
      warrantyMonths: 24,
      warrantyStartDate: '2026-10-12',
      returnDeadline: '2026-10-26',
    });
    expect(toProductInput(valid({ hasWarranty: false, hasReturn: false }))).toMatchObject({
      hasWarranty: false,
      warrantyMonths: null,
      warrantyStartDate: null,
      returnDeadline: null,
    });
  });

  it('round-trips an existing product into form values', () => {
    const product: Product = {
      id: 'p1',
      ...toProductInput(valid({ warrantyPreset: 'custom', customMonths: '18' })),
      warrantyEndDate: '2028-04-12',
      createdAt: '2026-10-12T10:00:00.000Z',
      updatedAt: '2026-10-12T10:00:00.000Z',
    };
    const values = fromProduct(product);
    expect(values).toMatchObject({ warrantyPreset: 'custom', customMonths: '18', priceText: '42.999', hasReturn: true });
    expect(toProductInput(values)).toMatchObject({ warrantyMonths: 18, price: 42999 });
  });

  it('defaults to today with a 14 day return window', () => {
    const empty = createEmptyProductForm();
    expect(empty.purchaseDate).toBe(today());
    expect(empty.warrantyPreset).toBe('24');
  });
});

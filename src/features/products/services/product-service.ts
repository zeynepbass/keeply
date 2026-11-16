import { activityService } from '@/features/activity/services/activity-service';
import { calculateWarrantyEndDate } from '@/features/warranties/services/warranty-calculator';
import { t } from '@/shared/i18n';
import { AppError } from '@/shared/lib/errors';
import { createId } from '@/shared/lib/id';
import { extensionForMime, fileStorage, mimeFromName } from '@/shared/services/file-storage';

import type { Product, ProductInput } from '../types';
import { productDependents } from './product-dependents';
import { productRepository } from './product-repository';

function normalizeInput(input: ProductInput): Omit<Product, 'id' | 'createdAt' | 'updatedAt'> {
  const hasWarranty = input.hasWarranty && !!input.warrantyMonths && input.warrantyMonths > 0;
  const warrantyStartDate = hasWarranty ? (input.warrantyStartDate ?? input.purchaseDate) : null;
  const warrantyMonths = hasWarranty ? input.warrantyMonths : null;
  return {
    ...input,
    name: input.name.trim(),
    brand: input.brand.trim(),
    model: input.model?.trim() || null,
    storeName: input.storeName.trim(),
    notes: input.notes?.trim() || null,
    hasWarranty,
    warrantyMonths,
    warrantyStartDate,
    warrantyEndDate: warrantyStartDate && warrantyMonths ? calculateWarrantyEndDate(warrantyStartDate, warrantyMonths) : null,
  };
}

async function persistImage(userId: string, productId: string, imageUri: string | null): Promise<string | null> {
  if (!imageUri || fileStorage.isManaged(imageUri)) {
    return imageUri;
  }
  const extension = extensionForMime(mimeFromName(imageUri) ?? 'image/jpeg', imageUri);
  const stored = await fileStorage.persist(userId, 'images', imageUri, `${productId}-${Date.now()}.${extension}`);
  return stored.uri;
}

export function sortByCreatedDesc(products: Product[]): Product[] {
  return [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const productService = {
  async list(userId: string): Promise<Product[]> {
    return sortByCreatedDesc(await productRepository.list(userId));
  },

  async get(userId: string, productId: string): Promise<Product> {
    const product = await productRepository.get(userId, productId);
    if (!product) {
      throw new AppError('not_found', t.common.notFound);
    }
    return product;
  },

  async create(userId: string, input: ProductInput): Promise<Product> {
    const now = new Date().toISOString();
    const id = createId();
    const imageUri = await persistImage(userId, id, input.imageUri);
    const product: Product = { id, ...normalizeInput({ ...input, imageUri }), createdAt: now, updatedAt: now };
    await productRepository.insert(userId, product);
    await activityService.log(userId, 'product_added', product.name, product.id);
    return product;
  },

  async update(userId: string, productId: string, input: ProductInput): Promise<Product> {
    const current = await this.get(userId, productId);
    const imageUri = await persistImage(userId, productId, input.imageUri);
    const updated = await productRepository.update(userId, productId, {
      ...normalizeInput({ ...input, imageUri }),
      updatedAt: new Date().toISOString(),
    });
    if (current.imageUri && current.imageUri !== imageUri) {
      fileStorage.remove(current.imageUri);
    }
    await activityService.log(userId, 'product_updated', updated.name, updated.id);
    return updated;
  },

  async remove(userId: string, productId: string): Promise<void> {
    const product = await this.get(userId, productId);
    for (const removeDependents of productDependents) {
      await removeDependents(userId, product);
    }
    await productRepository.remove(userId, productId);
    await activityService.removeForProduct(userId, productId);
  },
};

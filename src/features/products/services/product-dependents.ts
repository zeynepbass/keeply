import { documentService } from '@/features/documents/services/document-service';
import { serviceRecordService } from '@/features/service-history/services/service-record-service';
import { fileStorage } from '@/shared/services/file-storage';

import type { Product } from '../types';

export type ProductDependentsCleanup = (userId: string, product: Product) => Promise<unknown>;

export const productDependents: ProductDependentsCleanup[] = [
  (userId, product) => serviceRecordService.removeForProduct(userId, product.id),
  (userId, product) => documentService.removeWhere(userId, (document) => document.productId === product.id),
  async (_userId, product) => fileStorage.remove(product.imageUri),
];

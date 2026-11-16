import { documentService } from '@/features/documents/services/document-service';
import { fileStorage } from '@/shared/services/file-storage';

import type { Product } from '../types';

export type ProductDependentsCleanup = (userId: string, product: Product) => Promise<unknown>;

export const productDependents: ProductDependentsCleanup[] = [
  (userId, product) => documentService.removeWhere(userId, (document) => document.productId === product.id),
  async (_userId, product) => fileStorage.remove(product.imageUri),
];

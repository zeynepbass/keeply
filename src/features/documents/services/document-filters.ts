import type { Product } from '@/features/products/types';
import { matchesSearch } from '@/shared/utils/search';
import { t } from '@/shared/i18n';

import type { Document, DocumentType } from '../types';

export function filterDocuments(
  documents: Document[],
  products: Product[],
  filters: { query: string; type: DocumentType | 'all' },
): Document[] {
  const productNames = new Map(products.map((product) => [product.id, `${product.brand} ${product.name}`]));
  return documents.filter((document) => {
    if (filters.type !== 'all' && document.type !== filters.type) {
      return false;
    }
    return matchesSearch(filters.query, [
      document.name,
      t.documents.types[document.type],
      document.productId ? productNames.get(document.productId) : null,
    ]);
  });
}

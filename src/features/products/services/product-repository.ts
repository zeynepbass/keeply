import { t } from '@/shared/i18n';
import { createCollection } from '@/shared/lib/storage';

import type { Product } from '../types';

export const productRepository = createCollection<Product>('products', t.common.notFound);

import type { IsoDate } from '@/shared/utils/date';

export const PRODUCT_CATEGORIES = [
  'electronics',
  'white_goods',
  'home_living',
  'fashion',
  'personal_care',
  'furniture',
  'other',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export type SalesChannel = 'in_store' | 'online';

export interface Product {
  id: string;
  name: string;
  brand: string;
  model: string | null;
  category: ProductCategory;
  imageUri: string | null;
  price: number | null;
  purchaseDate: IsoDate;
  storeName: string;
  salesChannel: SalesChannel;
  hasWarranty: boolean;
  warrantyMonths: number | null;
  warrantyStartDate: IsoDate | null;
  warrantyEndDate: IsoDate | null;
  returnDeadline: IsoDate | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'warrantyEndDate'>;

export type ProductSort = 'recent' | 'name' | 'price_desc' | 'warranty_end';

export type ProductViewMode = 'list' | 'grid';

export interface ProductFilters {
  query: string;
  category: ProductCategory | 'all';
  warrantyStatus: 'all' | 'active' | 'expiring' | 'expired' | 'none';
  sort: ProductSort;
}

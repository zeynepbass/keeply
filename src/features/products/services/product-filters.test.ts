import type { Product } from '../types';
import { countActiveFilters, DEFAULT_FILTERS, filterProducts, sortProducts } from './product-filters';

const base: Product = {
  id: 'p1',
  name: 'Galaxy S24',
  brand: 'Samsung',
  model: 'SM-S921B',
  category: 'electronics',
  imageUri: null,
  price: 42999,
  purchaseDate: '2026-10-12',
  storeName: 'Teknosa',
  salesChannel: 'online',
  hasWarranty: true,
  warrantyMonths: 24,
  warrantyStartDate: '2026-10-12',
  warrantyEndDate: '2028-10-12',
  returnDeadline: '2026-10-26',
  notes: null,
  createdAt: '2026-10-12T10:00:00.000Z',
  updatedAt: '2026-10-12T10:00:00.000Z',
};

const products: Product[] = [
  base,
  {
    ...base,
    id: 'p2',
    name: 'Saç Kurutma Makinesi',
    brand: 'Philips',
    category: 'personal_care',
    price: 1299,
    storeName: 'Watsons',
    warrantyStartDate: '2024-11-03',
    warrantyEndDate: '2026-11-03',
    createdAt: '2024-11-03T10:00:00.000Z',
  },
  {
    ...base,
    id: 'p3',
    name: 'Bulaşık Makinesi',
    brand: 'Bosch',
    category: 'white_goods',
    price: 21499,
    storeName: 'MediaMarkt',
    warrantyStartDate: '2024-12-01',
    warrantyEndDate: '2026-12-01',
    createdAt: '2026-11-01T10:00:00.000Z',
  },
  {
    ...base,
    id: 'p4',
    name: 'Mont',
    brand: "Levi's",
    category: 'fashion',
    price: null,
    hasWarranty: false,
    warrantyMonths: null,
    warrantyStartDate: null,
    warrantyEndDate: null,
    createdAt: '2026-11-10T10:00:00.000Z',
  },
];

const reference = '2026-11-16';

describe('product filters', () => {
  it('searches across fields ignoring Turkish characters', () => {
    expect(filterProducts(products, { ...DEFAULT_FILTERS, query: 'bulasik' }, reference).map((p) => p.id)).toEqual(['p3']);
    expect(filterProducts(products, { ...DEFAULT_FILTERS, query: 'watsons sac' }, reference).map((p) => p.id)).toEqual(['p2']);
    expect(filterProducts(products, { ...DEFAULT_FILTERS, query: 'kisisel' }, reference).map((p) => p.id)).toEqual(['p2']);
  });

  it('filters by category and warranty status', () => {
    expect(filterProducts(products, { ...DEFAULT_FILTERS, category: 'white_goods' }, reference).map((p) => p.id)).toEqual(['p3']);
    expect(filterProducts(products, { ...DEFAULT_FILTERS, warrantyStatus: 'expired' }, reference).map((p) => p.id)).toEqual(['p2']);
    expect(filterProducts(products, { ...DEFAULT_FILTERS, warrantyStatus: 'expiring' }, reference).map((p) => p.id)).toEqual(['p3']);
    expect(filterProducts(products, { ...DEFAULT_FILTERS, warrantyStatus: 'none' }, reference).map((p) => p.id)).toEqual(['p4']);
    expect(filterProducts(products, { ...DEFAULT_FILTERS, warrantyStatus: 'active' }, reference).map((p) => p.id)).toEqual(['p1']);
  });

  it('sorts products', () => {
    expect(sortProducts(products, 'recent', reference).map((p) => p.id)).toEqual(['p4', 'p3', 'p1', 'p2']);
    expect(sortProducts(products, 'price_desc', reference).map((p) => p.id)).toEqual(['p1', 'p3', 'p2', 'p4']);
    expect(sortProducts(products, 'warranty_end', reference).map((p) => p.id)).toEqual(['p2', 'p3', 'p1', 'p4']);
    expect(sortProducts(products, 'name', reference).map((p) => p.id)).toEqual(['p3', 'p4', 'p2', 'p1']);
  });

  it('counts active filters', () => {
    expect(countActiveFilters(DEFAULT_FILTERS)).toBe(0);
    expect(countActiveFilters({ ...DEFAULT_FILTERS, category: 'fashion', warrantyStatus: 'expired' })).toBe(2);
  });
});

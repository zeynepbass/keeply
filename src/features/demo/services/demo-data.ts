import type { DocumentType } from '@/features/documents/types';
import type { ProductInput } from '@/features/products/types';
import { addDays, addMonths, type IsoDate } from '@/shared/utils/date';

export interface DemoProduct {
  key: string;
  addedHoursAgo: number;
  input: (reference: IsoDate) => ProductInput;
}

export interface DemoDocument {
  productKey: string;
  type: DocumentType;
  name: string;
  hoursAgo: number;
  lines: string[];
}

function product(
  values: Omit<ProductInput, 'imageUri' | 'warrantyStartDate' | 'hasWarranty' | 'returnDeadline'> & {
    returnDays: number | null;
  },
): ProductInput {
  return {
    ...values,
    imageUri: null,
    hasWarranty: values.warrantyMonths !== null,
    warrantyStartDate: values.warrantyMonths !== null ? values.purchaseDate : null,
    returnDeadline: values.returnDays === null ? null : addDays(values.purchaseDate, values.returnDays),
  };
}

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    key: 'nike',
    addedHoursAgo: 2,
    input: (reference) =>
      product({
        name: 'Air Max Spor Ayakkabı',
        brand: 'Nike',
        model: 'Air Max 90 · 39 numara',
        category: 'fashion',
        price: 5299,
        purchaseDate: addDays(reference, -2),
        storeName: 'Boyner',
        salesChannel: 'in_store',
        warrantyMonths: 24,
        returnDays: 14,
        notes: 'Beyaz renk. Kutusu ve etiketi saklanıyor.',
      }),
  },
  {
    key: 'ikea',
    addedHoursAgo: 26,
    input: (reference) =>
      product({
        name: 'Hemnes Çalışma Masası',
        brand: 'IKEA',
        model: '403.958.10',
        category: 'furniture',
        price: 8999,
        purchaseDate: addDays(reference, -1),
        storeName: 'IKEA',
        salesChannel: 'in_store',
        warrantyMonths: 24,
        returnDays: 14,
        notes: null,
      }),
  },
  {
    key: 'dyson',
    addedHoursAgo: 9 * 24,
    input: (reference) =>
      product({
        name: 'V15 Detect Dikey Süpürge',
        brand: 'Dyson',
        model: 'SV47',
        category: 'home_living',
        price: 27999,
        purchaseDate: addDays(reference, -11),
        storeName: 'Dyson Türkiye',
        salesChannel: 'online',
        warrantyMonths: 24,
        returnDays: 14,
        notes: null,
      }),
  },
  {
    key: 'samsung',
    addedHoursAgo: 40 * 24,
    input: (reference) =>
      product({
        name: 'Galaxy S24',
        brand: 'Samsung',
        model: 'SM-S921B',
        category: 'electronics',
        price: 42999,
        purchaseDate: addDays(addMonths(reference, -24), 14),
        storeName: 'Teknosa',
        salesChannel: 'online',
        warrantyMonths: 24,
        returnDays: 14,
        notes: '256 GB, Onyx Black.',
      }),
  },
  {
    key: 'bosch',
    addedHoursAgo: 52 * 24,
    input: (reference) =>
      product({
        name: 'Bulaşık Makinesi',
        brand: 'Bosch',
        model: 'SMS4HVI33E',
        category: 'white_goods',
        price: 21499,
        purchaseDate: addDays(addMonths(reference, -24), 27),
        storeName: 'MediaMarkt',
        salesChannel: 'in_store',
        warrantyMonths: 24,
        returnDays: 14,
        notes: null,
      }),
  },
  {
    key: 'airpods',
    addedHoursAgo: 120 * 24,
    input: (reference) =>
      product({
        name: 'AirPods Pro (2. nesil)',
        brand: 'Apple',
        model: 'MTJV3TU/A',
        category: 'electronics',
        price: 10499,
        purchaseDate: addDays(reference, -200),
        storeName: 'Apple Store',
        salesChannel: 'online',
        warrantyMonths: 24,
        returnDays: 14,
        notes: null,
      }),
  },
  {
    key: 'arcelik',
    addedHoursAgo: 200 * 24,
    input: (reference) =>
      product({
        name: 'No-Frost Buzdolabı',
        brand: 'Arçelik',
        model: '274651 EB',
        category: 'white_goods',
        price: 38750,
        purchaseDate: addDays(reference, -410),
        storeName: 'Arçelik Yetkili Satıcı',
        salesChannel: 'in_store',
        warrantyMonths: 36,
        returnDays: null,
        notes: 'Ek garanti paketi dahil.',
      }),
  },
  {
    key: 'philips',
    addedHoursAgo: 300 * 24,
    input: (reference) =>
      product({
        name: 'Saç Kurutma Makinesi',
        brand: 'Philips',
        model: 'BHD538/20',
        category: 'personal_care',
        price: 1299,
        purchaseDate: addDays(addMonths(reference, -24), -13),
        storeName: 'Watsons',
        salesChannel: 'in_store',
        warrantyMonths: 24,
        returnDays: 14,
        notes: null,
      }),
  },
];

export const DEMO_DOCUMENTS: DemoDocument[] = [
  {
    productKey: 'samsung',
    type: 'invoice',
    name: 'fatura_teknosa.pdf',
    hoursAgo: 40 * 24,
    lines: ['TEKNOSA IC VE DIS TICARET A.S.', 'E-ARSIV FATURA', '', 'Samsung Galaxy S24 256 GB  SM-S921B', 'Adet: 1', 'KDV Dahil Toplam: 42.999,00 TL'],
  },
  {
    productKey: 'bosch',
    type: 'warranty',
    name: 'garanti_bosch_bulasik.pdf',
    hoursAgo: 52 * 24,
    lines: ['BSH EV ALETLERI', 'GARANTI BELGESI', '', 'Urun: Bosch Bulasik Makinesi SMS4HVI33E', 'Garanti Suresi: 2 Yil'],
  },
  {
    productKey: 'nike',
    type: 'receipt',
    name: 'fis_boyner_nike.pdf',
    hoursAgo: 2,
    lines: ['BOYNER', 'SATIS FISI', '', 'Nike Air Max 90  39', 'Toplam: 5.299,00 TL', 'Iade suresi: 14 gun'],
  },
  {
    productKey: 'ikea',
    type: 'contract',
    name: 'sozlesme_ikea_masa.pdf',
    hoursAgo: 26,
    lines: ['IKEA', 'TESLIMAT VE MONTAJ SOZLESMESI', '', 'Hemnes Calisma Masasi 403.958.10', 'Tutar: 8.999,00 TL'],
  },
];

import { z } from 'zod';

import { calculateDefaultReturnDeadline } from '@/features/returns/services/return-calculator';
import { t } from '@/shared/i18n';
import { compareIsoDates, isIsoDate, today, type IsoDate } from '@/shared/utils/date';
import { formatCurrencyInput, parseCurrencyInput } from '@/shared/utils/format';

import { PRODUCT_CATEGORIES, type Product, type ProductInput } from '../types';

export const WARRANTY_PRESETS = ['12', '24', '36', 'custom'] as const;
export type WarrantyPreset = (typeof WARRANTY_PRESETS)[number];

const isoDateField = z.string().refine(isIsoDate, t.validation.dateInvalid);

export const productFormSchema = z
  .object({
    imageUri: z.string().nullable(),
    name: z.string().trim().min(1, t.validation.productNameRequired).max(80, t.validation.maxLength(80)),
    brand: z.string().trim().min(1, t.validation.brandRequired).max(40, t.validation.maxLength(40)),
    category: z.enum(PRODUCT_CATEGORIES, t.validation.categoryRequired),
    model: z.string().trim().max(60, t.validation.maxLength(60)),
    purchaseDate: isoDateField,
    priceText: z
      .string()
      .trim()
      .refine((value) => value === '' || parseCurrencyInput(value) !== null, t.validation.priceInvalid),
    storeName: z.string().trim().min(1, t.validation.storeRequired).max(60, t.validation.maxLength(60)),
    salesChannel: z.enum(['in_store', 'online']),
    notes: z.string().trim().max(500, t.validation.maxLength(500)),
    hasWarranty: z.boolean(),
    warrantyPreset: z.enum(WARRANTY_PRESETS),
    customMonths: z.string().trim(),
    warrantyStartDate: isoDateField,
    hasReturn: z.boolean(),
    returnDeadline: z.string(),
  })
  .superRefine((values, context) => {
    if (isIsoDate(values.purchaseDate) && compareIsoDates(values.purchaseDate, today()) > 0) {
      context.addIssue({ code: 'custom', path: ['purchaseDate'], message: t.validation.purchaseDateFuture });
    }
    if (values.hasWarranty && values.warrantyPreset === 'custom') {
      const months = Number(values.customMonths);
      if (!/^\d+$/.test(values.customMonths) || months < 1 || months > 240) {
        context.addIssue({ code: 'custom', path: ['customMonths'], message: t.validation.warrantyMonthsInvalid });
      }
    }
    if (values.hasReturn) {
      if (!isIsoDate(values.returnDeadline)) {
        context.addIssue({ code: 'custom', path: ['returnDeadline'], message: t.validation.dateInvalid });
      } else if (isIsoDate(values.purchaseDate) && compareIsoDates(values.returnDeadline, values.purchaseDate) < 0) {
        context.addIssue({ code: 'custom', path: ['returnDeadline'], message: t.validation.returnBeforePurchase });
      }
    }
  });

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const PRODUCT_FORM_STEPS = {
  image: ['imageUri'],
  info: ['name', 'brand', 'category', 'model'],
  purchase: ['purchaseDate', 'priceText', 'storeName', 'salesChannel', 'notes'],
  warranty: ['hasWarranty', 'warrantyPreset', 'customMonths', 'warrantyStartDate', 'hasReturn', 'returnDeadline'],
} as const satisfies Record<string, (keyof ProductFormValues)[]>;

export function getWarrantyMonths(values: Pick<ProductFormValues, 'hasWarranty' | 'warrantyPreset' | 'customMonths'>): number | null {
  if (!values.hasWarranty) {
    return null;
  }
  const months = values.warrantyPreset === 'custom' ? Number(values.customMonths) : Number(values.warrantyPreset);
  return Number.isInteger(months) && months > 0 ? months : null;
}

export function createEmptyProductForm(referenceDate: IsoDate = today()): ProductFormValues {
  return {
    imageUri: null,
    name: '',
    brand: '',
    category: 'electronics',
    model: '',
    purchaseDate: referenceDate,
    priceText: '',
    storeName: '',
    salesChannel: 'in_store',
    notes: '',
    hasWarranty: true,
    warrantyPreset: '24',
    customMonths: '',
    warrantyStartDate: referenceDate,
    hasReturn: true,
    returnDeadline: calculateDefaultReturnDeadline(referenceDate),
  };
}

export function toProductInput(values: ProductFormValues): ProductInput {
  const warrantyMonths = getWarrantyMonths(values);
  return {
    name: values.name.trim(),
    brand: values.brand.trim(),
    model: values.model.trim() || null,
    category: values.category,
    imageUri: values.imageUri,
    price: values.priceText.trim() === '' ? null : parseCurrencyInput(values.priceText),
    purchaseDate: values.purchaseDate,
    storeName: values.storeName.trim(),
    salesChannel: values.salesChannel,
    hasWarranty: values.hasWarranty && warrantyMonths !== null,
    warrantyMonths,
    warrantyStartDate: values.hasWarranty ? values.warrantyStartDate : null,
    returnDeadline: values.hasReturn && isIsoDate(values.returnDeadline) ? values.returnDeadline : null,
    notes: values.notes.trim() || null,
  };
}

export function fromProduct(product: Product): ProductFormValues {
  const months = product.warrantyMonths ?? 24;
  const preset: WarrantyPreset = (['12', '24', '36'] as const).find((value) => Number(value) === months) ?? 'custom';
  return {
    imageUri: product.imageUri,
    name: product.name,
    brand: product.brand,
    category: product.category,
    model: product.model ?? '',
    purchaseDate: product.purchaseDate,
    priceText: formatCurrencyInput(product.price),
    storeName: product.storeName,
    salesChannel: product.salesChannel,
    notes: product.notes ?? '',
    hasWarranty: product.hasWarranty,
    warrantyPreset: product.hasWarranty ? preset : '24',
    customMonths: preset === 'custom' && product.hasWarranty ? String(months) : '',
    warrantyStartDate: product.warrantyStartDate ?? product.purchaseDate,
    hasReturn: product.returnDeadline !== null,
    returnDeadline: product.returnDeadline ?? calculateDefaultReturnDeadline(product.purchaseDate),
  };
}

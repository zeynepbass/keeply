import { Armchair, Lamp, Package, Shirt, Smartphone, Sparkles, WashingMachine, type LucideIcon } from 'lucide-react-native';

import type { ColorToken } from '@/shared/theme/colors';
import { t } from '@/shared/i18n';

import { PRODUCT_CATEGORIES, type ProductCategory } from '../types';

export interface CategoryMeta {
  label: string;
  icon: LucideIcon;
  tint: ColorToken;
}

export const CATEGORY_META: Record<ProductCategory, CategoryMeta> = {
  electronics: { label: t.categories.electronics, icon: Smartphone, tint: 'primary-tint' },
  white_goods: { label: t.categories.white_goods, icon: WashingMachine, tint: 'tint-blue' },
  home_living: { label: t.categories.home_living, icon: Lamp, tint: 'tint-sand' },
  fashion: { label: t.categories.fashion, icon: Shirt, tint: 'tint-sand' },
  personal_care: { label: t.categories.personal_care, icon: Sparkles, tint: 'tint-blue' },
  furniture: { label: t.categories.furniture, icon: Armchair, tint: 'tint-lilac' },
  other: { label: t.categories.other, icon: Package, tint: 'neutral-bg' },
};

export const CATEGORY_OPTIONS = PRODUCT_CATEGORIES.map((value) => ({ value, label: CATEGORY_META[value].label }));

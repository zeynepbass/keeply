import { useState } from 'react';
import { View } from 'react-native';

import { Button, Chip, Sheet, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';

import { CATEGORY_OPTIONS } from '../constants/categories';
import type { ProductFilters } from '../types';

const STATUS_OPTIONS = (['all', 'active', 'expiring', 'expired', 'none'] as const).map((value) => ({
  value,
  label: t.products.filters.statuses[value],
}));

export interface ProductFilterSheetProps {
  visible: boolean;
  filters: ProductFilters;
  onApply: (filters: Pick<ProductFilters, 'category' | 'warrantyStatus'>) => void;
  onClose: () => void;
}

export function ProductFilterSheet({ visible, filters, onApply, onClose }: ProductFilterSheetProps) {
  const [category, setCategory] = useState(filters.category);
  const [warrantyStatus, setWarrantyStatus] = useState(filters.warrantyStatus);

  return (
    <Sheet
      visible={visible}
      title={t.products.filters.title}
      onClose={onClose}
      scrollable
      footer={
        <View className="flex-row gap-2.5">
          <Button
            label={t.products.filters.reset}
            variant="ghost"
            className="flex-1"
            onPress={() => {
              setCategory('all');
              setWarrantyStatus('all');
            }}
          />
          <Button label={t.products.filters.apply} className="flex-1" onPress={() => onApply({ category, warrantyStatus })} />
        </View>
      }
    >
      <Text variant="label" className="mb-2.5">
        {t.products.filters.warrantyStatus}
      </Text>
      <View className="mb-5 flex-row flex-wrap gap-2">
        {STATUS_OPTIONS.map((option) => (
          <Chip key={option.value} label={option.label} selected={warrantyStatus === option.value} onPress={() => setWarrantyStatus(option.value)} />
        ))}
      </View>
      <Text variant="label" className="mb-2.5">
        {t.products.filters.category}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        <Chip label={t.categories.all} selected={category === 'all'} onPress={() => setCategory('all')} />
        {CATEGORY_OPTIONS.map((option) => (
          <Chip key={option.value} label={option.label} selected={category === option.value} onPress={() => setCategory(option.value)} />
        ))}
      </View>
    </Sheet>
  );
}

import { Check } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Sheet, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { cn } from '@/shared/lib/cn';
import { useTheme } from '@/shared/theme/theme-provider';

import type { ProductSort } from '../types';

const SORT_OPTIONS: ProductSort[] = ['recent', 'name', 'price_desc', 'warranty_end'];

export function ProductSortSheet({ visible, value, onSelect, onClose }: { visible: boolean; value: ProductSort; onSelect: (sort: ProductSort) => void; onClose: () => void }) {
  const { colors } = useTheme();
  return (
    <Sheet visible={visible} title={t.products.sort.title} onClose={onClose}>
      <View className="overflow-hidden rounded-md border border-border">
        {SORT_OPTIONS.map((option, index) => {
          const selected = option === value;
          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => onSelect(option)}
              className={cn('flex-row items-center justify-between px-4 py-4 active:bg-neutral-bg', index > 0 && 'border-t border-border')}
            >
              <Text className={cn('text-[14px]', selected ? 'font-semibold text-primary' : 'font-body text-text')}>{t.products.sort[option]}</Text>
              {selected ? <Check size={18} color={colors.primary} strokeWidth={2.4} /> : null}
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}

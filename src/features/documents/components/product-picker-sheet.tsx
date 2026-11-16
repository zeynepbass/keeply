import { Check, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { ProductAvatar } from '@/features/products/components/product-avatar';
import { useProducts } from '@/features/products/hooks/use-products';
import { getProductTitle } from '@/features/products/services/product-display';
import { Sheet, Text, TextField } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { cn } from '@/shared/lib/cn';
import { useTheme } from '@/shared/theme/theme-provider';
import { matchesSearch } from '@/shared/utils/search';

export interface ProductPickerSheetProps {
  visible: boolean;
  value: string | null;
  onSelect: (productId: string | null) => void;
  onClose: () => void;
  allowNone?: boolean;
}

export function ProductPickerSheet({ visible, value, onSelect, onClose, allowNone = true }: ProductPickerSheetProps) {
  const { colors } = useTheme();
  const products = useProducts();
  const [query, setQuery] = useState('');
  const filtered = useMemo(
    () => (products.data ?? []).filter((product) => matchesSearch(query, [product.brand, product.name, product.storeName])),
    [products.data, query],
  );

  return (
    <Sheet visible={visible} title={t.documents.form.selectProduct} onClose={onClose} scrollable>
      <TextField
        value={query}
        onChangeText={setQuery}
        placeholder={t.products.searchPlaceholder}
        accessibilityLabel={t.products.searchPlaceholder}
        leading={<Search size={18} color={colors['text-secondary']} strokeWidth={2} />}
        containerClassName="mb-3"
      />
      <View className="gap-2 pb-2">
        {allowNone ? (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: value === null }}
            onPress={() => onSelect(null)}
            className={cn('flex-row items-center justify-between rounded-md border px-4 py-3.5', value === null ? 'border-primary bg-primary-tint' : 'border-border')}
          >
            <Text className="font-body text-[14px]">{t.documents.form.noProduct}</Text>
            {value === null ? <Check size={18} color={colors.primary} strokeWidth={2.4} /> : null}
          </Pressable>
        ) : null}
        {filtered.map((product) => {
          const selected = product.id === value;
          return (
            <Pressable
              key={product.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={getProductTitle(product)}
              onPress={() => onSelect(product.id)}
              className={cn('flex-row items-center gap-3 rounded-md border px-3 py-2.5', selected ? 'border-primary bg-primary-tint' : 'border-border')}
            >
              <ProductAvatar product={product} size={36} radius={10} />
              <View className="min-w-0 flex-1">
                <Text numberOfLines={1} className="font-semibold text-[13.5px]">
                  {getProductTitle(product)}
                </Text>
                <Text numberOfLines={1} variant="caption">
                  {product.storeName}
                </Text>
              </View>
              {selected ? <Check size={18} color={colors.primary} strokeWidth={2.4} /> : null}
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}

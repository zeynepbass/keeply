import { View } from 'react-native';

import { WarrantyBadge } from '@/features/warranties/components/warranty-badge';
import { PressableCard, Text } from '@/shared/components/ui';

import { getProductTitle } from '../services/product-display';
import type { Product } from '../types';
import { ProductAvatar } from './product-avatar';

export function ProductGridCard({ product, subtitle, onPress, referenceDate }: { product: Product; subtitle: string; onPress: () => void; referenceDate: string }) {
  return (
    <PressableCard onPress={onPress} accessibilityLabel={`${getProductTitle(product)}, ${subtitle}`} className="flex-1 gap-3 p-3">
      <ProductAvatar product={product} size={64} radius={14} />
      <View className="gap-0.5">
        <Text numberOfLines={2} className="font-semibold text-[13.5px] leading-[18px] text-text">
          {getProductTitle(product)}
        </Text>
        <Text numberOfLines={1} variant="caption">
          {subtitle}
        </Text>
      </View>
      <WarrantyBadge product={product} referenceDate={referenceDate} />
    </PressableCard>
  );
}

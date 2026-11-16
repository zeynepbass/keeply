import type { ReactNode } from 'react';
import { View } from 'react-native';

import { PressableCard, Text } from '@/shared/components/ui';

import type { Product } from '../types';
import { getProductTitle } from '../services/product-display';
import { ProductAvatar } from './product-avatar';

export interface ProductRowProps {
  product: Product;
  subtitle: string;
  trailing?: ReactNode;
  onPress: () => void;
  avatarSize?: number;
}

export function ProductRow({ product, subtitle, trailing, onPress, avatarSize = 44 }: ProductRowProps) {
  return (
    <PressableCard onPress={onPress} accessibilityLabel={`${getProductTitle(product)}, ${subtitle}`} className="flex-row items-center gap-3 p-3.5">
      <ProductAvatar product={product} size={avatarSize} />
      <View className="min-w-0 flex-1">
        <Text numberOfLines={1} className="font-semibold text-[14px] text-text">
          {getProductTitle(product)}
        </Text>
        <Text numberOfLines={1} className="font-body text-[12px] text-text-secondary">
          {subtitle}
        </Text>
      </View>
      {trailing}
    </PressableCard>
  );
}

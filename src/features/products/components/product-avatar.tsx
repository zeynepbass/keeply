import { Image } from 'expo-image';
import { View } from 'react-native';

import { useTheme } from '@/shared/theme/theme-provider';

import { CATEGORY_META } from '../constants/categories';
import type { Product } from '../types';

export interface ProductAvatarProps {
  product: Pick<Product, 'category' | 'imageUri'>;
  size?: number;
  radius?: number;
}

export function ProductAvatar({ product, size = 44, radius = 12 }: ProductAvatarProps) {
  const { colors } = useTheme();
  const meta = CATEGORY_META[product.category];
  const Icon = meta.icon;
  return (
    <View
      className="items-center justify-center overflow-hidden"
      style={{ width: size, height: size, borderRadius: radius, backgroundColor: colors[meta.tint] }}
      importantForAccessibility="no-hide-descendants"
    >
      {product.imageUri ? (
        <Image source={{ uri: product.imageUri }} style={{ width: size, height: size }} contentFit="cover" transition={150} />
      ) : (
        <Icon size={Math.round(size * 0.45)} color={colors.primary} strokeWidth={2} />
      )}
    </View>
  );
}

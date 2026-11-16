import { Image } from 'expo-image';
import { ArrowLeft, PencilLine, Trash2 } from 'lucide-react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { goBackOr } from '@/shared/components/layout/top-bar';
import { Badge, IconButton } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { useTheme } from '@/shared/theme/theme-provider';

import { CATEGORY_META } from '../constants/categories';
import type { Product } from '../types';

export function ProductHero({ product, onEdit, onDelete }: { product: Product; onEdit: () => void; onDelete: () => void }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const meta = CATEGORY_META[product.category];
  const Icon = meta.icon;
  return (
    <View className="items-center justify-center" style={{ height: 220 + insets.top, paddingTop: insets.top, backgroundColor: colors[meta.tint] }}>
      {product.imageUri ? (
        <Image source={{ uri: product.imageUri }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} contentFit="cover" accessibilityIgnoresInvertColors />
      ) : (
        <Icon size={84} color={colors.primary} strokeWidth={1.4} />
      )}
      <View className="absolute left-5 right-5 flex-row justify-between" style={{ top: insets.top + 12 }}>
        <IconButton icon={ArrowLeft} tone="floating" label={t.common.back} onPress={() => goBackOr('/products')} />
        <View className="flex-row gap-2">
          <IconButton icon={PencilLine} tone="floating" label={t.common.edit} onPress={onEdit} />
          <IconButton icon={Trash2} tone="floating" label={t.common.delete} onPress={onDelete} />
        </View>
      </View>
      <View className="absolute bottom-3.5 left-5">
        <Badge label={meta.label} />
      </View>
    </View>
  );
}

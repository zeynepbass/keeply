import { CircleCheck, Clock, TriangleAlert } from 'lucide-react-native';
import { View } from 'react-native';

import { ProductAvatar } from '@/features/products/components/product-avatar';
import { getProductTitle } from '@/features/products/services/product-display';
import { Badge, PressableCard, ProgressBar, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { formatDate } from '@/shared/utils/date';

import type { WarrantyItem } from '../hooks/use-warranties';

export function WarrantyCard({ item, onPress }: { item: WarrantyItem; onPress: () => void }) {
  const { product, warranty } = item;
  const percent = Math.round(warranty.elapsedRatio * 100);
  const tone = warranty.status === 'expired' ? 'danger' : warranty.status === 'expiring' ? 'warning' : 'primary';
  return (
    <PressableCard onPress={onPress} accessibilityLabel={`${getProductTitle(product)}, ${warranty.status === 'expired' ? t.warranties.endedOn(formatDate(warranty.endDate)) : t.warranties.remaining(warranty.remainingDays)}`} className="gap-3 p-3.5">
      <View className="flex-row items-center gap-3">
        <ProductAvatar product={product} size={44} />
        <View className="min-w-0 flex-1">
          <Text numberOfLines={1} className="font-semibold text-[14px]">
            {getProductTitle(product)}
          </Text>
          <Text numberOfLines={1} variant="caption">
            {warranty.status === 'expired' ? t.warranties.endedOn(formatDate(warranty.endDate)) : t.warranties.endsOn(formatDate(warranty.endDate))}
          </Text>
        </View>
        {warranty.status === 'expired' ? (
          <Badge label={t.warrantyStatus.expired} tone="danger" icon={TriangleAlert} />
        ) : warranty.status === 'expiring' ? (
          <Badge label={t.common.days(warranty.remainingDays)} tone="warning" icon={Clock} />
        ) : (
          <Badge label={t.common.days(warranty.remainingDays)} tone="success" icon={CircleCheck} />
        )}
      </View>
      <View className="gap-1.5">
        <ProgressBar progress={warranty.elapsedRatio} tone={tone} accessibilityLabel={t.warranties.progressLabel(percent)} />
        <Text variant="caption">{t.warranties.progressLabel(percent)}</Text>
      </View>
    </PressableCard>
  );
}

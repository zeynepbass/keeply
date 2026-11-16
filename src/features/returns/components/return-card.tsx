import { CalendarX, Tag } from 'lucide-react-native';
import { View } from 'react-native';

import { ProductAvatar } from '@/features/products/components/product-avatar';
import { getProductTitle } from '@/features/products/services/product-display';
import { Badge, PressableCard, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { formatDate } from '@/shared/utils/date';

import type { ReturnItem } from '../hooks/use-return-deadlines';

export function ReturnCard({ item, onPress }: { item: ReturnItem; onPress: () => void }) {
  const { product, deadline } = item;
  const closed = deadline.status === 'closed';
  const status = closed ? t.returns.closedOn(formatDate(deadline.deadline)) : t.returns.remaining(deadline.remainingDays);
  return (
    <PressableCard onPress={onPress} accessibilityLabel={`${getProductTitle(product)}, ${status}`} className="gap-3 p-3.5">
      <View className="flex-row items-center gap-3">
        <ProductAvatar product={product} size={44} />
        <View className="min-w-0 flex-1">
          <Text numberOfLines={1} className="font-semibold text-[14px]">
            {getProductTitle(product)}
          </Text>
          <Text numberOfLines={1} variant="caption">
            {t.returns.purchased(formatDate(product.purchaseDate), product.storeName)}
          </Text>
        </View>
        {closed ? (
          <Badge label={t.warrantyStatus.expired} tone="neutral" icon={CalendarX} />
        ) : (
          <Badge label={t.returns.remaining(deadline.remainingDays)} tone={deadline.status === 'urgent' ? 'danger' : 'warning'} icon={Tag} />
        )}
      </View>
      <View className="flex-row items-center justify-between rounded-sm bg-neutral-bg px-3 py-2.5">
        <Text className="font-body text-[12.5px] text-text-secondary">{closed ? status : t.returns.deadline(formatDate(deadline.deadline))}</Text>
        {deadline.status === 'urgent' ? <Text className="font-bold text-[12px] text-danger-text">{t.returns.urgent}</Text> : null}
      </View>
    </PressableCard>
  );
}

import { Paperclip, Wrench } from 'lucide-react-native';
import { View } from 'react-native';

import { Badge, PressableCard, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { cn } from '@/shared/lib/cn';
import { useTheme } from '@/shared/theme/theme-provider';
import { formatDate } from '@/shared/utils/date';
import { formatCurrency } from '@/shared/utils/format';

import type { ServiceRecord } from '../types';

export interface ServiceRecordCardProps {
  record: ServiceRecord;
  documentCount: number;
  onPress: () => void;
  isLast?: boolean;
  timeline?: boolean;
}

export function ServiceRecordCard({ record, documentCount, onPress, isLast = true, timeline = true }: ServiceRecordCardProps) {
  const { colors } = useTheme();
  const body = (
    <PressableCard onPress={onPress} accessibilityLabel={`${formatDate(record.date)}, ${record.provider}, ${record.problem}`} className="flex-1 gap-2 p-3.5">
      <View className="flex-row items-start justify-between gap-2">
        <View className="min-w-0 flex-1">
          <Text variant="caption">{formatDate(record.date)}</Text>
          <Text numberOfLines={1} className="font-semibold text-[14px]">
            {record.provider}
          </Text>
        </View>
        <Badge label={record.cost ? formatCurrency(record.cost) : t.service.free} tone={record.cost ? 'neutral' : 'success'} />
      </View>
      <Text className="font-body text-[13px] leading-[19px] text-text">{record.problem}</Text>
      {record.repairDetails ? <Text className="font-body text-[12.5px] leading-[18px] text-text-secondary">{record.repairDetails}</Text> : null}
      {documentCount > 0 ? (
        <View className="flex-row items-center gap-1">
          <Paperclip size={13} color={colors['text-secondary']} strokeWidth={2} />
          <Text variant="caption">{t.service.attachmentCount(documentCount)}</Text>
        </View>
      ) : null}
    </PressableCard>
  );

  if (!timeline) {
    return body;
  }
  return (
    <View className="flex-row gap-3">
      <View className="items-center">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-primary-tint">
          <Wrench size={15} color={colors.primary} strokeWidth={2.2} />
        </View>
        <View className={cn('w-0.5 flex-1', isLast ? 'bg-transparent' : 'bg-border')} />
      </View>
      <View className={cn('flex-1', !isLast && 'pb-3')}>{body}</View>
    </View>
  );
}

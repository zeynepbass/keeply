import { Bell, FileText, Package, PencilLine, Receipt, Wrench, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import type { ColorToken } from '@/shared/theme/colors';
import { useTheme } from '@/shared/theme/theme-provider';
import { formatRelativeTime } from '@/shared/utils/date';

import type { Activity, ActivityKind } from '../types';

const KIND_META: Record<ActivityKind, { icon: LucideIcon; bg: ColorToken; fg: ColorToken }> = {
  product_added: { icon: Package, bg: 'primary-tint', fg: 'primary' },
  product_updated: { icon: PencilLine, bg: 'primary-tint', fg: 'primary' },
  document_added: { icon: FileText, bg: 'primary-tint', fg: 'primary' },
  receipt_added: { icon: Receipt, bg: 'primary-tint', fg: 'primary' },
  service_added: { icon: Wrench, bg: 'neutral-bg', fg: 'neutral-text' },
  reminder_scheduled: { icon: Bell, bg: 'warning-bg', fg: 'warning-icon' },
};

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  const { colors } = useTheme();
  return (
    <View className="gap-3.5">
      {activities.map((activity) => {
        const meta = KIND_META[activity.kind];
        const Icon = meta.icon;
        const title = t.activity[activity.kind];
        return (
          <View key={activity.id} className="flex-row items-start gap-3" accessible accessibilityLabel={`${title}, ${activity.subject}, ${formatRelativeTime(activity.createdAt)}`}>
            <View className="mt-px h-[30px] w-[30px] items-center justify-center rounded-full" style={{ backgroundColor: colors[meta.bg] }}>
              <Icon size={14} color={colors[meta.fg]} strokeWidth={2.2} />
            </View>
            <View className="flex-1">
              <Text className="font-body text-[13.5px] leading-[19px] text-text">
                <Text className="font-bold text-[13.5px]">{title}</Text>
                {` — ${activity.subject}`}
              </Text>
              <Text variant="caption">{formatRelativeTime(activity.createdAt)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

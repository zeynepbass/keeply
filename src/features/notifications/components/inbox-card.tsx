import { Bell, CalendarClock, Clock, Hand, Tag, TriangleAlert, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { PressableCard, Text } from '@/shared/components/ui';
import { cn } from '@/shared/lib/cn';
import type { ColorToken } from '@/shared/theme/colors';
import { useTheme } from '@/shared/theme/theme-provider';
import { formatRelativeTime } from '@/shared/utils/date';

import type { InboxItem, InboxKind } from '../types';

const META: Record<InboxKind, { icon: LucideIcon; bg: ColorToken; fg: ColorToken }> = {
  warranty_expiring: { icon: Clock, bg: 'warning-bg', fg: 'warning-icon' },
  return_approaching: { icon: Tag, bg: 'danger-bg', fg: 'danger-icon' },
  warranty_expired: { icon: TriangleAlert, bg: 'neutral-bg', fg: 'neutral-text' },
  reminder: { icon: CalendarClock, bg: 'primary-tint', fg: 'primary' },
  welcome: { icon: Hand, bg: 'neutral-bg', fg: 'neutral-text' },
};

export function InboxCard({ item, onPress }: { item: InboxItem; onPress: () => void }) {
  const { colors } = useTheme();
  const meta = META[item.kind] ?? { icon: Bell, bg: 'neutral-bg', fg: 'neutral-text' };
  return (
    <PressableCard
      onPress={onPress}
      accessibilityLabel={`${item.title}. ${item.body}. ${formatRelativeTime(item.occurredAt)}`}
      accessibilityState={{ selected: !item.read }}
      className={cn('flex-row items-start gap-3 p-3.5', item.read && 'opacity-60')}
    >
      <View className="h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: colors[meta.bg] }}>
        <meta.icon size={17} color={colors[meta.fg]} strokeWidth={2.2} />
      </View>
      <View className="flex-1 pr-3">
        <Text className="font-bold text-[13.5px]">{item.title}</Text>
        {item.body ? <Text className="mt-0.5 font-body text-[12.5px] leading-[18px] text-text-secondary">{item.body}</Text> : null}
        <Text className="mt-1.5 font-body text-[11px] text-text-secondary">{formatRelativeTime(item.occurredAt)}</Text>
      </View>
      {!item.read ? <View className="absolute right-3.5 top-3.5 h-2 w-2 rounded-full bg-primary" /> : null}
    </PressableCard>
  );
}

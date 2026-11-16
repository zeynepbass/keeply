import { View } from 'react-native';

import type { Activity } from '@/features/activity/types';
import { Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { cn } from '@/shared/lib/cn';
import { compareIsoDates, formatDate, toIsoDate, type IsoDate } from '@/shared/utils/date';

export interface TimelineEntry {
  id: string;
  label: string;
  date: IsoDate;
  tone: 'primary' | 'danger';
}

export function buildProductTimeline(activities: Activity[], warrantyEnd: IsoDate | null, referenceDate: IsoDate): TimelineEntry[] {
  const entries: TimelineEntry[] = activities.map((activity) => ({
    id: activity.id,
    label: t.activity[activity.kind],
    date: toIsoDate(new Date(activity.createdAt)),
    tone: 'primary',
  }));
  if (warrantyEnd && compareIsoDates(warrantyEnd, referenceDate) < 0) {
    entries.push({ id: 'warranty-expired', label: t.activity.warranty_expired, date: warrantyEnd, tone: 'danger' });
  }
  return entries.sort((a, b) => compareIsoDates(b.date, a.date));
}

export function ProductTimeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <View className="gap-3">
      {entries.map((entry) => (
        <View key={entry.id} className="flex-row gap-2.5">
          <View className={cn('mt-1.5 h-1.5 w-1.5 rounded-full', entry.tone === 'danger' ? 'bg-danger-icon' : 'bg-primary')} />
          <Text className="font-body text-[13px] text-text-secondary">{`${entry.label} — ${formatDate(entry.date)}`}</Text>
        </View>
      ))}
    </View>
  );
}

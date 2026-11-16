import { Linking, View } from 'react-native';

import { useNotificationPreferences, useUpdateNotificationPreferences } from '@/features/notifications/hooks/use-notification-preferences';
import { notificationPermissions } from '@/features/notifications/services/notification-scheduler';
import { REMINDER_LEAD_DAYS, type NotificationPreference } from '@/features/notifications/types';
import { toast } from '@/shared/components/feedback/toast-store';
import { Screen } from '@/shared/components/layout/screen';
import { TopBar } from '@/shared/components/layout/top-bar';
import { Badge, Card, Chip, ErrorState, ListRow, LoadingState, SectionLabel, Switch, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';

export default function NotificationPreferencesScreen() {
  const preferences = useNotificationPreferences();
  const update = useUpdateNotificationPreferences();
  const p = t.notifications.preferences;

  const change = async (changes: Partial<NotificationPreference>) => {
    if (changes.pushEnabled) {
      const permission = await notificationPermissions.request();
      if (permission !== 'granted') {
        toast.error(p.permissionDenied);
        void Linking.openSettings();
        return;
      }
    }
    update.mutate(changes, {
      onSuccess: ({ outcome }) => {
        if (outcome.status === 'permission_denied') toast.error(p.permissionDenied);
        else if (outcome.status === 'failed') toast.error(p.rescheduleFailed);
        else if (outcome.status === 'scheduled') toast.info(p.rescheduled(outcome.count));
      },
    });
  };

  if (preferences.isPending) return <Screen header={<TopBar title={p.title} />}><LoadingState /></Screen>;
  if (preferences.isError || !preferences.data) return <Screen header={<TopBar title={p.title} />}><ErrorState error={preferences.error} onRetry={() => preferences.refetch()} /></Screen>;
  const value = preferences.data;

  return (
    <Screen scroll header={<TopBar title={p.title} />} contentClassName="px-5 pb-8">
      <SectionLabel title={p.reminders} />
      <Card className="overflow-hidden">
        <ListRow label={p.warranty} description={p.warrantyDescription} divider trailing={<Switch label={p.warranty} value={value.warrantyReminders} onValueChange={(v) => change({ warrantyReminders: v })} />} />
        <ListRow label={p.returns} description={p.returnsDescription} divider trailing={<Switch label={p.returns} value={value.returnReminders} onValueChange={(v) => change({ returnReminders: v })} />} />
        <ListRow label={p.updates} description={p.updatesDescription} trailing={<Switch label={p.updates} value={value.productUpdates} onValueChange={(v) => change({ productUpdates: v })} />} />
      </Card>
      <Text variant="label" className="mb-2.5 mt-5">{p.timing}</Text>
      <View className="flex-row flex-wrap gap-2">
        {REMINDER_LEAD_DAYS.map((days) => {
          const selected = value.leadDays.includes(days);
          return (
            <Chip key={days} label={p.leadDay(days)} selected={selected} onPress={() => {
              const next = selected ? value.leadDays.filter((d) => d !== days) : [...value.leadDays, days];
              if (next.length === 0) { toast.info(p.leadRequired); return; }
              change({ leadDays: next });
            }} />
          );
        })}
      </View>
      <SectionLabel title={p.channels} className="mt-6" />
      <Card className="overflow-hidden">
        <ListRow label={p.email} description={p.emailUnavailable} divider trailing={<Badge label={t.common.comingSoon} />} />
        <ListRow label={p.push} trailing={<Switch label={p.push} value={value.pushEnabled} onValueChange={(v) => change({ pushEnabled: v })} />} />
      </Card>
      <Text variant="caption" className="mt-5 text-center">{p.autoSave}</Text>
    </Screen>
  );
}

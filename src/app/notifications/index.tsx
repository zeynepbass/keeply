import { router } from 'expo-router';
import { BellOff, CalendarClock, CheckCheck, Plus, Trash2 } from 'lucide-react-native';
import { Alert, Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { InboxCard } from '@/features/notifications/components/inbox-card';
import { useInbox, useMarkInboxRead } from '@/features/notifications/hooks/use-inbox';
import { useDeleteReminder, useReminders } from '@/features/notifications/hooks/use-reminders';
import { useProducts } from '@/features/products/hooks/use-products';
import { getProductTitle } from '@/features/products/services/product-display';
import { toast } from '@/shared/components/feedback/toast-store';
import { Screen } from '@/shared/components/layout/screen';
import { TopBar } from '@/shared/components/layout/top-bar';
import { Card, EmptyState, ErrorState, IconButton, LoadingState, SectionLabel, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { getErrorMessage } from '@/shared/lib/errors';
import { useTheme } from '@/shared/theme/theme-provider';
import { compareIsoDates, formatDate, today } from '@/shared/utils/date';

const SECTION_TITLES = { today: t.notifications.today, thisWeek: t.notifications.thisWeek, earlier: t.notifications.earlier };

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const inbox = useInbox();
  const markRead = useMarkInboxRead();
  const reminders = useReminders();
  const products = useProducts();
  const deleteReminder = useDeleteReminder();
  const upcoming = (reminders.data ?? []).filter((reminder) => compareIsoDates(reminder.date, today()) >= 0);
  const productTitle = (productId: string | null) => {
    const product = products.data?.find((item) => item.id === productId);
    return product ? getProductTitle(product) : null;
  };

  const confirmDelete = (reminderId: string) =>
    Alert.alert(t.notifications.reminder.deleteTitle, t.notifications.reminder.deleteMessage, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: () =>
          deleteReminder.mutate(reminderId, {
            onSuccess: () => toast.success(t.notifications.reminder.deleted),
            onError: (error) => toast.error(getErrorMessage(error)),
          }),
      },
    ]);

  return (
    <Screen
      header={
        <TopBar
          title={t.notifications.title}
          right={
            <IconButton
              icon={CheckCheck}
              label={t.notifications.markAllRead}
              disabled={inbox.unreadCount === 0}
              onPress={() => markRead.mutate(inbox.items.map((item) => item.id))}
            />
          }
        />
      }
      edges={{ top: true, bottom: false }}
    >
      {inbox.isPending ? (
        <LoadingState />
      ) : inbox.error ? (
        <ErrorState error={inbox.error} onRetry={() => void inbox.refetch()} />
      ) : (
        <ScrollView
          contentContainerClassName="px-5 pb-10 pt-2"
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={false} onRefresh={() => void inbox.refetch()} tintColor={colors.primary} />}
        >
          <View className="mb-1 flex-row items-center justify-between">
            <SectionLabel title={t.notifications.upcomingReminders} className="mt-1" />
            <Pressable accessibilityRole="button" hitSlop={8} onPress={() => router.push('/reminders/new')} className="flex-row items-center gap-1">
              <Plus size={14} color={colors.primary} strokeWidth={2.4} />
              <Text className="font-semibold text-[12.5px] text-primary">{t.notifications.addReminder}</Text>
            </Pressable>
          </View>
          {upcoming.length > 0 ? (
            <Card className="mb-2 overflow-hidden">
              {upcoming.map((reminder, index) => (
                <View key={reminder.id} className={index > 0 ? 'flex-row items-center gap-3 border-t border-border px-4 py-3' : 'flex-row items-center gap-3 px-4 py-3'}>
                  <CalendarClock size={18} color={colors.primary} strokeWidth={2} />
                  <View className="min-w-0 flex-1">
                    <Text numberOfLines={1} className="font-semibold text-[13.5px]">
                      {reminder.title}
                    </Text>
                    <Text numberOfLines={1} variant="caption">
                      {[t.notifications.reminder.at(formatDate(reminder.date)), productTitle(reminder.productId)].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                  <Pressable accessibilityRole="button" accessibilityLabel={t.common.delete} hitSlop={10} onPress={() => confirmDelete(reminder.id)}>
                    <Trash2 size={17} color={colors['text-secondary']} strokeWidth={2} />
                  </Pressable>
                </View>
              ))}
            </Card>
          ) : (
            <Text variant="secondary" className="mb-2">
              {t.notifications.emptyDescription}
            </Text>
          )}

          {inbox.sections.length === 0 ? (
            <EmptyState compact className="pt-10" icon={BellOff} title={t.notifications.emptyTitle} />
          ) : (
            inbox.sections.map((section) => (
              <View key={section.section}>
                <SectionLabel title={SECTION_TITLES[section.section]} className="mt-5" />
                <View className="gap-3">
                  {section.items.map((item) => (
                    <InboxCard
                      key={item.id}
                      item={item}
                      onPress={() => {
                        if (!item.read) {
                          markRead.mutate([item.id]);
                        }
                        if (item.productId) {
                          router.push({ pathname: '/products/[id]', params: { id: item.productId } });
                        }
                      }}
                    />
                  ))}
                </View>
              </View>
            ))
          )}
          <Pressable accessibilityRole="link" onPress={() => router.push('/notifications/preferences')} className="mb-3 mt-7 items-center">
            <Text className="font-semibold text-[13.5px] text-primary">{t.notifications.editPreferences}</Text>
          </Pressable>
        </ScrollView>
      )}
    </Screen>
  );
}

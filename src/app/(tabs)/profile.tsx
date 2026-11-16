import { router } from 'expo-router';
import { PencilLine } from 'lucide-react-native';
import { Alert, Linking, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { env } from '@/config/env';
import { useLogout } from '@/features/auth/hooks/use-auth-actions';
import { useCurrentUser } from '@/features/auth/stores/auth-store';
import { useExportData } from '@/features/profile/hooks/use-account';
import { toast } from '@/shared/components/feedback/toast-store';
import { Badge, Button, Card, IconButton, ListRow, SectionLabel, SegmentedControl, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { getErrorMessage } from '@/shared/lib/errors';
import { useThemeStore, type ThemePreference } from '@/shared/theme/theme-store';
import { getInitials } from '@/shared/utils/format';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const user = useCurrentUser();
  const logout = useLogout();
  const exportData = useExportData();
  const { preference, setPreference } = useThemeStore();
  const p = t.profile;

  const confirmLogout = () =>
    Alert.alert(t.auth.logoutConfirmTitle, t.auth.logoutConfirmMessage, [
      { text: t.common.cancel, style: 'cancel' },
      { text: p.logout, style: 'destructive', onPress: () => logout.mutate(undefined, { onSuccess: () => router.replace('/login') }) },
    ]);

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
      <View className="flex-row items-center gap-3.5 px-5 pb-5 pt-7">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-primary">
          <Text className="font-display text-[18px] text-on-primary">{getInitials(user.name)}</Text>
        </View>
        <View className="min-w-0 flex-1">
          <Text accessibilityRole="header" numberOfLines={1} className="font-display text-[18px]">
            {user.name}
          </Text>
          <Text numberOfLines={1} className="font-body text-[12.5px] text-text-secondary">
            {user.email}
          </Text>
          {user.isDemo ? <Badge label={p.demoBadge} size="sm" className="mt-1" /> : null}
        </View>
        <IconButton icon={PencilLine} label={p.editProfile} onPress={() => router.push('/profile/account')} />
      </View>

      <View className="px-5">
        <SectionLabel title={p.sections.account} />
        <Card className="mb-2 overflow-hidden">
          <ListRow label={p.accountInfo} divider onPress={() => router.push('/profile/account')} />
          <ListRow label={p.changePassword} onPress={() => router.push('/profile/password')} />
        </Card>

        <SectionLabel title={p.sections.preferences} />
        <Card className="mb-2 overflow-hidden">
          <ListRow label={p.notificationPreferences} divider onPress={() => router.push('/notifications/preferences')} />
          <ListRow
            label={p.theme}
            divider
            trailing={
              <SegmentedControl<ThemePreference>
                size="sm"
                accessibilityLabel={p.theme}
                value={preference}
                onChange={setPreference}
                options={(['light', 'dark', 'system'] as const).map((value) => ({ value, label: p.themes[value] }))}
              />
            }
          />
          <ListRow label={p.language} value={p.turkish} onPress={() => router.push('/profile/language')} />
        </Card>

        <SectionLabel title={p.sections.privacy} />
        <Card className="mb-2 overflow-hidden">
          <ListRow label={p.privacySettings} divider onPress={() => router.push('/profile/privacy')} />
          <ListRow
            label={p.exportData}
            onPress={() =>
              exportData.mutate(undefined, {
                onSuccess: () => toast.success(p.export.success),
                onError: (error) => toast.error(getErrorMessage(error)),
              })
            }
          />
        </Card>

        <SectionLabel title={p.sections.support} />
        <Card className="mb-5 overflow-hidden">
          <ListRow label={p.helpCenter} divider onPress={() => router.push('/profile/help')} />
          <ListRow label={p.contact} divider onPress={() => Linking.openURL(env.supportUrl).catch(() => toast.error(p.contactFailed))} />
          <ListRow label={p.aboutLabel} value={p.version(env.appVersion)} onPress={() => router.push('/profile/about')} />
        </Card>

        <Button label={p.logout} variant="danger" block loading={logout.isPending} onPress={confirmLogout} />
      </View>
    </ScrollView>
  );
}

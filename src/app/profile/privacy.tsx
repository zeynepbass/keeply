import { router } from 'expo-router';
import { HardDrive, KeyRound, type LucideIcon } from 'lucide-react-native';
import { Alert, View } from 'react-native';

import { useClearData, useDeleteAccount } from '@/features/profile/hooks/use-account';
import { toast } from '@/shared/components/feedback/toast-store';
import { Screen } from '@/shared/components/layout/screen';
import { TopBar } from '@/shared/components/layout/top-bar';
import { Button, Card, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { getErrorMessage } from '@/shared/lib/errors';
import { useTheme } from '@/shared/theme/theme-provider';

function InfoCard({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  const { colors } = useTheme();
  return (
    <Card className="flex-row items-start gap-3 p-4">
      <View className="h-10 w-10 items-center justify-center rounded-sm bg-primary-tint">
        <Icon size={18} color={colors.primary} strokeWidth={2} />
      </View>
      <View className="flex-1">
        <Text className="mb-1 font-semibold text-[14px]">{title}</Text>
        <Text className="font-body text-[13px] leading-[19px] text-text-secondary">{description}</Text>
      </View>
    </Card>
  );
}

export default function PrivacyScreen() {
  const p = t.profile.privacy;
  const clearData = useClearData();
  const deleteAccount = useDeleteAccount();

  const confirm = (title: string, message: string, action: () => void) =>
    Alert.alert(title, message, [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.common.delete, style: 'destructive', onPress: action },
    ]);

  return (
    <Screen scroll header={<TopBar title={p.title} />} contentClassName="gap-3 px-5 pb-8 pt-2">
      <InfoCard icon={HardDrive} title={p.storageTitle} description={p.storageDescription} />
      <InfoCard icon={KeyRound} title={p.sessionTitle} description={p.sessionDescription} />
      <View className="mt-4 gap-2">
        <Button
          label={p.clearData}
          variant="danger"
          block
          loading={clearData.isPending}
          onPress={() =>
            confirm(p.clearConfirmTitle, p.clearConfirmMessage, () =>
              clearData.mutate(undefined, {
                onSuccess: () => toast.success(p.cleared),
                onError: (error) => toast.error(getErrorMessage(error)),
              }),
            )
          }
        />
        <Text variant="caption" className="text-center">
          {p.clearDataDescription}
        </Text>
      </View>
      <View className="mt-3 gap-2">
        <Button
          label={p.deleteAccount}
          variant="danger"
          block
          loading={deleteAccount.isPending}
          onPress={() =>
            confirm(p.deleteConfirmTitle, p.deleteConfirmMessage, () =>
              deleteAccount.mutate(undefined, {
                onSuccess: () => {
                  toast.success(p.deleted);
                  router.replace('/welcome');
                },
                onError: (error) => toast.error(getErrorMessage(error)),
              }),
            )
          }
        />
        <Text variant="caption" className="text-center">
          {p.deleteAccountDescription}
        </Text>
      </View>
    </Screen>
  );
}

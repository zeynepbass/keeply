import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import { accountSchema, type AccountValues } from '@/features/auth/schemas/auth-schemas';
import { useCurrentUser } from '@/features/auth/stores/auth-store';
import { useUpdateProfile } from '@/features/profile/hooks/use-account';
import { toast } from '@/shared/components/feedback/toast-store';
import { FormTextField } from '@/shared/components/form/form-text-field';
import { Screen } from '@/shared/components/layout/screen';
import { TopBar } from '@/shared/components/layout/top-bar';
import { Button, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { getErrorMessage } from '@/shared/lib/errors';
import { formatDateLong, toIsoDate } from '@/shared/utils/date';

export default function AccountScreen() {
  const user = useCurrentUser();
  const update = useUpdateProfile();
  const { control, handleSubmit, formState } = useForm<AccountValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: { name: user.name, email: user.email },
  });

  const submit = () =>
    void handleSubmit((values) =>
      update.mutate(values, {
        onSuccess: () => {
          toast.success(t.profile.account.saved);
          router.back();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      }),
    )();

  return (
    <Screen
      scroll
      keyboard
      header={<TopBar title={t.profile.account.title} />}
      contentClassName="gap-4 px-5 pt-2"
      footer={
        <View className="px-5 pt-3">
          <Button label={t.common.saveChanges} block disabled={!formState.isDirty} loading={update.isPending} onPress={submit} />
        </View>
      }
    >
      <FormTextField control={control} name="name" label={t.auth.fullName} autoCapitalize="words" autoComplete="name" />
      <FormTextField control={control} name="email" label={t.auth.email} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
      <Text variant="caption">{t.profile.account.memberSince(formatDateLong(toIsoDate(new Date(user.createdAt))))}</Text>
    </Screen>
  );
}

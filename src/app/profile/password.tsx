import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import { changePasswordSchema, type ChangePasswordValues } from '@/features/auth/schemas/auth-schemas';
import { useChangePassword } from '@/features/profile/hooks/use-account';
import { toast } from '@/shared/components/feedback/toast-store';
import { PasswordField } from '@/shared/components/form/password-field';
import { Screen } from '@/shared/components/layout/screen';
import { TopBar } from '@/shared/components/layout/top-bar';
import { Button } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { getErrorMessage } from '@/shared/lib/errors';

export default function ChangePasswordScreen() {
  const change = useChangePassword();
  const { control, handleSubmit, setError } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', password: '', passwordConfirm: '' },
  });

  const submit = () =>
    void handleSubmit((values) =>
      change.mutate(values, {
        onSuccess: () => {
          toast.success(t.profile.password.saved);
          router.back();
        },
        onError: (error) => setError('currentPassword', { message: getErrorMessage(error) }),
      }),
    )();

  return (
    <Screen
      scroll
      keyboard
      header={<TopBar title={t.profile.password.title} />}
      contentClassName="gap-4 px-5 pt-2"
      footer={
        <View className="px-5 pt-3">
          <Button label={t.profile.password.submit} block loading={change.isPending} onPress={submit} />
        </View>
      }
    >
      <PasswordField control={control} name="currentPassword" label={t.profile.password.current} autoComplete="current-password" />
      <PasswordField control={control} name="password" label={t.profile.password.next} helper={t.auth.passwordHelper} autoComplete="new-password" />
      <PasswordField control={control} name="passwordConfirm" label={t.profile.password.confirm} autoComplete="new-password" />
    </Screen>
  );
}

import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { CircleCheck } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import { AuthHeader } from '@/features/auth/components/auth-header';
import { useResetPassword } from '@/features/auth/hooks/use-auth-actions';
import { resetPasswordSchema, type ResetPasswordValues } from '@/features/auth/schemas/auth-schemas';
import { toast } from '@/shared/components/feedback/toast-store';
import { PasswordField } from '@/shared/components/form/password-field';
import { Screen } from '@/shared/components/layout/screen';
import { Button, Card, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { getErrorMessage } from '@/shared/lib/errors';
import { useTheme } from '@/shared/theme/theme-provider';

export default function ResetPasswordScreen() {
  const { colors } = useTheme();
  const { email = '' } = useLocalSearchParams<{ email: string }>();
  const reset = useResetPassword();
  const { control, handleSubmit } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', passwordConfirm: '' },
  });

  const onSubmit = () =>
    void handleSubmit((values) =>
    reset.mutate(
      { email, password: values.password },
      { onError: (error) => toast.error(getErrorMessage(error)) },
    ),
  )();

  return (
    <Screen scroll keyboard contentClassName="px-7 pt-7">
      <AuthHeader title={t.auth.resetTitle} description={t.auth.resetDescription(email)} fallback="/forgot-password" />
      {reset.isSuccess ? (
        <View className="gap-5">
          <Card flat className="flex-row items-start gap-3 bg-primary-tint p-4">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
              <CircleCheck size={16} color={colors['on-primary']} strokeWidth={2.4} />
            </View>
            <View className="flex-1">
              <Text className="mb-0.5 font-display text-[14px] text-primary-dark">{t.auth.resetSuccessTitle}</Text>
              <Text className="font-body text-[13px] leading-[19px] text-text-secondary">{t.auth.resetSuccessDescription}</Text>
            </View>
          </Card>
          <Button label={t.auth.backToLogin} block onPress={() => router.dismissTo('/login')} />
        </View>
      ) : (
        <View className="gap-4">
          <PasswordField
            control={control}
            name="password"
            label={t.auth.newPassword}
            helper={t.auth.passwordHelper}
            autoComplete="new-password"
            textContentType="newPassword"
          />
          <PasswordField
            control={control}
            name="passwordConfirm"
            label={t.auth.passwordConfirm}
            autoComplete="new-password"
            textContentType="newPassword"
          />
          <Button label={t.auth.resetSubmit} block loading={reset.isPending} onPress={onSubmit} className="mt-2" />
        </View>
      )}
    </Screen>
  );
}

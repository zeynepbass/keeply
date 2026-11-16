import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Pressable, View } from 'react-native';

import { AuthHeader } from '@/features/auth/components/auth-header';
import { useAccountLookup } from '@/features/auth/hooks/use-auth-actions';
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/features/auth/schemas/auth-schemas';
import { toast } from '@/shared/components/feedback/toast-store';
import { FormTextField } from '@/shared/components/form/form-text-field';
import { goBackOr } from '@/shared/components/layout/top-bar';
import { Screen } from '@/shared/components/layout/screen';
import { Button, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { getErrorMessage } from '@/shared/lib/errors';

export default function ForgotPasswordScreen() {
  const lookup = useAccountLookup();
  const { control, handleSubmit, setError } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = () =>
    void handleSubmit((values) =>
    lookup.mutate(values.email, {
      onSuccess: (exists) => {
        if (!exists) {
          setError('email', { message: t.auth.accountNotFound });
          return;
        }
        router.push({ pathname: '/reset-password', params: { email: values.email.trim().toLowerCase() } });
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    }),
  )();

  return (
    <Screen
      scroll
      keyboard
      contentClassName="px-7 pt-7"
      footer={
        <Pressable accessibilityRole="link" onPress={() => goBackOr('/login')} className="items-center p-2">
          <Text className="font-semibold text-[14px] text-text-secondary">{t.auth.backToLogin}</Text>
        </Pressable>
      }
    >
      <AuthHeader title={t.auth.forgotTitle} description={t.auth.forgotDescription} fallback="/login" />
      <FormTextField
        control={control}
        name="email"
        label={t.auth.email}
        placeholder={t.auth.emailPlaceholder}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        returnKeyType="go"
        onSubmitEditing={onSubmit}
      />
      <View className="mt-5">
        <Button label={t.auth.forgotSubmit} block loading={lookup.isPending} onPress={onSubmit} />
      </View>
    </Screen>
  );
}

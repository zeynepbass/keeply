import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Pressable, View } from 'react-native';

import { AuthHeader } from '@/features/auth/components/auth-header';
import { useLogin } from '@/features/auth/hooks/use-auth-actions';
import { loginSchema, type LoginValues } from '@/features/auth/schemas/auth-schemas';
import { FormTextField } from '@/shared/components/form/form-text-field';
import { PasswordField } from '@/shared/components/form/password-field';
import { toast } from '@/shared/components/feedback/toast-store';
import { Screen } from '@/shared/components/layout/screen';
import { Button, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { getErrorMessage } from '@/shared/lib/errors';

export default function LoginScreen() {
  const login = useLogin();
  const { control, handleSubmit } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = () =>
    void handleSubmit((values) =>
    login.mutate(values, {
      onSuccess: () => router.replace('/home'),
      onError: (error) => toast.error(getErrorMessage(error)),
    }),
  )();

  return (
    <Screen
      scroll
      keyboard
      contentClassName="px-7 pt-7"
      footer={
        <View className="gap-3.5 px-7 pt-3">
          <Button label={t.auth.login} block loading={login.isPending} onPress={onSubmit} />
          <View className="flex-row justify-center">
            <Text className="font-body text-[13.5px] text-text-secondary">{`${t.auth.noAccount} `}</Text>
            <Link href="/register" replace asChild>
              <Pressable accessibilityRole="link" hitSlop={8}>
                <Text className="font-bold text-[13.5px] text-primary">{t.auth.register}</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      }
    >
      <AuthHeader title={t.auth.loginTitle} description={t.auth.loginDescription} fallback="/welcome" />
      <View className="gap-[18px]">
        <FormTextField
          control={control}
          name="email"
          label={t.auth.email}
          placeholder={t.auth.emailPlaceholder}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
        />
        <View>
          <PasswordField
            control={control}
            name="password"
            label={t.auth.password}
            placeholder={t.auth.passwordPlaceholder}
            autoComplete="current-password"
            returnKeyType="go"
            onSubmitEditing={onSubmit}
          />
          <Link href="/forgot-password" asChild>
            <Pressable accessibilityRole="link" hitSlop={8} className="mt-2.5 self-end">
              <Text className="font-semibold text-[13px] text-primary">{t.auth.forgotPassword}</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </Screen>
  );
}

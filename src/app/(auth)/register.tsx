import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Pressable, View } from 'react-native';

import { AuthHeader } from '@/features/auth/components/auth-header';
import { useRegister } from '@/features/auth/hooks/use-auth-actions';
import { registerSchema, type RegisterValues } from '@/features/auth/schemas/auth-schemas';
import { toast } from '@/shared/components/feedback/toast-store';
import { FormTextField } from '@/shared/components/form/form-text-field';
import { PasswordField } from '@/shared/components/form/password-field';
import { Screen } from '@/shared/components/layout/screen';
import { Button, Checkbox, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { getErrorMessage } from '@/shared/lib/errors';

export default function RegisterScreen() {
  const register = useRegister();
  const { control, handleSubmit } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: { name: '', email: '', password: '', passwordConfirm: '', acceptTerms: false },
  });
  const acceptTerms = useWatch({ control, name: 'acceptTerms' });

  const onSubmit = () =>
    void handleSubmit((values) =>
    register.mutate(values, {
      onSuccess: () => {
        toast.success(t.auth.registerSuccess);
        router.replace('/home');
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    }),
  )();

  return (
    <Screen scroll keyboard contentClassName="px-7 pt-7">
      <AuthHeader title={t.auth.registerTitle} description={t.auth.registerDescription} fallback="/features" />
      <View className="gap-4">
        <FormTextField
          control={control}
          name="name"
          label={t.auth.fullName}
          placeholder={t.auth.fullNamePlaceholder}
          autoComplete="name"
          textContentType="name"
          autoCapitalize="words"
        />
        <FormTextField
          control={control}
          name="email"
          label={t.auth.email}
          placeholder={t.auth.emailPlaceholder}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <PasswordField
          control={control}
          name="password"
          label={t.auth.password}
          helper={t.auth.passwordHelper}
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <PasswordField
          control={control}
          name="passwordConfirm"
          label={t.auth.passwordConfirm}
          placeholder={t.auth.passwordConfirmPlaceholder}
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <Controller
          control={control}
          name="acceptTerms"
          render={({ field, fieldState }) => (
            <View className="mt-1">
              <Checkbox
                checked={field.value}
                onChange={field.onChange}
                error={!!fieldState.error}
                accessibilityLabel={`${t.auth.terms}${t.auth.and}${t.auth.privacy}${t.auth.termsSuffix}`}
              >
                <Text className="font-body text-[13px] leading-[20px] text-text-secondary">
                  <Text className="font-semibold text-[13px] text-primary" onPress={() => router.push('/legal/terms')}>
                    {t.auth.terms}
                  </Text>
                  {t.auth.and}
                  <Text className="font-semibold text-[13px] text-primary" onPress={() => router.push('/legal/privacy')}>
                    {t.auth.privacy}
                  </Text>
                  {t.auth.termsSuffix}
                </Text>
              </Checkbox>
              {fieldState.error ? (
                <Text className="mt-1.5 font-body text-[12.5px] text-danger-text">{fieldState.error.message}</Text>
              ) : null}
            </View>
          )}
        />
      </View>
      <View className="mt-7 gap-3.5">
        <Button label={t.auth.register} block disabled={!acceptTerms} loading={register.isPending} onPress={onSubmit} />
        <View className="flex-row justify-center">
          <Text className="font-body text-[13.5px] text-text-secondary">{`${t.auth.haveAccount} `}</Text>
          <Link href="/login" replace asChild>
            <Pressable accessibilityRole="link" hitSlop={8}>
              <Text className="font-bold text-[13.5px] text-primary">{t.auth.login}</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </Screen>
  );
}

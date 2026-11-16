import { Link, router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { BrandMark } from '@/features/auth/components/brand-mark';
import { WelcomeIllustration } from '@/features/auth/components/welcome-illustration';
import { Screen } from '@/shared/components/layout/screen';
import { Button, PageDots, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';

export default function WelcomeScreen() {
  return (
    <Screen contentClassName="px-7 pb-5 pt-10">
      <BrandMark />
      <View className="flex-1 items-center justify-center gap-7">
        <WelcomeIllustration />
        <View className="items-center gap-3">
          <Text accessibilityRole="header" className="text-center font-display text-[28px] leading-[35px]">
            {t.onboarding.welcomeTitle}
          </Text>
          <Text className="max-w-[280px] text-center font-body text-[15px] leading-[22px] text-text-secondary">
            {t.onboarding.welcomeDescription}
          </Text>
        </View>
      </View>
      <PageDots count={2} active={0} />
      <View className="mt-6 gap-3">
        <Button label={t.onboarding.start} block onPress={() => router.push('/features')} />
        <Link href="/login" asChild>
          <Pressable accessibilityRole="link" className="items-center p-1.5">
            <Text className="font-semibold text-[14px] text-text-secondary">{t.onboarding.haveAccount}</Text>
          </Pressable>
        </Link>
      </View>
    </Screen>
  );
}

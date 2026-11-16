import { Link, router } from 'expo-router';
import { ArrowLeft, FileText, ScanLine, ShieldCheck, Tag, type LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { useOnboardingStore } from '@/features/auth/stores/onboarding-store';
import { goBackOr } from '@/shared/components/layout/top-bar';
import { Screen } from '@/shared/components/layout/screen';
import { Button, Card, IconButton, PageDots, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { useTheme } from '@/shared/theme/theme-provider';

const ICONS: Record<(typeof t.onboarding.features)[number]['key'], LucideIcon> = {
  warranty: ShieldCheck,
  archive: FileText,
  scan: ScanLine,
  returns: Tag,
};

export default function FeaturesScreen() {
  const { colors } = useTheme();
  const complete = useOnboardingStore((state) => state.complete);

  return (
    <Screen
      scroll
      contentClassName="px-7 pt-7"
      footer={
        <View className="px-7">
          <PageDots count={2} active={1} />
          <View className="mt-5 gap-3">
            <Button
              label={t.onboarding.register}
              block
              onPress={() => {
                complete();
                router.push('/register');
              }}
            />
            <Link href="/login" asChild onPress={complete}>
              <Pressable accessibilityRole="link" className="items-center p-1.5">
                <Text className="font-semibold text-[14px] text-text-secondary">{t.onboarding.alreadyHaveAccount}</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      }
    >
      <IconButton icon={ArrowLeft} label={t.common.back} onPress={() => goBackOr('/welcome')} className="mb-4" />
      <Text accessibilityRole="header" className="mb-2 font-display text-[24px] leading-[30px]">
        {t.onboarding.featuresTitle}
      </Text>
      <Text className="mb-7 font-body text-[14.5px] leading-[21px] text-text-secondary">{t.onboarding.featuresDescription}</Text>
      <View className="gap-4 pb-5">
        {t.onboarding.features.map((feature) => {
          const Icon = ICONS[feature.key];
          return (
            <Card key={feature.key} className="flex-row items-start gap-3.5 p-[18px]">
              <View className="h-11 w-11 items-center justify-center rounded-[13px] bg-primary-tint">
                <Icon size={22} color={colors.primary} strokeWidth={2} />
              </View>
              <View className="flex-1">
                <Text className="mb-1 font-display-semibold text-[15.5px]">{feature.title}</Text>
                <Text className="font-body text-[13.5px] leading-[20px] text-text-secondary">{feature.description}</Text>
              </View>
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}

import { router } from 'expo-router';
import { View } from 'react-native';

import { env } from '@/config/env';
import { BrandMark } from '@/features/auth/components/brand-mark';
import { Screen } from '@/shared/components/layout/screen';
import { TopBar } from '@/shared/components/layout/top-bar';
import { Card, DetailRow, ListRow, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';

export default function AboutScreen() {
  const a = t.profile.about;
  return (
    <Screen scroll header={<TopBar title={a.title} />} contentClassName="gap-4 px-5 pb-8 pt-2">
      <Card className="items-center gap-3 p-6">
        <BrandMark />
        <Text className="text-center font-body text-[13.5px] leading-[20px] text-text-secondary">{a.description}</Text>
      </Card>
      <Card className="overflow-hidden">
        <DetailRow label={a.version} value={env.appVersion} />
        <DetailRow label={a.license} value={a.licenseValue} divider={false} />
      </Card>
      <Card className="overflow-hidden">
        <ListRow label={t.legal.termsTitle} divider onPress={() => router.push('/legal/terms')} />
        <ListRow label={t.legal.privacyTitle} onPress={() => router.push('/legal/privacy')} />
      </Card>
      <View className="items-center">
        <Text variant="caption">{a.copyright(new Date().getFullYear())}</Text>
      </View>
    </Screen>
  );
}

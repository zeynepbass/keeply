import { ShieldCheck } from 'lucide-react-native';
import { View } from 'react-native';

import { Screen } from '@/shared/components/layout/screen';
import { Badge, Button, Card, Chip, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { useTheme } from '@/shared/theme/theme-provider';

export default function Index() {
  const { colors } = useTheme();
  return (
    <Screen scroll contentClassName="gap-4 p-6">
      <View className="flex-row items-center gap-2.5">
        <View className="h-9 w-9 items-center justify-center rounded-[11px] bg-primary">
          <ShieldCheck size={20} color={colors['on-primary']} />
        </View>
        <Text className="font-display-extra text-[19px]">{t.brand.name}</Text>
      </View>
      <Card className="gap-3 p-4">
        <Text variant="h2">{t.brand.promise}</Text>
        <Badge label={t.warrantyStatus.activeLong} tone="success" />
        <Chip label={t.categories.electronics} selected />
      </Card>
      <Button label={t.onboarding.start} block />
    </Screen>
  );
}

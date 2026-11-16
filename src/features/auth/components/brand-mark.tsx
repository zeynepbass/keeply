import { ShieldCheck } from 'lucide-react-native';
import { View } from 'react-native';

import { Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { useTheme } from '@/shared/theme/theme-provider';

export function BrandMark() {
  const { colors } = useTheme();
  return (
    <View className="flex-row items-center gap-2.5" accessibilityRole="header" accessibilityLabel={t.brand.name}>
      <View className="h-9 w-9 items-center justify-center rounded-[11px] bg-primary">
        <ShieldCheck size={20} color={colors['on-primary']} strokeWidth={2} />
      </View>
      <Text className="font-display-extra text-[19px] text-text">{t.brand.name}</Text>
    </View>
  );
}

import { FileText, PackageOpen } from 'lucide-react-native';
import { View } from 'react-native';

import { elevatedShadow } from '@/shared/components/ui';
import { useTheme } from '@/shared/theme/theme-provider';

export function WelcomeIllustration() {
  const { colors } = useTheme();
  return (
    <View className="h-[180px] w-[220px]" importantForAccessibility="no-hide-descendants">
      <View className="absolute left-0 top-[30px] h-[110px] w-[140px] rounded-[20px] bg-primary-tint" style={{ transform: [{ rotate: '-6deg' }] }} />
      <View
        className="absolute right-0 top-0 h-[118px] w-[150px] items-center justify-center rounded-[20px] bg-surface"
        style={elevatedShadow}
      >
        <PackageOpen size={56} color={colors.primary} strokeWidth={1.8} />
      </View>
      <View
        className="absolute bottom-0 left-[30px] h-[70px] w-[92px] items-center justify-center rounded-md border-[1.5px] border-border bg-surface"
        style={{ shadowColor: '#202923', shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } }}
      >
        <FileText size={30} color={colors['warning-icon']} strokeWidth={2} />
      </View>
    </View>
  );
}

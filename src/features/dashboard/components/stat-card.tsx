import type { LucideIcon } from 'lucide-react-native';

import { PressableCard, Text } from '@/shared/components/ui';
import type { ColorToken } from '@/shared/theme/colors';
import { useTheme } from '@/shared/theme/theme-provider';

export interface StatCardProps {
  icon: LucideIcon;
  iconColor: ColorToken;
  value: number;
  label: string;
  onPress?: () => void;
}

export function StatCard({ icon: Icon, iconColor, value, label, onPress }: StatCardProps) {
  const { colors } = useTheme();
  return (
    <PressableCard
      onPress={onPress}
      disabled={!onPress}
      accessibilityLabel={`${label}: ${value}`}
      className="flex-1 p-4"
    >
      <Icon size={18} color={colors[iconColor]} strokeWidth={2} />
      <Text className="mt-2 font-display text-[22px] leading-[28px] text-text">{value}</Text>
      <Text className="font-body text-[12.5px] text-text-secondary">{label}</Text>
    </PressableCard>
  );
}

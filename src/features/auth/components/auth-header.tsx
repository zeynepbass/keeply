import { ArrowLeft } from 'lucide-react-native';
import { View } from 'react-native';

import { goBackOr } from '@/shared/components/layout/top-bar';
import { IconButton, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';

export interface AuthHeaderProps {
  title: string;
  description: string;
  fallback: Parameters<typeof goBackOr>[0];
}

export function AuthHeader({ title, description, fallback }: AuthHeaderProps) {
  return (
    <View>
      <IconButton icon={ArrowLeft} label={t.common.back} onPress={() => goBackOr(fallback)} className="mb-7" />
      <Text accessibilityRole="header" className="mb-1.5 font-display text-[26px] leading-[32px]">
        {title}
      </Text>
      <Text className="mb-7 font-body text-[14.5px] leading-[21px] text-text-secondary">{description}</Text>
    </View>
  );
}

import { ArrowLeft, X } from 'lucide-react-native';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { IconButton } from '@/shared/components/ui/icon-button';
import { Text } from '@/shared/components/ui/text';
import { t } from '@/shared/i18n';
import { cn } from '@/shared/lib/cn';

export interface TopBarProps {
  title?: string;
  onBack?: () => void;
  backIcon?: 'arrow' | 'close';
  right?: ReactNode;
  className?: string;
  hideBack?: boolean;
}

export function goBackOr(fallback: Parameters<typeof router.replace>[0]) {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback);
  }
}

export function TopBar({ title, onBack, backIcon = 'arrow', right, className, hideBack = false }: TopBarProps) {
  const handleBack = onBack ?? (() => goBackOr('/'));
  return (
    <View className={cn('flex-row items-center justify-between gap-3 px-5 pb-3 pt-5', className)}>
      {hideBack ? (
        <View className="w-[38px]" />
      ) : (
        <IconButton icon={backIcon === 'close' ? X : ArrowLeft} label={backIcon === 'close' ? t.common.close : t.common.back} onPress={handleBack} />
      )}
      {title ? (
        <Text accessibilityRole="header" numberOfLines={1} className="flex-1 text-center font-display text-[19px]">
          {title}
        </Text>
      ) : (
        <View className="flex-1" />
      )}
      {right ?? <View className="w-[38px]" />}
    </View>
  );
}

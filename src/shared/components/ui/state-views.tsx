import { RefreshCw, TriangleAlert } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';

import { t } from '@/shared/i18n';
import { getErrorMessage } from '@/shared/lib/errors';
import { useTheme } from '@/shared/theme/theme-provider';

import { Button } from './button';
import { Text } from './text';

export function LoadingState({ label = t.common.loading }: { label?: string }) {
  const { colors } = useTheme();
  return (
    <View className="flex-1 items-center justify-center gap-3 py-10" accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator color={colors.primary} />
      <Text variant="secondary">{label}</Text>
    </View>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { colors } = useTheme();
  return (
    <View className="flex-1 items-center justify-center gap-4 px-10 py-10" accessibilityLiveRegion="polite">
      <View className="h-[68px] w-[68px] items-center justify-center rounded-full bg-danger-bg">
        <TriangleAlert size={28} color={colors['danger-icon']} strokeWidth={2} />
      </View>
      <View className="items-center gap-1">
        <Text className="font-display text-[16px]">{t.common.errorTitle}</Text>
        <Text variant="secondary" className="text-center">
          {getErrorMessage(error)}
        </Text>
      </View>
      {onRetry ? <Button label={t.common.retry} icon={RefreshCw} size="sm" variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

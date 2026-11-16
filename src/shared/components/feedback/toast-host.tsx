import { CircleAlert, CircleCheck, Info } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/shared/components/ui/text';
import { t } from '@/shared/i18n';
import { useTheme } from '@/shared/theme/theme-provider';

import { useToastStore } from './toast-store';

const DURATION_MS = 3200;

export function ToastHost() {
  const current = useToastStore((state) => state.current);
  const hide = useToastStore((state) => state.hide);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  useEffect(() => {
    if (!current) {
      return;
    }
    const timer = setTimeout(hide, current.tone === 'error' ? DURATION_MS + 1500 : DURATION_MS);
    return () => clearTimeout(timer);
  }, [current, hide]);

  if (!current) {
    return null;
  }

  const config = {
    success: { Icon: CircleCheck, bg: colors['success-bg'], fg: colors['success-text'] },
    error: { Icon: CircleAlert, bg: colors['danger-bg'], fg: colors['danger-text'] },
    info: { Icon: Info, bg: colors['neutral-bg'], fg: colors['neutral-text'] },
  }[current.tone];

  return (
    <View pointerEvents="box-none" className="absolute left-0 right-0 z-50 px-4" style={{ top: insets.top + 8 }}>
      <Animated.View key={current.id} entering={FadeInUp.duration(220)} exiting={FadeOutUp.duration(180)}>
        <Pressable
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          accessibilityLabel={current.message}
          accessibilityHint={t.toast.dismiss}
          onPress={hide}
          className="flex-row items-center gap-3 rounded-md px-4 py-3.5"
          style={{
            backgroundColor: config.bg,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: '#176B50',
            shadowOpacity: 0.12,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 8 },
            elevation: 6,
          }}
        >
          <config.Icon size={20} color={config.fg} strokeWidth={2.2} />
          <Text className="flex-1 font-semibold text-[13.5px]" style={{ color: config.fg }}>
            {current.message}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

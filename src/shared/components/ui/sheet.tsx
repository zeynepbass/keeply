import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

import { t } from '@/shared/i18n';
import { useTheme } from '@/shared/theme/theme-provider';

import { IconButton } from './icon-button';
import { Text } from './text';

export interface SheetProps extends PropsWithChildren {
  visible: boolean;
  title: string;
  onClose: () => void;
  footer?: React.ReactNode;
  scrollable?: boolean;
}

export function Sheet({ visible, title, onClose, children, footer, scrollable = false }: SheetProps) {
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const Body = scrollable ? ScrollView : View;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-end">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t.common.close}
          onPress={onClose}
          className="absolute inset-0"
          style={{ backgroundColor: colors.overlay }}
        />
        <View
          className="max-h-[88%] rounded-t-lg px-6 pt-3.5"
          style={{
            backgroundColor: colors.surface,
            paddingBottom: Math.max(insets.bottom, 16) + 8,
            shadowColor: '#000',
            shadowOpacity: scheme === 'dark' ? 0.4 : 0.12,
            shadowRadius: 30,
            shadowOffset: { width: 0, height: -10 },
            elevation: 16,
          }}
          accessibilityViewIsModal
        >
          <View className="mb-[18px] h-1 w-10 self-center rounded bg-border-strong" />
          <View className="mb-5 flex-row items-center justify-between">
            <Text accessibilityRole="header" className="font-display text-[19px]">
              {title}
            </Text>
            <IconButton icon={X} label={t.common.close} onPress={onClose} />
          </View>
          <Body keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
          </Body>
          {footer ? <View className="pt-4">{footer}</View> : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

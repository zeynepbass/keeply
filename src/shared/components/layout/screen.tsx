import type { PropsWithChildren, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/shared/lib/cn';

export const MODAL_EDGES = { top: Platform.OS !== 'ios', bottom: true };

export interface ScreenProps extends PropsWithChildren {
  scroll?: boolean;
  keyboard?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
  edges?: { top?: boolean; bottom?: boolean };
  refreshControl?: ScrollViewProps['refreshControl'];
}

export function Screen({
  children,
  scroll = false,
  keyboard = false,
  header,
  footer,
  className,
  contentClassName,
  edges = { top: true, bottom: true },
  refreshControl,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const paddingTop = edges.top ? insets.top : 0;
  const paddingBottom = edges.bottom ? Math.max(insets.bottom, 16) : 0;

  const body = scroll ? (
    <ScrollView
      className="flex-1"
      contentContainerClassName={cn('flex-grow', contentClassName)}
      contentContainerStyle={footer ? undefined : { paddingBottom }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  ) : (
    <View className={cn('flex-1', contentClassName)} style={footer ? undefined : { paddingBottom }}>
      {children}
    </View>
  );

  const content = (
    <View className={cn('flex-1 bg-bg', className)} style={{ paddingTop }}>
      {header}
      {body}
      {footer ? <View style={{ paddingBottom }}>{footer}</View> : null}
    </View>
  );

  if (!keyboard) {
    return content;
  }
  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {content}
    </KeyboardAvoidingView>
  );
}

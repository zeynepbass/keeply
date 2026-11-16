import { AlertCircle } from 'lucide-react-native';
import { useState, type ComponentRef, type ReactNode, type Ref } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { useTheme } from '@/shared/theme/theme-provider';

import { Text } from './text';

export interface TextFieldProps extends Omit<TextInputProps, 'ref'> {
  ref?: Ref<ComponentRef<typeof TextInput>>;
  label?: string;
  labelSuffix?: string;
  helper?: string;
  error?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  containerClassName?: string;
}

export function TextField({
  ref,
  label,
  labelSuffix,
  helper,
  error,
  leading,
  trailing,
  containerClassName,
  multiline,
  onFocus,
  onBlur,
  editable = true,
  ...props
}: TextFieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View className={containerClassName}>
      {label ? (
        <Text variant="label" className="mb-1.5">
          {label}
          {labelSuffix ? <Text className="font-body text-[13px] text-text-secondary">{` ${labelSuffix}`}</Text> : null}
        </Text>
      ) : null}
      <View
        className={cn(
          'flex-row items-center rounded-xs border-[1.5px] bg-surface',
          multiline ? 'min-h-[96px] items-start py-3' : 'h-[52px]',
          error ? 'border-danger-icon bg-danger-input' : focused ? 'border-primary' : 'border-border',
          !editable && 'opacity-50',
        )}
      >
        {leading ? <View className="pl-3.5">{leading}</View> : null}
        <TextInput
          ref={ref}
          accessibilityLabel={props.accessibilityLabel ?? label}
          accessibilityHint={error ?? helper}
          placeholderTextColor={colors.placeholder}
          selectionColor={colors.primary}
          editable={editable}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          maxFontSizeMultiplier={1.4}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          className={cn(
            'flex-1 font-body text-[15px] text-text',
            leading ? 'pl-2.5' : 'pl-4',
            trailing ? 'pr-2' : 'pr-4',
            multiline && 'min-h-[72px]',
          )}
          {...props}
        />
        {trailing ? <View className="pr-3.5">{trailing}</View> : null}
      </View>
      {error ? (
        <View className="mt-1.5 flex-row items-center gap-1" accessibilityLiveRegion="polite">
          <AlertCircle size={13} color={colors['danger-text']} strokeWidth={2.4} />
          <Text className="flex-1 font-body text-[12.5px] text-danger-text">{error}</Text>
        </View>
      ) : helper ? (
        <Text className="mt-1.5 font-body text-[12.5px] text-text-secondary">{helper}</Text>
      ) : null}
    </View>
  );
}

import { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { cn } from '@/shared/lib/cn';

export interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label: string;
  disabled?: boolean;
}

export function Switch({ value, onValueChange, label, disabled = false }: SwitchProps) {
  const offset = useSharedValue(value ? 21 : 3);

  useEffect(() => {
    offset.value = withTiming(value ? 21 : 3, { duration: 160 });
  }, [value, offset]);

  const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={() => onValueChange(!value)}
      className={cn('h-[26px] w-11 justify-center rounded-[14px]', value ? 'bg-primary' : 'bg-border-strong', disabled && 'opacity-40')}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: 0,
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#FFFFFF',
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 1,
            shadowOffset: { width: 0, height: 1 },
            elevation: 1,
          },
          knobStyle,
        ]}
      />
    </Pressable>
  );
}

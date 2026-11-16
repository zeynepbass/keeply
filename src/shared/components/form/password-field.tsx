import { Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable } from 'react-native';
import type { FieldValues } from 'react-hook-form';

import { t } from '@/shared/i18n';
import { useTheme } from '@/shared/theme/theme-provider';

import { FormTextField, type FormTextFieldProps } from './form-text-field';

export function PasswordField<T extends FieldValues>(props: FormTextFieldProps<T>) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  return (
    <FormTextField
      {...props}
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoCorrect={false}
      textContentType="password"
      trailing={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? t.auth.hidePassword : t.auth.showPassword}
          hitSlop={10}
          onPress={() => setVisible((value) => !value)}
        >
          {visible ? (
            <EyeOff size={20} color={colors['text-secondary']} strokeWidth={2} />
          ) : (
            <Eye size={20} color={colors['text-secondary']} strokeWidth={2} />
          )}
        </Pressable>
      }
    />
  );
}

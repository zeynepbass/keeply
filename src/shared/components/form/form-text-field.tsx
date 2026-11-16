import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

import { TextField, type TextFieldProps } from '@/shared/components/ui/text-field';

export interface FormTextFieldProps<T extends FieldValues> extends Omit<TextFieldProps, 'value' | 'onChangeText' | 'error'> {
  control: Control<T>;
  name: FieldPath<T>;
}

export function FormTextField<T extends FieldValues>({ control, name, onBlur, ...props }: FormTextFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          {...props}
          ref={field.ref}
          value={field.value === null || field.value === undefined ? '' : String(field.value)}
          onChangeText={field.onChange}
          onBlur={(event) => {
            field.onBlur();
            onBlur?.(event);
          }}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}

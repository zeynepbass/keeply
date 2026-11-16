import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

import { t } from '@/shared/i18n';
import { cn } from '@/shared/lib/cn';
import { useTheme } from '@/shared/theme/theme-provider';
import { formatDateNumeric, isoToLocalDate, toIsoDate, type IsoDate } from '@/shared/utils/date';

import { Button } from './button';
import { Sheet } from './sheet';
import { Text } from './text';

export interface DateFieldProps {
  label: string;
  value: IsoDate | null;
  onChange: (value: IsoDate) => void;
  error?: string;
  helper?: string;
  minimumDate?: IsoDate;
  maximumDate?: IsoDate;
  placeholder?: string;
}

export function DateField({ label, value, onChange, error, helper, minimumDate, maximumDate, placeholder = t.common.selectDate }: DateFieldProps) {
  const { colors, scheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(value ? isoToLocalDate(value) : new Date());
  const minDate = minimumDate ? isoToLocalDate(minimumDate) : undefined;
  const maxDate = maximumDate ? isoToLocalDate(maximumDate) : undefined;

  const openPicker = () => {
    const initial = value ? isoToLocalDate(value) : new Date();
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: initial,
        mode: 'date',
        minimumDate: minDate,
        maximumDate: maxDate,
        onValueChange: (_event, date) => onChange(toIsoDate(date)),
      });
      return;
    }
    setDraft(initial);
    setOpen(true);
  };

  return (
    <View>
      <Text variant="label" className="mb-1.5">
        {label}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value ? formatDateNumeric(value) : placeholder}`}
        accessibilityHint={error ?? helper}
        onPress={openPicker}
        className={cn(
          'h-[52px] flex-row items-center justify-between rounded-xs border-[1.5px] bg-surface px-4',
          error ? 'border-danger-icon bg-danger-input' : 'border-border',
        )}
      >
        <Text className={cn('font-body text-[15px]', value ? 'text-text' : 'text-placeholder')}>
          {value ? formatDateNumeric(value) : placeholder}
        </Text>
        <Calendar size={18} color={colors['text-secondary']} strokeWidth={2} />
      </Pressable>
      {error ? (
        <Text className="mt-1.5 font-body text-[12.5px] text-danger-text">{error}</Text>
      ) : helper ? (
        <Text className="mt-1.5 font-body text-[12.5px] text-text-secondary">{helper}</Text>
      ) : null}
      {Platform.OS === 'ios' ? (
        <Sheet
          visible={open}
          title={label}
          onClose={() => setOpen(false)}
          footer={
            <Button
              label={t.common.done}
              block
              onPress={() => {
                onChange(toIsoDate(draft));
                setOpen(false);
              }}
            />
          }
        >
          <DateTimePicker
            value={draft}
            mode="date"
            display="inline"
            locale="tr-TR"
            accentColor={colors.primary}
            themeVariant={scheme}
            minimumDate={minDate}
            maximumDate={maxDate}
            onValueChange={(_event, date) => setDraft(date)}
          />
        </Sheet>
      ) : null}
    </View>
  );
}

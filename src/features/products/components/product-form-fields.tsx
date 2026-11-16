import { Controller, useWatch, type Control, type UseFormSetValue } from 'react-hook-form';
import { View } from 'react-native';

import { calculateDefaultReturnDeadline, DEFAULT_RETURN_WINDOW_DAYS } from '@/features/returns/services/return-calculator';
import { calculateWarrantyEndDate } from '@/features/warranties/services/warranty-calculator';
import { FormTextField } from '@/shared/components/form/form-text-field';
import { Card, Chip, DateField, SegmentedControl, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { differenceInDays, formatDateNumeric, isIsoDate, today } from '@/shared/utils/date';

import { CATEGORY_OPTIONS } from '../constants/categories';
import { getWarrantyMonths, type ProductFormValues } from '../schemas/product-schema';

interface FieldsProps {
  control: Control<ProductFormValues>;
}

export function ProductInfoFields({ control }: FieldsProps) {
  return (
    <View className="gap-4">
      <FormTextField control={control} name="name" label={t.addProduct.info.name} placeholder={t.addProduct.info.namePlaceholder} autoCapitalize="words" />
      <FormTextField control={control} name="brand" label={t.addProduct.info.brand} placeholder={t.addProduct.info.brandPlaceholder} autoCapitalize="words" />
      <Controller
        control={control}
        name="category"
        render={({ field, fieldState }) => (
          <View>
            <Text variant="label" className="mb-1.5">
              {t.addProduct.info.category}
            </Text>
            <View className="flex-row flex-wrap gap-2" accessibilityRole="radiogroup">
              {CATEGORY_OPTIONS.map((option) => (
                <Chip key={option.value} label={option.label} selected={field.value === option.value} onPress={() => field.onChange(option.value)} />
              ))}
            </View>
            {fieldState.error ? <Text className="mt-1.5 font-body text-[12.5px] text-danger-text">{fieldState.error.message}</Text> : null}
          </View>
        )}
      />
      <FormTextField
        control={control}
        name="model"
        label={t.addProduct.info.model}
        labelSuffix={t.common.optional}
        placeholder={t.addProduct.info.modelPlaceholder}
        autoCapitalize="characters"
        autoCorrect={false}
      />
    </View>
  );
}

export function ProductPurchaseFields({ control, setValue, syncDates = true }: FieldsProps & { setValue: UseFormSetValue<ProductFormValues>; syncDates?: boolean }) {
  return (
    <View className="gap-4">
      <Controller
        control={control}
        name="purchaseDate"
        render={({ field, fieldState }) => (
          <DateField
            label={t.addProduct.purchase.date}
            value={isIsoDate(field.value) ? field.value : null}
            maximumDate={today()}
            error={fieldState.error?.message}
            onChange={(value) => {
              field.onChange(value);
              if (syncDates) {
                setValue('warrantyStartDate', value);
                setValue('returnDeadline', calculateDefaultReturnDeadline(value));
              }
            }}
          />
        )}
      />
      <FormTextField
        control={control}
        name="priceText"
        label={t.addProduct.purchase.price}
        labelSuffix={t.common.optional}
        placeholder={t.addProduct.purchase.pricePlaceholder}
        keyboardType="decimal-pad"
        leading={<Text className="font-semibold text-[15px] text-text-secondary">₺</Text>}
      />
      <FormTextField control={control} name="storeName" label={t.addProduct.purchase.store} placeholder={t.addProduct.purchase.storePlaceholder} autoCapitalize="words" />
      <Controller
        control={control}
        name="salesChannel"
        render={({ field }) => (
          <View>
            <Text variant="label" className="mb-1.5">
              {t.addProduct.purchase.channel}
            </Text>
            <View className="flex-row gap-2">
              <Chip label={t.products.detail.channels.in_store} selected={field.value === 'in_store'} onPress={() => field.onChange('in_store')} />
              <Chip label={t.products.detail.channels.online} selected={field.value === 'online'} onPress={() => field.onChange('online')} />
            </View>
          </View>
        )}
      />
      <FormTextField
        control={control}
        name="notes"
        label={t.addProduct.purchase.notes}
        labelSuffix={t.common.optional}
        placeholder={t.addProduct.purchase.notesPlaceholder}
        multiline
      />
    </View>
  );
}

const PRESET_OPTIONS = [
  { value: '12', label: t.addProduct.warranty.oneYear },
  { value: '24', label: t.addProduct.warranty.twoYears },
  { value: '36', label: t.addProduct.warranty.threeYears },
  { value: 'custom', label: t.addProduct.warranty.custom },
] as const;

export function ProductWarrantyFields({ control }: FieldsProps) {
  const values = useWatch({ control });
  const months = getWarrantyMonths({
    hasWarranty: values.hasWarranty ?? false,
    warrantyPreset: values.warrantyPreset ?? '24',
    customMonths: values.customMonths ?? '',
  });
  const endDate = values.warrantyStartDate && isIsoDate(values.warrantyStartDate) && months ? calculateWarrantyEndDate(values.warrantyStartDate, months) : null;
  const returnWindow =
    values.purchaseDate && values.returnDeadline && isIsoDate(values.purchaseDate) && isIsoDate(values.returnDeadline)
      ? differenceInDays(values.returnDeadline, values.purchaseDate)
      : DEFAULT_RETURN_WINDOW_DAYS;

  return (
    <View className="gap-[18px]">
      <Controller
        control={control}
        name="hasWarranty"
        render={({ field }) => (
          <View>
            <Text variant="label" className="mb-1.5">
              {t.addProduct.warranty.hasWarranty}
            </Text>
            <SegmentedControl
              accessibilityLabel={t.addProduct.warranty.hasWarranty}
              value={field.value ? 'yes' : 'no'}
              onChange={(value) => field.onChange(value === 'yes')}
              options={[
                { value: 'yes', label: t.common.yes },
                { value: 'no', label: t.common.no },
              ]}
            />
          </View>
        )}
      />
      {values.hasWarranty ? (
        <>
          <Controller
            control={control}
            name="warrantyPreset"
            render={({ field }) => (
              <View>
                <Text variant="label" className="mb-1.5">
                  {t.addProduct.warranty.duration}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {PRESET_OPTIONS.map((option) => (
                    <Chip key={option.value} label={option.label} selected={field.value === option.value} onPress={() => field.onChange(option.value)} />
                  ))}
                </View>
              </View>
            )}
          />
          {values.warrantyPreset === 'custom' ? (
            <FormTextField
              control={control}
              name="customMonths"
              label={t.addProduct.warranty.customMonths}
              placeholder={t.addProduct.warranty.customPlaceholder}
              keyboardType="number-pad"
              maxLength={3}
            />
          ) : null}
          <Controller
            control={control}
            name="warrantyStartDate"
            render={({ field, fieldState }) => (
              <DateField
                label={t.addProduct.warranty.startDate}
                value={isIsoDate(field.value) ? field.value : null}
                error={fieldState.error?.message}
                onChange={field.onChange}
              />
            )}
          />
          {endDate ? (
            <Card flat className="flex-row justify-between rounded-sm bg-primary-tint px-4 py-3.5">
              <Text className="font-semibold text-[13.5px] text-primary-dark">{t.addProduct.warranty.endDate}</Text>
              <Text className="font-bold text-[13.5px] text-primary-dark">{formatDateNumeric(endDate)}</Text>
            </Card>
          ) : null}
        </>
      ) : null}
      <Controller
        control={control}
        name="hasReturn"
        render={({ field }) => (
          <View className="flex-row flex-wrap gap-2">
            <Chip label={t.addProduct.warranty.returnDeadline} selected={field.value} onPress={() => field.onChange(true)} />
            <Chip label={t.addProduct.warranty.noReturn} selected={!field.value} onPress={() => field.onChange(false)} />
          </View>
        )}
      />
      {values.hasReturn ? (
        <Controller
          control={control}
          name="returnDeadline"
          render={({ field, fieldState }) => (
            <DateField
              label={t.addProduct.warranty.returnDeadline}
              value={isIsoDate(field.value) ? field.value : null}
              minimumDate={values.purchaseDate && isIsoDate(values.purchaseDate) ? values.purchaseDate : undefined}
              error={fieldState.error?.message}
              helper={returnWindow >= 0 ? t.addProduct.warranty.returnHelper(returnWindow) : undefined}
              onChange={field.onChange}
            />
          )}
        />
      ) : null}
    </View>
  );
}

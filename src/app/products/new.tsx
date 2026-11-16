import { zodResolver } from '@hookform/resolvers/zod';
import { router, useFocusEffect } from 'expo-router';
import { CircleCheck } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, BackHandler, Pressable, View } from 'react-native';

import { ImagePickerPanel } from '@/features/products/components/image-picker-panel';
import { ProductAvatar } from '@/features/products/components/product-avatar';
import { ProductInfoFields, ProductPurchaseFields, ProductWarrantyFields } from '@/features/products/components/product-form-fields';
import { ReceiptStep, type PendingAttachment } from '@/features/products/components/receipt-step';
import { StepHeader, StepTitle } from '@/features/products/components/step-header';
import { useAddProduct, type AddProductResult } from '@/features/products/hooks/use-add-product';
import { createEmptyProductForm, PRODUCT_FORM_STEPS, productFormSchema, type ProductFormValues } from '@/features/products/schemas/product-schema';
import { getProductTitle } from '@/features/products/services/product-display';
import { WarrantyBadge } from '@/features/warranties/components/warranty-badge';
import { toast } from '@/shared/components/feedback/toast-store';
import { Screen } from '@/shared/components/layout/screen';
import { Button, Card, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { getErrorMessage } from '@/shared/lib/errors';
import { mediaPicker } from '@/shared/services/media-picker';
import { useTheme } from '@/shared/theme/theme-provider';
import { formatDate } from '@/shared/utils/date';

const TOTAL_STEPS = 6;
const STEP_FIELDS = [PRODUCT_FORM_STEPS.image, PRODUCT_FORM_STEPS.info, PRODUCT_FORM_STEPS.purchase, PRODUCT_FORM_STEPS.warranty];

export default function AddProductScreen() {
  const { colors } = useTheme();
  const [step, setStep] = useState(1);
  const [attachment, setAttachment] = useState<PendingAttachment | null>(null);
  const [result, setResult] = useState<AddProductResult | null>(null);
  const addProduct = useAddProduct();
  const { control, trigger, setValue, getValues, reset, formState } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    mode: 'onTouched',
    defaultValues: createEmptyProductForm(),
  });

  const close = useCallback(() => {
    if (!formState.isDirty && !attachment) {
      router.back();
      return;
    }
    Alert.alert(t.addProduct.leaveTitle, t.addProduct.leaveMessage, [
      { text: t.addProduct.leaveCancel, style: 'cancel' },
      { text: t.addProduct.leaveConfirm, style: 'destructive', onPress: () => router.back() },
    ]);
  }, [formState.isDirty, attachment]);

  const goBack = useCallback(() => {
    if (step === 1) {
      close();
    } else if (step < TOTAL_STEPS) {
      setStep((value) => value - 1);
    }
  }, [step, close]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (step === TOTAL_STEPS) {
          return false;
        }
        goBack();
        return true;
      });
      return () => subscription.remove();
    }, [goBack, step]),
  );

  const save = () => {
    addProduct.mutate(
      { values: getValues(), attachment },
      {
        onSuccess: (outcome) => {
          setResult(outcome);
          setStep(TOTAL_STEPS);
          if (outcome.attachmentError) {
            toast.error(outcome.attachmentError);
          }
        },
        onError: (error) => toast.error(getErrorMessage(error) || t.addProduct.saveFailed),
      },
    );
  };

  const next = async () => {
    if (step <= STEP_FIELDS.length) {
      const valid = await trigger([...STEP_FIELDS[step - 1]]);
      if (!valid) {
        return;
      }
      setStep((value) => value + 1);
      return;
    }
    save();
  };

  const scanReceipt = async () => {
    try {
      const file = await mediaPicker.takePhoto();
      if (file) {
        setAttachment({ file, type: attachment?.type ?? 'receipt' });
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const restart = () => {
    reset(createEmptyProductForm());
    setAttachment(null);
    setResult(null);
    setStep(1);
  };

  if (step === TOTAL_STEPS && result) {
    return (
      <Screen contentClassName="items-center px-7 pt-[60px]">
        <View className="mb-[22px] h-[84px] w-[84px] items-center justify-center rounded-full bg-primary-tint">
          <CircleCheck size={40} color={colors.primary} strokeWidth={2} />
        </View>
        <Text accessibilityRole="header" className="mb-2 text-center font-display text-[22px]">
          {t.addProduct.confirmation.title}
        </Text>
        <Text className="mb-7 max-w-[280px] text-center font-body text-[14px] leading-[21px] text-text-secondary">
          {t.addProduct.confirmation.description}
        </Text>
        <Card className="mb-3 w-full flex-row items-center gap-3 p-4">
          <ProductAvatar product={result.product} size={48} />
          <View className="min-w-0 flex-1">
            <Text numberOfLines={1} className="font-bold text-[14px]">
              {getProductTitle(result.product)}
            </Text>
            <Text variant="caption">{`${result.product.storeName} · ${formatDate(result.product.purchaseDate)}`}</Text>
          </View>
          <WarrantyBadge product={result.product} />
        </Card>
        <View className="flex-1" />
        <View className="w-full gap-3">
          <Button label={t.addProduct.confirmation.goHome} block onPress={() => router.dismissTo('/home')} />
          <Button label={t.addProduct.confirmation.addAnother} variant="ghost" block onPress={restart} />
        </View>
      </Screen>
    );
  }

  const steps: Record<number, { title: string; description: string; body: React.ReactNode; skippable?: boolean; scroll: boolean }> = {
    1: {
      title: t.addProduct.image.title,
      description: t.addProduct.image.description,
      skippable: true,
      scroll: false,
      body: <Controller control={control} name="imageUri" render={({ field }) => <ImagePickerPanel value={field.value} onChange={field.onChange} />} />,
    },
    2: { title: t.addProduct.info.title, description: t.addProduct.info.description, scroll: true, body: <ProductInfoFields control={control} /> },
    3: {
      title: t.addProduct.purchase.title,
      description: t.addProduct.purchase.description,
      scroll: true,
      body: <ProductPurchaseFields control={control} setValue={setValue} />,
    },
    4: { title: t.addProduct.warranty.title, description: t.addProduct.warranty.description, scroll: true, body: <ProductWarrantyFields control={control} /> },
    5: {
      title: t.addProduct.receipt.title,
      description: t.addProduct.receipt.description,
      skippable: true,
      scroll: true,
      body: <ReceiptStep value={attachment} onChange={setAttachment} onScan={scanReceipt} />,
    },
  };
  const current = steps[step];

  return (
    <Screen
      scroll={current.scroll}
      keyboard
      contentClassName="px-6 pt-6"
      footer={
        <View className="px-6 pt-2">
          {current.skippable ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                if (step === 1) {
                  setValue('imageUri', null);
                  setStep(2);
                } else {
                  setAttachment(null);
                  save();
                }
              }}
              className="mb-[18px] items-center"
            >
              <Text className="font-semibold text-[13.5px] text-text-secondary">{t.common.skipForNow}</Text>
            </Pressable>
          ) : null}
          <Button label={t.common.next} block loading={addProduct.isPending} onPress={next} />
        </View>
      }
    >
      <StepHeader step={step} total={TOTAL_STEPS} onBack={goBack} />
      <StepTitle title={current.title} description={current.description} />
      {current.body}
    </Screen>
  );
}

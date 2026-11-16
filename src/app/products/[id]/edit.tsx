import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { ImagePickerPanel } from '@/features/products/components/image-picker-panel';
import { ProductInfoFields, ProductPurchaseFields, ProductWarrantyFields } from '@/features/products/components/product-form-fields';
import { useProduct, useUpdateProduct } from '@/features/products/hooks/use-products';
import { fromProduct, productFormSchema, toProductInput, type ProductFormValues } from '@/features/products/schemas/product-schema';
import type { Product } from '@/features/products/types';
import { toast } from '@/shared/components/feedback/toast-store';
import { Screen } from '@/shared/components/layout/screen';
import { TopBar } from '@/shared/components/layout/top-bar';
import { Button, ErrorState, LoadingState, SectionLabel } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { getErrorMessage } from '@/shared/lib/errors';

function EditProductForm({ product }: { product: Product }) {
  const update = useUpdateProduct(product.id);
  const { control, handleSubmit, setValue } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    mode: 'onTouched',
    defaultValues: fromProduct(product),
  });

  const submit = () =>
    void handleSubmit((values) =>
      update.mutate(toProductInput(values), {
        onSuccess: () => {
          toast.success(t.products.edit.saved);
          router.back();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      }),
    )();

  return (
    <Screen
      scroll
      keyboard
      header={<TopBar title={t.products.edit.title} backIcon="close" />}
      contentClassName="px-5 pb-6"
      footer={
        <View className="px-5 pt-3">
          <Button label={t.common.saveChanges} block loading={update.isPending} onPress={submit} />
        </View>
      }
    >
      <SectionLabel title={t.products.edit.image} className="mt-1" />
      <Controller control={control} name="imageUri" render={({ field }) => <ImagePickerPanel compact value={field.value} onChange={field.onChange} />} />
      <SectionLabel title={t.addProduct.info.title} className="mt-6" />
      <ProductInfoFields control={control} />
      <SectionLabel title={t.addProduct.purchase.title} className="mt-6" />
      <ProductPurchaseFields control={control} setValue={setValue} syncDates={false} />
      <SectionLabel title={t.addProduct.warranty.title} className="mt-6" />
      <ProductWarrantyFields control={control} />
    </Screen>
  );
}

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = useProduct(id);
  if (product.isPending) {
    return (
      <Screen header={<TopBar title={t.products.edit.title} backIcon="close" />}>
        <LoadingState />
      </Screen>
    );
  }
  if (product.isError || !product.data) {
    return (
      <Screen header={<TopBar title={t.products.edit.title} backIcon="close" />}>
        <ErrorState error={product.error} onRetry={() => product.refetch()} />
      </Screen>
    );
  }
  return <EditProductForm product={product.data} />;
}

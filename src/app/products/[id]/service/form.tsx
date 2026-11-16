import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { Paperclip, Trash2, X } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, View } from 'react-native';

import { AttachDocumentSheet } from '@/features/documents/components/attach-document-sheet';
import { DocumentRow } from '@/features/documents/components/document-row';
import { useDeleteDocument, useDocuments } from '@/features/documents/hooks/use-documents';
import { validatePickedFile } from '@/features/documents/services/document-rules';
import type { PickedFile } from '@/features/documents/types';
import { useProduct } from '@/features/products/hooks/use-products';
import { getProductTitle } from '@/features/products/services/product-display';
import { useDeleteServiceRecord, useSaveServiceRecord, useServiceRecords } from '@/features/service-history/hooks/use-service-records';
import {
  emptyServiceRecordForm,
  serviceRecordSchema,
  serviceRecordToForm,
  toServiceRecordInput,
  type ServiceRecordFormValues,
} from '@/features/service-history/schemas/service-record-schema';
import { toast } from '@/shared/components/feedback/toast-store';
import { FormTextField } from '@/shared/components/form/form-text-field';
import { MODAL_EDGES, Screen } from '@/shared/components/layout/screen';
import { TopBar } from '@/shared/components/layout/top-bar';
import { Button, DateField, IconButton, LoadingState, Text } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { getErrorMessage } from '@/shared/lib/errors';
import { useTheme } from '@/shared/theme/theme-provider';
import { isIsoDate, today } from '@/shared/utils/date';
import { formatFileSize } from '@/shared/utils/format';

export default function ServiceRecordFormScreen() {
  const { id, recordId } = useLocalSearchParams<{ id: string; recordId?: string }>();
  const records = useServiceRecords(id);
  const product = useProduct(id);
  if (records.isPending || product.isPending) {
    return (
      <Screen edges={MODAL_EDGES} header={<TopBar title={recordId ? t.service.editTitle : t.service.newTitle} backIcon="close" />}>
        <LoadingState />
      </Screen>
    );
  }
  const record = recordId ? (records.data?.find((item) => item.id === recordId) ?? null) : null;
  return (
    <ServiceRecordForm
      key={record?.id ?? 'new'}
      productId={id}
      productTitle={product.data ? getProductTitle(product.data) : ''}
      recordId={record?.id ?? null}
      defaults={record ? serviceRecordToForm(record) : emptyServiceRecordForm()}
    />
  );
}

function ServiceRecordForm({
  productId,
  productTitle,
  recordId,
  defaults,
}: {
  productId: string;
  productTitle: string;
  recordId: string | null;
  defaults: ServiceRecordFormValues;
}) {
  const { colors } = useTheme();
  const save = useSaveServiceRecord();
  const remove = useDeleteServiceRecord();
  const deleteDocument = useDeleteDocument();
  const existingDocuments = useDocuments((documents) => documents.filter((document) => recordId && document.serviceRecordId === recordId));
  const [attachments, setAttachments] = useState<PickedFile[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { control, handleSubmit } = useForm<ServiceRecordFormValues>({
    resolver: zodResolver(serviceRecordSchema),
    mode: 'onTouched',
    defaultValues: defaults,
  });

  const addAttachment = (file: PickedFile) => {
    try {
      validatePickedFile(file);
      setAttachments((current) => [...current, file]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const submit = () =>
    void handleSubmit((values) =>
      save.mutate(
        {
          recordId,
          input: toServiceRecordInput(productId, values),
          productTitle,
          attachments: attachments.map((file) => ({ file, type: 'other' as const })),
        },
        {
          onSuccess: ({ failures }) => {
            if (failures.length > 0) {
              toast.error(failures[0]);
            } else {
              toast.success(t.service.saved);
            }
            router.back();
          },
          onError: (error) => toast.error(getErrorMessage(error)),
        },
      ),
    )();

  const confirmDelete = () =>
    recordId &&
    Alert.alert(t.service.deleteTitle, t.service.deleteMessage, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: () =>
          remove.mutate(recordId, {
            onSuccess: () => {
              toast.success(t.service.deleted);
              router.back();
            },
            onError: (error) => toast.error(getErrorMessage(error)),
          }),
      },
    ]);

  return (
    <Screen edges={MODAL_EDGES}
      scroll
      keyboard
      header={
        <TopBar
          title={recordId ? t.service.editTitle : t.service.newTitle}
          backIcon="close"
          right={recordId ? <IconButton icon={Trash2} label={t.common.delete} onPress={confirmDelete} /> : undefined}
        />
      }
      contentClassName="gap-4 px-5 pb-6"
      footer={
        <View className="px-5 pt-3">
          <Button label={t.common.save} block loading={save.isPending} onPress={submit} />
        </View>
      }
    >
      <Controller
        control={control}
        name="date"
        render={({ field, fieldState }) => (
          <DateField
            label={t.service.date}
            value={isIsoDate(field.value) ? field.value : null}
            maximumDate={today()}
            error={fieldState.error?.message}
            onChange={field.onChange}
          />
        )}
      />
      <FormTextField control={control} name="provider" label={t.service.provider} placeholder={t.service.providerPlaceholder} autoCapitalize="words" />
      <FormTextField control={control} name="problem" label={t.service.problem} placeholder={t.service.problemPlaceholder} multiline />
      <FormTextField
        control={control}
        name="repairDetails"
        label={t.service.repair}
        labelSuffix={t.common.optional}
        placeholder={t.service.repairPlaceholder}
        multiline
      />
      <FormTextField
        control={control}
        name="costText"
        label={t.service.cost}
        labelSuffix={t.common.optional}
        helper={t.service.costHelper}
        placeholder="0"
        keyboardType="decimal-pad"
        leading={<Text className="font-semibold text-[15px] text-text-secondary">₺</Text>}
      />
      <FormTextField control={control} name="notes" label={t.service.notes} labelSuffix={t.common.optional} placeholder={t.service.notesPlaceholder} multiline />
      <View>
        <View className="mb-2 flex-row items-center justify-between">
          <Text variant="label">{t.service.documents}</Text>
          <Button label={t.service.attach} icon={Paperclip} size="sm" variant="secondary" onPress={() => setSheetOpen(true)} />
        </View>
        <View className="gap-2">
          {(existingDocuments.data ?? []).map((document) => (
            <DocumentRow
              key={document.id}
              compact
              document={document}
              subtitle={formatFileSize(document.size)}
              onPress={() => router.push({ pathname: '/documents/[id]', params: { id: document.id } })}
              trailing={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t.common.delete}
                  hitSlop={10}
                  onPress={() => deleteDocument.mutate(document.id, { onError: (error) => toast.error(getErrorMessage(error)) })}
                >
                  <X size={18} color={colors['text-secondary']} strokeWidth={2.2} />
                </Pressable>
              }
            />
          ))}
          {attachments.map((file, index) => (
            <View key={`${file.uri}-${index}`} className="flex-row items-center gap-3 rounded-md border border-dashed border-border-strong px-3.5 py-3">
              <Paperclip size={16} color={colors.primary} strokeWidth={2} />
              <Text numberOfLines={1} className="flex-1 font-semibold text-[13px]">
                {file.name}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t.addProduct.receipt.remove}
                hitSlop={10}
                onPress={() => setAttachments((current) => current.filter((_, position) => position !== index))}
              >
                <X size={18} color={colors['text-secondary']} strokeWidth={2.2} />
              </Pressable>
            </View>
          ))}
        </View>
      </View>
      <AttachDocumentSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} onPicked={addAttachment} />
    </Screen>
  );
}

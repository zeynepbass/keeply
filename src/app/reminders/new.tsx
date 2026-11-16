import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { useCreateReminder } from '@/features/notifications/hooks/use-reminders';
import { reminderSchema, type ReminderFormValues } from '@/features/notifications/schemas/reminder-schema';
import { toast } from '@/shared/components/feedback/toast-store';
import { FormTextField } from '@/shared/components/form/form-text-field';
import { MODAL_EDGES, Screen } from '@/shared/components/layout/screen';
import { TopBar } from '@/shared/components/layout/top-bar';
import { Button, DateField } from '@/shared/components/ui';
import { t } from '@/shared/i18n';
import { getErrorMessage } from '@/shared/lib/errors';
import { isIsoDate, today } from '@/shared/utils/date';

export default function NewReminderScreen() {
  const { productId } = useLocalSearchParams<{ productId?: string }>();
  const create = useCreateReminder();
  const r = t.notifications.reminder;
  const { control, handleSubmit } = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: { title: '', note: '', date: today(), productId: productId ?? null },
  });

  const submit = () =>
    void handleSubmit((values) =>
      create.mutate(
        { title: values.title, note: values.note || null, date: values.date, productId: values.productId },
        {
          onSuccess: ({ outcome }) => {
            if (outcome.status === 'scheduled') toast.success(r.scheduled);
            else if (outcome.status === 'skipped' && outcome.reason === 'disabled') toast.info(r.savedPushDisabled);
            else toast.error(r.savedWithoutPush);
            router.back();
          },
          onError: (error) => toast.error(getErrorMessage(error)),
        },
      ),
    )();

  return (
    <Screen scroll keyboard edges={MODAL_EDGES} header={<TopBar title={r.title} backIcon="close" />} contentClassName="gap-4 px-5 pb-6"
      footer={<View className="px-5 pt-3"><Button label={r.save} block loading={create.isPending} onPress={submit} /></View>}>
      <FormTextField control={control} name="title" label={r.name} placeholder={r.namePlaceholder} />
      <FormTextField control={control} name="note" label={r.note} labelSuffix={t.common.optional} placeholder={r.notePlaceholder} multiline />
      <Controller control={control} name="date" render={({ field, fieldState }) => (
        <DateField label={r.date} value={isIsoDate(field.value) ? field.value : null} minimumDate={today()} error={fieldState.error?.message} onChange={field.onChange} />
      )} />
    </Screen>
  );
}

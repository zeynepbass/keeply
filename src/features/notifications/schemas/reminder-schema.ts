import { z } from 'zod';

import { t } from '@/shared/i18n';
import { compareIsoDates, isIsoDate, today } from '@/shared/utils/date';

export const reminderSchema = z
  .object({
    title: z.string().trim().min(1, t.validation.reminderTitleRequired).max(80, t.validation.maxLength(80)),
    note: z.string().trim().max(200, t.validation.maxLength(200)),
    date: z.string().refine(isIsoDate, t.validation.dateInvalid),
    productId: z.string().nullable(),
  })
  .superRefine((values, context) => {
    if (isIsoDate(values.date) && compareIsoDates(values.date, today()) < 0) {
      context.addIssue({ code: 'custom', path: ['date'], message: t.validation.reminderDatePast });
    }
  });

export type ReminderFormValues = z.infer<typeof reminderSchema>;

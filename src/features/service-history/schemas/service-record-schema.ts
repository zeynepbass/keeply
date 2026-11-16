import { z } from 'zod';

import { t } from '@/shared/i18n';
import { compareIsoDates, isIsoDate, today } from '@/shared/utils/date';
import { formatCurrencyInput, parseCurrencyInput } from '@/shared/utils/format';

import type { ServiceRecord, ServiceRecordInput } from '../types';

export const serviceRecordSchema = z
  .object({
    date: z.string().refine(isIsoDate, t.validation.dateInvalid),
    provider: z.string().trim().min(1, t.validation.providerRequired).max(80, t.validation.maxLength(80)),
    problem: z.string().trim().min(1, t.validation.problemRequired).max(300, t.validation.maxLength(300)),
    repairDetails: z.string().trim().max(500, t.validation.maxLength(500)),
    costText: z
      .string()
      .trim()
      .refine((value) => value === '' || parseCurrencyInput(value) !== null, t.validation.priceInvalid),
    notes: z.string().trim().max(500, t.validation.maxLength(500)),
  })
  .superRefine((values, context) => {
    if (isIsoDate(values.date) && compareIsoDates(values.date, today()) > 0) {
      context.addIssue({ code: 'custom', path: ['date'], message: t.validation.serviceDateFuture });
    }
  });

export type ServiceRecordFormValues = z.infer<typeof serviceRecordSchema>;

export function emptyServiceRecordForm(): ServiceRecordFormValues {
  return { date: today(), provider: '', problem: '', repairDetails: '', costText: '', notes: '' };
}

export function serviceRecordToForm(record: ServiceRecord): ServiceRecordFormValues {
  return {
    date: record.date,
    provider: record.provider,
    problem: record.problem,
    repairDetails: record.repairDetails ?? '',
    costText: formatCurrencyInput(record.cost),
    notes: record.notes ?? '',
  };
}

export function toServiceRecordInput(productId: string, values: ServiceRecordFormValues): ServiceRecordInput {
  return {
    productId,
    date: values.date,
    provider: values.provider.trim(),
    problem: values.problem.trim(),
    repairDetails: values.repairDetails.trim() || null,
    cost: values.costText.trim() === '' ? null : parseCurrencyInput(values.costText),
    notes: values.notes.trim() || null,
  };
}

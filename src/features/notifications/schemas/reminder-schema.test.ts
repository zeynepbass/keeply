import { t } from '@/shared/i18n';
import { addDays, today } from '@/shared/utils/date';

import { reminderSchema } from './reminder-schema';

describe('reminder schema', () => {
  it('accepts reminders for today and later', () => {
    expect(reminderSchema.safeParse({ title: 'Klima bakımı', note: '', date: today(), productId: null }).success).toBe(true);
    expect(reminderSchema.safeParse({ title: 'Filtre', note: 'Mutfak', date: addDays(today(), 30), productId: 'p1' }).success).toBe(true);
  });

  it('rejects empty titles and past dates in Turkish', () => {
    const result = reminderSchema.safeParse({ title: '  ', note: '', date: addDays(today(), -1), productId: null });
    expect(result.success).toBe(false);
    const messages = result.success ? [] : result.error.issues.map((issue) => issue.message);
    expect(messages).toEqual(expect.arrayContaining([t.validation.reminderTitleRequired, t.validation.reminderDatePast]));
  });
});

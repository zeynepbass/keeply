import { t } from '@/shared/i18n';

import { loginSchema, registerSchema } from './auth-schemas';

const valid = {
  name: 'Elif Yılmaz',
  email: 'elif.yilmaz@email.com',
  password: 'guvenli123',
  passwordConfirm: 'guvenli123',
  acceptTerms: true,
};

function messages(result: { success: boolean; error?: { issues: { message: string }[] } }): string[] {
  return result.success ? [] : (result.error?.issues.map((issue) => issue.message) ?? []);
}

describe('auth schemas', () => {
  it('accepts a valid registration', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('reports Turkish validation messages', () => {
    expect(messages(registerSchema.safeParse({ ...valid, email: 'eksik@' }))).toContain(t.validation.emailInvalid);
    expect(messages(registerSchema.safeParse({ ...valid, password: 'kisa1', passwordConfirm: 'kisa1' }))).toContain(
      t.validation.passwordRule,
    );
    expect(messages(registerSchema.safeParse({ ...valid, password: 'rakamsizsifre', passwordConfirm: 'rakamsizsifre' }))).toContain(
      t.validation.passwordRule,
    );
    expect(messages(registerSchema.safeParse({ ...valid, passwordConfirm: 'farkli123' }))).toContain(t.validation.passwordMismatch);
    expect(messages(registerSchema.safeParse({ ...valid, acceptTerms: false }))).toContain(t.validation.termsRequired);
    expect(messages(registerSchema.safeParse({ ...valid, name: '  ' }))).toContain(t.validation.nameRequired);
  });

  it('requires login fields', () => {
    expect(messages(loginSchema.safeParse({ email: '', password: '' }))).toEqual([
      t.validation.emailRequired,
      t.validation.emailInvalid,
      t.validation.passwordRequired,
    ]);
  });
});

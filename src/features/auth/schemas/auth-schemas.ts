import { z } from 'zod';

import { t } from '@/shared/i18n';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_PATTERN = /^(?=.*\d).{8,}$/;

export const emailField = z
  .string()
  .trim()
  .min(1, t.validation.emailRequired)
  .regex(EMAIL_PATTERN, t.validation.emailInvalid);

export const passwordField = z.string().min(1, t.validation.passwordRequired).regex(PASSWORD_PATTERN, t.validation.passwordRule);

export const nameField = z
  .string()
  .trim()
  .min(1, t.validation.nameRequired)
  .min(3, t.validation.nameTooShort)
  .max(60, t.validation.maxLength(60));

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, t.validation.passwordRequired),
});

export const registerSchema = z
  .object({
    name: nameField,
    email: emailField,
    password: passwordField,
    passwordConfirm: z.string().min(1, t.validation.passwordRequired),
    acceptTerms: z.boolean().refine((value) => value, t.validation.termsRequired),
  })
  .refine((values) => values.password === values.passwordConfirm, {
    path: ['passwordConfirm'],
    message: t.validation.passwordMismatch,
  });

export const forgotPasswordSchema = z.object({ email: emailField });

export const resetPasswordSchema = z
  .object({
    password: passwordField,
    passwordConfirm: z.string().min(1, t.validation.passwordRequired),
  })
  .refine((values) => values.password === values.passwordConfirm, {
    path: ['passwordConfirm'],
    message: t.validation.passwordMismatch,
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, t.validation.passwordRequired),
    password: passwordField,
    passwordConfirm: z.string().min(1, t.validation.passwordRequired),
  })
  .refine((values) => values.password === values.passwordConfirm, {
    path: ['passwordConfirm'],
    message: t.validation.passwordMismatch,
  });

export const accountSchema = z.object({ name: nameField, email: emailField });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
export type AccountValues = z.infer<typeof accountSchema>;

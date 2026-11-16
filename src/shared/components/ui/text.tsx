import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { mergeTextClasses } from '@/shared/lib/cn';

type Variant = 'h1' | 'h2' | 'h3' | 'title' | 'body' | 'label' | 'secondary' | 'caption' | 'overline';

const VARIANTS: Record<Variant, string> = {
  h1: 'font-display text-[26px] leading-[32px] tracking-tight text-text',
  h2: 'font-display text-[21px] leading-[27px] tracking-tight text-text',
  h3: 'font-display text-[16px] leading-[22px] text-text',
  title: 'font-semibold text-[14px] leading-[19px] text-text',
  body: 'font-body text-[15px] leading-[22px] text-text',
  label: 'font-semibold text-[13px] leading-[18px] text-text',
  secondary: 'font-body text-[13px] leading-[19px] text-text-secondary',
  caption: 'font-body text-[12px] leading-[16px] text-text-secondary',
  overline: 'font-bold text-[12px] uppercase tracking-wider text-text-secondary',
};

export interface TextProps extends RNTextProps {
  variant?: Variant;
  className?: string;
}

export function Text({ variant = 'body', className, ...props }: TextProps) {
  return <RNText maxFontSizeMultiplier={1.4} className={mergeTextClasses(VARIANTS[variant], className)} {...props} />;
}

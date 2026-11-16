import palette from './palette';

export type ColorToken = keyof typeof palette.light;

export type ThemeColors = Record<ColorToken, string>;

export const lightColors: ThemeColors = palette.light;

export const darkColors: ThemeColors = palette.dark;

export function toCssVariables(colors: ThemeColors): Record<`--color-${string}`, string> {
  return Object.fromEntries(Object.entries(colors).map(([key, value]) => [`--color-${key}`, value])) as Record<
    `--color-${string}`,
    string
  >;
}

import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { vars } from 'nativewind';
import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';
import { useColorScheme, View } from 'react-native';

import { darkColors, lightColors, toCssVariables, type ThemeColors } from './colors';
import { useThemeStore } from './theme-store';

interface ThemeContextValue {
  scheme: 'light' | 'dark';
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue>({ scheme: 'light', colors: lightColors });

const lightVariables = vars(toCssVariables(lightColors));
const darkVariables = vars(toCssVariables(darkColors));

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const preference = useThemeStore((state) => state.preference);
  const scheme = preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;
  const colors = scheme === 'dark' ? darkColors : lightColors;

  const navigationTheme = useMemo(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.bg,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
      },
    };
  }, [scheme, colors]);

  const value = useMemo(() => ({ scheme, colors }), [scheme, colors]);

  return (
    <ThemeContext.Provider value={value}>
      <NavigationThemeProvider value={navigationTheme}>
        <View style={[{ flex: 1, backgroundColor: colors.bg }, scheme === 'dark' ? darkVariables : lightVariables]}>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          {children}
        </View>
      </NavigationThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

export const env = {
  supportUrl: process.env.EXPO_PUBLIC_SUPPORT_URL ?? 'https://github.com/zeynepbass/keeply/issues',
  demoEnabled: (process.env.EXPO_PUBLIC_ENABLE_DEMO ?? 'true') === 'true',
  appVersion: '1.0.0',
} as const;

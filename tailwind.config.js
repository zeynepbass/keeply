const { light } = require('./src/shared/theme/palette');

const colors = Object.fromEntries(Object.keys(light).map((key) => [key, `var(--color-${key})`]));

module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors,
      fontFamily: {
        display: ['PlusJakartaSans_700Bold'],
        'display-extra': ['PlusJakartaSans_800ExtraBold'],
        'display-semibold': ['PlusJakartaSans_600SemiBold'],
        body: ['Inter_400Regular'],
        medium: ['Inter_500Medium'],
        semibold: ['Inter_600SemiBold'],
        bold: ['Inter_700Bold'],
      },
      borderRadius: {
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '24px',
        pill: '100px',
      },
    },
  },
  plugins: [],
};

interface Palette {
  primary: string;
  'primary-dark': string;
  'primary-tint': string;
  'on-primary': string;
  bg: string;
  surface: string;
  text: string;
  'text-secondary': string;
  placeholder: string;
  border: string;
  'border-strong': string;
  'warning-bg': string;
  'warning-text': string;
  'warning-icon': string;
  'danger-bg': string;
  'danger-text': string;
  'danger-icon': string;
  'danger-input': string;
  'success-bg': string;
  'success-text': string;
  'neutral-bg': string;
  'neutral-text': string;
  'tint-sand': string;
  'tint-blue': string;
  'tint-lilac': string;
  overlay: string;
}

declare const palette: {
  light: Palette;
  dark: Palette;
};

export default palette;

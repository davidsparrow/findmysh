export const colors = {
  primary: {
    voidBlack: '#090908',
    deepZinc: '#18181B',
    softViolet: '#A788FA',
    nearWhite: '#FAFAFA',
    navyDepth: '#0A2540',
  },
  accent: {
    emeraldGlow: '#50D395',
    linearBlue: '#5E6AB2',
    warmSignal: '#F8923C',
  },
  neutral: {
    borderGray: '#3F3F46',
    zincMuted: '#A1A1AA',
    elevated: '#27272A',
  },
} as const;

export const theme = {
  background: colors.primary.nearWhite,
  surface: '#FFFFFF',
  surfaceElevated: colors.neutral.elevated,

  text: {
    primary: colors.primary.voidBlack,
    secondary: colors.neutral.zincMuted,
    inverse: colors.primary.nearWhite,
  },

  border: {
    light: '#E4E4E7',
    medium: colors.neutral.borderGray,
    dark: colors.primary.deepZinc,
  },

  button: {
    primary: colors.primary.softViolet,
    primaryText: colors.primary.nearWhite,
    secondary: colors.neutral.elevated,
    secondaryText: colors.primary.nearWhite,
  },

  status: {
    success: colors.accent.emeraldGlow,
    warning: colors.accent.warmSignal,
    info: colors.accent.linearBlue,
    error: '#EF4444',
  },

  interactive: {
    hover: 'rgba(167, 136, 250, 0.1)',
    pressed: 'rgba(167, 136, 250, 0.2)',
    disabled: colors.neutral.zincMuted,
  },
} as const;

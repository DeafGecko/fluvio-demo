// Design tokens from the Expense Tracker Design System v1.0.
// Keep names in sync with the Figma variables.

export const spacing = {
  1: 4, 2: 8, 3: 12, 4: 16, 5: 20,
  6: 24, 8: 32, 10: 40, 12: 48, 16: 64,
} as const;

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 20, pill: 999,
} as const;

export const borderWidth = { subtle: 1 } as const;

// Minimum comfortable touch target (48 x 48 dp).
export const minTarget = 48;

// Screen horizontal insets.
export const screenInset = 24;
export const screenInsetNarrow = 16;

export const colors = {
  light: {
    // Fluvio handoff, light theme (token values from Fluvio-handoff section 2).
    canvas: '#F7F8F7', surface: '#FFFFFF', surfaceMuted: '#E8ECEE',
    textPrimary: '#20282D', textSecondary: '#56636C', textTertiary: '#56636C',
    border: '#858F97', cardBorder: '#858F97', avatarBorder: '#356B85', iconBadge: '#E3ECF1', accent: '#356B85', accentSoft: '#E3ECF1', accentLight: '#82B5CF',
    onAccent: '#FFFFFF', success: '#2E6B4F', danger: '#9E3434', warning: '#7A5200',
    info: '#356B85', focus: '#82B5CF',
  },
  dark: {
    // Fluvio handoff, dark theme.
    canvas: '#141B1F', surface: '#20282D', surfaceMuted: '#2A353B', cardBorder: 'transparent', avatarBorder: 'transparent', iconBadge: 'transparent',
    textPrimary: '#F5F7F8', textSecondary: '#B4C4CC', textTertiary: '#B4C4CC',
    border: '#72878F', accent: '#82B5CF', accentSoft: '#2A3D48', accentLight: '#356B85',
    onAccent: '#141B1F', success: '#8FD3B0', danger: '#FFABAB', warning: '#F4CB75',
    info: '#82B5CF', focus: '#82B5CF',
  },
} as const;

export type ThemeName = keyof typeof colors;
export type ThemeColors = { [K in keyof typeof colors.light]: string };

// Type scale. Sizes are design intent; scaling is handled by the OS.
// Weight 650 (h2) is not representable in React Native, so it uses 700.
export const typography = {
  display: { fontSize: 36, fontWeight: '700', lineHeight: 44 },
  h1: { fontSize: 28, fontWeight: '700', lineHeight: 36 },
  h2: { fontSize: 22, fontWeight: '700', lineHeight: 30 },
  h3: { fontSize: 18, fontWeight: '600', lineHeight: 26 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodyStrong: { fontSize: 16, fontWeight: '600', lineHeight: 24 },
  secondary: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  caption: { fontSize: 13, fontWeight: '500', lineHeight: 19 },
  tabLabel: { fontSize: 12, fontWeight: '600', lineHeight: 17 },
} as const;

// Category icon-badge colors. Always shown with a text label.
// Category colors come from the Figma foundation palette (light mode values).
// The palette has few hues, so Bills and Other are the closest pair.
// Dark mode category colors, from the Figma dark variables (bright enough on the dark cards).
export const categoryColorsDark: Record<string, string> = {
  Food: '#8FD3B0',          // color/success (dark)
  Transport: '#82B5CF',     // color/accent (dark)
  Entertainment: '#F4CB75', // color/warning (dark)
  Health: '#FFABAB',        // color/danger (dark)
  Shopping: '#B4C4CC',      // color/textSecondary (dark)
  Bills: '#F5F7F8',         // color/charcoal (dark)
  Other: '#9AAEB6',         // lighter grey-blue so the icon reaches 3:1 contrast on its tint (not a Figma variable)
};

export const categoryColors: Record<string, string> = {
  Food: '#2E6B4F',          // color/success
  Transport: '#82B5CF',     // color/accentLight
  Entertainment: '#356B85', // color/accent
  Health: '#9E3434',        // color/danger
  Shopping: '#7A5200',      // color/warning
  Bills: '#20282D',         // color/charcoal
  Other: '#56636C',         // color/textSecondary
};

// The category color set for each mode.
export const categoryPalette = { light: categoryColors, dark: categoryColorsDark } as const;

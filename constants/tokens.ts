// Design tokens from the Expense Tracker Design System v1.0.
// Keep names in sync with the Figma variables.
import { PixelRatio } from 'react-native';

// rem: sizes are in rem, where 1 rem = 16 px at the default text size.
// The phone's Text Size setting scales it, so layout grows with the text.
// Layout growth is capped: at the accessibility sizes (font scale up to ~3.1) full-scale
// padding and icons would leave no room for the (already scaled) text on a phone screen.
const layoutScale = Math.min(PixelRatio.getFontScale(), 1.3);
export function rem(value: number): number {
  return value * 16 * layoutScale;
}

// True at the accessibility text sizes. Rows with side-by-side text stack instead, so words don't break mid-word.
export const isLargeText = PixelRatio.getFontScale() >= 1.6;

// Max text growth for short labels in fixed-size controls (tab bar, chips, segments, keypad),
// like iOS system tab bars. Pass as maxFontSizeMultiplier.
export const compactTextScale = 1.5;

// Text sizes: React Native already scales Text with the phone's setting, so these are not scaled again.
export function font(value: number): number {
  return value * 16;
}

export const spacing = {
  1: rem(0.25), 2: rem(0.5), 3: rem(0.75), 4: rem(1), 5: rem(1.25),
  6: rem(1.5), 8: rem(2), 10: rem(2.5), 12: rem(3), 16: rem(4),
} as const;

export const radius = {
  sm: rem(0.5), md: rem(0.75), lg: rem(1), xl: rem(1.25), pill: 999,
} as const;

// Hairline borders stay 1 px so they remain thin on every screen.
export const borderWidth = { subtle: 1 } as const;

// Minimum comfortable touch target (3 rem, 48 px at default size).
export const minTarget = rem(3);

// Screen horizontal insets.
export const screenInset = rem(1.5);
export const screenInsetNarrow = rem(1);

export const colors = {
  light: {
    // Fluvio handoff, light theme (token values from Fluvio-handoff section 2).
    canvas: '#F7F8F7', surface: '#FFFFFF', surfaceMuted: '#E8ECEE',
    textPrimary: '#20282D', textSecondary: '#56636C', textTertiary: '#56636C',
    border: '#858F97', cardBorder: '#858F97', avatarBorder: '#356B85', iconBadge: '#E3ECF1', iconBadgeStrong: '#BFD8E5', accent: '#356B85', accentSoft: '#E3ECF1', accentLight: '#82B5CF',
    onAccent: '#FFFFFF', success: '#2E6B4F', danger: '#9E3434', warning: '#7A5200',
    info: '#356B85', focus: '#82B5CF',
  },
  dark: {
    // Fluvio handoff, dark theme.
    canvas: '#141B1F', surface: '#20282D', surfaceMuted: '#2A353B', cardBorder: 'transparent', avatarBorder: 'transparent', iconBadge: 'transparent', iconBadgeStrong: '#2A3D48',
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
  display: { fontSize: font(2.25), fontWeight: '700', lineHeight: font(2.75) },
  h1: { fontSize: font(1.75), fontWeight: '700', lineHeight: font(2.25) },
  h2: { fontSize: font(1.375), fontWeight: '700', lineHeight: font(1.875) },
  h3: { fontSize: font(1.125), fontWeight: '600', lineHeight: font(1.625) },
  body: { fontSize: font(1), fontWeight: '400', lineHeight: font(1.5) },
  bodyStrong: { fontSize: font(1), fontWeight: '600', lineHeight: font(1.5) },
  secondary: { fontSize: font(0.875), fontWeight: '400', lineHeight: font(1.25) },
  caption: { fontSize: font(0.8125), fontWeight: '500', lineHeight: font(1.1875) },
  tabLabel: { fontSize: font(0.75), fontWeight: '600', lineHeight: font(1.0625) },
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

import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { categoryPalette, colors, ThemeColors, typography } from '../constants/tokens';
import { usePrefs } from '../lib/prefs';

// Larger text option: every font size and line height grows by this factor.
const LARGER_TEXT_SCALE = 1.25;

// Returns semantic colors and type. Follows the saved Appearance setting, and
// scales text when "Larger text" is on in Accessibility.
export function useTheme() {
  const system = useColorScheme();
  const { appearance, largerText } = usePrefs();
  const resolved = appearance === 'system' ? system : appearance;
  const scheme = resolved === 'dark' ? 'dark' : 'light';
  const c = colors[scheme] as ThemeColors;

  return useMemo(() => {
    const k = largerText ? LARGER_TEXT_SCALE : 1;
    const t = Object.fromEntries(
      Object.entries(typography).map(([name, s]) => [
        name,
        { ...s, fontSize: Math.round(s.fontSize * k), lineHeight: Math.round(s.lineHeight * k) },
      ]),
    ) as typeof typography;
    return { scheme, c, t, cat: categoryPalette[scheme] as Record<string, string> };
  }, [scheme, largerText, c]);
}

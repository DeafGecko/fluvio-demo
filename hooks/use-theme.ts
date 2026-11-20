import { useColorScheme } from 'react-native';
import { categoryPalette, colors, ThemeColors, typography } from '../constants/tokens';
import { usePrefs } from '../lib/prefs';

// Returns semantic colors and type. Follows the phone's light or dark setting,
// unless the user picked Light or Dark in Settings > Appearance.
// Text size is not set here: React Native scales every Text with the phone's
// Text Size setting (Dynamic Type on iPhone, font size on Android).
export function useTheme() {
  const system = useColorScheme();
  const { appearance } = usePrefs();
  const resolved = appearance === 'system' ? system : appearance;
  const scheme = resolved === 'dark' ? 'dark' : 'light';
  const c = colors[scheme] as ThemeColors;
  return { scheme, c, t: typography, cat: categoryPalette[scheme] as Record<string, string> };
}

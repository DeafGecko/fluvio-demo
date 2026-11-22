import { Stack, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Platform, View } from 'react-native';
import { useTheme } from '../hooks/use-theme';
import { trackUse } from '../lib/usage';
import { usePrefs } from '../lib/prefs';
import { installWebAlerts, WebAlertHost } from '../lib/web-alert';

installWebAlerts();

// Launch on the splash screen; it routes to Home (the tabs group) or Sign In.
// On the web the page you open is the first screen, so the splash is not preloaded there.
export const unstable_settings = Platform.OS === 'web' ? {} : { anchor: 'splash' };

// Root stack: the tab group plus screens opened on top of it (Profile, Settings, Sign In, etc.).
// Web only: each page fades in. A canvas-colored layer fades out whenever the route changes.
// The first page does not animate, and Reduce Motion turns it off.
function useWebPageFade() {
  const pathname = usePathname();
  const [cover] = useState(() => new Animated.Value(0));
  // Counts route changes. Starts at 0, so the first page never animates.
  const [seenPath, setSeenPath] = useState(pathname);
  const [changes, setChanges] = useState(0);
  if (pathname !== seenPath) {
    setSeenPath(pathname);
    setChanges((n) => n + 1);
  }
  useEffect(() => {
    if (Platform.OS !== 'web' || changes === 0) return;
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (!active || reduce) return;
      cover.setValue(0.6);
      Animated.timing(cover, { toValue: 0, duration: 260, useNativeDriver: true }).start();
    });
    return () => { active = false; };
  }, [changes, cover]);
  return cover;
}

export default function RootLayout() {
  const { c } = useTheme();
  const cover = useWebPageFade();
  // Web only: paint the page behind the app in the theme's canvas color, so no white shows during screen changes.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const doc = (globalThis as any).document;
    if (!doc) return;
    doc.documentElement.style.backgroundColor = c.canvas;
    doc.body.style.backgroundColor = c.canvas;
  }, [c.canvas]);
  // Local usage log: counts each screen visit on this phone only (see lib/usage.ts).
  const pathname = usePathname();
  useEffect(() => { if (pathname) trackUse(`screen:${pathname}`); }, [pathname]);
  // On iPad and other wide screens, keep the content in a centered column (about phone width up to 760 points).
  const { layout } = usePrefs();
  // Phone: 430 wide. Tablet: 834 wide (iPad). Auto: up to 760.
  const maxWidth = layout === 'phone' ? 430 : layout === 'tablet' ? 834 : 760;
  return (
    <View style={{ flex: 1, backgroundColor: c.canvas, alignItems: 'center' }}>
      {/* role="main" marks the page content as the main landmark for screen readers. */}
      <View role="main" style={{ flex: 1, width: '100%', maxWidth: maxWidth }}>
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: c.canvas },
        // Swipe from the left edge (or anywhere on iOS) to go back to the previous screen.
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        // Every page slides in from the right, like a standard phone app; the splash fades in instead.
        animation: 'slide_from_right',
        // Pages you are not looking at do not re-draw when the theme or settings change. This keeps Light/Dark switching fast.
        freezeOnBlur: true,
      }}>
        <Stack.Screen name="splash" options={{ animation: 'fade' }} />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="account-settings" />
        <Stack.Screen name="help" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="key-benefits" />
        <Stack.Screen name="create-profile" />
        <Stack.Screen name="set-up" />
        <Stack.Screen name="connect-bank" />
        <Stack.Screen name="connection-success" />
        <Stack.Screen name="connection-error" />
        {/* Take out cash slides up from the bottom as a sheet, like Quick Add. */}
        <Stack.Screen name="withdraw" options={{ presentation: 'modal' }} />
        {/* Cash on hand opens as a short bottom sheet: amount and notes, no full page. */}
        <Stack.Screen name="cash" options={{ presentation: 'formSheet', sheetAllowedDetents: 'fitToContents', sheetGrabberVisible: true, sheetCornerRadius: 24 }} />
        <Stack.Screen name="account-detail" />
        <Stack.Screen name="purchase-detail" />
        <Stack.Screen name="search" />
        <Stack.Screen name="bills" />
        <Stack.Screen name="journey" />
        <Stack.Screen name="statement" />
        {/* Add demo account opens as a bottom sheet sized to its content. */}
        <Stack.Screen name="add-account" options={{ presentation: 'formSheet', sheetAllowedDetents: 'fitToContents', sheetGrabberVisible: true, sheetCornerRadius: 24 }} />
        <Stack.Screen name="add" />
        <Stack.Screen name="stats" />
        <Stack.Screen name="onboarding" />
      </Stack>
        <Animated.View pointerEvents="none" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: c.canvas, opacity: cover }} />
        <WebAlertHost />
      </View>
    </View>
  );
}

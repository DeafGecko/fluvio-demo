import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';
import { FluvioLogo } from '../components/fluvio-logo';
import { DEMO_STATEMENT_KEY, loadDemoStatement, seedDemoData } from '../lib/demo-data';
import { loadExpenses } from '../lib/expenses';
import { loadDemoAccounts } from '../lib/accounts';
import { loadWithdrawals } from '../lib/cash';
import { radius, spacing } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';

// Stay on the splash for 3 seconds, then go to Home or Welcome.
const SPLASH_MS = 3000;

// Splash motion: the logo fades in and grows slightly, then the name and tagline fade in.
// With Reduce Motion on, everything appears at once with no movement.
export default function Splash() {
  const router = useRouter();
  const { c, t } = useTheme();

  const [logo] = useState(() => new Animated.Value(0));    // 0 → 1
  const [words] = useState(() => new Animated.Value(0));   // 0 → 1

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (!active) return;
      if (reduce) {
        logo.setValue(1);
        words.setValue(1);
        return;
      }
      // Slow and calm: logo first, then the name and tagline.
      Animated.sequence([
        Animated.timing(logo, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.delay(200),
        Animated.timing(words, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]).start();
    });
    return () => { active = false; };
  }, [logo, words]);

  // Preload before leaving: read the saved sign-in state, make sure the demo data exists,
  // and load it into storage so the next screen opens with data ready. Leave only when
  // BOTH the preload and the minimum splash time are done.
  useEffect(() => {
    let cancelled = false;
    const minimumTime = new Promise<void>((resolve) => setTimeout(resolve, SPLASH_MS));
    const preload = (async () => {
      const onboarded = await AsyncStorage.getItem('onboarded');
      if (onboarded && !(await AsyncStorage.getItem(DEMO_STATEMENT_KEY))) await seedDemoData();
      if (onboarded) {
        // Warm the data the first screens read.
        await Promise.all([loadExpenses(), loadDemoAccounts(), loadDemoStatement(), loadWithdrawals()]);
      }
      return !!onboarded;
    })().catch(() => false);

    Promise.all([preload, minimumTime]).then(([signedIn]) => {
      if (cancelled) return;
      // New users start at Welcome. Signed-in users go Home.
      router.replace(signedIn ? '/' : '/welcome');
    });
    return () => { cancelled = true; };
    // Run once on mount. Re-running this effect would restart the preload and loop the splash.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const styles = useMemo(() => StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.canvas, alignItems: 'center', justifyContent: 'center', padding: spacing[6] },
    title: { color: c.textPrimary, fontSize: 40, fontWeight: '700', letterSpacing: -1, marginTop: spacing[3] },
    tagline: { color: c.textSecondary, fontSize: t.body.fontSize, lineHeight: t.body.lineHeight, marginTop: spacing[2], textAlign: 'center' },
    spinner: { marginTop: spacing[8] },
  }), [c, t]);

  return (
    <View style={styles.screen} accessibilityLabel="Fluvio, loading">
      <Animated.View style={{
        opacity: logo,
        transform: [{ scale: logo.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
      }}>
        <FluvioLogo size={72} />
      </Animated.View>
      <Animated.View style={{ alignItems: 'center', opacity: words, transform: [{ translateY: words.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }}>
        <Text style={styles.title} accessibilityRole="header">Fluvio</Text>
        <Text style={styles.tagline}>Know where your money goes.</Text>
      </Animated.View>
      <ActivityIndicator color={c.accent} style={styles.spinner} accessibilityLabel="Loading" />
      <View style={{ height: radius.sm }} />
    </View>
  );
}

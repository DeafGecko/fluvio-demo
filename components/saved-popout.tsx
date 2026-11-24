import { useEffect, useMemo, useState } from 'react';
import { Animated, Modal, StyleSheet, Text, View } from 'react-native';
import { CheckCircleIcon } from 'react-native-heroicons/solid';
import { radius, spacing, rem } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';

// A small "Saved" toast that floats in the top right corner for a moment, then fades out.
// It does not cover the screen, so the page underneath stays readable and usable.
const SHOW_MS = 1600;

export function SavedPopout({ visible, message = 'Saved' }: { visible: boolean; message?: string }) {
  const { c, t } = useTheme();
  const [opacity] = useState(() => new Animated.Value(0));
  // `shown` keeps the toast mounted while it fades out. Each time `visible` turns on, `showId`
  // goes up, which restarts the timer. Turning `visible` off does not cut the toast short.
  const [shown, setShown] = useState(false);
  const [showId, setShowId] = useState(0);
  const [shownFor, setShownFor] = useState(visible);
  if (visible !== shownFor) {
    setShownFor(visible);
    if (visible) {
      setShown(true);
      setShowId((id) => id + 1);
    }
  }

  useEffect(() => {
    if (showId === 0) return;
    opacity.stopAnimation();
    Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => setShown(false));
    }, SHOW_MS);
    return () => clearTimeout(timer);
  }, [showId, opacity]);

  const styles = useMemo(() => StyleSheet.create({
    layer: { flex: 1, justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: rem(3.625), paddingRight: spacing[4] },
    toast: {
      flexDirection: 'row', alignItems: 'center', gap: spacing[2],
      backgroundColor: c.surface, borderWidth: 1, borderColor: c.cardBorder, borderRadius: radius.pill,
      paddingVertical: spacing[3], paddingHorizontal: spacing[4],
      shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: rem(0.25) }, elevation: 4,
    },
    label: { color: c.textPrimary, fontSize: t.secondary.fontSize, fontWeight: '600' },
  }), [c, t]);

  const slide = opacity.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] });

  return (
    <Modal visible={shown} transparent animationType="none" statusBarTranslucent>
      <View style={styles.layer} pointerEvents="none" accessibilityLiveRegion="polite">
        <Animated.View style={[styles.toast, { opacity, transform: [{ translateY: slide }] }]}
          accessibilityRole="alert" accessibilityLabel={message}>
          <CheckCircleIcon size={rem(1.25)} color={c.success} />
          <Text style={styles.label}>{message}</Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

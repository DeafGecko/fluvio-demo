import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, spacing, rem } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';

// Shown when the app can't reach its data. Demo: turned on with "Show offline message" in Settings.
export function OfflineBanner({ onRetry }: { onRetry: () => void }) {
  const { c, t } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    box: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.warning, padding: spacing[3], marginBottom: spacing[4] },
    text: { flex: 1, color: c.textPrimary, fontSize: t.secondary.fontSize, lineHeight: t.secondary.lineHeight },
    retry: { minHeight: rem(2.75), minWidth: rem(2.75), justifyContent: 'center', paddingHorizontal: spacing[2] },
    retryText: { color: c.accent, fontSize: t.secondary.fontSize, fontWeight: '700' },
  }), [c, t]);
  return (
    <View style={styles.box} accessibilityRole="alert">
      <Text style={styles.text}>You&apos;re offline. Showing saved data from 2 hours ago.</Text>
      <Pressable onPress={onRetry} accessibilityRole="button" accessibilityLabel="Retry connection" style={styles.retry}>
        <Text style={styles.retryText}>Retry</Text>
      </Pressable>
    </View>
  );
}

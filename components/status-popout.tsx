import { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { ExclamationTriangleIcon } from 'react-native-heroicons/solid';
import { radius, spacing } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';

// Red error popup over a dark scrim. Offers Try again and Cancel.
export function ErrorPopout({ visible, title, message, onRetry, onCancel }: {
  visible: boolean; title: string; message: string; onRetry: () => void; onCancel: () => void;
}) {
  const { c, t } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: spacing[6] },
    card: { backgroundColor: c.surface, borderRadius: radius.lg, padding: spacing[6], width: '100%', maxWidth: 340, borderWidth: 1, borderColor: c.cardBorder, alignItems: 'center', gap: spacing[3] },
    title: { color: c.danger, fontSize: t.h3.fontSize, fontWeight: '700', textAlign: 'center' },
    message: { color: c.textPrimary, fontSize: t.secondary.fontSize, lineHeight: t.secondary.lineHeight, textAlign: 'center' },
    row: { flexDirection: 'row', gap: spacing[2], width: '100%', marginTop: spacing[2] },
    btn: { flex: 1, minHeight: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.border },
    primary: { backgroundColor: c.accent, borderColor: c.accent },
    btnText: { color: c.textPrimary, fontSize: 16, fontWeight: '600' },
    primaryText: { color: c.onAccent },
    pressed: { opacity: 0.85 },
  }), [c, t]);
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.scrim}>
        <View style={styles.card} accessibilityRole="alert">
          <ExclamationTriangleIcon size={44} color={c.danger} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.row}>
            <Pressable onPress={onCancel} accessibilityRole="button" accessibilityLabel="Cancel" style={({ pressed }) => [styles.btn, pressed && styles.pressed]}>
              <Text style={styles.btnText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={onRetry} accessibilityRole="button" accessibilityLabel="Try again" style={({ pressed }) => [styles.btn, styles.primary, pressed && styles.pressed]}>
              <Text style={[styles.btnText, styles.primaryText]}>Try again</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

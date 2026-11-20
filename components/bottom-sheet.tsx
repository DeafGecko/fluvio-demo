import { useEffect, useMemo, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { XMarkIcon } from 'react-native-heroicons/outline';
import { spacing, rem } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';

// A panel that slides up from the bottom over the screen. It covers only part of the screen,
// and tapping the dark area above it closes it. Use it for short information or a small form.
export function BottomSheet({ visible, onClose, title, children, height = 0.6 }: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  height?: number; // share of the screen the sheet covers, 0 to 1
}) {
  const { c, t } = useTheme();
  // progress: 0 = closed, 1 = open. The dark area fades and the sheet slides up with it.
  const [progress] = useState(() => new Animated.Value(0));
  // The Modal stays on screen while the closing animation runs.
  const [mounted, setMounted] = useState(visible);
  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    if (visible) {
      Animated.timing(progress, { toValue: 1, duration: 260, useNativeDriver: true }).start();
    } else if (mounted) {
      Animated.timing(progress, { toValue: 0, duration: 200, useNativeDriver: true }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, mounted, progress]);

  const styles = useMemo(() => StyleSheet.create({
    backdrop: { flex: 1, justifyContent: 'flex-end' },
    dim: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.35)' },
    sheet: { backgroundColor: c.surface, borderTopLeftRadius: rem(1.5), borderTopRightRadius: rem(1.5), padding: spacing[5], paddingBottom: spacing[12] },
    grabber: { alignSelf: 'center', width: rem(2.5), height: rem(0.3125), borderRadius: rem(0.1875), backgroundColor: c.cardBorder, marginBottom: spacing[3] },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[3] },
    title: { color: c.textPrimary, fontSize: t.h3.fontSize, fontWeight: '700', flex: 1, paddingRight: spacing[3] },
    closeBtn: { minWidth: rem(2.75), minHeight: rem(2.75), alignItems: 'center', justifyContent: 'center' },
  }), [c, t]);

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Animated.View pointerEvents="none" style={[styles.dim, { opacity: progress }]} />
        {/* Tapping the dark area closes the sheet. The sheet itself is a plain View, so its text fields can get focus. */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        <Animated.View style={[styles.sheet, { maxHeight: `${Math.round(height * 100)}%`, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [600, 0] }) }] }]}>
          <View style={styles.grabber} />
          <View style={styles.titleRow}>
            <Text style={styles.title} accessibilityRole="header">{title}</Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" style={styles.closeBtn} hitSlop={rem(0.5)}>
              <XMarkIcon size={rem(1.375)} color={c.textSecondary} />
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}


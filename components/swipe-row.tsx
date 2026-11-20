import { useMemo, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { EllipsisVerticalIcon, PencilSquareIcon, TrashIcon } from 'react-native-heroicons/outline';
import { minTarget, radius, spacing, rem, font } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';

// A row that slides left to reveal Edit and Delete behind it.
// Swipe left, or tap the ⋯ button on the right edge.
const REVEAL = 136; // two 68-pt action buttons


type Props = {
  children: React.ReactNode;     // the card content (name, amount, etc.)
  onEdit: () => void;
  onDelete: () => void;
  label: string;                 // used for screen readers, e.g. "Coffee, 4.50"
};

export function SwipeRow({ children, onEdit, onDelete, label }: Props) {
  const { c } = useTheme();
  const [x] = useState(() => new Animated.Value(0));
  const [open, setOpen] = useState(false);

  const animateTo = (value: number, isOpen: boolean) => {
    setOpen(isOpen);
    Animated.timing(x, { toValue: value, duration: 180, useNativeDriver: true }).start();
  };

  // Rebuilt each render from the current open state, so the handlers never read a stale value.
  const pan = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
    onPanResponderMove: (_, g) => {
      const base = open ? -REVEAL : 0;
      const next = Math.min(0, Math.max(-REVEAL, base + g.dx));
      x.setValue(next);
    },
    onPanResponderRelease: (_, g) => {
      const base = open ? -REVEAL : 0;
      const position = base + g.dx;
      animateTo(position < -REVEAL / 2 ? -REVEAL : 0, position < -REVEAL / 2);
    },
  });

  const styles = useMemo(() => StyleSheet.create({
    wrap: { borderRadius: radius.md, overflow: 'hidden', marginBottom: spacing[2] },
    // The action layer fills the whole row behind the card, so no page color shows at the card's rounded corners.
    actions: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'flex-end', backgroundColor: c.surface, borderRadius: radius.md, overflow: 'hidden' },
    action: { width: REVEAL / 2, alignItems: 'center', justifyContent: 'center', gap: rem(0.25) },
    actionText: { color: c.onAccent, fontSize: font(0.8125), fontWeight: '700' },
    front: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.cardBorder, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', minHeight: minTarget },
    more: { width: rem(2.75), minHeight: minTarget, alignItems: 'center', justifyContent: 'center' },
    pressed: { opacity: 0.7 },
  }), [c]);

  return (
    <View style={styles.wrap}>
      <View style={styles.actions}>
        <Pressable style={[styles.action, { backgroundColor: c.accent }]} accessibilityRole="button"
          accessibilityLabel={`Edit ${label}`} onPress={() => { animateTo(0, false); onEdit(); }}>
          <PencilSquareIcon size={rem(1.25)} color={c.onAccent} />
          <Text style={styles.actionText}>Edit</Text>
        </Pressable>
        <Pressable style={[styles.action, { backgroundColor: c.danger }]} accessibilityRole="button"
          accessibilityLabel={`Delete ${label}`} onPress={() => { animateTo(0, false); onDelete(); }}>
          <TrashIcon size={rem(1.25)} color={c.onAccent} />
          <Text style={styles.actionText}>Delete</Text>
        </Pressable>
      </View>

      <Animated.View style={[styles.front, { transform: [{ translateX: x }] }]} {...pan.panHandlers}>
        <View style={{ flex: 1 }}>{children}</View>
        <Pressable style={({ pressed }) => [styles.more, pressed && styles.pressed]} accessibilityRole="button"
          accessibilityLabel={`More options for ${label}. Swipe left or tap to see Edit and Delete.`}
          accessibilityState={{ expanded: open }}
          onPress={() => animateTo(open ? 0 : -REVEAL, !open)}>
          <EllipsisVerticalIcon size={rem(1.375)} color={c.textPrimary} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

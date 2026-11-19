import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { AccessibilityInfo, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { SwipeRow } from './swipe-row';
import { minTarget, radius, spacing } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';
import { usePrefs } from '../lib/prefs';
import { CATEGORY_ICONS, Expense, formatSignedPurchase, formatUSD } from '../lib/expenses';

// Fades a row in. Skipped entirely when reduce motion is on.
function EntranceRow({ children, index }: { children: React.ReactNode; index: number }) {
  const [opacity] = useState(() => new Animated.Value(0));
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (!active) return;
      Animated.timing(opacity, {
        toValue: 1,
        duration: reduce ? 0 : 200,
        delay: reduce ? 0 : Math.min(index, 5) * 40,
        useNativeDriver: true,
      }).start();
    });
    return () => { active = false; };
  }, [index, opacity]);
  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
}

type Props = {
  expense: Expense;
  index: number;
  onDelete: (id: string) => void;
};

// Plain delete button instead of a swipe gesture. Swipe rows were crashing
// React Native's render loop on Expo Go SDK 58 (see the native crash report).
export function TransactionRow({ expense, index, onDelete }: Props) {
  const { c, t, cat: catColor, scheme } = useTheme();
  // The tint behind each category icon: stronger in dark mode so the color shows.
  const tint = scheme === 'dark' ? '59' : '26';
  const router = useRouter();
  const { hideAmounts } = usePrefs();
  const badge = catColor[expense.category] ?? '#94a3b8';
  const Icon = CATEGORY_ICONS[expense.category] ?? CATEGORY_ICONS.Other;

  const styles = useMemo(() => StyleSheet.create({
    card: {
      backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.cardBorder,
      paddingLeft: spacing[4], paddingRight: spacing[2], paddingVertical: spacing[2],
      flexDirection: 'row', alignItems: 'center', gap: spacing[3],
      minHeight: minTarget, marginBottom: spacing[2],
    },
    badge: { width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
    info: { flex: 1 },
    name: { color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: t.bodyStrong.fontWeight, lineHeight: t.bodyStrong.lineHeight },
    meta: { color: c.textSecondary, fontSize: t.caption.fontSize, lineHeight: t.caption.lineHeight, marginTop: 2 },
    amount: { color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: t.bodyStrong.fontWeight, fontVariant: ['tabular-nums'] },
    deleteBtn: {
      width: minTarget, height: minTarget, borderRadius: radius.md,
      alignItems: 'center', justifyContent: 'center',
    },
  }), [c, t]);

  return (
    <EntranceRow index={index}>
      <SwipeRow
        label={`${expense.name}, ${formatUSD(expense.amount)}`}
        onEdit={() => router.push({ pathname: '/add', params: { id: expense.id } })}
        onDelete={() => onDelete(expense.id)}
      >
        <Pressable style={({ pressed }) => [styles.card, { borderWidth: 0 }, pressed && { opacity: 0.85 }]}
          onPress={() => router.push({ pathname: '/purchase-detail', params: { id: expense.id } })}
          accessibilityRole="button"
          accessibilityHint="Tap for details. Swipe left for Edit and Delete."
          {...(hideAmounts ? { accessibilityLabel: `${expense.name}, ${expense.category}, ${expense.date}, amount hidden` } : {})}>
          <View style={[styles.badge, { backgroundColor: badge + tint }]} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
            <Icon size={20} color={c.textPrimary} />
          </View>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={2}>{expense.name}</Text>
            <Text style={styles.meta}>Purchase · {expense.category}</Text>
            <Text style={styles.meta}>{expense.date}</Text>
          </View>
          <Text style={styles.amount}>{hideAmounts ? '••••••' : formatSignedPurchase(expense.amount)}</Text>
        </Pressable>
      </SwipeRow>
    </EntranceRow>
  );
}

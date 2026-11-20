import { useFocusEffect, useRouter } from 'expo-router';
import { parseAmount } from '../../lib/amount';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChevronRightIcon } from 'react-native-heroicons/outline';
import { SwipeRow } from '../../components/swipe-row';
import { radius, screenInset, spacing, rem, font } from '../../constants/tokens';
import { useTheme } from '../../hooks/use-theme';
import { DemoAccount, loadDemoAccounts, loadSyncedIds } from '../../lib/accounts';
import { cashOnHand, deleteWithdrawal, loadWithdrawals, updateWithdrawal, Withdrawal } from '../../lib/cash';
import { formatUSD, loadExpenses } from '../../lib/expenses';
import { usePrefs } from '../../lib/prefs';

// Figma: 08 Accounts. Institution groups and account cards (checking, savings, credit card),
// with connection status. Tapping a card will open its detail screen (not built yet).
// Log out, settings, and data controls live in Settings (opened from the avatar on Home).
export default function Accounts() {
  const { c, t } = useTheme();
  const router = useRouter();
  const { hideAmounts } = usePrefs();
  // Hides money amounts when Hide amounts is on (privacy).
  const money = (n: number) => (hideAmounts ? '••••••' : formatUSD(n));
  const [accounts, setAccounts] = useState<DemoAccount[]>([]);
  const [cashHand, setCashHand] = useState(0);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  const refreshCash = () => {
    Promise.all([loadWithdrawals(), loadExpenses(), loadDemoAccounts()]).then(([w, e, a]) => {
      setWithdrawals(w);
      setCashHand(cashOnHand(w, e));
      setAccounts(a);
    });
  };

  const editWithdrawal = (w: Withdrawal) => {
    const save = async (value?: string) => {
      const next = parseAmount(value);
      if (next === null || next <= 0) return;
      await updateWithdrawal(w.id, next);
      refreshCash();
    };
    if (Platform.OS !== 'android') {
      Alert.prompt('Change amount', `Taken out from ${w.fromName}. Enter the new amount.`, save, 'plain-text', String(w.amount), 'decimal-pad');
    } else {
      Alert.alert('Change amount', 'Changing amounts is available on iPhone in this demo.');
    }
  };

  const removeWithdrawal = (w: Withdrawal) => {
    Alert.alert('Delete cash withdrawal', `Delete ${money(w.amount)}? The money goes back to ${w.fromName}.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteWithdrawal(w.id); refreshCash(); } },
    ]);
  };

  const [syncedIds, setSyncedIds] = useState<string[]>([]);

  useFocusEffect(useCallback(() => {
    loadDemoAccounts().then(setAccounts);
    loadSyncedIds().then(setSyncedIds);
    refreshCash();
  }, []));

  const groups = useMemo(() => {
    const map = new Map<string, DemoAccount[]>();
    accounts.forEach((a) => {
      const list = map.get(a.institution) ?? [];
      list.push(a);
      map.set(a.institution, list);
    });
    return Array.from(map.entries());
  }, [accounts]);

  const styles = useMemo(() => StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.canvas },
    content: { paddingHorizontal: screenInset, paddingTop: spacing[16], paddingBottom: spacing[12] },
    heading: { color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: t.h1.fontWeight, lineHeight: t.h1.lineHeight },
    groupLabel: { color: c.textSecondary, fontSize: t.caption.fontSize, fontWeight: '600', letterSpacing: font(0.0375), marginTop: spacing[6], marginBottom: spacing[2], textTransform: 'uppercase' },
    card: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.cardBorder, borderRadius: rem(1.125), paddingHorizontal: rem(1.125), paddingVertical: rem(1), marginBottom: spacing[2], gap: spacing[1] },
    cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
    cardName: { flex: 1, color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: '600' },
    synced: { color: c.success, fontSize: t.caption.fontSize, fontWeight: '600' },
    warn: { color: c.warning, fontSize: t.caption.fontSize, fontWeight: '600' },
    line: { color: c.textPrimary, fontSize: font(0.9375), fontVariant: ['tabular-nums'] },
    sub: { color: c.textSecondary, fontSize: t.caption.fontSize, lineHeight: t.caption.lineHeight },
    addBtn: {
      minHeight: rem(3.25), borderRadius: rem(0.875), borderWidth: 1, borderColor: c.cardBorder, backgroundColor: c.surface,
      alignItems: 'center', justifyContent: 'center', marginTop: spacing[4],
    },
    addLabel: { color: c.textPrimary, fontSize: font(1.0625), fontWeight: '600' },
    footnote: { color: c.textSecondary, fontSize: t.caption.fontSize, lineHeight: t.caption.lineHeight, marginTop: spacing[3] },
    pressed: { opacity: 0.8 },
  }), [c, t]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading} accessibilityRole="header">Accounts</Text>
      <View style={{ alignSelf: 'flex-start', backgroundColor: c.accentSoft, borderRadius: radius.pill, paddingHorizontal: spacing[2], paddingVertical: rem(0.25), marginTop: spacing[2] }}
        accessibilityLabel="Demo data, fictional accounts">
        <Text style={{ color: c.accent, fontSize: font(0.6875), fontWeight: '600', letterSpacing: font(0.0375) }}>DEMO · FICTIONAL ACCOUNTS</Text>
      </View>

      {accounts.length === 0 ? (
        <Text style={styles.footnote}>No demo accounts yet. Add demo accounts to explore the app.</Text>
      ) : (
        groups.map(([institution, items]) => (
          <View key={institution}>
            <Text style={styles.groupLabel} accessibilityRole="header">{institution}</Text>
            {items.map((a) => (
              <Pressable key={a.id} style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
                onPress={() => router.push({ pathname: '/account-detail', params: { id: a.id } })}
                accessibilityRole="button"
                accessibilityHint={a.kind === 'cash'
                  ? `Opens this account. Available ${money(a.available ?? 0)}. Current ${money(a.current ?? 0)}. Updated 2 minutes ago.`
                  : `Opens this account. You owe ${money(a.owed ?? 0)}. Credit card debt, not part of your cash. Not updated yet.`}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardName}>{a.name} ····{a.mask}</Text>
                  <Text style={a.kind === 'cash' ? styles.synced : styles.warn}>
                    {a.kind === 'cash' || syncedIds.includes(a.id) ? 'Updated 2 min ago' : 'Not updated yet'}
                  </Text>
                </View>
                {a.kind === 'cash' ? (
                  <>
                    <Text style={styles.line}>Available {money(a.available ?? 0)}</Text>
                    <Text style={styles.sub}>Current {money(a.current ?? 0)}</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.line}>You owe {money(a.owed ?? 0)}</Text>
                    <Text style={styles.sub}>Credit card debt · not part of your cash</Text>
                  </>
                )}
              </Pressable>
            ))}
          </View>
        ))
      )}

      <Pressable style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
        onPress={() => router.push('/statement')} accessibilityRole="button">
        <Text style={styles.addLabel}>See history (6 months)</Text>
      </Pressable>

      <Pressable onPress={() => router.push('/cash')} accessibilityRole="button"
        accessibilityHint="Tap to see and change cash taken out"
        style={({ pressed }) => ({ backgroundColor: c.surface, borderWidth: 1, borderColor: c.cardBorder, borderRadius: rem(1.125), paddingHorizontal: rem(1.125), paddingVertical: rem(1), marginTop: spacing[4], opacity: pressed ? 0.85 : 1 })}>
        <Text style={{ color: c.textSecondary, fontSize: t.caption.fontSize, fontWeight: '600' }}>Cash on hand</Text>
        <Text style={{ color: c.textPrimary, fontSize: t.h2.fontSize, fontWeight: '700', marginTop: rem(0.125) }}>{money(cashHand)}</Text>
        <Text style={{ color: c.textSecondary, fontSize: t.caption.fontSize, marginTop: rem(0.125) }}>Taken out of the bank, minus cash you spent</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing[3] }}>
          <Text style={{ color: c.accent, fontSize: t.secondary.fontSize, fontWeight: '600' }}>Tap to open cash notes</Text>
          <ChevronRightIcon size={rem(1.375)} color={c.accent} />
        </View>
      </Pressable>

      <Pressable style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
        onPress={() => router.push('/withdraw')} accessibilityRole="button" accessibilityLabel="Take out cash">
        <Text style={styles.addLabel}>Take out cash</Text>
      </Pressable>

      {withdrawals.length > 0 && (
        <View style={{ marginTop: spacing[4] }}>
          <Text style={{ color: c.textSecondary, fontSize: t.caption.fontSize, fontWeight: '600', letterSpacing: font(0.0375), marginBottom: spacing[2], textTransform: 'uppercase' }}>
            Cash taken out · tap ⋯ or swipe
          </Text>
          {[...withdrawals].reverse().map((w) => (
            <SwipeRow key={w.id} label={`Cash ${money(w.amount)} from ${w.fromName}`}
              onEdit={() => editWithdrawal(w)} onDelete={() => removeWithdrawal(w)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing[4], minHeight: rem(3.5) }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: '600' }}>{w.fromName}</Text>
                  <Text style={{ color: c.textSecondary, fontSize: t.caption.fontSize }}>{w.date}</Text>
                </View>
                <Text style={{ color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: '600' }}>−{money(w.amount)}</Text>
              </View>
            </SwipeRow>
          ))}
        </View>
      )}

      <Pressable
        style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
        onPress={() => router.push('/add-account')}
        accessibilityRole="button"
        accessibilityLabel="Add demo account"
      >
        <Text style={styles.addLabel}>Add demo account</Text>
      </Pressable>
      <Text style={styles.footnote}>Demo accounts are fictional. No bank credentials are accepted.</Text>
    </ScrollView>
  );
}

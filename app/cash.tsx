import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { WithdrawForm } from '../components/withdraw-form';
import { screenInset, spacing } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';
import { cashOnHand, loadWithdrawals, Withdrawal } from '../lib/cash';
import { formatUSD, loadExpenses } from '../lib/expenses';

// Cash on hand, shown as a bottom sheet: the total, the Take out cash form (amount and note),
// and each cash withdrawal's note and amount.
export default function Cash() {
  const { c, t } = useTheme();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [total, setTotal] = useState(0);

  const refresh = useCallback(() => {
    Promise.all([loadWithdrawals(), loadExpenses()]).then(([w, e]) => {
      setWithdrawals(w);
      setTotal(cashOnHand(w, e));
    });
  }, []);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const styles = useMemo(() => StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.canvas },
    content: { paddingHorizontal: screenInset, paddingTop: spacing[10], paddingBottom: spacing[12] },
    heading: { color: c.textPrimary, fontSize: t.h2.fontSize, fontWeight: '700' },
    amount: { color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: '700', marginTop: spacing[1] },
    hint: { color: c.textSecondary, fontSize: t.caption.fontSize, marginTop: spacing[1] },
    group: { color: c.textSecondary, fontSize: t.caption.fontSize, fontWeight: '600', marginTop: spacing[6], marginBottom: spacing[2] },
    row: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.surface, borderRadius: 14, borderWidth: 1, borderColor: c.cardBorder, padding: spacing[3], marginBottom: spacing[2] },
    rowName: { color: c.textPrimary, fontSize: t.secondary.fontSize, fontWeight: '600' },
    rowMeta: { color: c.textSecondary, fontSize: t.caption.fontSize, marginTop: 2 },
    rowAmount: { color: c.textPrimary, fontSize: t.secondary.fontSize, fontWeight: '700' },
    empty: { color: c.textSecondary, fontSize: t.body.fontSize, marginTop: spacing[2] },
  }), [c, t]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading} accessibilityRole="header">Cash on hand</Text>
      <Text style={styles.amount}>{formatUSD(total)}</Text>
      <Text style={styles.hint}>Taken out of the bank, minus cash you spent</Text>

      <Text style={styles.group}>TAKE OUT CASH</Text>
      <WithdrawForm onSaved={refresh} />

      <Text style={styles.group}>CASH TAKEN OUT</Text>
      {withdrawals.length === 0 ? (
        <Text style={styles.empty}>No cash taken out yet.</Text>
      ) : (
        [...withdrawals].reverse().map((w) => (
          <View key={w.id} style={styles.row} accessible accessibilityLabel={`${w.note || 'Cash taken out'}, ${w.date}, ${formatUSD(w.amount)}`}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowName}>{w.note || 'Cash taken out'}</Text>
              <Text style={styles.rowMeta}>{w.fromName} · {w.date}</Text>
            </View>
            <Text style={styles.rowAmount}>−{formatUSD(w.amount)}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

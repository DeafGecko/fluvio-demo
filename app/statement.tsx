import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BackLink } from '../components/settings-ui';
import { radius, screenInset, spacing, rem, font } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';
import { loadDemoStatement, StatementLine } from '../lib/demo-data';
import { formatUSD } from '../lib/expenses';
import { loadWithdrawals } from '../lib/cash';

const KIND_LABEL: Record<StatementLine['kind'], string> = {
  paycheck: 'Paycheck',
  refund: 'Refund received',
  transfer: 'Transfer',
  purchase: 'Purchase',
  bill: 'Bill',
  subscription: 'Subscription',
  fee: 'Bank fee',
  bounced: 'Bounced payment',
};

// Demo statement. Six months of fictional money in and money out, grouped by month.
export default function Statement() {
  const router = useRouter();
  const { c, t } = useTheme();
  const [lines, setLines] = useState<StatementLine[]>([]);

  useFocusEffect(useCallback(() => {
    // Demo statement plus any cash withdrawals made in this app.
    Promise.all([loadDemoStatement(), loadWithdrawals()]).then(([statement, withdrawals]) => {
      const cashLines: StatementLine[] = withdrawals.map((w) => ({
        id: w.id,
        date: w.at.slice(0, 10),
        name: `Cash withdrawal from ${w.fromName}`,
        amount: -w.amount,
        kind: 'transfer',
      }));
      setLines([...statement, ...cashLines]);
    });
  }, []));

  const groups = useMemo(() => {
    const map = new Map<string, StatementLine[]>();
    [...lines].reverse().forEach((l) => {
      const key = new Date(`${l.date}T00:00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const list = map.get(key) ?? [];
      list.push(l);
      map.set(key, list);
    });
    return Array.from(map.entries());
  }, [lines]);

  const styles = useMemo(() => StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.canvas },
    content: { paddingHorizontal: screenInset, paddingTop: spacing[16], paddingBottom: spacing[12] },
    heading: { color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: t.h1.fontWeight, lineHeight: t.h1.lineHeight, marginTop: spacing[2] },
    demo: { alignSelf: 'flex-start', backgroundColor: c.accentSoft, borderRadius: radius.pill, paddingHorizontal: spacing[2], paddingVertical: rem(0.25), marginTop: spacing[2], marginBottom: spacing[4] },
    demoText: { color: c.accent, fontSize: font(0.6875), fontWeight: '600', letterSpacing: font(0.0375) },
    month: { color: c.textSecondary, fontSize: t.caption.fontSize, fontWeight: '600', marginTop: spacing[5], marginBottom: spacing[2], textTransform: 'uppercase' },
    row: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.cardBorder, borderRadius: radius.md, padding: spacing[3], marginBottom: spacing[2], flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
    info: { flex: 1 },
    name: { color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: t.bodyStrong.fontWeight },
    meta: { color: c.textSecondary, fontSize: t.caption.fontSize, marginTop: rem(0.125) },
    amount: { fontSize: t.bodyStrong.fontSize, fontWeight: t.bodyStrong.fontWeight, fontVariant: ['tabular-nums'] },
  }), [c, t]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <BackLink label="Accounts" onPress={() => router.back()} />
      <Text style={styles.heading} accessibilityRole="header">Account history</Text>
      <View style={styles.demo}><Text style={styles.demoText}>DEMO · FICTIONAL DATA</Text></View>

      {groups.map(([month, items]) => (
        <View key={month}>
          <Text style={styles.month} accessibilityRole="header">{month}</Text>
          {items.map((l) => {
            const moneyIn = l.amount > 0;
            return (
              <View key={l.id} style={styles.row} accessible
                accessibilityLabel={`${l.name}, ${KIND_LABEL[l.kind]}, ${moneyIn ? 'money in' : 'money out'} ${formatUSD(Math.abs(l.amount))}, ${l.date}`}>
                <View style={styles.info}>
                  <Text style={styles.name}>{l.name}</Text>
                  <Text style={styles.meta}>{KIND_LABEL[l.kind]} · {l.date}</Text>
                </View>
                <Text style={[styles.amount, { color: moneyIn ? c.success : c.textPrimary }]}>
                  {moneyIn ? '+' : '−'}{formatUSD(Math.abs(l.amount))}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

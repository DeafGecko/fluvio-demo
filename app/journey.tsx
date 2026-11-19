import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BackLink } from '../components/settings-ui';
import { radius, screenInset, spacing } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';
import { loadDemoStatement, StatementLine } from '../lib/demo-data';
import { loadWithdrawals } from '../lib/cash';
import { formatUSD } from '../lib/expenses';

// Money in and out: a timeline of money in and money out, grouped by month, with totals.
export default function Journey() {
  const router = useRouter();
  const { c, t } = useTheme();
  const [lines, setLines] = useState<StatementLine[]>([]);

  useFocusEffect(useCallback(() => {
    Promise.all([loadDemoStatement(), loadWithdrawals()]).then(([statement, withdrawals]) => {
      const cash = withdrawals.map((w) => ({
        id: w.id, date: w.at.slice(0, 10), name: `Cash withdrawal from ${w.fromName}`, amount: -w.amount, kind: 'transfer' as const,
      }));
      setLines([...statement, ...cash].sort((a, b) => (a.date < b.date ? 1 : -1)));
    });
  }, []));

  const months = useMemo(() => {
    const map = new Map<string, { label: string; items: StatementLine[]; net: number }>();
    lines.forEach((l) => {
      const label = new Date(`${l.date}T00:00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const m = map.get(label) ?? { label, items: [], net: 0 };
      m.items.push(l);
      m.net += l.amount;
      map.set(label, m);
    });
    return Array.from(map.values());
  }, [lines]);

  const styles = useMemo(() => StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.canvas },
    content: { paddingHorizontal: screenInset, paddingTop: spacing[16], paddingBottom: spacing[12] },
    heading: { color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: t.h1.fontWeight, lineHeight: t.h1.lineHeight, marginTop: spacing[2] },
    month: { backgroundColor: c.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: c.cardBorder, padding: spacing[4], marginTop: spacing[4] },
    monthHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[2] },
    monthName: { color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: '700' },
    net: { color: c.textSecondary, fontSize: t.secondary.fontSize, fontWeight: '600' },
    item: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing[2], borderTopWidth: 1, borderTopColor: c.border },
    itemName: { color: c.textPrimary, fontSize: t.secondary.fontSize, flex: 1, paddingRight: spacing[2] },
    itemDate: { color: c.textSecondary, fontSize: t.caption.fontSize },
    itemAmt: { color: c.textPrimary, fontSize: t.secondary.fontSize, fontWeight: '600' },
    note: { color: c.textSecondary, fontSize: t.caption.fontSize, marginTop: spacing[4] },
  }), [c, t]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <BackLink label="Insights" onPress={() => (router.canGoBack() ? router.back() : router.replace('/insights'))} />
      <Text style={styles.heading} accessibilityRole="header">Money in and out</Text>
      <Text style={styles.note}>Money in and money out, newest first. Demo data only.</Text>

      {months.map((m) => (
        <View key={m.label} style={styles.month}>
          <View style={styles.monthHead}>
            <Text style={styles.monthName} accessibilityRole="header">{m.label}</Text>
            <Text style={styles.net} accessibilityLabel={`Net ${m.net >= 0 ? 'plus' : 'minus'} ${formatUSD(Math.abs(m.net))}`}>
              Net {m.net >= 0 ? '+' : '−'}{formatUSD(Math.abs(m.net))}
            </Text>
          </View>
          {m.items.map((l) => (
            <View key={l.id} style={styles.item} accessible
              accessibilityLabel={`${l.name}, ${l.date}, ${l.amount >= 0 ? 'money in' : 'money out'} ${formatUSD(Math.abs(l.amount))}`}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{l.name}</Text>
                <Text style={styles.itemDate}>{l.date}</Text>
              </View>
              <Text style={styles.itemAmt}>{l.amount >= 0 ? '+' : '−'}{formatUSD(Math.abs(l.amount))}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

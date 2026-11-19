import { BackLink } from '../components/settings-ui';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { minTarget, radius, screenInset, spacing } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';
import { Expense, formatUSD, loadExpenses, sumExpenses, totalsByCategory } from '../lib/expenses';
import { currentMonthShort } from '../lib/subscriptions';

const W = Dimensions.get('window').width;

// Hidden stack route, reached from Insights. Every chart has a text equivalent below it.
export default function Stats() {
  const router = useRouter();
  const { c, t, cat: catColor } = useTheme();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  useFocusEffect(useCallback(() => { loadExpenses().then(setExpenses); }, []));

  // This month only, so the total matches Home and Insights.
  const monthName = new Date().toLocaleDateString('en-US', { month: 'long' });
  const monthExpenses = expenses.filter((e) => !e.deletedAt && e.date.split(' ')[0] === currentMonthShort());
  const total = sumExpenses(monthExpenses);
  const categoryTotals = totalsByCategory(monthExpenses);
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const pieData = sortedCategories.map(([category, amount]) => ({
    name: category, amount, color: catColor[category] ?? '#94a3b8',
    legendFontColor: c.textSecondary, legendFontSize: 12,
  }));
  const dailyTotals = monthExpenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.date] = (acc[e.date] || 0) + e.amount; return acc;
  }, {});
  const sortedDays = Object.entries(dailyTotals).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  const maxDaily = Math.max(...Object.values(dailyTotals), 1);

  const styles = useMemo(() => StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.canvas },
    content: { paddingHorizontal: screenInset, paddingTop: spacing[16], paddingBottom: spacing[12] },
    back: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], minHeight: minTarget, minWidth: minTarget, alignSelf: 'flex-start' },
    backLabel: { color: c.accent, fontSize: t.bodyStrong.fontSize, fontWeight: t.bodyStrong.fontWeight },
    heading: { color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: t.h1.fontWeight, lineHeight: t.h1.lineHeight, marginTop: spacing[2] },
    sub: { color: c.textSecondary, fontSize: t.secondary.fontSize, lineHeight: t.secondary.lineHeight, marginTop: spacing[1], marginBottom: spacing[6] },
    card: { backgroundColor: c.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: c.cardBorder, padding: spacing[3], marginBottom: spacing[6] },
    sectionTitle: { color: c.textPrimary, fontSize: t.h3.fontSize, fontWeight: t.h3.fontWeight, lineHeight: t.h3.lineHeight, marginBottom: spacing[3] },
    row: { backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.cardBorder, padding: spacing[3], marginBottom: spacing[2] },
    rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[2] },
    rowName: { color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: t.bodyStrong.fontWeight },
    rowValue: { color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: t.bodyStrong.fontWeight, fontVariant: ['tabular-nums'] },
    rowMeta: { color: c.textSecondary, fontSize: t.caption.fontSize, marginTop: 2 },
    barBg: { height: 8, backgroundColor: c.surfaceMuted, borderRadius: radius.pill, overflow: 'hidden' },
    barFill: { height: 8, borderRadius: radius.pill },
    empty: { alignItems: 'center', paddingVertical: spacing[10], gap: spacing[2] },
    emptyTitle: { color: c.textPrimary, fontSize: t.h3.fontSize, fontWeight: t.h3.fontWeight },
    emptyBody: { color: c.textSecondary, fontSize: t.secondary.fontSize, lineHeight: t.secondary.lineHeight, textAlign: 'center' },
  }), [c, t]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <BackLink label="Insights" onPress={() => router.back()} />

      <Text style={styles.heading} accessibilityRole="header">Spending breakdown</Text>
      <Text style={styles.sub}>Spent in {monthName}: {formatUSD(total)}</Text>

      {expenses.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No data yet</Text>
          <Text style={styles.emptyBody}>Add purchases to see the breakdown.</Text>
        </View>
      ) : (
        <>
          <View style={styles.card} accessible={false}>
            <PieChart data={pieData} width={W - screenInset * 2 - spacing[6]} height={160}
              chartConfig={{ color: (o = 1) => `rgba(23,35,30,${o})`, backgroundColor: c.surface, backgroundGradientFrom: c.surface, backgroundGradientTo: c.surface }}
              accessor="amount" backgroundColor="transparent" paddingLeft="10" absolute={false} />
          </View>

          <Text style={styles.sectionTitle} accessibilityRole="header">By category</Text>
          <View accessibilityRole="list">
            {sortedCategories.map(([category, amount]) => {
              const share = total > 0 ? (amount / total) * 100 : 0;
              const color = catColor[category] ?? '#94a3b8';
              return (
                <View key={category} style={styles.row} accessible accessibilityRole="listitem"
                  accessibilityLabel={`${category}: ${formatUSD(amount)}, ${share.toFixed(0)} percent of total logged`}>
                  <View style={styles.rowHeader}>
                    <Text style={styles.rowName}>{category}</Text>
                    <Text style={styles.rowValue}>{formatUSD(amount)}</Text>
                  </View>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: `${share}%`, backgroundColor: color }]} />
                  </View>
                  <Text style={styles.rowMeta}>{share.toFixed(0)}% of total logged</Text>
                </View>
              );
            })}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: spacing[6] }]} accessibilityRole="header">By day</Text>
          <View accessibilityRole="list">
            {sortedDays.map(([date, amount]) => (
              <View key={date} style={styles.row} accessible accessibilityRole="listitem"
                accessibilityLabel={`${date}: ${formatUSD(amount)}`}>
                <View style={styles.rowHeader}>
                  <Text style={styles.rowName}>{date}</Text>
                  <Text style={styles.rowValue}>{formatUSD(amount)}</Text>
                </View>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${(amount / maxDaily) * 100}%`, backgroundColor: c.accent }]} />
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

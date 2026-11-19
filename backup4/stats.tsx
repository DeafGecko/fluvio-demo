import { useCallback, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { PieChart } from 'react-native-chart-kit';
import { ChartPieIcon } from 'react-native-heroicons/outline';
import { LightBulbIcon as BulbSolid } from 'react-native-heroicons/solid';
import { loadExpenses } from './index';
import type { Expense } from './index';

const SCREEN_WIDTH = Dimensions.get('window').width;

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#4ade80', Transport: '#4f9eff', Entertainment: '#a855f7',
  Health: '#f87171', Shopping: '#fb923c', Bills: '#facc15', Other: '#94a3b8',
};

export default function Stats() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  useFocusEffect(useCallback(() => { loadExpenses().then(setExpenses); }, []));

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryTotals = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount; return acc;
  }, {});

  const pieData = Object.entries(categoryTotals).map(([category, amount]) => ({
    name: category, amount,
    color: CATEGORY_COLORS[category] ?? '#94a3b8',
    legendFontColor: '#253550', legendFontSize: 11,
  }));

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  const dailyTotals = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.date] = (acc[e.date] || 0) + e.amount; return acc;
  }, {});
  const sortedDays = Object.entries(dailyTotals).sort((a, b) =>
    new Date(b[0]).getTime() - new Date(a[0]).getTime()
  );
  const maxDaily = Math.max(...Object.values(dailyTotals), 1);

  return (
    <View style={styles.bg}>
      <View style={styles.nebula1} />
      <View style={styles.nebula2} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.heading} accessibilityRole="header">Spending Breakdown</Text>
          <Text style={styles.subHeading} accessibilityLabel={`Total: $${total.toFixed(2)}`}>
            Total: ${total.toFixed(2)}
          </Text>
        </View>

        {expenses.length === 0 ? (
          <View style={styles.emptyState} accessible accessibilityLabel="No data yet.">
            <View style={styles.emptyIconWrap}>
              <ChartPieIcon size={24} color="#1a3a6e" />
            </View>
            <Text style={styles.emptyText}>No data yet</Text>
            <Text style={styles.emptySubText}>Add expenses to see your chart</Text>
          </View>
        ) : (
          <>
            <View style={styles.chartCard} accessible accessibilityLabel={`Chart: ${pieData.map(d => `${d.name}: ${((d.amount / total) * 100).toFixed(0)}%`).join(', ')}`}>
              <PieChart
                data={pieData}
                width={SCREEN_WIDTH - 32}
                height={160}
                chartConfig={{
                  color: (opacity = 1) => `rgba(240,244,255,${opacity})`,
                  backgroundColor: '#060d1e',
                  backgroundGradientFrom: '#060d1e',
                  backgroundGradientTo: '#060d1e',
                }}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="10"
                absolute={false}
              />
            </View>

            <Text style={styles.sectionTitle} accessibilityRole="header">By Category</Text>
            <View accessibilityRole="list">
              {sortedCategories.map(([category, amount]) => {
                const pct = total > 0 ? ((amount / total) * 100).toFixed(1) : '0';
                return (
                  <View key={category} style={styles.row} accessibilityRole="listitem" accessible
                    accessibilityLabel={`${category}: $${amount.toFixed(2)}, ${pct}%`}>
                    <View style={styles.rowHeader}>
                      <View style={styles.rowLeft}>
                        <View style={[styles.dot, { backgroundColor: CATEGORY_COLORS[category] ?? '#94a3b8' }]} />
                        <Text style={styles.rowName}>{category}</Text>
                      </View>
                      <View style={styles.rowRight}>
                        <Text style={styles.rowAmount}>${amount.toFixed(2)}</Text>
                        <Text style={styles.rowPct}>{pct}%</Text>
                      </View>
                    </View>
                    <View style={styles.barBg} accessibilityElementsHidden>
                      <View style={[styles.barFill, {
                        width: `${(amount / total) * 100}%`,
                        backgroundColor: CATEGORY_COLORS[category] ?? '#94a3b8',
                      }]} />
                    </View>
                  </View>
                );
              })}
            </View>

            <Text style={styles.sectionTitle} accessibilityRole="header">By Day</Text>
            <View accessibilityRole="list">
              {sortedDays.map(([date, amount]) => (
                <View key={date} style={styles.row} accessibilityRole="listitem" accessible
                  accessibilityLabel={`${date}: $${amount.toFixed(2)}`}>
                  <View style={styles.rowHeader}>
                    <Text style={styles.rowName}>{date}</Text>
                    <Text style={styles.rowAmount}>${amount.toFixed(2)}</Text>
                  </View>
                  <View style={styles.barBg} accessibilityElementsHidden>
                    <View style={[styles.barFill, {
                      width: `${(amount / maxDaily) * 100}%`,
                      backgroundColor: '#4f9eff',
                    }]} />
                  </View>
                </View>
              ))}
            </View>

            {sortedCategories.length > 0 && (
              <View style={styles.insightCard} accessible
                accessibilityLabel={`Top spending: ${sortedCategories[0][0]}`}>
                <View style={styles.insightTitleRow}>
                  <BulbSolid size={13} color="#4f9eff" />
                  <Text style={styles.insightTitle}>Top Spending</Text>
                </View>
                <Text style={styles.insightText}>
                  Most on <Text style={styles.insightHighlight}>{sortedCategories[0][0]}</Text>
                  {' '}— ${sortedCategories[0][1].toFixed(2)} ({((sortedCategories[0][1] / total) * 100).toFixed(1)}%)
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#02040e' },
  nebula1: { position: 'absolute', width: 240, height: 240, borderRadius: 120, backgroundColor: '#072a2a', top: -50, right: -60, opacity: 0.4 },
  nebula2: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: '#0a1f5e', top: 250, left: -50, opacity: 0.3 },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { marginTop: 56, marginBottom: 14 },
  heading: { fontSize: 22, fontWeight: '800', color: '#f0f4ff', letterSpacing: -0.5 },
  subHeading: { fontSize: 12, color: '#253550', marginTop: 2, fontWeight: '600' },
  chartCard: { backgroundColor: '#060d1e', borderRadius: 14, padding: 10, marginBottom: 16, borderWidth: 1, borderColor: '#0f1f35' },
  sectionTitle: { color: '#f0f4ff', fontSize: 13, fontWeight: '800', marginBottom: 8, letterSpacing: -0.2 },
  row: { backgroundColor: '#060d1e', borderRadius: 10, padding: 10, marginBottom: 5, borderWidth: 1, borderColor: '#0f1f35' },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  rowName: { color: '#e8eeff', fontSize: 12, fontWeight: '700' },
  rowRight: { alignItems: 'flex-end' },
  rowAmount: { color: '#e8eeff', fontSize: 12, fontWeight: '800' },
  rowPct: { color: '#253550', fontSize: 10, marginTop: 1, fontWeight: '600' },
  barBg: { height: 3, backgroundColor: '#0f1f35', borderRadius: 2, overflow: 'hidden' },
  barFill: { height: 3, borderRadius: 2 },
  insightCard: { backgroundColor: '#060d1e', borderRadius: 10, padding: 12, marginTop: 2, marginBottom: 32, borderLeftWidth: 2, borderLeftColor: '#4f9eff', borderWidth: 1, borderColor: '#0f1f35' },
  insightTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
  insightTitle: { color: '#f0f4ff', fontSize: 12, fontWeight: '800' },
  insightText: { color: '#253550', fontSize: 12, lineHeight: 18, fontWeight: '500' },
  insightHighlight: { color: '#4f9eff', fontWeight: '800' },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyIconWrap: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#060d1e', borderWidth: 1, borderColor: '#0f1f35', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  emptyText: { color: '#f0f4ff', fontSize: 14, fontWeight: '700' },
  emptySubText: { color: '#253550', fontSize: 12, marginTop: 3, fontWeight: '500' },
});

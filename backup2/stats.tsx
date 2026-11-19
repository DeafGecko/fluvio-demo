import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { ChartPieIcon } from 'react-native-heroicons/outline';
import { LightBulbIcon as BulbSolid } from 'react-native-heroicons/solid';
import type { Expense } from '../backup4/index';
import { loadExpenses } from '../backup4/index';

const SCREEN_WIDTH = Dimensions.get('window').width;

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#4ade80',
  Transport: '#4f9eff',
  Entertainment: '#a855f7',
  Health: '#f87171',
  Shopping: '#fb923c',
  Bills: '#facc15',
  Other: '#94a3b8',
};

export default function Stats() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  useFocusEffect(useCallback(() => { loadExpenses().then(setExpenses); }, []));

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryTotals = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const pieData = Object.entries(categoryTotals).map(([category, amount]) => ({
    name: category, amount,
    color: CATEGORY_COLORS[category] ?? '#94a3b8',
    legendFontColor: '#253550', legendFontSize: 12,
  }));

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  const dailyTotals = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.date] = (acc[e.date] || 0) + e.amount;
    return acc;
  }, {});
  const sortedDays = Object.entries(dailyTotals).sort((a, b) =>
    new Date(b[0]).getTime() - new Date(a[0]).getTime());
  const maxDaily = Math.max(...Object.values(dailyTotals), 1);

  return (
    <View style={styles.bg}>
      <View style={styles.nebula1} />
      <View style={styles.nebula2} />
      <View style={styles.nebula3} />
      <View style={styles.nebula4} />
      <View style={styles.nebula5} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.heading} accessibilityRole="header">
            Spending{'\n'}Breakdown
          </Text>
          <Text style={styles.subHeading} accessibilityLabel={`Total: $${total.toFixed(2)}`}>
            Total: ${total.toFixed(2)}
          </Text>
        </View>

        {expenses.length === 0 ? (
          <View style={styles.emptyState} accessible accessibilityLabel="No data yet. Add expenses to see your chart.">
            <View style={styles.emptyIconWrap}>
              <ChartPieIcon size={32} color="#1a3a6e" />
            </View>
            <Text style={styles.emptyText}>No data yet</Text>
            <Text style={styles.emptySubText}>Add expenses to see your chart</Text>
          </View>
        ) : (
          <>
            {/* Pie Chart */}
            <View style={styles.chartCard} accessible accessibilityLabel={`Spending chart. ${pieData.map(d => `${d.name}: ${((d.amount / total) * 100).toFixed(0)}%`).join(', ')}`}>
              <PieChart
                data={pieData}
                width={SCREEN_WIDTH - 40}
                height={200}
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

            {/* By Category */}
            <Text style={styles.sectionTitle} accessibilityRole="header">By Category</Text>
            <View accessibilityRole="list">
              {sortedCategories.map(([category, amount]) => {
                const pct = total > 0 ? ((amount / total) * 100).toFixed(1) : '0';
                return (
                  <View key={category} style={styles.row}
                    accessibilityRole="listitem" accessible
                    accessibilityLabel={`${category}: $${amount.toFixed(2)}, ${pct} percent`}
                  >
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
                        shadowColor: CATEGORY_COLORS[category],
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.8,
                        shadowRadius: 4,
                      }]} />
                    </View>
                  </View>
                );
              })}
            </View>

            {/* By Day */}
            <Text style={styles.sectionTitle} accessibilityRole="header">By Day</Text>
            <View accessibilityRole="list">
              {sortedDays.map(([date, amount]) => (
                <View key={date} style={styles.row}
                  accessibilityRole="listitem" accessible
                  accessibilityLabel={`${date}: $${amount.toFixed(2)}`}
                >
                  <View style={styles.rowHeader}>
                    <Text style={styles.rowName}>{date}</Text>
                    <Text style={styles.rowAmount}>${amount.toFixed(2)}</Text>
                  </View>
                  <View style={styles.barBg} accessibilityElementsHidden>
                    <View style={[styles.barFill, {
                      width: `${(amount / maxDaily) * 100}%`,
                      backgroundColor: '#4f9eff',
                      shadowColor: '#4f9eff',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.8,
                      shadowRadius: 4,
                    }]} />
                  </View>
                </View>
              ))}
            </View>

            {/* Top Insight */}
            {sortedCategories.length > 0 && (
              <View style={styles.insightCard} accessible
                accessibilityLabel={`Top spending: ${sortedCategories[0][0]}, $${sortedCategories[0][1].toFixed(2)}, ${((sortedCategories[0][1] / total) * 100).toFixed(1)} percent of total`}
              >
                <View style={styles.insightTitleRow}>
                  <BulbSolid size={15} color="#4f9eff" />
                  <Text style={styles.insightTitle}>Top Spending</Text>
                </View>
                <Text style={styles.insightText}>
                  You spend the most on{' '}
                  <Text style={styles.insightHighlight}>{sortedCategories[0][0]}</Text>
                  {' '}— ${sortedCategories[0][1].toFixed(2)} (
                  {((sortedCategories[0][1] / total) * 100).toFixed(1)}% of total)
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
  nebula1: {
    position: 'absolute', width: 300, height: 300,
    borderRadius: 150, backgroundColor: '#072a2a',
    top: -60, right: -80, opacity: 0.25,
  },
  nebula2: {
    position: 'absolute', width: 220, height: 220,
    borderRadius: 110, backgroundColor: '#0a1f5e',
    top: 200, left: -70, opacity: 0.15,
  },
  nebula3: {
    position: 'absolute', width: 180, height: 280,
    borderRadius: 100, backgroundColor: '#1a0a3e',
    top: 450, right: -50, opacity: 0.15,
  },
  nebula4: {
    position: 'absolute', width: 260, height: 150,
    borderRadius: 90, backgroundColor: '#071a1a',
    top: 700, left: -40, opacity: 0.1,
  },
  nebula5: {
    position: 'absolute', width: 160, height: 160,
    borderRadius: 80, backgroundColor: '#0d2248',
    top: 900, right: -20, opacity: 0.25,
  },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { marginTop: 60, marginBottom: 24 },
  heading: {
    fontSize: 34, fontWeight: '800', color: '#f0f4ff', letterSpacing: -1,
  },
  subHeading: { fontSize: 14, color: '#253550', marginTop: 6, fontWeight: '600' },
  chartCard: {
    backgroundColor: '#060d1e', borderRadius: 22,
    padding: 14, marginBottom: 28,
    borderWidth: 1, borderColor: '#0f1f35',
  },
  sectionTitle: {
    color: '#f0f4ff', fontSize: 17, fontWeight: '800',
    marginBottom: 12, letterSpacing: -0.3,
  },
  row: {
    backgroundColor: '#060d1e', borderRadius: 16,
    padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: '#0f1f35',
  },
  rowHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 9, height: 9, borderRadius: 5 },
  rowName: { color: '#e8eeff', fontSize: 14, fontWeight: '700' },
  rowRight: { alignItems: 'flex-end' },
  rowAmount: { color: '#e8eeff', fontSize: 14, fontWeight: '800' },
  rowPct: { color: '#253550', fontSize: 12, marginTop: 2, fontWeight: '600' },
  barBg: {
    height: 4, backgroundColor: '#0f1f35',
    borderRadius: 2, overflow: 'hidden',
  },
  barFill: { height: 4, borderRadius: 2 },
  insightCard: {
    backgroundColor: '#060d1e', borderRadius: 16,
    padding: 16, marginTop: 4, marginBottom: 40,
    borderLeftWidth: 2, borderLeftColor: '#4f9eff',
    borderWidth: 1, borderColor: '#0f1f35',
  },
  insightTitleRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 8,
  },
  insightTitle: { color: '#f0f4ff', fontSize: 14, fontWeight: '800' },
  insightText: { color: '#253550', fontSize: 13, lineHeight: 20, fontWeight: '500' },
  insightHighlight: { color: '#4f9eff', fontWeight: '800' },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyIconWrap: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: '#060d1e', borderWidth: 1,
    borderColor: '#0f1f35', alignItems: 'center',
    justifyContent: 'center', marginBottom: 16,
  },
  emptyText: { color: '#f0f4ff', fontSize: 17, fontWeight: '700' },
  emptySubText: { color: '#253550', fontSize: 13, marginTop: 6, fontWeight: '500' },
});
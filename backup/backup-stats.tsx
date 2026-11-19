import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { ChartPieIcon } from 'react-native-heroicons/outline';
import { LightBulbIcon } from 'react-native-heroicons/solid';
import type { Expense } from './backup-index';
import { loadExpenses } from './backup-index';

const SCREEN_WIDTH = Dimensions.get('window').width;

const CATEGORY_COLORS: Record<string, string> = {
      Food: '#4ade80',
      Transport: '#60a5fa',
      Entertainment: '#c084fc',
      Health: '#f87171',
      Shopping: '#fb923c',
      Bills: '#facc15',
      Other: '#94a3b8',
};

export default function Stats() {
      const [expenses, setExpenses] = useState<Expense[]>([]);

      useFocusEffect(
            useCallback(() => {
                  loadExpenses().then(setExpenses);
            }, [])
      );

      const total = expenses.reduce((sum, e) => sum + e.amount, 0);

      const categoryTotals = expenses.reduce<Record<string, number>>((acc, e) => {
            acc[e.category] = (acc[e.category] || 0) + e.amount;
            return acc;
      }, {});

      const pieData = Object.entries(categoryTotals).map(([category, amount]) => ({
            name: category,
            amount,
            color: CATEGORY_COLORS[category] ?? '#94a3b8',
            legendFontColor: '#64748b',
            legendFontSize: 13,
      }));

      const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

      // Daily breakdown
      const dailyTotals = expenses.reduce<Record<string, number>>((acc, e) => {
            acc[e.date] = (acc[e.date] || 0) + e.amount;
            return acc;
      }, {});

      const sortedDays = Object.entries(dailyTotals).sort((a, b) =>
            new Date(b[0]).getTime() - new Date(a[0]).getTime()
      );

      const maxDaily = Math.max(...Object.values(dailyTotals), 1);

      return (
            <ScrollView
                  style={styles.container}
                  showsVerticalScrollIndicator={false}
                  accessibilityRole="scrollview"
            >
                  {/* Header */}
                  <View style={styles.header}>
                        <Text
                              style={styles.heading}
                              accessibilityRole="header"
                              accessibilityLabel="Spending Breakdown screen"
                        >
                              Spending{'\n'}Breakdown
                        </Text>
                        <Text
                              style={styles.subHeading}
                              accessibilityLabel={`Total: $${total.toFixed(2)}`}
                        >
                              Total: ${total.toFixed(2)}
                        </Text>
                  </View>

                  {expenses.length === 0 ? (
                        <View
                              style={styles.emptyState}
                              accessible={true}
                              accessibilityLabel="No data yet. Add some expenses to see your chart."
                        >
                              <ChartPieIcon size={52} color="#2d3f55" />
                              <Text style={styles.emptyText}>No data yet</Text>
                              <Text style={styles.emptySubText}>Add expenses to see your chart</Text>
                        </View>
                  ) : (
                        <>
                              {/* Pie Chart */}
                              <View
                                    style={styles.chartCard}
                                    accessible={true}
                                    accessibilityLabel={`Spending pie chart. ${pieData.map(d => `${d.name}: ${((d.amount / total) * 100).toFixed(0)}%`).join(', ')}`}
                              >
                                    <PieChart
                                          data={pieData}
                                          width={SCREEN_WIDTH - 40}
                                          height={200}
                                          chartConfig={{
                                                color: (opacity = 1) => `rgba(226,232,240,${opacity})`,
                                                backgroundColor: '#1a2332',
                                                backgroundGradientFrom: '#1a2332',
                                                backgroundGradientTo: '#1a2332',
                                          }}
                                          accessor="amount"
                                          backgroundColor="transparent"
                                          paddingLeft="10"
                                          absolute={false}
                                    />
                              </View>

                              {/* By Category */}
                              <Text
                                    style={styles.sectionTitle}
                                    accessibilityRole="header"
                              >
                                    By Category
                              </Text>
                              <View accessibilityRole="list">
                                    {sortedCategories.map(([category, amount]) => {
                                          const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : '0';
                                          const barWidth = total > 0 ? (amount / total) * 100 : 0;
                                          return (
                                                <View
                                                      key={category}
                                                      style={styles.categoryRow}
                                                      accessibilityRole="listitem"
                                                      accessible={true}
                                                      accessibilityLabel={`${category}: $${amount.toFixed(2)}, ${percentage} percent of total`}
                                                >
                                                      <View style={styles.categoryHeader}>
                                                            <View style={styles.categoryLeft}>
                                                                  <View style={[styles.dot, { backgroundColor: CATEGORY_COLORS[category] ?? '#94a3b8' }]} />
                                                                  <Text style={styles.categoryName}>{category}</Text>
                                                            </View>
                                                            <View style={styles.categoryRight}>
                                                                  <Text style={styles.categoryAmount}>${amount.toFixed(2)}</Text>
                                                                  <Text style={styles.categoryPercent}>{percentage}%</Text>
                                                            </View>
                                                      </View>
                                                      <View
                                                            style={styles.barBackground}
                                                            accessibilityElementsHidden={true}
                                                      >
                                                            <View style={[
                                                                  styles.barFill,
                                                                  { width: `${barWidth}%`, backgroundColor: CATEGORY_COLORS[category] ?? '#94a3b8' }
                                                            ]} />
                                                      </View>
                                                </View>
                                          );
                                    })}
                              </View>

                              {/* Daily Breakdown */}
                              <Text
                                    style={styles.sectionTitle}
                                    accessibilityRole="header"
                              >
                                    By Day
                              </Text>
                              <View accessibilityRole="list">
                                    {sortedDays.map(([date, amount]) => {
                                          const barWidth = (amount / maxDaily) * 100;
                                          return (
                                                <View
                                                      key={date}
                                                      style={styles.categoryRow}
                                                      accessibilityRole="listitem"
                                                      accessible={true}
                                                      accessibilityLabel={`${date}: $${amount.toFixed(2)}`}
                                                >
                                                      <View style={styles.categoryHeader}>
                                                            <Text style={styles.categoryName}>{date}</Text>
                                                            <Text style={styles.categoryAmount}>${amount.toFixed(2)}</Text>
                                                      </View>
                                                      <View
                                                            style={styles.barBackground}
                                                            accessibilityElementsHidden={true}
                                                      >
                                                            <View style={[styles.barFill, { width: `${barWidth}%`, backgroundColor: '#3b82f6' }]} />
                                                      </View>
                                                </View>
                                          );
                                    })}
                              </View>

                              {/* Top Spending Insight */}
                              {sortedCategories.length > 0 && (
                                    <View
                                          style={styles.insightCard}
                                          accessible={true}
                                          accessibilityLabel={`Top spending insight: You spend the most on ${sortedCategories[0][0]}, $${sortedCategories[0][1].toFixed(2)}, ${((sortedCategories[0][1] / total) * 100).toFixed(1)} percent of total`}
                                    >
                                          <View style={styles.insightTitleRow}>
                                                <LightBulbIcon size={16} color="#60a5fa" />
                                                <Text style={styles.insightTitle}>Top Spending</Text>
                                          </View>
                                          <Text style={styles.insightText}>
                                                You spend the most on{' '}
                                                <Text style={styles.insightHighlight}>
                                                      {sortedCategories[0][0]}
                                                </Text>
                                                {' '}— ${sortedCategories[0][1].toFixed(2)} (
                                                {((sortedCategories[0][1] / total) * 100).toFixed(1)}% of total)
                                          </Text>
                                    </View>
                              )}
                        </>
                  )}
            </ScrollView>
      );
}

const styles = StyleSheet.create({
      container: {
            flex: 1,
            backgroundColor: '#111827',
            paddingHorizontal: 20,
      },
      header: {
            marginTop: 60,
            marginBottom: 24,
      },
      heading: {
            fontSize: 32,
            fontWeight: '800',
            color: '#e2e8f0',
            letterSpacing: -0.5,
      },
      subHeading: {
            fontSize: 14,
            color: '#4a6080',
            marginTop: 6,
            fontWeight: '500',
      },
      chartCard: {
            backgroundColor: '#1a2332',
            borderRadius: 20,
            padding: 16,
            marginBottom: 28,
            borderWidth: 1,
            borderColor: '#243044',
      },
      sectionTitle: {
            color: '#e2e8f0',
            fontSize: 17,
            fontWeight: '700',
            marginBottom: 12,
            letterSpacing: -0.3,
      },
      categoryRow: {
            backgroundColor: '#1a2332',
            borderRadius: 14,
            padding: 14,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: '#243044',
      },
      categoryHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
      },
      categoryLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
      },
      dot: {
            width: 10,
            height: 10,
            borderRadius: 5,
      },
      categoryName: {
            color: '#e2e8f0',
            fontSize: 14,
            fontWeight: '600',
      },
      categoryRight: {
            alignItems: 'flex-end',
      },
      categoryAmount: {
            color: '#e2e8f0',
            fontSize: 14,
            fontWeight: '700',
      },
      categoryPercent: {
            color: '#4a6080',
            fontSize: 12,
            marginTop: 2,
            fontWeight: '500',
      },
      barBackground: {
            height: 5,
            backgroundColor: '#243044',
            borderRadius: 3,
            overflow: 'hidden',
      },
      barFill: {
            height: 5,
            borderRadius: 3,
      },
      insightCard: {
            backgroundColor: '#1a2332',
            borderRadius: 14,
            padding: 16,
            marginTop: 4,
            marginBottom: 40,
            borderLeftWidth: 3,
            borderLeftColor: '#3b82f6',
            borderWidth: 1,
            borderColor: '#243044',
      },
      insightTitleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
      },
      insightTitle: {
            color: '#e2e8f0',
            fontSize: 15,
            fontWeight: '700',
      },
      insightText: {
            color: '#64748b',
            fontSize: 14,
            lineHeight: 21,
      },
      insightHighlight: {
            color: '#e2e8f0',
            fontWeight: '700',
      },
      emptyState: {
            alignItems: 'center',
            marginTop: 80,
      },
      emptyText: {
            color: '#e2e8f0',
            fontSize: 17,
            fontWeight: '700',
            marginTop: 16,
      },
      emptySubText: {
            color: '#4a6080',
            fontSize: 13,
            marginTop: 6,
            fontWeight: '500',
      },
});
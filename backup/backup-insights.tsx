import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
      ActivityIndicator,
      Pressable,
      ScrollView,
      StyleSheet,
      Text,
      View,
} from 'react-native';
import {
      ArrowPathIcon,
      ArrowTrendingDownIcon,
      BoltIcon,
      CpuChipIcon,
      CurrencyDollarIcon,
      DocumentTextIcon,
      LightBulbIcon,
      SparklesIcon,
} from 'react-native-heroicons/outline';
import type { Expense } from './backup-index';
import { loadExpenses } from './backup-index';

async function getAIInsights(expenses: Expense[]): Promise<string[]> {
      const summary = Object.entries(
            expenses.reduce<Record<string, number>>((acc, e) => {
                  acc[e.category] = (acc[e.category] || 0) + e.amount;
                  return acc;
            }, {})
      ).map(([cat, amt]) => `${cat}: $${amt.toFixed(2)}`).join(', ');

      const total = expenses.reduce((sum, e) => sum + e.amount, 0);

      const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                  'Content-Type': 'application/json',
                  'x-api-key': 'YOUR_API_KEY_HERE',
                  'anthropic-version': '2023-06-01',
                  'anthropic-dangerous-direct-browser-access': 'true',
            },
            body: JSON.stringify({
                  model: 'claude-sonnet-4-20250514',
                  max_tokens: 500,
                  messages: [{
                        role: 'user',
                        content: `You are a friendly personal finance advisor. Based on this spending data, give exactly 4 short, specific, actionable tips. Each tip should be 1-2 sentences max.
Spending summary: ${summary}
Total spent: $${total.toFixed(2)}
Number of transactions: ${expenses.length}
Reply ONLY with a JSON array of 4 strings, no other text.`,
                  }],
            }),
      });

      const data = await response.json();
      const text = data.content[0].text.trim();
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [];
}

const TIP_ICON_COMPONENTS = [
      CurrencyDollarIcon,
      ArrowTrendingDownIcon,
      BoltIcon,
      SparklesIcon,
];

const TIP_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#a78bfa'];

export default function Insights() {
      const [expenses, setExpenses] = useState<Expense[]>([]);
      const [tips, setTips] = useState<string[]>([]);
      const [loading, setLoading] = useState(false);
      const [loaded, setLoaded] = useState(false);
      const [error, setError] = useState('');

      useFocusEffect(
            useCallback(() => {
                  loadExpenses().then(setExpenses);
                  setLoaded(false);
                  setTips([]);
            }, [])
      );

      const handleGetInsights = async () => {
            if (expenses.length === 0) return;
            setLoading(true);
            setError('');
            setTips([]);
            try {
                  const result = await getAIInsights(expenses);
                  setTips(result);
                  setLoaded(true);
            } catch {
                  setError('Could not load insights. Please try again.');
            } finally {
                  setLoading(false);
            }
      };

      const total = expenses.reduce((sum, e) => sum + e.amount, 0);
      const categoryTotals = expenses.reduce<Record<string, number>>((acc, e) => {
            acc[e.category] = (acc[e.category] || 0) + e.amount;
            return acc;
      }, {});
      const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

      return (
            <ScrollView
                  style={styles.container}
                  showsVerticalScrollIndicator={false}
                  accessibilityRole="scrollview"
            >
                  {/* Header */}
                  <View style={styles.header}>
                        <View style={styles.headingRow}>
                              <LightBulbIcon size={26} color="#e2e8f0" />
                              <Text
                                    style={styles.heading}
                                    accessibilityRole="header"
                                    accessibilityLabel="AI Insights screen"
                              >
                                    AI Insights
                              </Text>
                        </View>
                        <Text style={styles.subHeading}>
                              Personalized tips based on your spending
                        </Text>
                  </View>

                  {expenses.length === 0 ? (
                        <View
                              style={styles.emptyState}
                              accessible={true}
                              accessibilityLabel="No expenses yet. Add some expenses first to get AI insights."
                        >
                              <DocumentTextIcon size={48} color="#2d3f55" />
                              <Text style={styles.emptyText}>No expenses yet</Text>
                              <Text style={styles.emptySubText}>Add expenses to get AI insights</Text>
                        </View>
                  ) : (
                        <>
                              {/* Snapshot */}
                              <View
                                    style={styles.snapshotRow}
                                    accessibilityRole="summary"
                              >
                                    <View
                                          style={styles.snapshotCard}
                                          accessible={true}
                                          accessibilityLabel={`Total spent: $${total.toFixed(2)}`}
                                    >
                                          <Text style={styles.snapshotValue} numberOfLines={1} adjustsFontSizeToFit>
                                                ${total.toFixed(2)}
                                          </Text>
                                          <Text style={styles.snapshotLabel}>Total Spent</Text>
                                    </View>
                                    <View
                                          style={styles.snapshotCard}
                                          accessible={true}
                                          accessibilityLabel={`${expenses.length} transactions`}
                                    >
                                          <Text style={styles.snapshotValue} numberOfLines={1}>
                                                {expenses.length}
                                          </Text>
                                          <Text style={styles.snapshotLabel}>Transactions</Text>
                                    </View>
                                    <View
                                          style={styles.snapshotCard}
                                          accessible={true}
                                          accessibilityLabel={`Top category: ${topCategory ? topCategory[0] : 'None'}`}
                                    >
                                          <Text style={styles.snapshotValue} numberOfLines={1} adjustsFontSizeToFit>
                                                {topCategory ? topCategory[0] : '—'}
                                          </Text>
                                          <Text style={styles.snapshotLabel}>Top Category</Text>
                                    </View>
                              </View>

                              {/* Button */}
                              {!loaded && (
                                    <Pressable
                                          style={[styles.insightButton, loading && styles.insightButtonDisabled]}
                                          accessibilityRole="button"
                                          accessibilityLabel={loading ? 'AI is analyzing your spending, please wait' : 'Get AI spending insights'}
                                          accessibilityState={{ disabled: loading, busy: loading }}
                                          onPress={handleGetInsights}
                                          disabled={loading}
                                    >
                                          {loading ? (
                                                <View style={styles.row}>
                                                      <ActivityIndicator color="#e2e8f0" size="small" />
                                                      <Text style={styles.insightButtonText}>Analyzing your spending...</Text>
                                                </View>
                                          ) : (
                                                <View style={styles.row}>
                                                      <CpuChipIcon size={20} color="#e2e8f0" />
                                                      <Text style={styles.insightButtonText}>Get AI Insights</Text>
                                                </View>
                                          )}
                                    </Pressable>
                              )}

                              {/* Error */}
                              {error !== '' && (
                                    <Pressable
                                          style={styles.errorCard}
                                          onPress={handleGetInsights}
                                          accessibilityRole="button"
                                          accessibilityLabel="Could not load insights. Tap to retry."
                                    >
                                          <Text style={styles.errorText}>{error}</Text>
                                          <Text style={styles.retryText}>Tap to retry</Text>
                                    </Pressable>
                              )}

                              {/* Tips */}
                              {tips.length > 0 && (
                                    <>
                                          <Text
                                                style={styles.sectionTitle}
                                                accessibilityRole="header"
                                          >
                                                Your Personalized Tips
                                          </Text>
                                          <View accessibilityRole="list">
                                                {tips.map((tip, index) => {
                                                      const Icon = TIP_ICON_COMPONENTS[index] ?? SparklesIcon;
                                                      return (
                                                            <View
                                                                  key={index}
                                                                  style={[styles.tipCard, { borderLeftColor: TIP_COLORS[index] }]}
                                                                  accessibilityRole="listitem"
                                                                  accessible={true}
                                                                  accessibilityLabel={`Tip ${index + 1}: ${tip}`}
                                                            >
                                                                  <Icon size={20} color={TIP_COLORS[index]} style={{ marginTop: 2 }} />
                                                                  <Text style={styles.tipText}>{tip}</Text>
                                                            </View>
                                                      );
                                                })}
                                          </View>

                                          <Pressable
                                                style={styles.refreshButton}
                                                accessibilityRole="button"
                                                accessibilityLabel="Refresh AI insights"
                                                onPress={handleGetInsights}
                                          >
                                                <View style={styles.row}>
                                                      <ArrowPathIcon size={15} color="#4a6080" />
                                                      <Text style={styles.refreshText}>Refresh Insights</Text>
                                                </View>
                                          </Pressable>
                                    </>
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
      headingRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginBottom: 6,
      },
      heading: {
            fontSize: 28,
            fontWeight: '800',
            color: '#e2e8f0',
            letterSpacing: -0.5,
      },
      subHeading: {
            fontSize: 14,
            color: '#4a6080',
            fontWeight: '500',
      },
      snapshotRow: {
            flexDirection: 'row',
            gap: 10,
            marginBottom: 24,
      },
      snapshotCard: {
            flex: 1,
            backgroundColor: '#1a2332',
            borderRadius: 16,
            padding: 14,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#243044',
      },
      snapshotValue: {
            color: '#e2e8f0',
            fontSize: 15,
            fontWeight: '700',
            marginBottom: 4,
            textAlign: 'center',
      },
      snapshotLabel: {
            color: '#4a6080',
            fontSize: 11,
            textAlign: 'center',
            fontWeight: '600',
      },
      insightButton: {
            backgroundColor: '#5b21b6',
            borderRadius: 16,
            padding: 18,
            alignItems: 'center',
            marginBottom: 24,
      },
      insightButtonDisabled: {
            backgroundColor: '#2e1065',
      },
      insightButtonText: {
            color: '#e2e8f0',
            fontSize: 15,
            fontWeight: '700',
      },
      row: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
      },
      sectionTitle: {
            color: '#e2e8f0',
            fontSize: 17,
            fontWeight: '700',
            marginBottom: 14,
            letterSpacing: -0.3,
      },
      tipCard: {
            backgroundColor: '#1a2332',
            borderRadius: 14,
            padding: 16,
            marginBottom: 10,
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 12,
            borderLeftWidth: 3,
            borderWidth: 1,
            borderColor: '#243044',
      },
      tipText: {
            color: '#94a3b8',
            fontSize: 14,
            lineHeight: 22,
            flex: 1,
      },
      refreshButton: {
            padding: 16,
            alignItems: 'center',
            marginBottom: 40,
      },
      refreshText: {
            color: '#4a6080',
            fontSize: 14,
            fontWeight: '600',
      },
      errorCard: {
            backgroundColor: '#1f0a0a',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#3f1010',
      },
      errorText: {
            color: '#fca5a5',
            fontSize: 14,
            marginBottom: 8,
      },
      retryText: {
            color: '#f87171',
            fontSize: 13,
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

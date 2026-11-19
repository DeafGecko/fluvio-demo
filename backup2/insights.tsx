import { LinearGradient } from 'expo-linear-gradient';
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
import type { Expense } from '../backup4/index';
import { loadExpenses } from '../backup4/index';

async function getAIInsights(expenses: Expense[]): Promise<string[]> {
  const summary = Object.entries(
    expenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {})
  ).map(([cat, amt]) => `${cat}: $${amt.toFixed(2)}`).join(', ');

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('API key not set.');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `You are a friendly personal finance advisor. Give exactly 4 short, specific, actionable tips based on this data. Each tip: 1-2 sentences max.\nSpending: ${summary}\nTotal: $${total.toFixed(2)}, Transactions: ${expenses.length}\nReply ONLY with a JSON array of 4 strings.`,
      }],
    }),
  });

  if (!response.ok) throw new Error('Failed to fetch AI insights.');

  const data = await response.json();
  try {
    const parsed = JSON.parse(data.content[0].text.trim());
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    throw new Error('Invalid response from AI.');
  }
}

const TIP_ICONS = [CurrencyDollarIcon, ArrowTrendingDownIcon, BoltIcon, SparklesIcon];
const TIP_COLORS = ['#4f9eff', '#2dd4bf', '#facc15', '#a855f7'];

export default function Insights() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');

  useFocusEffect(useCallback(() => {
    loadExpenses().then(setExpenses);
    setLoaded(false);
    setTips([]);
  }, []));

  const handleGetInsights = async () => {
    if (!expenses.length) return;
    setLoading(true);
    setError('');
    setTips([]);
    try {
      const result = await getAIInsights(expenses);
      setTips(result);
      setLoaded(true);
    } catch (err: any) {
      setError(err.message ?? 'Could not load insights. Please try again.');
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
    <View style={styles.bg}>
      <View style={styles.nebula1} />
      <View style={styles.nebula2} />
      <View style={styles.nebula3} />
      <View style={styles.nebula4} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headingRow}>
            <LightBulbIcon
              size={26}
              color="#a855f7"
              style={{
                shadowColor: '#a855f7',
                shadowRadius: 8,
                shadowOpacity: 0.9,
                shadowOffset: { width: 0, height: 0 },
              }}
            />
            <Text style={styles.heading} accessibilityRole="header">
              AI Insights
            </Text>
          </View>
          <Text style={styles.subHeading}>
            Personalized tips based on your spending
          </Text>
        </View>

        {!expenses.length ? (
          <View
            style={styles.emptyState}
            accessible
            accessibilityLabel="No expenses yet. Add some to get AI insights."
          >
            <View style={styles.emptyIconWrap}>
              <DocumentTextIcon size={32} color="#1a2f4a" />
            </View>
            <Text style={styles.emptyText}>No expenses yet</Text>
            <Text style={styles.emptySubText}>
              Add expenses to get AI insights
            </Text>
          </View>
        ) : (
          <>
            {/* Snapshot */}
            <View style={styles.snapshotRow}>
              {[
                {
                  value: `$${total.toFixed(2)}`,
                  label: 'Total Spent',
                  a11y: `Total spent: $${total.toFixed(2)}`,
                },
                {
                  value: `${expenses.length}`,
                  label: 'Transactions',
                  a11y: `${expenses.length} transactions`,
                },
                {
                  value: topCategory ? topCategory[0] : '—',
                  label: 'Top Category',
                  a11y: `Top category: ${topCategory ? topCategory[0] : 'None'}`,
                },
              ].map((item) => (
                <View
                  key={item.label}
                  style={styles.snapshotCard}
                  accessible
                  accessibilityLabel={item.a11y}
                >
                  <Text
                    style={styles.snapshotValue}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {item.value}
                  </Text>
                  <Text style={styles.snapshotLabel}>{item.label}</Text>
                </View>
              ))}
            </View>

            {/* Button */}
            {!loaded && (
              <Pressable
                style={[styles.insightButton, loading && { opacity: 0.6 }]}
                accessibilityRole="button"
                accessibilityLabel={
                  loading
                    ? 'Analyzing spending, please wait'
                    : 'Get AI spending insights'
                }
                accessibilityState={{ disabled: loading, busy: loading }}
                onPress={handleGetInsights}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#2d0a5e', '#1a0a3e', '#0d0620']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buttonGradient}
                >
                  {loading ? (
                    <View style={styles.row}>
                      <ActivityIndicator color="#a855f7" size="small" />
                      <Text style={styles.buttonText}>
                        Analyzing your spending...
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.row}>
                      <CpuChipIcon size={20} color="#a855f7" />
                      <Text style={styles.buttonText}>Get AI Insights</Text>
                    </View>
                  )}
                </LinearGradient>
              </Pressable>
            )}

            {/* Error */}
            {!!error && (
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
                <Text style={styles.sectionTitle} accessibilityRole="header">
                  Your Personalized Tips
                </Text>
                <View accessibilityRole="list">
                  {tips.map((tip, i) => {
                    const Icon = TIP_ICONS[i] ?? SparklesIcon;
                    return (
                      <View
                        key={i}
                        style={[styles.tipCard, { borderLeftColor: TIP_COLORS[i] }]}
                        accessibilityRole="listitem"
                        accessible
                        accessibilityLabel={`Tip ${i + 1}: ${tip}`}
                      >
                        <Icon
                          size={18}
                          color={TIP_COLORS[i]}
                          style={{ marginTop: 2, flexShrink: 0 }}
                        />
                        <Text style={styles.tipText}>{tip}</Text>
                      </View>
                    );
                  })}
                </View>

                <Pressable
                  style={styles.refreshButton}
                  onPress={handleGetInsights}
                  accessibilityRole="button"
                  accessibilityLabel="Refresh AI insights"
                >
                  <View style={styles.row}>
                    <ArrowPathIcon size={14} color="#253550" />
                    <Text style={styles.refreshText}>Refresh Insights</Text>
                  </View>
                </Pressable>
              </>
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
    position: 'absolute', width: 360, height: 360,
    borderRadius: 180, backgroundColor: '#1e0a4e',
    top: -100, right: -90, opacity: 0.3,
  },
  nebula2: {
    position: 'absolute', width: 200, height: 200,
    borderRadius: 100, backgroundColor: '#0a1f5e',
    top: 180, left: -60, opacity: 0.25,
  },
  nebula3: {
    position: 'absolute', width: 240, height: 180,
    borderRadius: 100, backgroundColor: '#2a0a3e',
    top: 420, right: -50, opacity: 0.15,
  },
  nebula4: {
    position: 'absolute', width: 180, height: 280,
    borderRadius: 90, backgroundColor: '#071428',
    top: 650, left: -30, opacity: 0.1,
  },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { marginTop: 60, marginBottom: 24 },
  headingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6,
  },
  heading: {
    fontSize: 34, fontWeight: '800', color: '#f0f4ff', letterSpacing: -1,
  },
  subHeading: {
    fontSize: 14, color: '#253550', fontWeight: '600', letterSpacing: 0.2,
  },
  snapshotRow: { flexDirection: 'row', gap: 8, marginBottom: 22 },
  snapshotCard: {
    flex: 1, backgroundColor: '#060d1e', borderRadius: 16,
    padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#0f1f35',
  },
  snapshotValue: {
    color: '#e8eeff', fontSize: 14, fontWeight: '800',
    marginBottom: 4, textAlign: 'center',
  },
  snapshotLabel: {
    color: '#253550', fontSize: 10, textAlign: 'center',
    fontWeight: '700', letterSpacing: 0.5,
  },
  insightButton: {
    borderRadius: 18, marginBottom: 24,
    overflow: 'hidden', borderWidth: 1, borderColor: '#2d0a5e',
  },
  buttonGradient: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', padding: 18,
  },
  buttonText: { color: '#c084fc', fontSize: 15, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: {
    color: '#f0f4ff', fontSize: 17, fontWeight: '800',
    marginBottom: 12, letterSpacing: -0.3,
  },
  tipCard: {
    backgroundColor: '#060d1e', borderRadius: 14,
    padding: 16, marginBottom: 10,
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    borderLeftWidth: 2, borderWidth: 1, borderColor: '#0f1f35',
  },
  tipText: { color: '#4a6a8a', fontSize: 14, lineHeight: 22, flex: 1 },
  refreshButton: { padding: 16, alignItems: 'center', marginBottom: 40 },
  refreshText: { color: '#253550', fontSize: 14, fontWeight: '600' },
  errorCard: {
    backgroundColor: '#1a0808', borderRadius: 12, padding: 16,
    marginBottom: 16, alignItems: 'center',
    borderWidth: 1, borderColor: '#3f1010',
  },
  errorText: { color: '#fca5a5', fontSize: 14, marginBottom: 8 },
  retryText: { color: '#f87171', fontSize: 13, fontWeight: '700' },
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
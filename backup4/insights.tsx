import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  ArrowPathIcon, ArrowTrendingDownIcon, BoltIcon,
  CpuChipIcon, CurrencyDollarIcon, DocumentTextIcon,
  LightBulbIcon, SparklesIcon,
} from 'react-native-heroicons/outline';
import type { Expense } from './index';
import { loadExpenses } from './index';

async function getAIInsights(expenses: Expense[]): Promise<string[]> {
  const summary = Object.entries(
    expenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount; return acc;
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
      messages: [{ role: 'user', content: `You are a friendly personal finance advisor. Give exactly 4 short, specific, actionable tips. Each tip: 1-2 sentences max.\nSpending: ${summary}\nTotal: $${total.toFixed(2)}, Transactions: ${expenses.length}\nReply ONLY with a JSON array of 4 strings.` }],
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`API Error ${response.status}: ${JSON.stringify(data)}`);
  try {
    const parsed = JSON.parse(data.content[0].text.trim());
    return Array.isArray(parsed) ? parsed : [];
  } catch { throw new Error('Invalid response from AI.'); }
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
    setLoaded(false); setTips([]);
  }, []));

  const handleGetInsights = async () => {
    if (!expenses.length) return;
    setLoading(true); setError(''); setTips([]);
    try { const result = await getAIInsights(expenses); setTips(result); setLoaded(true); }
    catch (err: any) { setError(err.message ?? 'Could not load insights.'); }
    finally { setLoading(false); }
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categoryTotals = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount; return acc;
  }, {});
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

  return (
    <View style={styles.bg}>
      <View style={styles.nebula1} />
      <View style={styles.nebula2} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <View style={styles.headingRow}>
            <LightBulbIcon size={20} color="#a855f7" />
            <Text style={styles.heading} accessibilityRole="header">AI Insights</Text>
          </View>
          <Text style={styles.sub}>Personalized tips based on your spending</Text>
        </View>

        {!expenses.length ? (
          <View style={styles.emptyState} accessible accessibilityLabel="No expenses yet.">
            <View style={styles.emptyIconWrap}><DocumentTextIcon size={22} color="#1a2f4a" /></View>
            <Text style={styles.emptyText}>No expenses yet</Text>
            <Text style={styles.emptySubText}>Add expenses to get AI insights</Text>
          </View>
        ) : (
          <>
            <View style={styles.snapshotRow}>
              {[
                { value: `$${total.toFixed(2)}`, label: 'Total Spent', a11y: `Total: $${total.toFixed(2)}` },
                { value: `${expenses.length}`, label: 'Transactions', a11y: `${expenses.length} transactions` },
                { value: topCategory ? topCategory[0] : '—', label: 'Top Category', a11y: `Top: ${topCategory?.[0] ?? 'None'}` },
              ].map((item) => (
                <View key={item.label} style={styles.snapshotCard} accessible accessibilityLabel={item.a11y}>
                  <Text style={styles.snapshotValue} numberOfLines={1} adjustsFontSizeToFit>{item.value}</Text>
                  <Text style={styles.snapshotLabel}>{item.label}</Text>
                </View>
              ))}
            </View>

            {!loaded && (
              <Pressable
                style={[styles.insightBtn, loading && { opacity: 0.6 }]}
                accessibilityRole="button"
                accessibilityLabel={loading ? 'Analyzing...' : 'Get AI insights'}
                accessibilityState={{ disabled: loading, busy: loading }}
                onPress={handleGetInsights} disabled={loading}
              >
                <LinearGradient colors={['#2d0a5e', '#1a0a3e', '#0d0620']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btnGrad}>
                  {loading ? (
                    <View style={styles.row}><ActivityIndicator color="#a855f7" size="small" /><Text style={styles.btnTxt}>Analyzing...</Text></View>
                  ) : (
                    <View style={styles.row}><CpuChipIcon size={15} color="#a855f7" /><Text style={styles.btnTxt}>Get AI Insights</Text></View>
                  )}
                </LinearGradient>
              </Pressable>
            )}

            {!!error && (
              <Pressable style={styles.errorCard} onPress={handleGetInsights} accessibilityRole="button" accessibilityLabel="Tap to retry.">
                <Text style={styles.errorText}>{error}</Text>
                <Text style={styles.retryText}>Tap to retry</Text>
              </Pressable>
            )}

            {tips.length > 0 && (
              <>
                <Text style={styles.sectionTitle} accessibilityRole="header">Your Personalized Tips</Text>
                <View accessibilityRole="list">
                  {tips.map((tip, i) => {
                    const Icon = TIP_ICONS[i] ?? SparklesIcon;
                    return (
                      <View key={i} style={[styles.tipCard, { borderLeftColor: TIP_COLORS[i] }]}
                        accessibilityRole="listitem" accessible accessibilityLabel={`Tip ${i + 1}: ${tip}`}>
                        <Icon size={15} color={TIP_COLORS[i]} style={{ marginTop: 2, flexShrink: 0 }} />
                        <Text style={styles.tipText}>{tip}</Text>
                      </View>
                    );
                  })}
                </View>
                <Pressable style={styles.refreshBtn} onPress={handleGetInsights} accessibilityRole="button" accessibilityLabel="Refresh insights">
                  <View style={styles.row}><ArrowPathIcon size={11} color="#253550" /><Text style={styles.refreshTxt}>Refresh Insights</Text></View>
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
  nebula1: { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: '#1e0a4e', top: -80, right: -70, opacity: 0.25 },
  nebula2: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: '#0a1f5e', top: 220, left: -40, opacity: 0.2 },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { marginTop: 56, marginBottom: 14 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  heading: { fontSize: 22, fontWeight: '800', color: '#f0f4ff', letterSpacing: -0.5 },
  sub: { fontSize: 12, color: '#253550', fontWeight: '600' },
  snapshotRow: { flexDirection: 'row', gap: 7, marginBottom: 14 },
  snapshotCard: { flex: 1, backgroundColor: '#060d1e', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#0f1f35' },
  snapshotValue: { color: '#e8eeff', fontSize: 13, fontWeight: '800', marginBottom: 3, textAlign: 'center' },
  snapshotLabel: { color: '#253550', fontSize: 9, textAlign: 'center', fontWeight: '700', letterSpacing: 0.4 },
  insightBtn: { borderRadius: 13, marginBottom: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#2d0a5e' },
  btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14 },
  btnTxt: { color: '#c084fc', fontSize: 14, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { color: '#f0f4ff', fontSize: 13, fontWeight: '800', marginBottom: 8, letterSpacing: -0.2 },
  tipCard: { backgroundColor: '#060d1e', borderRadius: 10, padding: 12, marginBottom: 7, flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderLeftWidth: 2, borderWidth: 1, borderColor: '#0f1f35' },
  tipText: { color: '#4a6a8a', fontSize: 12, lineHeight: 18, flex: 1 },
  refreshBtn: { padding: 12, alignItems: 'center', marginBottom: 32 },
  refreshTxt: { color: '#253550', fontSize: 12, fontWeight: '600' },
  errorCard: { backgroundColor: '#1a0808', borderRadius: 10, padding: 12, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#3f1010' },
  errorText: { color: '#fca5a5', fontSize: 13, marginBottom: 5 },
  retryText: { color: '#f87171', fontSize: 12, fontWeight: '700' },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyIconWrap: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#060d1e', borderWidth: 1, borderColor: '#0f1f35', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  emptyText: { color: '#f0f4ff', fontSize: 14, fontWeight: '700' },
  emptySubText: { color: '#253550', fontSize: 12, marginTop: 3, fontWeight: '500' },
});

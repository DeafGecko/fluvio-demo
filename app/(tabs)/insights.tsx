import { useFocusEffect, useRouter } from 'expo-router';
import { BottomSheet } from '../../components/bottom-sheet';
import { usePrefs } from '../../lib/prefs';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { ArrowPathIcon, CpuChipIcon, SparklesIcon } from 'react-native-heroicons/outline';
import { minTarget, radius, screenInset, spacing } from '../../constants/tokens';
import { useTheme } from '../../hooks/use-theme';
import { CATEGORY_ICONS, Expense, formatUSD, loadExpenses, totalsByCategory } from '../../lib/expenses';
import { thisMonth } from '../../lib/budget';
import { currentMonthShort, findDuplicateSubscriptions, listDuplicateCharges } from '../../lib/subscriptions';

async function getAIInsights(_expenses: Expense[]): Promise<string[]> {
  // AI tips are not available in this build. The app never calls an AI service directly,
  // because a key inside an app can be extracted. Any AI feature must go through a server.
  throw new Error('AI tips are not available in this demo.');
}

export default function Insights() {
  const router = useRouter();
  const { c, t, cat: catColor } = useTheme();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [aiOpen, setAiOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [dupOpen, setDupOpen] = useState(false);
  const [error, setError] = useState('');

  useFocusEffect(useCallback(() => {
    loadExpenses().then(setExpenses); setLoaded(false); setTips([]); setError('');
  }, []));

  const handleGetInsights = async () => {
    if (!expenses.length) return;
    setLoading(true); setError(''); setTips([]);
    try { const r = await getAIInsights(expenses); setTips(r); setLoaded(true); }
    catch (err: any) { setError(err.message ?? 'Could not load insights.'); }
    finally { setLoading(false); }
  };

  // Insights uses the current month, so its numbers match the Home card (Spent this month).
  const { monthlyLimit } = usePrefs();
  const monthly = thisMonth(expenses, monthlyLimit);
  const monthExpenses = expenses.filter((e) => !e.deletedAt && e.date.split(' ')[0] === currentMonthShort());
  const total = monthly.spent;
  const categoryTotals = totalsByCategory(monthExpenses);
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

  const styles = useMemo(() => StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.canvas },
    content: { paddingHorizontal: screenInset, paddingTop: spacing[16], paddingBottom: spacing[12] },
    heading: { color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: t.h1.fontWeight, lineHeight: t.h1.lineHeight },
    sub: { color: c.textSecondary, fontSize: t.secondary.fontSize, lineHeight: t.secondary.lineHeight, marginTop: spacing[1], marginBottom: spacing[6] },
    stats: { flexDirection: 'row', gap: spacing[2], marginBottom: spacing[8] },
    stat: {
      flex: 1, backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.cardBorder,
      padding: spacing[3], minHeight: 96, justifyContent: 'space-between', alignItems: 'flex-start',
    },
    statLabel: { color: c.textSecondary, fontSize: t.caption.fontSize, lineHeight: t.caption.lineHeight, fontWeight: '600', textAlign: 'left' },
    statValue: { color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: '700', fontVariant: ['tabular-nums'], textAlign: 'left', alignSelf: 'stretch' },
    sectionTitle: { color: c.textPrimary, fontSize: t.h3.fontSize, fontWeight: t.h3.fontWeight, lineHeight: t.h3.lineHeight, marginBottom: spacing[3] },
    primary: {
      minHeight: minTarget, borderRadius: radius.md, backgroundColor: c.accent,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2], paddingHorizontal: spacing[4],
    },
    primaryLabel: { color: c.onAccent, fontSize: t.bodyStrong.fontSize, fontWeight: t.bodyStrong.fontWeight },
    pressed: { opacity: 0.85 },
    disabled: { opacity: 0.5 },
    secondaryRow: {
      minHeight: minTarget, borderRadius: radius.md, borderWidth: 1, borderColor: c.cardBorder, backgroundColor: c.surface,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[4], marginTop: spacing[3],
    },
    secondaryLabel: { color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: t.bodyStrong.fontWeight },
    tip: {
      backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.cardBorder,
      padding: spacing[4], marginBottom: spacing[2], flexDirection: 'row', gap: spacing[3], alignItems: 'flex-start',
    },
    tipText: { color: c.textPrimary, flex: 1, fontSize: t.body.fontSize, lineHeight: t.body.lineHeight },
    errorBox: {
      borderRadius: radius.md, borderWidth: 1, borderColor: c.danger, padding: spacing[4], marginBottom: spacing[4],
    },
    errorText: { color: c.danger, fontSize: t.secondary.fontSize, lineHeight: t.secondary.lineHeight, marginBottom: spacing[2] },
    retry: { color: c.danger, fontSize: t.secondary.fontSize, fontWeight: '700', minHeight: minTarget, textAlignVertical: 'center' },
    empty: { alignItems: 'center', paddingVertical: spacing[10], gap: spacing[2] },
    emptyTitle: { color: c.textPrimary, fontSize: t.h3.fontSize, fontWeight: t.h3.fontWeight },
    emptyBody: { color: c.textSecondary, fontSize: t.secondary.fontSize, lineHeight: t.secondary.lineHeight, textAlign: 'center' },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
    footer: { color: c.textSecondary, fontSize: t.caption.fontSize, lineHeight: t.caption.lineHeight, marginTop: spacing[3], marginBottom: spacing[8] },
  }), [c, t]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading} accessibilityRole="header">Insights</Text>
      <Text style={styles.sub}>Patterns from the purchases you have logged</Text>

      {!expenses.length ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No purchases yet</Text>
          <Text style={styles.emptyBody}>Add purchases to see patterns and tips.</Text>
        </View>
      ) : (
        <>
          <View style={styles.stats}>
            {[
              { value: formatUSD(total), label: `Spent in ${new Date().toLocaleDateString('en-US', { month: 'long' })}` },
              { value: `${monthExpenses.length}`, label: 'Purchased' },
              { value: topCategory ? topCategory[0] : 'Not available', label: 'Top spend' },
            ].map((item) => (
              <View key={item.label} style={styles.stat} accessible accessibilityLabel={`${item.label}: ${item.value}`}>
                <Text style={styles.statLabel}>{item.label}</Text>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text style={styles.statValue} numberOfLines={2} adjustsFontSizeToFit>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>

          {topCategory && (() => {
            const Icon = CATEGORY_ICONS[topCategory[0]] ?? CATEGORY_ICONS.Other;
            const pct = total > 0 ? ((topCategory[1] / total) * 100).toFixed(0) : '0';
            return (
              <View style={styles.tip} accessible accessibilityLabel={`Top category is ${topCategory[0]}, ${formatUSD(topCategory[1])}, ${pct} percent of total logged.`}>
                <Icon size={20} color={catColor[topCategory[0]] ?? c.textSecondary} />
                <Text style={styles.tipText}>
                  Most of your logged spending is on {topCategory[0]}: {formatUSD(topCategory[1])} ({pct}%).
                </Text>
              </View>
            );
          })()}

          {findDuplicateSubscriptions(expenses).length > 0 && (
            <View style={{ backgroundColor: c.surface, borderRadius: radius.lg, padding: spacing[4], marginBottom: spacing[4], borderWidth: 1, borderColor: c.warning }}>
              <Pressable onPress={() => setDupOpen(true)} accessibilityRole="button"
                accessibilityHint="Opens the list of charges"
                style={{ minHeight: 44, justifyContent: 'center' }}>
                <Text style={{ color: c.warning, fontSize: t.bodyStrong.fontSize, fontWeight: '700' }}>
                  Possible double subscriptions
                </Text>
                <Text style={{ color: c.accent, fontSize: t.caption.fontSize, fontWeight: '600', marginTop: 2 }}>
                  Tap to see charges
                </Text>
              </Pressable>

              {findDuplicateSubscriptions(expenses).map((d) => (
                <Text key={`${d.name}-${d.month}`}
                  style={{ color: c.textPrimary, fontSize: t.secondary.fontSize, lineHeight: t.secondary.lineHeight, marginTop: spacing[2] }}>
                  {d.name}: charged {d.count} times in {d.month} ({formatUSD(d.total)}). Check if you need to cancel one.
                </Text>
              ))}

            </View>
          )}

          <BottomSheet visible={aiOpen} onClose={() => setAiOpen(false)} title="AI tips" height={1 / 3}>
            <Text style={{ color: c.textSecondary, fontSize: t.secondary.fontSize, lineHeight: t.secondary.lineHeight }}>
              AI tips are not available in this demo. The app does not send your purchases to an AI service, so no key is stored on your phone.
            </Text>
          </BottomSheet>

          <BottomSheet visible={dupOpen} onClose={() => setDupOpen(false)} title="Possible double subscriptions" height={0.6}>
            {findDuplicateSubscriptions(expenses).map((d) => (
              <Text key={`${d.name}-${d.month}`} style={{ color: c.textSecondary, fontSize: t.secondary.fontSize, lineHeight: t.secondary.lineHeight, marginBottom: spacing[2] }}>
                {d.name}: charged {d.count} times in {d.month} ({formatUSD(d.total)}). Check if you need to cancel one.
              </Text>
            ))}
            {listDuplicateCharges(expenses).map((e) => (
              <View key={e.id} accessible accessibilityLabel={`${e.name}, ${formatUSD(e.amount)}, ${e.date}`}
                style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing[3], borderTopWidth: 1, borderTopColor: c.border }}>
                <Text style={{ color: c.textPrimary, fontSize: t.secondary.fontSize }}>{e.name} · {e.date}</Text>
                <Text style={{ color: c.textPrimary, fontSize: t.secondary.fontSize, fontWeight: '600' }}>{formatUSD(e.amount)}</Text>
              </View>
            ))}
          </BottomSheet>

          {/* Pie chart shown directly on Insights. Labels show the amounts; a list follows below. */}
          <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.cardBorder, borderRadius: radius.lg, padding: spacing[3], marginBottom: spacing[4] }}
            accessibilityLabel="Spending by category pie chart">
            <Text style={{ color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: '600', marginBottom: spacing[2] }}>
              Spending by category
            </Text>
            <PieChart
              data={Object.entries(categoryTotals).map(([category, amount]) => ({
                name: category,
                amount,
                color: catColor[category] ?? '#94a3b8',
                legendFontColor: c.textSecondary,
                legendFontSize: 12,
              }))}
              width={Dimensions.get('window').width - screenInset * 2 - spacing[6]}
              height={170}
              chartConfig={{ color: (o = 1) => `rgba(32,40,45,${o})` }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="0"
              absolute={false}
            />
          </View>

          <Pressable style={({ pressed }) => [styles.secondaryRow, pressed && styles.pressed]}
            accessibilityRole="button" accessibilityLabel="Open bills" onPress={() => router.push('/bills')}>
            <Text style={styles.secondaryLabel}>Bills</Text>
            <Text style={{ color: c.accent, fontWeight: '600' }}>Open</Text>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.secondaryRow, pressed && styles.pressed]}
            accessibilityRole="button" accessibilityLabel="Open money journey" onPress={() => router.push('/journey')}>
            <Text style={styles.secondaryLabel}>Money in and out</Text>
            <Text style={{ color: c.accent, fontWeight: '600' }}>Open</Text>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.secondaryRow, pressed && styles.pressed]}
            accessibilityRole="button" accessibilityLabel="See spending breakdown by category and day"
            onPress={() => router.push('/stats')}>
            <Text style={styles.secondaryLabel}>Spending breakdown</Text>
            <Text style={{ color: c.accent, fontWeight: '600' }}>View</Text>
          </Pressable>

          <Text style={[styles.sectionTitle, { marginTop: spacing[8] }]} accessibilityRole="header">AI tips</Text>

          {!loaded && (
            <Pressable
              style={({ pressed }) => [styles.primary, pressed && styles.pressed, loading && styles.disabled]}
              onPress={() => setAiOpen(true)} disabled={loading}
              accessibilityRole="button" accessibilityLabel={loading ? 'Analyzing spending' : 'Get AI tips'}
              accessibilityState={{ disabled: loading, busy: loading }}>
              {loading ? (
                <View style={styles.row}>
                  <ActivityIndicator color={c.onAccent} size="small" />
                  <Text style={styles.primaryLabel}>Analyzing...</Text>
                </View>
              ) : (
                <View style={styles.row}>
                  <CpuChipIcon size={20} color={c.onAccent} />
                  <Text style={styles.primaryLabel}>Get AI tips</Text>
                </View>
              )}
            </Pressable>
          )}

          {!!error && (
            <View style={styles.errorBox} accessibilityRole="alert">
              <Text style={styles.errorText}>Tips are not available right now. {error}</Text>
              <Pressable onPress={handleGetInsights} accessibilityRole="button" accessibilityLabel="Retry AI tips">
                <Text style={styles.retry}>Try again</Text>
              </Pressable>
            </View>
          )}

          {tips.length > 0 && (
            <>
              {tips.map((tip, i) => (
                <View key={i} style={styles.tip}>
                  <SparklesIcon size={20} color={c.accent} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
              <Pressable style={({ pressed }) => [styles.secondaryRow, pressed && styles.pressed]}
                onPress={handleGetInsights} accessibilityRole="button" accessibilityLabel="Refresh AI tips">
                <View style={styles.row}>
                  <ArrowPathIcon size={20} color={c.textPrimary} />
                  <Text style={styles.secondaryLabel}>Refresh tips</Text>
                </View>
              </Pressable>
            </>
          )}

          <Text style={styles.footer}>
            AI tips are estimates generated from the purchases on this device. They are not financial advice.
          </Text>
        </>
      )}
    </ScrollView>
  );
}

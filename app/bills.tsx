import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BackLink } from '../components/settings-ui';
import { compactTextScale, radius, screenInset, spacing, rem, font } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';
import { Expense, formatUSD, loadExpenses } from '../lib/expenses';

// Regular bills: every purchase tagged "Bill payment", grouped by bill name.
type Bill = { name: string; count: number; lastAmount: number; lastDate: string; total: number };

export default function Bills() {
  const router = useRouter();
  const { c, t } = useTheme();
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useFocusEffect(useCallback(() => { loadExpenses().then(setExpenses); }, []));

  const bills = useMemo<Bill[]>(() => {
    const map = new Map<string, Bill>();
    // expenses are oldest first, so the last one seen is the most recent payment
    expenses.filter((e) => e.note.toLowerCase().includes('bill')).forEach((e) => {
      const b = map.get(e.name) ?? { name: e.name, count: 0, lastAmount: 0, lastDate: '', total: 0 };
      b.count += 1;
      b.total += e.amount;
      b.lastAmount = e.amount;
      b.lastDate = e.date;
      map.set(e.name, b);
    });
    return Array.from(map.values()).sort((a, b) => b.lastAmount - a.lastAmount);
  }, [expenses]);

  const monthly = bills.reduce((sum, b) => sum + b.lastAmount, 0);
  // Upcoming shows every bill. Recurring shows bills paid more than once.
  const [tab, setTab] = useState<'upcoming' | 'recurring'>('upcoming');
  const shown = tab === 'recurring' ? bills.filter((b) => b.count > 1) : bills;

  const styles = useMemo(() => StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.canvas },
    content: { paddingHorizontal: screenInset, paddingTop: spacing[16], paddingBottom: spacing[12] },
    heading: { color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: t.h1.fontWeight, lineHeight: t.h1.lineHeight, marginTop: spacing[2] },
    total: { backgroundColor: c.surface, borderRadius: rem(1.125), padding: spacing[4], marginTop: spacing[4], borderWidth: 1, borderColor: c.cardBorder },
    label: { color: c.textSecondary, fontSize: t.caption.fontSize, fontWeight: '600' },
    amount: { color: c.textPrimary, fontSize: t.h2.fontSize, fontWeight: '700' },
    card: { backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.cardBorder, padding: spacing[4], marginTop: spacing[2] },
    name: { color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: '600' },
    meta: { color: c.textSecondary, fontSize: t.caption.fontSize, marginTop: rem(0.125) },
    amt: { color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: '600', marginTop: spacing[1] },
    button: { minHeight: rem(3.25), borderRadius: rem(0.875), backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center', marginTop: spacing[6], paddingVertical: spacing[2] },
    buttonLabel: { color: c.onAccent, fontSize: font(1.0625), fontWeight: '600' },
    empty: { color: c.textSecondary, fontSize: t.body.fontSize, marginTop: spacing[4] },
    tabs: { flexDirection: 'row', backgroundColor: c.surface, borderWidth: 1, borderColor: c.cardBorder, borderRadius: rem(0.875), padding: rem(0.1875), marginTop: spacing[4] },
    tab: { flex: 1, minHeight: rem(2.5), borderRadius: rem(0.6875), alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing[2] },
    tabOn: { backgroundColor: c.accentSoft },
    tabLabel: { color: c.textSecondary, fontSize: t.secondary.fontSize, fontWeight: '600' },
    tabLabelOn: { color: c.textPrimary },
    pressed: { opacity: 0.85 },
  }), [c, t]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <BackLink label="Insights" onPress={() => (router.canGoBack() ? router.back() : router.replace('/insights'))} />
      <Text style={styles.heading} accessibilityRole="header">Bills</Text>

      <View style={styles.total} accessible accessibilityLabel={`Latest bills total ${formatUSD(monthly)}`}>
        <Text style={styles.label}>Latest bill amounts, added together</Text>
        <Text style={styles.amount}>{formatUSD(monthly)}</Text>
      </View>

      <View style={styles.tabs} accessibilityRole="tablist">
        {(['upcoming', 'recurring'] as const).map((key) => {
          const on = tab === key;
          return (
            <Pressable key={key} onPress={() => setTab(key)} accessibilityRole="tab" accessibilityState={{ selected: on }}
              aria-selected={on} style={[styles.tab, on && styles.tabOn]}>
              <Text style={[styles.tabLabel, on && styles.tabLabelOn]} numberOfLines={1} adjustsFontSizeToFit maxFontSizeMultiplier={compactTextScale}>{key === 'upcoming' ? 'Upcoming' : 'Recurring'}</Text>
            </Pressable>
          );
        })}
      </View>

      {shown.length === 0 ? (
        <Text style={styles.empty}>
          {tab === 'recurring'
            ? 'No recurring bills yet. A bill shows here once you have paid it more than once.'
            : 'No bills yet. Add a bill, and it will show here with how often you paid it.'}
        </Text>
      ) : shown.map((b) => (
        <View key={b.name} style={styles.card} accessible
          accessibilityLabel={`${b.name}. Paid ${b.count} ${b.count === 1 ? 'time' : 'times'}. Last ${formatUSD(b.lastAmount)} on ${b.lastDate}.`}>
          <Text style={styles.name}>{b.name}</Text>
          <Text style={styles.meta}>Paid {b.count} {b.count === 1 ? 'time' : 'times'} · Last paid {b.lastDate}</Text>
          <Text style={styles.amt}>{formatUSD(b.lastAmount)} last time</Text>
        </View>
      ))}

      <Pressable onPress={() => router.push('/add')} accessibilityRole="button" accessibilityLabel="Add bill"
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.buttonLabel}>Add bill</Text>
      </Pressable>
      <Text style={[styles.meta, { marginTop: spacing[3] }]}>Tip: type &ldquo;Bill payment&rdquo; in the note so it shows here.</Text>
    </ScrollView>
  );
}

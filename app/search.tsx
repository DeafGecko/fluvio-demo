import { useFocusEffect, useRouter } from 'expo-router';
import { parseAmount } from '../lib/amount';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BackLink } from '../components/settings-ui';
import { TransactionRow } from '../components/transaction-row';
import { minTarget, radius, screenInset, spacing, rem } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';
import { CATEGORY_NAMES, Expense, categoryIcon, loadCustomCategories, loadExpenses, softDeleteExpense } from '../lib/expenses';

// Find a purchase by name or category, and narrow it by amount. Opens from Activity.
export default function Search() {
  const router = useRouter();
  const { c, t, cat: catColor } = useTheme();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [customCats, setCustomCats] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');

  useFocusEffect(useCallback(() => {
    loadExpenses().then(setExpenses);
    loadCustomCategories().then(setCustomCats);
  }, []));

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const lo = parseAmount(min) ?? NaN;
    const hi = parseAmount(max) ?? NaN;
    return [...expenses].reverse().filter((e) =>
      (category === 'All' || e.category === category) &&
      (!q || e.name.toLowerCase().includes(q) || e.category.toLowerCase().includes(q) || e.note.toLowerCase().includes(q)) &&
      (isNaN(lo) || e.amount >= lo) &&
      (isNaN(hi) || e.amount <= hi));
  }, [expenses, query, category, min, max]);

  const styles = useMemo(() => StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.canvas },
    content: { paddingHorizontal: screenInset, paddingTop: spacing[16], paddingBottom: spacing[12] },
    heading: { color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: t.h1.fontWeight, lineHeight: t.h1.lineHeight, marginTop: spacing[2], marginBottom: spacing[4] },
    input: { minHeight: minTarget, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface, paddingHorizontal: spacing[3], color: c.textPrimary, fontSize: t.body.fontSize, marginBottom: spacing[3] },
    row: { flexDirection: 'row', gap: spacing[2] },
    chips: { flexDirection: 'row', gap: spacing[2], marginBottom: spacing[4] },
    chip: { minHeight: rem(2.75), borderRadius: radius.pill, borderWidth: 1, borderColor: c.cardBorder, backgroundColor: c.surface, paddingHorizontal: spacing[3], justifyContent: 'center' },
    chipOn: { borderColor: c.accent, backgroundColor: c.accentSoft },
    chipText: { color: c.textSecondary, fontSize: t.caption.fontSize, fontWeight: '600' },
    chipTextOn: { color: c.accent },
    count: { color: c.textSecondary, fontSize: t.caption.fontSize, marginBottom: spacing[2] },
    empty: { color: c.textSecondary, fontSize: t.body.fontSize, marginTop: spacing[4] },
  }), [c, t]);

  const cats = ['All', ...CATEGORY_NAMES, ...customCats];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <BackLink label="Activity" onPress={() => (router.canGoBack() ? router.back() : router.replace('/activity'))} />
      <Text style={styles.heading} accessibilityRole="header">Search</Text>

      <TextInput style={styles.input} value={query} onChangeText={(v) => setQuery(v.slice(0, 60))} maxLength={60} placeholder="Name, category, or note"
        placeholderTextColor={c.textTertiary} accessibilityLabel="Search purchases" returnKeyType="search" />

      <View style={styles.row}>
        <TextInput style={[styles.input, { flex: 1, minWidth: 0 }]} value={min} onChangeText={(v) => setMin(v.replace(/[^0-9.]/g, '').slice(0, 10))} maxLength={10} keyboardType="decimal-pad"
          placeholder="Min $" placeholderTextColor={c.textTertiary} accessibilityLabel="Minimum amount" />
        <TextInput style={[styles.input, { flex: 1, minWidth: 0 }]} value={max} onChangeText={(v) => setMax(v.replace(/[^0-9.]/g, '').slice(0, 10))} maxLength={10} keyboardType="decimal-pad"
          placeholder="Max $" placeholderTextColor={c.textTertiary} accessibilityLabel="Maximum amount" />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing[4] }}>
        <View style={styles.chips} accessibilityRole="radiogroup">
          {cats.map((cat) => {
            const on = category === cat;
            return (
              <Pressable key={cat} onPress={() => setCategory(cat)} accessibilityRole="radio"
                accessibilityLabel={`Category ${cat}`} accessibilityState={{ checked: on }} aria-checked={on}
                style={[styles.chip, on && styles.chipOn]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
                  {cat !== 'All' && (() => { const ChipIcon = categoryIcon(cat); return <ChipIcon size={rem(1)} color={catColor[cat] ?? c.textSecondary} />; })()}
                  <Text numberOfLines={1} style={[styles.chipText, on && styles.chipTextOn]}>{cat}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <Text style={styles.count} accessibilityLiveRegion="polite">{results.length} {results.length === 1 ? 'purchase' : 'purchases'} found</Text>
      {results.length === 0 && <Text style={styles.empty}>No matches. Try another word, or clear the amounts.</Text>}
      {results.map((e, i) => (
        <TransactionRow key={e.id} expense={e} index={i} onDelete={async (id) => { await softDeleteExpense(id); setExpenses(await loadExpenses()); }} />
      ))}
    </ScrollView>
  );
}

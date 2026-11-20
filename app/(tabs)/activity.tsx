import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MagnifyingGlassIcon, XMarkIcon } from 'react-native-heroicons/outline';
import {
  CATEGORY_NAMES, Expense, categoryIcon, loadCustomCategories, loadDeletedExpenses, loadExpenses, restoreExpense, softDeleteExpense, formatUSD,
} from '../../lib/expenses';
import { TransactionRow } from '../../components/transaction-row';
import { seedDemoData } from '../../lib/demo-data';
import { minTarget, radius, screenInset, spacing, rem, font } from '../../constants/tokens';
import { useTheme } from '../../hooks/use-theme';

const ALL = 'All';

export default function Activity() {
  const { c, t } = useTheme();
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>(ALL);
  const [deleted, setDeleted] = useState<Expense[]>([]);
  const [customCats, setCustomCats] = useState<string[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);

  useFocusEffect(useCallback(() => {
    loadExpenses().then((data) => { setExpenses(data); setLoading(false); });
    loadDeletedExpenses().then(setDeleted);
    loadCustomCategories().then(setCustomCats);
  }, []));

  // Delete keeps the purchase in history (not erased for good). Restore it from the list below.
  const handleDelete = async (id: string) => {
    await softDeleteExpense(id);
    setExpenses(await loadExpenses());
    setDeleted(await loadDeletedExpenses());
  };

  const handleRestore = async (id: string) => {
    await restoreExpense(id);
    setExpenses(await loadExpenses());
    setDeleted(await loadDeletedExpenses());
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...expenses].reverse().filter((e) =>
      (filter === ALL || e.category === filter) &&
      (!q || e.name.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)));
  }, [expenses, search, filter]);

  // Group by date label, newest first (list is already newest-first).
  const groups = useMemo(() => {
    const map = new Map<string, Expense[]>();
    filtered.forEach((e) => {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const styles = useMemo(() => StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.canvas },
    content: { paddingHorizontal: screenInset, paddingTop: spacing[16], paddingBottom: spacing[12] },
    heading: { color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: t.h1.fontWeight, lineHeight: t.h1.lineHeight, marginBottom: spacing[4] },
    searchBar: {
      flexDirection: 'row', alignItems: 'center', gap: spacing[2], minHeight: minTarget,
      backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.cardBorder,
      paddingHorizontal: spacing[3], marginBottom: spacing[3],
    },
    searchInput: { flex: 1, color: c.textPrimary, fontSize: t.body.fontSize, paddingVertical: spacing[2] },
    clearBtn: { width: minTarget, height: minTarget, alignItems: 'center', justifyContent: 'center' },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginBottom: spacing[6] },
    chip: {
      minHeight: rem(2.5), paddingHorizontal: spacing[3], borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', gap: rem(0.375),
      borderWidth: 1, borderColor: c.cardBorder, backgroundColor: c.surface, justifyContent: 'center',
    },
    chipSelected: { backgroundColor: c.accent, borderColor: c.accent },
    chipLabel: { color: c.textPrimary, fontSize: t.secondary.fontSize, fontWeight: '700' },
    chipLabelSelected: { color: c.onAccent },
    groupTitle: { color: c.textSecondary, fontSize: t.caption.fontSize, fontWeight: '600', marginTop: spacing[4], marginBottom: spacing[2] },
    hint: { color: c.textSecondary, fontSize: t.caption.fontSize, lineHeight: t.caption.lineHeight, marginBottom: spacing[3] },
    empty: { alignItems: 'center', paddingVertical: spacing[10], gap: spacing[2] },
    emptyTitle: { color: c.textPrimary, fontSize: t.h3.fontSize, fontWeight: t.h3.fontWeight },
    emptyBody: { color: c.textSecondary, fontSize: t.secondary.fontSize, lineHeight: t.secondary.lineHeight, textAlign: 'center' },
  }), [c, t]);

  if (loading) {
    return <View style={styles.screen}><ActivityIndicator color={c.accent} style={{ marginTop: rem(5) }} accessibilityLabel="Loading activity" /></View>;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading} accessibilityRole="header">Activity</Text>
      <Pressable onPress={() => router.push('/search')} accessibilityRole="button" accessibilityLabel="Search and filter purchases"
        style={{ minHeight: rem(2.75), justifyContent: 'center', marginBottom: spacing[3] }}>
        <Text style={{ color: c.accent, fontSize: t.bodyStrong.fontSize, fontWeight: '600' }}>Search and filter →</Text>
      </Pressable>

      {expenses.length > 0 && (
        <>
          <View style={styles.searchBar}>
            <MagnifyingGlassIcon size={rem(1.25)} color={c.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search purchases"
              placeholderTextColor={c.textTertiary}
              value={search}
              onChangeText={setSearch}
              accessibilityLabel="Search purchases"
              returnKeyType="search"
            />
            {search.length > 0 && (
              <Pressable style={styles.clearBtn} onPress={() => setSearch('')} accessibilityRole="button" accessibilityLabel="Clear search">
                <XMarkIcon size={rem(1.25)} color={c.textSecondary} />
              </Pressable>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing[6] }}
            contentContainerStyle={{ gap: spacing[2], paddingRight: spacing[4] }} accessibilityRole="radiogroup">
            {[ALL, ...CATEGORY_NAMES, ...customCats].map((name) => {
              const selected = filter === name;
              return (
                <Pressable key={name}
                  style={[styles.chip, selected && styles.chipSelected]}
                  accessibilityRole="radio"
                  accessibilityLabel={name}
                  accessibilityState={{ checked: selected }} aria-checked={selected}
                  onPress={() => setFilter(name)}>
                  {name !== ALL && (() => { const ChipIcon = categoryIcon(name); return <ChipIcon size={rem(1.125)} color={selected ? c.onAccent : c.textPrimary} strokeWidth={2.25} />; })()}
                  <Text numberOfLines={1} style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{name}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </>
      )}

      {expenses.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No purchases yet</Text>
          <Text style={styles.emptyBody}>Your purchases show here, newest first.</Text>
          <Pressable onPress={() => router.push('/add')} accessibilityRole="button" accessibilityLabel="Add expense"
            style={{ minHeight: rem(3), borderRadius: radius.md, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing[6], marginTop: spacing[3] }}>
            <Text style={{ color: c.onAccent, fontSize: font(1), fontWeight: '600' }}>Add expense</Text>
          </Pressable>
          <Pressable onPress={async () => { await seedDemoData(); setExpenses(await loadExpenses()); }} accessibilityRole="button" accessibilityLabel="Load demo data"
            style={{ minHeight: rem(3), borderRadius: radius.md, borderWidth: 1, borderColor: c.cardBorder, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing[6], marginTop: spacing[2] }}>
            <Text style={{ color: c.textPrimary, fontSize: font(1), fontWeight: '600' }}>Load demo data</Text>
          </Pressable>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No matching purchases</Text>
          <Text style={styles.emptyBody}>Try another word or category.</Text>
        </View>
      ) : (
        <>
          {!search && filter === ALL && <Text style={styles.hint}>Tap a purchase to edit or delete it.</Text>}
          {groups.map(([date, items]) => (
            <View key={date}>
              <Text style={styles.groupTitle} accessibilityRole="header">
                {date} · {formatUSD(items.reduce((s, e) => s + e.amount, 0))}
              </Text>
              {items.map((expense, index) => (
                <TransactionRow key={expense.id} expense={expense} index={index} onDelete={handleDelete} />
              ))}
            </View>
          ))}
        </>
      )}
      {deleted.length > 0 && (
        <View style={{ marginTop: spacing[6] }}>
          <Pressable onPress={() => setShowDeleted((v) => !v)} accessibilityRole="button"
            accessibilityLabel={`${showDeleted ? 'Hide' : 'Show'} deleted purchases, ${deleted.length}`}
            style={{ minHeight: rem(2.75), justifyContent: 'center' }}>
            <Text style={{ color: c.accent, fontWeight: '600' }}>
              {showDeleted ? 'Hide' : 'Show'} deleted ({deleted.length}) · kept in history
            </Text>
          </Pressable>
          {showDeleted && deleted.map((e) => (
            <View key={e.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3], backgroundColor: c.surface, borderWidth: 1, borderColor: c.cardBorder, borderRadius: radius.md, padding: spacing[3], marginTop: spacing[2] }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.textSecondary, textDecorationLine: 'line-through' }}>{e.name} · {formatUSD(e.amount)}</Text>
                <Text style={{ color: c.textTertiary, fontSize: font(0.75) }}>Deleted {new Date(e.deletedAt as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
              </View>
              <Pressable onPress={() => handleRestore(e.id)} accessibilityRole="button" accessibilityLabel={`Restore ${e.name}`}
                style={{ minHeight: rem(2.75), justifyContent: 'center', paddingHorizontal: spacing[2] }}>
                <Text style={{ color: c.accent, fontWeight: '600' }}>Restore</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

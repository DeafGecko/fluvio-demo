import { SavedPopout } from '../components/saved-popout';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BackLink } from '../components/settings-ui';
import { minTarget, radius, screenInset, spacing, rem, font } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';
import {
  CATEGORY_ICONS, CATEGORY_NAMES, Expense, categoryIcon, loadCustomCategories, formatSignedPurchase, readAllExpenses, saveExpenses, softDeleteExpense,
} from '../lib/expenses';

// One purchase: details, change its category, and add or edit its note.
export default function PurchaseDetail() {
  const router = useRouter();
  const { c, t, cat: catColor } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState<string | null>(null);
  const [customCats, setCustomCats] = useState<string[]>([]);

  const load = useCallback(async () => {
    const all = await readAllExpenses();
    setCustomCats(await loadCustomCategories());
    const found = all.find((e) => e.id === id) ?? null;
    setExpense(found);
    // The note text without the "Cash" tag, which is shown separately.
    setNote(found ? found.note.replace(/^Cash( · )?/, '') : '');
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Update one purchase in storage, keeping its history fields.
  const update = async (changes: Partial<Expense>) => {
    if (!expense) return;
    const all = await readAllExpenses();
    await saveExpenses(all.map((e) => (e.id === expense.id ? { ...e, ...changes } : e)));
    await load();
    setSaved('Saved');
    setTimeout(() => setSaved(null), 1200);
  };

  const saveNote = () => {
    if (!expense) return;
    const isCash = expense.note.startsWith('Cash');
    const text = note.trim();
    const next = isCash ? (text ? `Cash · ${text}` : 'Cash') : text;
    update({ note: next });
  };

  const remove = () => {
    if (!expense) return;
    Alert.alert('Delete purchase', 'It will move to Show deleted in Activity. You can restore it there.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await softDeleteExpense(expense.id); router.back(); } },
    ]);
  };

  const styles = useMemo(() => StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.canvas },
    content: { paddingHorizontal: screenInset, paddingTop: spacing[16], paddingBottom: spacing[12] },
    heading: { color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: t.h1.fontWeight, lineHeight: t.h1.lineHeight, marginTop: spacing[2] },
    amount: { color: c.textPrimary, fontSize: t.h2.fontSize, fontWeight: '700', marginTop: spacing[2], fontVariant: ['tabular-nums'] },
    card: { backgroundColor: c.surface, borderRadius: rem(1.125), padding: spacing[4], marginTop: spacing[4], gap: spacing[2] },
    label: { color: c.textSecondary, fontSize: t.caption.fontSize, fontWeight: '600' },
    value: { color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: '600' },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing[3], gap: spacing[3] },
    rowDivider: { borderBottomWidth: 1, borderBottomColor: c.cardBorder },
    rowLabel: { color: c.textSecondary, fontSize: t.secondary.fontSize },
    rowValue: { color: c.textPrimary, fontSize: t.secondary.fontSize, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
    meaning: { backgroundColor: c.accentSoft, borderRadius: rem(1.125), padding: spacing[4], marginTop: spacing[4] },
    meaningTitle: { color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: '600' },
    meaningBody: { color: c.textSecondary, fontSize: t.secondary.fontSize, lineHeight: t.secondary.lineHeight, marginTop: spacing[2] },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginTop: spacing[1] },
    chip: { minHeight: rem(2.75), borderRadius: radius.pill, borderWidth: 1, borderColor: c.cardBorder, paddingHorizontal: spacing[3], justifyContent: 'center', backgroundColor: c.surface },
    chipOn: { borderColor: c.accent, backgroundColor: c.accentSoft },
    chipInner: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
    chipText: { color: c.textPrimary, fontSize: t.secondary.fontSize, fontWeight: '600' },
    chipTextOn: { color: c.accent },
    input: {
      minHeight: minTarget, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, backgroundColor: c.canvas,
      paddingHorizontal: spacing[3], color: c.textPrimary, fontSize: t.body.fontSize, marginTop: spacing[1],
    },
    button: { minHeight: rem(3.25), borderRadius: rem(0.875), borderWidth: 1, borderColor: c.cardBorder, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center', marginTop: spacing[3] },
    primary: { backgroundColor: c.accent, borderColor: c.accent },
    buttonLabel: { color: c.textPrimary, fontSize: font(1.0625), fontWeight: '600' },
    primaryLabel: { color: c.onAccent },
    danger: { color: c.danger, fontSize: font(1.0625), fontWeight: '600' },
    saved: { color: c.success, fontSize: t.secondary.fontSize, fontWeight: '600', marginTop: spacing[2] },
    pressed: { opacity: 0.85 },
  }), [c, t]);

  if (!expense) {
    return (
      <View style={styles.screen}>
        <View style={{ padding: screenInset, paddingTop: spacing[16] }}>
          <BackLink label="Activity" onPress={() => (router.canGoBack() ? router.back() : router.replace('/activity'))} />
          <Text style={styles.label}>This purchase could not be found.</Text>
        </View>
      </View>
    );
  }

  const Icon = CATEGORY_ICONS[expense.category] ?? CATEGORY_ICONS.Other;
  const isCash = expense.note.startsWith('Cash');

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <BackLink label="Activity" onPress={() => (router.canGoBack() ? router.back() : router.replace('/activity'))} />
      <Text style={styles.heading} accessibilityRole="header">{expense.name}</Text>
      <Text style={styles.amount}>{formatSignedPurchase(expense.amount)}</Text>
      <SavedPopout visible={!!saved} message={saved ?? 'Saved'} />

      <View style={styles.card} accessibilityRole="list">
        {[
          ['Merchant', expense.name],
          ['Category', expense.category],
          ['Date', expense.date],
          ['Paid with', isCash ? 'Cash' : 'Card'],
          ['Status', 'Posted'],
        ].map(([k, v], i, all) => (
          <View key={k} style={[styles.row, i < all.length - 1 && styles.rowDivider]} accessibilityRole="listitem">
            <Text style={styles.rowLabel}>{k}</Text>
            <Text style={styles.rowValue}>{v}</Text>
          </View>
        ))}
      </View>

      <View style={styles.meaning}>
        <Text style={styles.meaningTitle}>What this means</Text>
        <Text style={styles.meaningBody}>This is a purchase. It lowers your balance and counts toward spending. It is not a fee, transfer, or refund.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Category</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
          <Icon size={rem(1.25)} color={catColor[expense.category] ?? c.textPrimary} />
          <Text style={styles.value}>{expense.category}</Text>
        </View>
        <View style={styles.chips} accessibilityRole="radiogroup">
          {[...CATEGORY_NAMES, ...customCats].map((cat) => {
            const on = expense.category === cat;
            return (
              <Pressable key={cat} onPress={() => { if (!on) update({ category: cat }); }}
                accessibilityRole="radio" accessibilityLabel={`Category ${cat}`} accessibilityState={{ checked: on }} aria-checked={on}
                style={[styles.chip, on && styles.chipOn]}>
                <View style={styles.chipInner}>
                  {(() => { const ChipIcon = categoryIcon(cat); return <ChipIcon size={rem(1)} color={on ? c.accent : c.textSecondary} />; })()}
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{cat}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Note</Text>
        <TextInput style={styles.input} value={note} onChangeText={(v) => setNote(v.slice(0, 280))} maxLength={280}
          placeholder="Add a note, for example: birthday dinner" placeholderTextColor={c.textTertiary}
          accessibilityLabel="Note for this purchase" />
        <Pressable onPress={saveNote} accessibilityRole="button" accessibilityLabel="Save note"
          style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}>
          <Text style={[styles.buttonLabel, styles.primaryLabel]}>Save note</Text>
        </Pressable>
      </View>

      <Pressable onPress={() => router.push({ pathname: '/add', params: { id: expense.id } })} accessibilityRole="button"
        accessibilityLabel="Edit name, amount, and details" style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.buttonLabel}>Edit name, amount, and details</Text>
      </Pressable>

      <Pressable onPress={remove} accessibilityRole="button" accessibilityLabel="Delete purchase"
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.danger}>Delete purchase</Text>
      </Pressable>
    </ScrollView>
  );
}

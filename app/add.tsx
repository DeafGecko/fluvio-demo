import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseAmount } from '../lib/amount';
import { BackLink } from '../components/settings-ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CheckIcon } from 'react-native-heroicons/outline';
import { isLargeText, minTarget, radius, screenInset, spacing, rem } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';
import { CATEGORY_NAMES, Expense, STORAGE_KEY, addCustomCategory, categoryIcon, formatUSD, loadCustomCategories, loadExpenses, readAllExpenses } from '../lib/expenses';
import { findPaidThisMonth } from '../lib/subscriptions';
import { SavedPopout } from '../components/saved-popout';
import { ErrorPopout } from '../components/status-popout';

// Short date for a new purchase, for example "Nov 18". Called when a purchase is saved.
// A unique id for a new purchase. Called when a purchase is saved.
function newId(): string {
  return Date.now().toString();
}

function todayLabel(): string {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function AddExpense() {
  const router = useRouter();
  const { c, t, cat: catColor } = useTheme();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customCats, setCustomCats] = useState<string[]>([]);
  useEffect(() => { loadCustomCategories().then(setCustomCats); }, []);

  // Add a category the user names. It is saved and selected.
  const newCategory = () => {
    const save = async (value?: string) => {
      const name = (value ?? '').trim();
      if (!name) return;
      await addCustomCategory(name);
      setCustomCats(await loadCustomCategories());
      setSelectedCategory(name);
    };
    if (Platform.OS !== 'android') Alert.prompt('New category', 'Name it, for example Pets.', save, 'plain-text');
    else Alert.alert('New category', 'Adding categories is available on iPhone in this demo.');
  };
  const [note, setNote] = useState('');
  // When opened from a purchase's Edit option, id is set and the form is prefilled.
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editingId = typeof id === 'string' ? id : undefined;

  const [paidWith, setPaidWith] = useState<'Card' | 'Cash'>('Card');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);

  useEffect(() => {
    if (!editingId) return;
    loadExpenses().then((list) => {
      const found = list.find((e) => e.id === editingId);
      if (!found) return;
      setName(found.name);
      setAmount(String(found.amount));
      setSelectedCategory(found.category);
      const isCash = found.note.startsWith('Cash');
      setPaidWith(isCash ? 'Cash' : 'Card');
      setNote(found.note.replace(/^Cash( · )?/, ''));
    });
  }, [editingId]);

  // force = true skips the double-subscription check (after the user chooses "Save anyway").
  const handleSave = async (force = false) => {
    if (!name.trim()) { Alert.alert('Missing name', 'Please enter what you bought.'); return; }
    const parsed = parseAmount(amount);
    if (parsed === null || parsed <= 0) { Alert.alert('Invalid amount', 'Please enter an amount greater than zero, using numbers only (up to 1,000,000).'); return; }
    if (!selectedCategory) { Alert.alert('Missing category', 'Please choose a category.'); return; }

    // Double-subscription check: warn before saving a second payment for the same service this month.
    if (!editingId && !force) {
      const all = await readAllExpenses();
      const paid = findPaidThisMonth(all, name.trim());
      if (paid) {
        Alert.alert(
          'Already paid this month?',
          `You already paid ${paid.name} this month (${formatUSD(paid.amount)}). Do you want to save this one too?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Save anyway', style: 'destructive', onPress: () => handleSave(true) },
          ],
        );
        return;
      }
    }
    setSaving(true);
    const newExpense: Expense = {
      id: newId(), name: name.trim(),
      amount: parsed, category: selectedCategory,
      // Cash purchases are tagged in the note so they can be filtered and shown on statements.
      note: [paidWith === 'Cash' ? 'Cash' : '', note.trim()].filter(Boolean).join(' · '),
      date: todayLabel(),
    };
    try {
      // Read everything, including deleted history, so saving never drops it.
      const existing = await readAllExpenses();
      if (editingId) {
        // Keep the original id and date; update the details that were edited.
        const updated = existing.map((e) => (e.id === editingId
          ? { ...e, name: newExpense.name, amount: newExpense.amount, category: newExpense.category, note: newExpense.note }
          : e));
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } else {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, newExpense]));
      }
      setSaved(true);
      setTimeout(() => router.back(), 1800);
    } catch { setErrorOpen(true); }
    finally { setSaving(false); }
  };

  const styles = useMemo(() => StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.canvas },
    content: { paddingHorizontal: screenInset, paddingTop: spacing[16], paddingBottom: spacing[12] },
    back: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], minHeight: minTarget, alignSelf: 'flex-start' },
    backLabel: { color: c.accent, fontSize: t.bodyStrong.fontSize, fontWeight: t.bodyStrong.fontWeight },
    heading: { color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: t.h1.fontWeight, lineHeight: t.h1.lineHeight, marginTop: spacing[2] },
    sub: { color: c.textSecondary, fontSize: t.secondary.fontSize, lineHeight: t.secondary.lineHeight, marginTop: spacing[1], marginBottom: spacing[4] },
    label: { color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: t.bodyStrong.fontWeight, marginTop: spacing[5], marginBottom: spacing[2] },
    optional: { color: c.textSecondary, fontWeight: '400' },
    input: {
      minHeight: minTarget, backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.cardBorder,
      paddingHorizontal: spacing[4], color: c.textPrimary, fontSize: t.body.fontSize,
    },
    amountRow: {
      minHeight: minTarget, flexDirection: 'row', alignItems: 'center', backgroundColor: c.surface,
      borderRadius: radius.md, borderWidth: 1, borderColor: c.border, paddingHorizontal: spacing[4],
    },
    dollar: { color: c.textSecondary, fontSize: t.h2.fontSize, fontWeight: t.h2.fontWeight, marginRight: spacing[1] },
    amountInput: { flex: 1, color: c.textPrimary, fontSize: t.h2.fontSize, fontWeight: t.h2.fontWeight, paddingVertical: spacing[3], fontVariant: ['tabular-nums'] },
    noteInput: { minHeight: rem(6), paddingTop: spacing[3], textAlignVertical: 'top' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
    cat: {
      // Large text: one category per row, so names like Entertainment fit on one line.
      minHeight: minTarget, minWidth: isLargeText ? '100%' : '47%', flexGrow: 1, borderRadius: radius.md, borderWidth: 1, borderColor: c.border,
      backgroundColor: c.surface, paddingHorizontal: spacing[3], flexDirection: 'row', alignItems: 'center', gap: spacing[2],
    },
    catSelected: { borderColor: c.accent, borderWidth: 2 },
    catLabel: { color: c.textPrimary, fontSize: t.body.fontSize, fontWeight: '600', flex: 1 },
    check: { width: rem(1.25) },
    save: {
      minHeight: minTarget, borderRadius: radius.md, backgroundColor: c.accent, marginTop: spacing[8], paddingVertical: spacing[2],
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2], paddingHorizontal: spacing[4],
    },
    saveLabel: { color: c.onAccent, fontSize: t.bodyStrong.fontSize, fontWeight: t.bodyStrong.fontWeight },
    cancel: { minHeight: minTarget, alignItems: 'center', justifyContent: 'center', marginTop: spacing[2] },
    cancelLabel: { color: c.textSecondary, fontSize: t.bodyStrong.fontSize, fontWeight: t.bodyStrong.fontWeight },
    disabled: { opacity: 0.5 },
    pressed: { opacity: 0.85 },
  }), [c, t]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <SavedPopout visible={saved} message={editingId ? 'Changes saved' : 'Saved'} />
      <ErrorPopout visible={errorOpen} title="Couldn't save" message="Something went wrong. Your purchase was not saved."
        onRetry={() => { setErrorOpen(false); handleSave(); }} onCancel={() => setErrorOpen(false)} />
      <BackLink label="Home" onPress={() => router.back()} />

      <Text style={styles.heading} accessibilityRole="header">{editingId ? 'Edit purchase' : 'Add purchase'}</Text>
      <Text style={styles.sub}>Save a purchase on this device.</Text>

      <Text style={styles.label}>What did you buy?</Text>
      <TextInput style={styles.input} maxLength={60} placeholder="For example, coffee or rent"
        placeholderTextColor={c.textTertiary} value={name} onChangeText={setName}
        accessibilityLabel="What did you buy?" returnKeyType="next" />

      <Text style={styles.label}>Amount</Text>
      <View style={styles.amountRow}>
        <Text style={styles.dollar} accessibilityElementsHidden importantForAccessibility="no">$</Text>
        <TextInput style={styles.amountInput} maxLength={10} placeholder="0.00" placeholderTextColor={c.textTertiary}
          value={amount} onChangeText={setAmount} keyboardType="decimal-pad"
          accessibilityLabel="Amount in dollars" />
      </View>

      <Text style={styles.label}>How did you pay?</Text>
      <View style={{ flexDirection: 'row', gap: spacing[2] }} accessibilityRole="radiogroup">
        {(['Card', 'Cash'] as const).map((opt) => {
          const selected = paidWith === opt;
          return (
            <Pressable key={opt} onPress={() => setPaidWith(opt)}
              accessibilityRole="radio" accessibilityLabel={opt === 'Cash' ? 'Paid with cash' : 'Paid with card'}
              accessibilityState={{ checked: selected }} aria-checked={selected}
              style={{
                flex: 1, minHeight: minTarget, borderRadius: radius.md, borderWidth: 1,
                borderColor: selected ? c.accent : c.border, backgroundColor: selected ? c.accentSoft : c.surface,
                alignItems: 'center', justifyContent: 'center',
              }}>
              <Text style={{ color: selected ? c.accent : c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: '600' }}>{opt}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Category</Text>
      <Pressable onPress={newCategory} accessibilityRole="button" accessibilityLabel="Add a new category"
        style={({ pressed }) => [{ minHeight: rem(2.75), alignSelf: 'flex-start', borderRadius: rem(0.75), borderWidth: 1, borderStyle: 'dashed', borderColor: c.accent, paddingHorizontal: spacing[3], justifyContent: 'center', marginBottom: spacing[2] }, pressed && { opacity: 0.85 }]}>
        <Text style={{ color: c.accent, fontSize: t.bodyStrong.fontSize, fontWeight: '600' }}>+ New category</Text>
      </Pressable>
      <View style={styles.grid} accessibilityRole="radiogroup">
        {[...CATEGORY_NAMES, ...customCats].map((cat) => {
          const selected = selectedCategory === cat;
          const Icon = categoryIcon(cat);
          return (
            <Pressable key={cat}
              style={[styles.cat, selected && styles.catSelected]}
              accessibilityRole="radio" accessibilityLabel={cat}
              accessibilityState={{ checked: selected }} aria-checked={selected}
              onPress={() => setSelectedCategory(cat)}>
              <Icon size={rem(1.25)} color={catColor[cat] ?? '#94a3b8'} />
              <Text style={styles.catLabel}>{cat}</Text>
              {selected && <CheckIcon size={rem(1.25)} color={c.accent} />}
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Note <Text style={styles.optional}>(optional)</Text></Text>
      <TextInput style={[styles.input, styles.noteInput]} maxLength={280} placeholder="Any extra details"
        placeholderTextColor={c.textTertiary} value={note} onChangeText={setNote}
        multiline numberOfLines={3} accessibilityLabel="Note, optional" textAlignVertical="top" />

      <Pressable
        style={({ pressed }) => [styles.save, (saving || pressed) && styles.pressed, saving && styles.disabled]}
        accessibilityRole="button" accessibilityLabel={saving ? 'Saving purchase' : 'Save purchase'}
        accessibilityState={{ disabled: saving, busy: saving }}
        onPress={() => handleSave()} disabled={saving}>
        <Text style={styles.saveLabel}>{saving ? 'Saving...' : 'Save purchase'}</Text>
      </Pressable>

      <Pressable style={styles.cancel} accessibilityRole="button" accessibilityLabel="Cancel" onPress={() => router.back()}>
        <Text style={styles.cancelLabel}>Cancel</Text>
      </Pressable>
    </ScrollView>
  );
}

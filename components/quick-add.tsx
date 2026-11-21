import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { compactTextScale, radius, spacing, rem } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';
import { parseAmount } from '../lib/amount';
import { categoryIcon, Expense, formatUSD, readAllExpenses, saveExpenses } from '../lib/expenses';
import { recordSave, trackUse } from '../lib/usage';

// Two-tap logging: type the amount on the keypad, then tap one of four category tiles.
// Saves straight away. "More details" opens the full form for a name, note, or cash.
const QUICK_CATEGORIES = ['Food', 'Transport', 'Bills', 'Other'] as const;
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'DEL'];

// Allows typing a number with up to 7 digits before the point and 2 after.
const TYPING = /^\d{0,7}(\.\d{0,2})?$/;

// Helpers outside the component: they read the clock, which is only done when saving.
function todayLabel(): string {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function newId(): string {
  return Date.now().toString();
}

export function QuickAdd({ visible, onClose, onSaved, onMoreDetails }: {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  onMoreDetails: () => void;
}) {
  const { c, t, cat: catColor } = useTheme();
  const [value, setValue] = useState('');
  const [hint, setHint] = useState<string | null>(null);

  const amount = parseAmount(value);

  const press = (key: string) => {
    setHint(null);
    if (key === 'DEL') { setValue((v) => v.slice(0, -1)); return; }
    const next = value + key;
    if (TYPING.test(next)) setValue(next);
  };

  const close = () => { setValue(''); setHint(null); onClose(); };

  const logAs = async (category: string) => {
    if (amount === null || amount <= 0) { setHint('Type an amount first.'); return; }
    trackUse(`save:quick-add:${category}`);
    const expense: Expense = { id: newId(), name: category, amount, category, note: '', date: todayLabel() };
    const all = await readAllExpenses();
    await saveExpenses([...all, expense]);
    recordSave('Home quick add', category);
    setValue('');
    onSaved();
    onClose();
  };

  const styles = useMemo(() => StyleSheet.create({
    root: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.35)' },
    // At large text sizes the sheet is taller than the screen: cap it below the status bar and scroll inside.
    sheet: { backgroundColor: c.surface, borderTopLeftRadius: rem(1.5), borderTopRightRadius: rem(1.5), maxHeight: '90%' },
    sheetContent: { padding: spacing[5], paddingBottom: spacing[8] },
    grabber: { alignSelf: 'center', width: rem(2.5), height: rem(0.3125), borderRadius: rem(0.1875), backgroundColor: c.cardBorder, marginBottom: spacing[3] },
    title: { color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: '700' },
    amount: { color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: '700', textAlign: 'center', marginVertical: spacing[3] },
    hint: { color: c.textSecondary, fontSize: t.caption.fontSize, textAlign: 'center', minHeight: rem(1.125) },
    keys: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: spacing[2] },
    key: { width: '31%', height: rem(3.25), borderRadius: radius.md, backgroundColor: c.surfaceMuted, alignItems: 'center', justifyContent: 'center', marginBottom: spacing[2] },
    keyText: { color: c.textPrimary, fontSize: t.h3.fontSize, fontWeight: '600' },
    tiles: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing[3] },
    tile: { width: '23.5%', minHeight: rem(4.75), borderRadius: radius.md, borderWidth: 1, borderColor: c.cardBorder, alignItems: 'center', justifyContent: 'center', gap: rem(0.375) },
    tileText: { color: c.textPrimary, fontSize: t.caption.fontSize, fontWeight: '700' },
    more: { color: c.accent, fontSize: t.secondary.fontSize, fontWeight: '600', textAlign: 'center', marginTop: spacing[4] },
    pressed: { opacity: 0.8 },
  }), [c, t]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      {/* The backdrop is a sibling layer, not a parent, so it can't take drags meant for the sheet's scroll view. */}
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Close quick add" />
        <View style={styles.sheet}>
          <ScrollView contentContainerStyle={styles.sheetContent} bounces={false}>
          <View style={styles.grabber} />
          <Text style={styles.title} accessibilityRole="header">Quick add</Text>
          <Text style={styles.amount} accessibilityLabel={`Amount ${amount === null ? 'not entered' : formatUSD(amount)}`}>
            {value === '' ? '$0.00' : `$${value}`}
          </Text>
          <Text style={styles.hint}>{hint ?? 'Then tap a category to save'}</Text>

          <View style={styles.keys}>
            {KEYS.map((k) => (
              <Pressable key={k} onPress={() => press(k)} accessibilityRole="button"
                accessibilityLabel={k === 'DEL' ? 'Delete digit' : k}
                style={({ pressed }) => [styles.key, pressed && styles.pressed]}>
                <Text style={styles.keyText} maxFontSizeMultiplier={compactTextScale}>{k === 'DEL' ? '⌫' : k}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.tiles}>
            {QUICK_CATEGORIES.map((cat) => {
              const Icon = categoryIcon(cat);
              return (
                <Pressable key={cat} onPress={() => logAs(cat)} accessibilityRole="button"
                  accessibilityLabel={`Save as ${cat}`}
                  style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
                  <Icon size={rem(1.375)} color={catColor[cat] ?? c.textPrimary} strokeWidth={2.25} />
                  <Text style={styles.tileText} numberOfLines={1} adjustsFontSizeToFit maxFontSizeMultiplier={compactTextScale}>{cat}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable onPress={() => { close(); onMoreDetails(); }} accessibilityRole="link">
            <Text style={styles.more}>More details</Text>
          </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

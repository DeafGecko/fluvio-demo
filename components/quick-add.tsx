import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, spacing } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';
import { parseAmount } from '../lib/amount';
import { categoryIcon, Expense, formatUSD, readAllExpenses, saveExpenses } from '../lib/expenses';

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
    const expense: Expense = { id: newId(), name: category, amount, category, note: '', date: todayLabel() };
    const all = await readAllExpenses();
    await saveExpenses([...all, expense]);
    setValue('');
    onSaved();
    onClose();
  };

  const styles = useMemo(() => StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: c.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing[5], paddingBottom: spacing[8] },
    grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: c.cardBorder, marginBottom: spacing[3] },
    title: { color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: '700' },
    amount: { color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: '700', textAlign: 'center', marginVertical: spacing[3] },
    hint: { color: c.textSecondary, fontSize: t.caption.fontSize, textAlign: 'center', minHeight: 18 },
    keys: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: spacing[2] },
    key: { width: '31%', height: 52, borderRadius: radius.md, backgroundColor: c.surfaceMuted, alignItems: 'center', justifyContent: 'center', marginBottom: spacing[2] },
    keyText: { color: c.textPrimary, fontSize: t.h3.fontSize, fontWeight: '600' },
    tiles: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing[3] },
    tile: { width: '23.5%', minHeight: 76, borderRadius: radius.md, borderWidth: 1, borderColor: c.cardBorder, alignItems: 'center', justifyContent: 'center', gap: 6 },
    tileText: { color: c.textPrimary, fontSize: t.caption.fontSize, fontWeight: '700' },
    more: { color: c.accent, fontSize: t.secondary.fontSize, fontWeight: '600', textAlign: 'center', marginTop: spacing[4] },
    pressed: { opacity: 0.8 },
  }), [c, t]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Close quick add">
        <Pressable style={styles.sheet} onPress={() => {}}>
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
                <Text style={styles.keyText}>{k === 'DEL' ? '⌫' : k}</Text>
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
                  <Icon size={22} color={catColor[cat] ?? c.textPrimary} strokeWidth={2.25} />
                  <Text style={styles.tileText}>{cat}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable onPress={() => { close(); onMoreDetails(); }} accessibilityRole="link">
            <Text style={styles.more}>More details</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

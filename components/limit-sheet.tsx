import { useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { radius, spacing, rem, font } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';
import { parseAmount } from '../lib/amount';
import { recordSave, trackUse } from '../lib/usage';
import { BottomSheet } from './bottom-sheet';

// The monthly limit sheet. It uses an on-screen keypad, so typing works on the phone without
// a keyboard. The typed amount is kept inside this sheet, so the screen behind it does not redraw.
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'DEL'];
const TYPING = /^\d{0,7}(\.\d{0,2})?$/;

export function LimitSheet({ visible, onClose, current, onSave }: {
  visible: boolean;
  onClose: () => void;
  current: number;
  onSave: (value: number) => void;
}) {
  const { c, t } = useTheme();
  const [draft, setDraft] = useState(String(current));

  const styles = useMemo(() => ({
    note: { color: c.textSecondary, fontSize: t.secondary.fontSize, lineHeight: t.secondary.lineHeight, marginBottom: spacing[3] },
    display: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const, minHeight: rem(3.5), borderRadius: radius.md, borderWidth: 1, borderColor: c.cardBorder, backgroundColor: c.surface, marginBottom: spacing[3] },
    dollar: { color: c.textPrimary, fontSize: t.h2.fontSize, fontWeight: '700' as const, marginRight: spacing[1] },
    amount: { color: c.textPrimary, fontSize: t.h2.fontSize, fontWeight: '700' as const },
    keys: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, justifyContent: 'space-between' as const },
    key: { width: '31%' as const, height: rem(3.125), borderRadius: radius.md, backgroundColor: c.surfaceMuted, alignItems: 'center' as const, justifyContent: 'center' as const, marginBottom: spacing[2] },
    keyText: { color: c.textPrimary, fontSize: t.h3.fontSize, fontWeight: '600' as const },
    save: { minHeight: rem(3.25), borderRadius: rem(0.875), backgroundColor: c.accent, alignItems: 'center' as const, justifyContent: 'center' as const, marginTop: spacing[2] },
    saveLabel: { color: c.onAccent, fontSize: font(1.0625), fontWeight: '600' as const },
    pressed: { opacity: 0.8 },
  }), [c, t]);

  const press = (key: string) => {
    if (key === 'DEL') { setDraft((v) => v.slice(0, -1)); return; }
    const next = draft + key;
    if (TYPING.test(next)) setDraft(next);
  };

  const save = () => {
    const v = parseAmount(draft);
    if (v === null || v <= 0) { Alert.alert('Check the limit', 'Enter an amount greater than zero, up to 1,000,000.'); return; }
    trackUse('save:monthly-limit');
    recordSave('Monthly limit');
    onSave(v);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Monthly limit" height={rem(0.0437)}>
      <Text style={styles.note}>Set how much you plan to spend this month. Left to spend counts down from this number.</Text>
      <View style={styles.display} accessibilityLabel={`Monthly limit ${draft || '0'} dollars`} accessibilityRole="text">
        <Text style={styles.dollar}>$</Text>
        <Text style={styles.amount}>{draft || '0'}</Text>
      </View>
      <View style={styles.keys}>
        {KEYS.map((k) => (
          <Pressable key={k} onPress={() => press(k)} accessibilityRole="button"
            accessibilityLabel={k === 'DEL' ? 'Delete digit' : k}
            style={({ pressed }) => [styles.key, pressed && styles.pressed]}>
            <Text style={styles.keyText}>{k === 'DEL' ? '⌫' : k}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable onPress={save} accessibilityRole="button" accessibilityLabel="Save monthly limit"
        style={({ pressed }) => [styles.save, pressed && styles.pressed]}>
        <Text style={styles.saveLabel}>Save limit</Text>
      </Pressable>
    </BottomSheet>
  );
}

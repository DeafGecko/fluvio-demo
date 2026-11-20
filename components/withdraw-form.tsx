import { useFocusEffect } from 'expo-router';
import { parseAmount } from '../lib/amount';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { minTarget, radius, spacing, rem, font } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';
import { adjustDemoCashBalance, DemoAccount, loadDemoAccounts } from '../lib/accounts';
import { addWithdrawal } from '../lib/cash';
import { formatUSD } from '../lib/expenses';
import { SavedPopout } from './saved-popout';

// The Take out cash form: pick the account, type the amount, and a note. Used on the
// Take out cash screen and inside the Cash on hand sheet. Demo only.
export function WithdrawForm({ onSaved }: { onSaved?: () => void }) {
  const { c, t } = useTheme();
  const [accounts, setAccounts] = useState<DemoAccount[]>([]);
  const [fromId, setFromId] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useFocusEffect(useCallback(() => {
    loadDemoAccounts().then((list) => {
      const cash = list.filter((a) => a.kind === 'cash');
      setAccounts(cash);
      setFromId((prev) => prev || cash[0]?.id || '');
    });
  }, []));

  const from = accounts.find((a) => a.id === fromId);
  const available = from?.available ?? 0;
  const value = parseAmount(amount) ?? NaN;
  const valid = !isNaN(value) && value > 0 && value <= available;
  const canSave = valid && !saving && !!from;

  const save = async () => {
    if (!from) return;
    if (!valid) {
      Alert.alert('Check the amount', `Enter more than $0 and no more than ${formatUSD(available)}.`);
      return;
    }
    setSaving(true);
    await adjustDemoCashBalance(from.id, -value);
    await addWithdrawal({ fromAccountId: from.id, fromName: `${from.name} ····${from.mask}`, amount: value, note: note.trim() || undefined });
    setSaving(false);
    setSaved(true);
    setAmount('');
    setNote('');
    onSaved?.();
  };

  const styles = useMemo(() => StyleSheet.create({
    label: { color: c.textPrimary, fontSize: t.secondary.fontSize, fontWeight: '600', marginTop: spacing[4], marginBottom: spacing[2] },
    chip: {
      minHeight: rem(2.75), borderRadius: radius.pill, borderWidth: 1, borderColor: c.cardBorder, backgroundColor: c.surface,
      paddingHorizontal: spacing[3], justifyContent: 'center', marginRight: spacing[2], marginBottom: spacing[2],
    },
    chipOn: { borderColor: c.accent, backgroundColor: c.accentSoft },
    chipText: { color: c.textPrimary, fontSize: t.secondary.fontSize, fontWeight: '600' },
    chipTextOn: { color: c.accent },
    input: {
      minHeight: minTarget, backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.cardBorder,
      paddingHorizontal: spacing[4], color: c.textPrimary, fontSize: t.body.fontSize,
    },
    hint: { color: c.textSecondary, fontSize: t.caption.fontSize, marginTop: spacing[2] },
    save: { minHeight: rem(3.25), borderRadius: rem(0.875), backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center', marginTop: spacing[6] },
    saveLabel: { color: c.onAccent, fontSize: font(1.0625), fontWeight: '600' },
    disabled: { opacity: 0.5 },
  }), [c, t]);

  return (
    <View>
      <SavedPopout visible={saved} message="Cash taken out" />
      <Text style={styles.label}>From account</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {accounts.map((a) => {
          const on = a.id === fromId;
          return (
            <Pressable key={a.id} onPress={() => setFromId(a.id)} accessibilityRole="radio"
              accessibilityLabel={`${a.name} ending ${a.mask}, ${formatUSD(a.available ?? 0)} available`}
              accessibilityState={{ checked: on }} aria-checked={on} style={[styles.chip, on && styles.chipOn]}>
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{a.name} ····{a.mask}</Text>
            </Pressable>
          );
        })}
      </View>
      {from && <Text style={styles.hint}>Available: {formatUSD(available)}</Text>}

      <Text style={styles.label}>Amount</Text>
      <TextInput style={styles.input} value={amount} onChangeText={(v) => setAmount(v.replace(/[^0-9.]/g, '').slice(0, 10))} maxLength={10} keyboardType="decimal-pad"
        placeholder="0.00" placeholderTextColor={c.textTertiary} accessibilityLabel="Amount to take out" />

      <Text style={styles.label}>What is the cash for? (optional)</Text>
      <TextInput style={styles.input} value={note} onChangeText={(v) => setNote(v.slice(0, 280))} maxLength={280}
        placeholder="For example, groceries or parking" placeholderTextColor={c.textTertiary} accessibilityLabel="What the cash is for, optional" />

      <Pressable onPress={save} disabled={!canSave} accessibilityRole="button" accessibilityLabel="Take out cash"
        accessibilityState={{ disabled: !canSave }}
        style={({ pressed }) => [styles.save, (!canSave || pressed) && styles.disabled]}>
        <Text style={styles.saveLabel}>{saving ? 'Saving…' : 'Take out cash'}</Text>
      </Pressable>
    </View>
  );
}

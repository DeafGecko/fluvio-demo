import { useRouter } from 'expo-router';
import { parseAmount } from '../lib/amount';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BackLink } from '../components/settings-ui';
import { minTarget, radius, screenInset, spacing, rem, font } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';
import { addDemoAccount, DEMO_BANKS } from '../lib/accounts';

// Figma: 33 Add Manual Account (demo). Fictional accounts only. No bank credentials.
const TYPES = [
  { label: 'Checking', kind: 'cash' as const, name: 'Checking' },
  { label: 'Savings', kind: 'cash' as const, name: 'Savings' },
  { label: 'Credit card', kind: 'credit' as const, name: 'Credit card' },
];

export default function AddAccount() {
  const router = useRouter();
  const { c, t } = useTheme();
  const [bank, setBank] = useState<string>(DEMO_BANKS[0]);
  const [type, setType] = useState(0);
  const [mask, setMask] = useState('');
  // Starting values match the Figma frame, so the Add button is ready to use right away.
  const [balance, setBalance] = useState('1000.00');
  const [saving, setSaving] = useState(false);

  const maskOk = /^\d{4}$/.test(mask);
  const balanceNum = parseAmount(balance) ?? NaN;
  const balanceOk = !isNaN(balanceNum) && balanceNum >= 0;
  const canSave = maskOk && balanceOk && !saving;

  const handleSave = async () => {
    if (!maskOk) { Alert.alert('Check the last four digits', 'Enter exactly four numbers.'); return; }
    if (!balanceOk) { Alert.alert('Check the amount', 'Enter a balance of zero or more.'); return; }
    setSaving(true);
    const chosen = TYPES[type];
    await addDemoAccount({ institution: bank, kind: chosen.kind, name: chosen.name, mask, balance: balanceNum });
    setSaving(false);
    router.back();
  };

  const styles = useMemo(() => StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.canvas },
    content: { paddingHorizontal: screenInset, paddingTop: spacing[10], paddingBottom: spacing[12] },
    heading: { color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: t.h1.fontWeight, lineHeight: t.h1.lineHeight, marginTop: spacing[2] },
    label: { color: c.textPrimary, fontSize: t.secondary.fontSize, fontWeight: '600', marginTop: spacing[5], marginBottom: spacing[2] },
    chip: {
      minHeight: rem(2.75), borderRadius: radius.pill, borderWidth: 1, borderColor: c.border,
      backgroundColor: c.surface, paddingHorizontal: spacing[3], justifyContent: 'center', marginRight: spacing[2], marginBottom: spacing[2],
    },
    chipOn: { borderColor: c.accent, backgroundColor: c.accentSoft },
    chipText: { color: c.textPrimary, fontSize: t.secondary.fontSize, fontWeight: '600' },
    chipTextOn: { color: c.accent },
    input: {
      minHeight: minTarget, backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.cardBorder,
      paddingHorizontal: spacing[4], color: c.textPrimary, fontSize: t.body.fontSize,
    },
    hint: { color: c.textSecondary, fontSize: t.caption.fontSize, marginTop: spacing[2] },
    save: {
      minHeight: rem(3.25), borderRadius: rem(0.875), backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center', marginTop: spacing[8],
    },
    saveLabel: { color: c.onAccent, fontSize: font(1.0625), fontWeight: '600' },
    disabled: { opacity: 0.5 },
    pressed: { opacity: 0.85 },
    note: { color: c.textSecondary, fontSize: t.caption.fontSize, lineHeight: t.caption.lineHeight, marginTop: spacing[4], textAlign: 'center' },
  }), [c, t]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <BackLink label="Accounts" onPress={() => router.back()} />
      <Text style={styles.heading} accessibilityRole="header">Add demo account</Text>

      <Text style={styles.label}>Bank</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {DEMO_BANKS.map((b) => {
          const on = bank === b;
          return (
            <Pressable key={b} onPress={() => setBank(b)} accessibilityRole="radio"
              accessibilityLabel={b} accessibilityState={{ checked: on }} aria-checked={on}
              style={[styles.chip, on && styles.chipOn]}>
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{b}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Account type</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {TYPES.map((tp, i) => {
          const on = type === i;
          return (
            <Pressable key={tp.label} onPress={() => setType(i)} accessibilityRole="radio"
              accessibilityLabel={tp.label} accessibilityState={{ checked: on }} aria-checked={on}
              style={[styles.chip, on && styles.chipOn]}>
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{tp.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Last four digits</Text>
      <TextInput style={styles.input} value={mask} onChangeText={(v) => setMask(v.replace(/\D/g, '').slice(0, 4))}
        keyboardType="number-pad" maxLength={4} placeholder="0000" placeholderTextColor={c.textTertiary}
        accessibilityLabel="Last four digits" />
      <Text style={styles.hint}>Fictional number. Shown as ····{mask || '0000'}.</Text>

      <Text style={styles.label}>{type === 2 ? 'You owe' : 'Starting balance'}</Text>
      <TextInput style={styles.input} value={balance} maxLength={10} onChangeText={(v) => setBalance(v.replace(/[^0-9.]/g, '').slice(0, 10))}
        keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={c.textTertiary}
        accessibilityLabel={type === 2 ? 'You owe' : 'Starting balance'} />

      <Pressable onPress={handleSave} disabled={!canSave}
        style={({ pressed }) => [styles.save, (!canSave || pressed) && styles.disabled, pressed && styles.pressed]}
        accessibilityRole="button" accessibilityLabel="Add demo account" accessibilityState={{ disabled: !canSave }}>
        <Text style={styles.saveLabel}>{saving ? 'Adding…' : 'Add demo account'}</Text>
      </Pressable>

      <Text style={styles.note}>Demo only. No bank is contacted and no credentials are accepted.</Text>
    </ScrollView>
  );
}

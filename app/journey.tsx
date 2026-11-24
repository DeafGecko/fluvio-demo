import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CheckIcon, ChevronDownIcon } from 'react-native-heroicons/outline';
import { BackLink } from '../components/settings-ui';
import { BottomSheet } from '../components/bottom-sheet';
import { minTarget, radius, screenInset, spacing, rem } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';
import { loadDemoStatement } from '../lib/demo-data';
import { loadWithdrawals } from '../lib/cash';
import { formatUSD, loadExpenses } from '../lib/expenses';

// Every movement of money in one history: paychecks and refunds (in), purchases,
// cash taken out, and transfers. Filter by type, grouped by month, newest first.
type Group = 'paycheck' | 'refund' | 'purchase' | 'cash' | 'transfer' | 'other';
type Line = { id: string; date: string; name: string; amount: number; group: Group; note?: string; accountId: string };

// The three accounts in the demo. Items with no account saved are treated as Checking.
const DEFAULT_ACCOUNT = 'chk-4821';
const ACCOUNTS: { key: string; label: string }[] = [
  { key: 'all', label: 'All accounts' },
  { key: 'chk-4821', label: 'Checking' },
  { key: 'sav-9033', label: 'Savings' },
  { key: 'crd-1187', label: 'Credit card' },
];

const GROUP_LABEL: Record<Group, string> = {
  paycheck: 'Paycheck', refund: 'Refund', purchase: 'Purchase', cash: 'Cash out', transfer: 'Transfer', other: 'Other',
};
const FILTERS: { key: 'all' | 'in' | 'purchase' | 'cash' | 'transfer'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'in', label: 'Money in' },
  { key: 'purchase', label: 'Purchases' },
  { key: 'cash', label: 'Cash out' },
  { key: 'transfer', label: 'Transfers' },
];

const pad = (n: number) => String(n).padStart(2, '0');
const isoOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Purchases store a short date such as "Nov 19". Add this year so they sort and group with the rest.
function purchaseIso(date: string): string {
  const d = new Date(`${date}, ${new Date().getFullYear()} 12:00:00`);
  return isNaN(d.getTime()) ? '' : isoOf(d);
}

export default function Journey() {
  const router = useRouter();
  const { c, t } = useTheme();
  const [lines, setLines] = useState<Line[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('all');
  const [account, setAccount] = useState<string>('all');
  const [accountOpen, setAccountOpen] = useState(false);

  useFocusEffect(useCallback(() => {
    Promise.all([loadDemoStatement(), loadWithdrawals(), loadExpenses()]).then(([statement, withdrawals, expenses]) => {
      const fromStatement: Line[] = statement.map((s) => ({
        id: `s-${s.id}`,
        date: s.date,
        name: s.name,
        amount: s.amount,
        group: s.kind === 'paycheck' ? 'paycheck' : s.kind === 'refund' ? 'refund' : s.kind === 'transfer' ? 'transfer' : 'other',
        accountId: DEFAULT_ACCOUNT,
      }));
      const cash: Line[] = withdrawals.map((w) => ({
        id: `c-${w.id}`,
        date: w.at.slice(0, 10),
        name: w.fromName,
        amount: -w.amount,
        group: 'cash',
        note: w.note,
        accountId: w.fromAccountId,
      }));
      const purchases: Line[] = expenses
        .filter((e) => !e.deletedAt)
        .map((e) => ({
          id: `p-${e.id}`,
          date: purchaseIso(e.date),
          name: e.name,
          amount: -e.amount,
          group: 'purchase' as const,
          note: e.note || undefined,
          accountId: e.accountId ?? DEFAULT_ACCOUNT,
        }))
        .filter((l) => l.date);
      setLines([...fromStatement, ...cash, ...purchases].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)));
    });
  }, []));

  const shown = useMemo(() => lines.filter((l) => {
    if (account !== 'all' && l.accountId !== account) return false;
    if (filter === 'all') return true;
    if (filter === 'in') return l.amount > 0;
    return l.group === filter;
  }), [lines, filter, account]);

  const months = useMemo(() => {
    const map = new Map<string, { label: string; items: Line[]; net: number; moneyIn: number; moneyOut: number }>();
    shown.forEach((l) => {
      const label = new Date(`${l.date}T00:00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const m = map.get(label) ?? { label, items: [], net: 0, moneyIn: 0, moneyOut: 0 };
      m.items.push(l);
      m.net += l.amount;
      if (l.amount >= 0) m.moneyIn += l.amount; else m.moneyOut += -l.amount;
      map.set(label, m);
    });
    return Array.from(map.values());
  }, [shown]);

  const styles = useMemo(() => StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.canvas },
    content: { paddingHorizontal: screenInset, paddingTop: spacing[16], paddingBottom: spacing[12] },
    heading: { color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: t.h1.fontWeight, lineHeight: t.h1.lineHeight, marginTop: spacing[2] },
    note: { color: c.textSecondary, fontSize: t.secondary.fontSize, lineHeight: t.secondary.lineHeight, marginTop: spacing[1], marginBottom: spacing[4] },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginBottom: spacing[2] },
    chip: { paddingHorizontal: spacing[4], paddingVertical: rem(0.375), borderRadius: radius.pill, borderWidth: 1, borderColor: c.cardBorder, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: spacing[2] },
    option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: minTarget, borderBottomWidth: 1, borderBottomColor: c.cardBorder },
    optionLabel: { color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: t.bodyStrong.fontWeight },
    chipOn: { backgroundColor: c.accent, borderColor: c.accent },
    chipLabel: { color: c.textPrimary, fontSize: t.secondary.fontSize, fontWeight: '600' },
    chipLabelOn: { color: c.onAccent },
    month: { backgroundColor: c.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: c.cardBorder, padding: spacing[4], marginTop: spacing[4] },
    monthHead: { marginBottom: spacing[2] },
    monthName: { color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: '700' },
    totals: { color: c.textSecondary, fontSize: t.caption.fontSize, marginTop: rem(0.125) },
    item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing[2], borderTopWidth: 1, borderTopColor: c.border, gap: spacing[3] },
    itemName: { color: c.textPrimary, fontSize: t.secondary.fontSize, fontWeight: '600' },
    itemMeta: { color: c.textSecondary, fontSize: t.caption.fontSize, marginTop: rem(0.125) },
    itemAmt: { color: c.textPrimary, fontSize: t.secondary.fontSize, fontWeight: '700', fontVariant: ['tabular-nums'] },
    empty: { color: c.textSecondary, fontSize: t.secondary.fontSize, marginTop: spacing[6], textAlign: 'center' },
    pressed: { opacity: 0.8 },
  }), [c, t]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <BackLink label="Insights" onPress={() => (router.canGoBack() ? router.back() : router.replace('/insights'))} />
      <Text style={styles.heading} accessibilityRole="header">History</Text>
      <Text style={styles.note}>Every purchase, cash withdrawal, transfer, and paycheck, newest first.</Text>

      <Pressable onPress={() => setAccountOpen(true)} accessibilityRole="button"
        accessibilityLabel={`Account: ${ACCOUNTS.find((a) => a.key === account)?.label ?? 'All accounts'}. Change account`}
        style={({ pressed }) => [styles.chip, { alignSelf: 'flex-start', marginBottom: spacing[6] }, pressed && styles.pressed]}>
        <Text style={styles.chipLabel}>Account: {ACCOUNTS.find((a) => a.key === account)?.label ?? 'All accounts'}</Text>
        <ChevronDownIcon size={rem(1)} color={c.textPrimary} />
      </Pressable>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing[2] }}
        contentContainerStyle={{ gap: spacing[2], paddingRight: spacing[4] }} accessibilityRole="tablist">
        {FILTERS.map((f) => {
          const on = filter === f.key;
          return (
            <Pressable key={f.key} onPress={() => setFilter(f.key)} accessibilityRole="tab"
              accessibilityState={{ selected: on }} accessibilityLabel={f.label}
              style={({ pressed }) => [styles.chip, on && styles.chipOn, pressed && styles.pressed]}>
              <Text style={[styles.chipLabel, on && styles.chipLabelOn]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {months.length === 0 && <Text style={styles.empty}>Nothing here yet for this filter.</Text>}

      {months.map((m) => (
        <View key={m.label} style={styles.month}>
          <View style={styles.monthHead}>
            <Text style={styles.monthName} accessibilityRole="header">{m.label}</Text>
            <Text style={styles.totals}>
              In +{formatUSD(m.moneyIn)} · Out −{formatUSD(m.moneyOut)} · Net {m.net >= 0 ? '+' : '−'}{formatUSD(Math.abs(m.net))}
            </Text>
          </View>
          {m.items.map((l) => {
            const meta = `${new Date(`${l.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${GROUP_LABEL[l.group]}${l.note ? ` · ${l.note}` : ''}`;
            return (
              <View key={l.id} style={styles.item} accessible
                accessibilityLabel={`${l.name}, ${GROUP_LABEL[l.group]}, ${meta}, ${l.amount >= 0 ? 'money in' : 'money out'} ${formatUSD(Math.abs(l.amount))}`}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{l.name}</Text>
                  <Text style={styles.itemMeta}>{meta}</Text>
                </View>
                <Text style={styles.itemAmt}>{l.amount >= 0 ? '+' : '−'}{formatUSD(Math.abs(l.amount))}</Text>
              </View>
            );
          })}
        </View>
      ))}

      <BottomSheet visible={accountOpen} onClose={() => setAccountOpen(false)} title="Choose an account" height={0.5}>
        {ACCOUNTS.map((a) => {
          const on = account === a.key;
          return (
            <Pressable key={a.key} onPress={() => { setAccount(a.key); setAccountOpen(false); }}
              accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={a.label}
              style={({ pressed }) => [styles.option, pressed && styles.pressed]}>
              <Text style={styles.optionLabel}>{a.label}</Text>
              {on && <CheckIcon size={rem(1.25)} color={c.accent} />}
            </Pressable>
          );
        })}
      </BottomSheet>
    </ScrollView>
  );
}

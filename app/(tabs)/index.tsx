import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BellIcon, DocumentIcon, EyeIcon, EyeSlashIcon, PencilSquareIcon, PlusIcon, XMarkIcon } from 'react-native-heroicons/outline';
import { compactTextScale, isLargeText, minTarget, radius, screenInset, spacing, rem, font } from '../../constants/tokens';
import { useTheme } from '../../hooks/use-theme';
import { Avatar } from '../../components/avatar';
import { TransactionRow } from '../../components/transaction-row';
import { seedDemoData } from '../../lib/demo-data';
import { trackUse } from '../../lib/usage';
import { setPref, usePrefs } from '../../lib/prefs';
import { OfflineBanner } from '../../components/offline-banner';
import { loadUnreadCount } from '../../lib/notifications';
import { DemoAccount, loadDemoAccounts, seedDemoAccounts } from '../../lib/accounts';
import { thisMonth } from '../../lib/budget';
import { QuickAdd } from '../../components/quick-add';
import { LimitSheet } from '../../components/limit-sheet';
import { CATEGORY_NAMES, Expense, categoryIcon, formatUSD, loadExpenses, softDeleteExpense } from '../../lib/expenses';

const RECENT_LIMIT = 5;

// Top-right "+" on Home opens the quick add sheet (two-tap logging).
const SHOW_HOME_ADD = true;

export default function Home() {
  const router = useRouter();
  const { c, t, cat: catColor } = useTheme();
  const [unread, setUnread] = useState(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [quickOpen, setQuickOpen] = useState(false);
  const reloadExpenses = useCallback(() => { loadExpenses().then(setExpenses); }, []);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [alertOpen, setAlertOpen] = useState(true);
  // The bell only shows when Notifications is turned on in Settings.
  const { notifications: notificationsOn, hideAmounts, pretendOffline, monthlyLimit } = usePrefs();
  const [limitOpen, setLimitOpen] = useState(false);

  // Refresh the bell count each time Home is shown.
  const [accounts, setAccounts] = useState<DemoAccount[]>([]);
  useFocusEffect(useCallback(() => {
    loadUnreadCount().then(setUnread);
    // Demo: a signed-in device with no accounts gets the starter accounts, so the balance always shows.
    loadDemoAccounts().then(async (list) => {
      if (list.length === 0) { await seedDemoAccounts(); setAccounts(await loadDemoAccounts()); }
      else setAccounts(list);
    });
  }, []));
  // Cash accounts shown on Home: checking and savings, using the current balance.
  const currentBalance = accounts
    .filter((a) => a.kind === 'cash' && a.showOnHome !== false)
    .reduce((sum, a) => sum + (a.current ?? a.available ?? 0), 0);

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem('user_name').then((n) => setUserName(n ?? ''));
    // Demo: if signed in but no purchases are stored, load the six-month demo data.
    loadExpenses().then(async (data) => {
      let list = data;
      if (list.length === 0 && (await AsyncStorage.getItem('onboarded'))) {
        await seedDemoData();
        list = await loadExpenses();
      }
      setExpenses(list);
      setLoading(false);
    });
  }, []));

  // Delete keeps the purchase in history (not erased for good).
  const handleDelete = async (id: string) => {
    await softDeleteExpense(id);
    setExpenses(await loadExpenses());
  };

  // The category chips filter the Recent purchases list. 'All' shows everything.
  const [chosen, setChosen] = useState<string>('All');
  const recent = useMemo(
    () => [...expenses].reverse().filter((e) => chosen === 'All' || e.category === chosen).slice(0, RECENT_LIMIT),
    [expenses, chosen],
  );
  const month = thisMonth(expenses, monthlyLimit);
  const usedPct = Math.min(100, Math.round((month.spent / monthlyLimit) * 100));

  // The time and date are read after the screen mounts, so a pre-rendered page never shows a stale greeting.
  const [now] = useState<Date | null>(() => new Date());
  const hour = now ? now.getHours() : 12;
  const greeting = !now ? 'Hello' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const styles = useMemo(() => StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.canvas },
    content: { paddingHorizontal: screenInset, paddingTop: spacing[16], paddingBottom: spacing[12] },
    // Large text: the buttons move above the title so the title keeps the full width.
    header: isLargeText
      ? { flexDirection: 'column-reverse', gap: spacing[4], marginBottom: spacing[6] }
      : { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing[6] },
    greeting: { color: c.textSecondary, fontSize: font(0.875), fontWeight: '400', lineHeight: font(1.1875) },
    title: { color: c.textPrimary, fontSize: font(1.5), fontWeight: '700', lineHeight: font(2), marginTop: rem(0.125) },
    caption: { color: c.textSecondary, fontSize: t.caption.fontSize, lineHeight: t.caption.lineHeight, marginTop: rem(0.125) },
    topRight: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], alignSelf: 'flex-start' },
    alert: {
      flexDirection: 'row', alignItems: 'center', gap: spacing[2], backgroundColor: c.surface,
      borderRadius: radius.md, borderWidth: 1, borderColor: c.warning, padding: spacing[3], marginBottom: spacing[4],
    },
    alertTitle: { color: c.warning, fontSize: t.secondary.fontSize, fontWeight: '600' },
    alertBody: { color: c.textSecondary, fontSize: t.caption.fontSize, marginTop: rem(0.125) },
    alertClose: { width: rem(2.75), height: rem(2.75), alignItems: 'center', justifyContent: 'center' },
    addBtn: {
      width: rem(2.75), height: rem(2.75), borderRadius: radius.pill,
      backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center',
    },
    avatar: {
      width: rem(2.75), height: rem(2.75), borderRadius: rem(1.375), backgroundColor: c.accentSoft, borderWidth: 1, borderColor: c.avatarBorder,
      alignItems: 'center', justifyContent: 'center',
    },
    avatarLetter: { color: c.accent, fontSize: font(1.0625), fontWeight: '700' },
    // Plain outline bell, no background or border.
    bell: { width: rem(2.75), height: rem(2.75), alignItems: 'center', justifyContent: 'center', marginTop: rem(0.25) },
    // Full red circle with the unread count inside.
    bellCount: {
      position: 'absolute', top: rem(0.125), right: 0, minWidth: rem(1.25), height: rem(1.25), borderRadius: rem(0.625),
      backgroundColor: c.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: rem(0.25),
    },
    bellCountText: { color: c.onAccent, fontSize: font(0.75), fontWeight: '700' },
    demoPill: {
      alignSelf: 'flex-start', marginTop: spacing[2], backgroundColor: c.accentSoft,
      borderRadius: radius.pill, paddingHorizontal: spacing[2], paddingVertical: rem(0.3125),
    },
    demoPillText: { color: c.accent, fontSize: font(0.6875), fontWeight: '600', letterSpacing: font(0.0375) },
    summary: {
      backgroundColor: c.surface, borderWidth: 1, borderColor: c.cardBorder, borderRadius: rem(1.125), padding: rem(1.25),
      marginBottom: spacing[8],
    },
    // Large text: the amount goes under the label, so neither squeezes the other.
    balanceRow: { flexDirection: isLargeText ? 'column' : 'row', alignItems: isLargeText ? 'flex-start' : 'center', gap: isLargeText ? spacing[1] : 0, marginTop: spacing[5], paddingTop: spacing[5], borderTopWidth: 1, borderTopColor: c.border },
    balanceLabel: { color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: '600' },
    balanceNote: { color: c.textSecondary, fontSize: t.caption.fontSize, marginTop: rem(0.125) },
    balanceAmount: { color: c.textPrimary, fontSize: t.h2.fontSize, fontWeight: '700', fontVariant: ['tabular-nums'] },
    // Same capsule as History: side padding and a short height.
    chip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2], paddingVertical: rem(0.375), paddingHorizontal: spacing[4], borderRadius: radius.pill, backgroundColor: c.surface, borderWidth: 1, borderColor: c.cardBorder },
    chipOn: { backgroundColor: c.accent, borderColor: c.accent },
    chipLabel: { color: c.textPrimary, fontSize: t.secondary.fontSize, fontWeight: '600' },
    chipLabelOn: { color: c.onAccent },
    amountRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginTop: spacing[1] },
    spentLine: { color: c.textSecondary, fontSize: t.caption.fontSize, lineHeight: t.caption.lineHeight, marginTop: spacing[2] },
    summaryMonth: { color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: '700', marginBottom: spacing[1] },
    bar: { flexDirection: 'row', height: rem(0.625), borderRadius: rem(0.3125), overflow: 'hidden', marginTop: spacing[4], backgroundColor: c.surfaceMuted },
    catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginTop: spacing[4] },
    // Large text: the amount wraps under the name, so the chip uses card corners instead of a pill.
    catChip: { flexDirection: 'row', flexShrink: 0, alignItems: 'center', gap: rem(0.375), paddingVertical: rem(0.125), paddingHorizontal: rem(0.625), borderRadius: isLargeText ? radius.md : rem(62.4375), borderWidth: 1, borderColor: c.cardBorder },
    catDot: { width: rem(0.5), height: rem(0.5), borderRadius: rem(0.25) },
    catName: { flexShrink: 1, color: c.textSecondary, fontSize: t.caption.fontSize, fontWeight: '600' },
    catAmt: { color: c.textPrimary, fontSize: t.caption.fontSize, fontWeight: '700' },
    summaryLabel: { color: c.textSecondary, fontSize: t.secondary.fontSize, lineHeight: t.secondary.lineHeight, fontWeight: '600' },
    summaryAmount: {
      flexShrink: 1, color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: t.h1.fontWeight,
      lineHeight: t.h1.lineHeight, fontVariant: ['tabular-nums'],
    },
    summaryNote: { color: c.textSecondary, fontSize: t.caption.fontSize, lineHeight: t.caption.lineHeight, marginTop: spacing[2] },
    sectionRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[3] },
    sectionTitle: { color: c.textPrimary, fontSize: t.h3.fontSize, fontWeight: t.h3.fontWeight, lineHeight: t.h3.lineHeight },
    textAction: { minHeight: minTarget, justifyContent: 'center', paddingLeft: spacing[3] },
    textActionLabel: { color: c.accent, fontSize: t.bodyStrong.fontSize, fontWeight: t.bodyStrong.fontWeight },
    empty: { alignItems: 'center', paddingVertical: spacing[10], gap: spacing[2] },
    emptyIcon: {
      width: rem(3.5), height: rem(3.5), borderRadius: radius.lg, backgroundColor: c.surfaceMuted,
      alignItems: 'center', justifyContent: 'center', marginBottom: spacing[2],
    },
    emptyTitle: { color: c.textPrimary, fontSize: t.h3.fontSize, fontWeight: t.h3.fontWeight },
    emptyBody: { color: c.textSecondary, fontSize: t.secondary.fontSize, lineHeight: t.secondary.lineHeight, textAlign: 'center' },
    primaryBtn: {
      marginTop: spacing[3], minHeight: minTarget, paddingHorizontal: spacing[6],
      borderRadius: radius.md, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center',
    },
    primaryBtnLabel: { color: c.onAccent, fontSize: t.bodyStrong.fontSize, fontWeight: t.bodyStrong.fontWeight },
    loader: { marginTop: spacing[10] },
  }), [c, t]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={isLargeText ? undefined : { flex: 1 }}>
          <Text style={styles.greeting}>
            {greeting}{userName ? `, ${userName}` : ''}
          </Text>
          <Text style={styles.title} accessibilityRole="header">Your money today</Text>
          <Text style={styles.caption}>
            {now ? now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : ''}
          </Text>
          <View style={styles.demoPill} accessibilityLabel="Demo data">
            <Text style={styles.demoPillText}>DEMO</Text>
          </View>
        </View>
        <View style={styles.topRight}>
          {notificationsOn && (
            <Pressable style={styles.bell} accessibilityRole="button"
              accessibilityLabel={unread > 0 ? `Notifications, ${unread} new` : 'Notifications'}
              onPress={() => router.push('/notifications')}>
              <BellIcon size={rem(2)} color={c.textPrimary} />
              {unread > 0 && (
                <View style={styles.bellCount}>
                  <Text style={styles.bellCountText} maxFontSizeMultiplier={compactTextScale}>{unread}</Text>
                </View>
              )}
            </Pressable>
          )}
          {SHOW_HOME_ADD && (
            <Pressable style={styles.addBtn} accessibilityRole="button" accessibilityLabel="Add expense"
              onPress={() => { trackUse('tap:home-add'); setQuickOpen(true); }}>
              <PlusIcon size={rem(1.375)} color={c.onAccent} />
            </Pressable>
          )}
          <Avatar size={rem(2.75)} label={`Account and settings for ${userName || 'Fluvio'}`} onPress={() => router.push('/profile')} />
        </View>
      </View>

      {pretendOffline && <OfflineBanner onRetry={() => setPref('pretendOffline', false)} />}

      {alertOpen && expenses.length > 0 && (
        <View style={styles.alert} accessibilityRole="alert">
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>Check a charge (demo)</Text>
            <Text style={styles.alertBody}>This is a pretend alert. Look at your recent purchases.</Text>
          </View>
          <Pressable style={styles.alertClose} onPress={() => setAlertOpen(false)}
            accessibilityRole="button" accessibilityLabel="Dismiss demo alert">
            <XMarkIcon size={rem(1.25)} color={c.textSecondary} />
          </Pressable>
        </View>
      )}

      <View style={styles.summary}>
        <Text style={styles.summaryMonth}>{new Date().toLocaleDateString('en-US', { month: 'long' })}</Text>
        <Text style={styles.summaryLabel}>Left to spend</Text>
        <View style={styles.amountRow}>
          <Text style={styles.summaryAmount} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{hideAmounts ? '••••••' : formatUSD(month.left)}</Text>
          <Pressable onPress={() => setPref('hideAmounts', !hideAmounts)} accessibilityRole="button"
            accessibilityLabel={hideAmounts ? 'Show amounts' : 'Hide amounts'} hitSlop={rem(0.625)}>
            {hideAmounts ? <EyeSlashIcon size={rem(1.25)} color={c.textSecondary} /> : <EyeIcon size={rem(1.25)} color={c.textSecondary} />}
          </Pressable>
        </View>
        <Text style={styles.spentLine}>Spent this month: {hideAmounts ? '••••••' : formatUSD(month.spent)}</Text>

        {/* One bar: each colored part is a category; the grey part is what is left under the limit. */}
        <View style={styles.bar} accessibilityRole="progressbar" accessibilityLabel={`Used ${usedPct}% of your ${formatUSD(monthlyLimit)} monthly limit`} accessibilityValue={{ min: 0, max: 100, now: usedPct }}>
          {month.byCategory.map(([cat, amt]) => (
            <View key={cat} style={{ flex: amt, backgroundColor: catColor[cat] ?? c.textTertiary }} />
          ))}
          <View style={{ flex: Math.max(0, month.left), backgroundColor: c.surfaceMuted }} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing[2] }}>
          <Text style={[styles.summaryNote, { marginTop: 0, flex: 1 }]}>{usedPct}% of {formatUSD(monthlyLimit)} limit used this month</Text>
          <Pressable onPress={() => setLimitOpen(true)} accessibilityRole="button"
            accessibilityLabel="Edit limit" style={{ minHeight: rem(2.75), justifyContent: 'center', paddingLeft: spacing[3] }}>
            <PencilSquareIcon size={rem(1.25)} color={c.accent} />
          </Pressable>
        </View>

        <View style={styles.catRow}>
          {month.byCategory.slice(0, 4).map(([cat, amt]) => (
            <View key={cat} style={styles.catChip}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: rem(0.375), flexShrink: 1 }}>
                <View style={[styles.catDot, { backgroundColor: catColor[cat] ?? c.textTertiary }]} />
                <Text style={styles.catName} numberOfLines={1}>{cat}</Text>
              </View>
              <Text style={styles.catAmt} numberOfLines={1}>{hideAmounts ? '••••' : formatUSD(amt)}</Text>
            </View>
          ))}
        </View>

        {accounts.length > 0 && (
          <View style={styles.balanceRow}>
            <View style={isLargeText ? undefined : { flex: 1 }}>
              <Text style={styles.balanceLabel}>Current balance</Text>
              <Text style={styles.balanceNote}>Checking and savings</Text>
            </View>
            <Text style={styles.balanceAmount} numberOfLines={1} adjustsFontSizeToFit>{hideAmounts ? '••••••' : formatUSD(currentBalance)}</Text>
          </View>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing[6] }}
        contentContainerStyle={{ gap: spacing[2], paddingRight: spacing[4] }} accessibilityRole="tablist">
        {['All', ...CATEGORY_NAMES].map((cat) => {
          const on = chosen === cat;
          const Icon = cat === 'All' ? null : categoryIcon(cat);
          return (
            <Pressable key={cat} onPress={() => setChosen(cat)} accessibilityRole="tab"
              accessibilityState={{ selected: on }} aria-selected={on}
              style={[styles.chip, on && styles.chipOn]}>
              {Icon && <Icon size={rem(1.125)} color={on ? c.onAccent : (catColor[cat] ?? c.textPrimary)} strokeWidth={2.25} />}
              <Text style={[styles.chipLabel, on && styles.chipLabelOn]}>{cat}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle} accessibilityRole="header">Recent purchases</Text>
        {expenses.length > 0 && (
          <Pressable style={styles.textAction} accessibilityRole="link" accessibilityLabel="View all activity"
            onPress={() => router.push('/activity')}>
            <Text style={styles.textActionLabel}>View all</Text>
          </Pressable>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={c.accent} style={styles.loader} accessibilityLabel="Loading activity" />
      ) : expenses.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}><DocumentIcon size={rem(1.5)} color={c.textSecondary} /></View>
          <Text style={styles.emptyTitle}>No purchases yet</Text>
          <Text style={styles.emptyBody}>Tap Add expense to add your first one.</Text>
          <Pressable style={styles.primaryBtn} accessibilityRole="button" accessibilityLabel="Add your first expense"
            onPress={() => setQuickOpen(true)}>
            <Text style={styles.primaryBtnLabel}>Add expense</Text>
          </Pressable>
          <Pressable style={[styles.primaryBtn, { backgroundColor: c.surface, borderWidth: 1, borderColor: c.cardBorder }]} accessibilityRole="button"
            accessibilityLabel="Load demo data" onPress={async () => { await seedDemoData(); setExpenses(await loadExpenses()); }}>
            <Text style={[styles.primaryBtnLabel, { color: c.textPrimary }]}>Load demo data</Text>
          </Pressable>
        </View>
      ) : (
        <View accessibilityRole="list">
          {recent.map((expense, index) => (
            <View key={expense.id} accessibilityRole="listitem">
              <TransactionRow expense={expense} index={index} onDelete={handleDelete} />
            </View>
          ))}
        </View>
      )}
      {/* Own component: keeps the typed amount, so typing does not redraw this screen. */}
      <LimitSheet key={limitOpen ? 'open' : 'closed'} visible={limitOpen} onClose={() => setLimitOpen(false)}
        current={monthlyLimit} onSave={(v) => setPref('monthlyLimit', v)} />
      <QuickAdd visible={quickOpen} onClose={() => setQuickOpen(false)} onSaved={reloadExpenses} onMoreDetails={() => router.push('/add')} />
    </ScrollView>
  );
}

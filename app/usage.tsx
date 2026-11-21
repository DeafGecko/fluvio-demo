import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BackLink } from '../components/settings-ui';
import { minTarget, radius, screenInset, spacing, rem } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';
import { clearUsage, loadSaves, loadUsage, SaveEntry, UsageEntry } from '../lib/usage';

// Pilot only: how often each screen and key button was used on this phone.
// Nothing leaves the phone. Use it to decide what to keep.
const SCREENS: Record<string, string> = {
  '/': 'Home', '/activity': 'Activity', '/insights': 'Insights', '/accounts': 'Accounts',
  '/bills': 'Bills', '/stats': 'Spending breakdown', '/search': 'Search', '/cash': 'Cash on hand',
  '/settings': 'Settings', '/profile': 'Profile', '/journey': 'Money in and out', '/statement': 'Account history',
  '/notifications': 'Notifications', '/add': 'Add expense (full form)', '/withdraw': 'Take out cash',
  '/purchase-detail': 'Purchase details', '/add-account': 'Add account', '/account-detail': 'Account detail',
  '/account-settings': 'Account settings', '/key-benefits': 'Key benefits', '/help': 'Help', '/usage': 'Usage',
};
const TAPS: Record<string, string> = {
  'tap:home-add': 'Home + button',
  'save:monthly-limit': 'Monthly limit saved',
  'save:quick-add:Food': 'Quick add saved as Food',
  'save:quick-add:Transport': 'Quick add saved as Transport',
  'save:quick-add:Bills': 'Quick add saved as Bills',
  'save:quick-add:Other': 'Quick add saved as Other',
};

function labelFor(key: string): string {
  if (key.startsWith('screen:')) { const p = key.slice(7); return SCREENS[p] ?? p; }
  return TAPS[key] ?? key;
}

export default function Usage() {
  const router = useRouter();
  const { c, t } = useTheme();
  const [usage, setUsage] = useState<Record<string, UsageEntry>>({});
  const [saves, setSaves] = useState<SaveEntry[]>([]);
  useFocusEffect(useCallback(() => { loadUsage().then(setUsage); loadSaves().then(setSaves); }, []));

  // Every known screen and button, plus anything else that was logged.
  const rows = useMemo(() => {
    const keys = new Set<string>([
      ...Object.keys(SCREENS).map((p) => `screen:${p}`),
      ...Object.keys(TAPS),
      ...Object.keys(usage),
    ]);
    return [...keys]
      .map((key) => ({ key, label: labelFor(key), entry: usage[key] }))
      .sort((a, b) => (b.entry?.count ?? 0) - (a.entry?.count ?? 0) || a.label.localeCompare(b.label));
  }, [usage]);

  const reset = () => {
    Alert.alert('Clear usage', 'Erase the usage log on this phone? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => { await clearUsage(); setUsage({}); setSaves([]); } },
    ]);
  };

  const styles = useMemo(() => StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.canvas },
    content: { paddingHorizontal: screenInset, paddingTop: spacing[16], paddingBottom: spacing[12] },
    heading: { color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: t.h1.fontWeight, lineHeight: t.h1.lineHeight, marginTop: spacing[2] },
    note: { color: c.textSecondary, fontSize: t.secondary.fontSize, lineHeight: t.secondary.lineHeight, marginTop: spacing[1], marginBottom: spacing[5] },
    card: { backgroundColor: c.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: c.cardBorder, paddingHorizontal: spacing[4], paddingVertical: spacing[1], marginBottom: spacing[4] },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: c.cardBorder, minHeight: minTarget, gap: spacing[3] },
    name: { flex: 1, color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: t.bodyStrong.fontWeight },
    count: { color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: '700', fontVariant: ['tabular-nums'] },
    meta: { color: c.textSecondary, fontSize: t.caption.fontSize, marginTop: rem(0.125), textAlign: 'right' },
    unused: { color: c.textSecondary, fontSize: t.secondary.fontSize, fontStyle: 'italic' },
    sectionTitle: { color: c.textPrimary, fontSize: t.h3.fontSize, fontWeight: t.h3.fontWeight, marginTop: spacing[4], marginBottom: spacing[3] },
    clear: { minHeight: minTarget, borderRadius: rem(0.875), borderWidth: 1, borderColor: c.danger, alignItems: 'center', justifyContent: 'center', marginTop: spacing[2] },
    clearLabel: { color: c.danger, fontSize: t.bodyStrong.fontSize, fontWeight: t.bodyStrong.fontWeight },
  }), [c, t]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <BackLink label="Settings" onPress={() => router.back()} />
      <Text style={styles.heading} accessibilityRole="header">Usage on this device</Text>
      <Text style={styles.note}>
        Counts stay on this phone and are never sent anywhere. Most used is at the top. Not used yet means no visits or taps are logged.
      </Text>

      <View style={styles.card}>
        {rows.map(({ key, label, entry }) => (
          <View key={key} style={styles.row} accessible
            accessibilityLabel={entry ? `${label}: ${entry.count} times, last ${new Date(entry.last).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : `${label}: not used yet`}>
            <Text style={styles.name}>{label}</Text>
            {entry ? (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.count}>{entry.count}</Text>
                <Text style={styles.meta}>last {new Date(entry.last).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
              </View>
            ) : (
              <Text style={styles.unused}>Not used yet</Text>
            )}
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle} accessibilityRole="header">Save history</Text>
      <View style={styles.card}>
        {saves.length === 0 ? (
          <View style={styles.row}><Text style={styles.unused}>No saves logged yet.</Text></View>
        ) : saves.map((s, i) => (
          <View key={`${s.at}-${i}`} style={styles.row} accessible
            accessibilityLabel={`${new Date(s.at).toLocaleString('en-US')}: saved from ${s.from}${s.detail ? `, ${s.detail}` : ''}`}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{s.from}{s.detail ? ` · ${s.detail}` : ''}</Text>
            </View>
            <Text style={styles.meta}>{new Date(s.at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</Text>
          </View>
        ))}
      </View>

      <Pressable style={styles.clear} onPress={reset} accessibilityRole="button" accessibilityLabel="Clear usage log">
        <Text style={styles.clearLabel}>Clear usage log</Text>
      </Pressable>
    </ScrollView>
  );
}

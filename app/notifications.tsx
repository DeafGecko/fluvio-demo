import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  BanknotesIcon, BellAlertIcon, ChevronRightIcon, ExclamationTriangleIcon, InformationCircleIcon,
} from 'react-native-heroicons/outline';
import { BackLink } from '../components/settings-ui';
import { minTarget, radius, screenInset, spacing } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';
import { loadReadIds, markNotificationRead } from '../lib/notifications';

// Demo notifications. All names and amounts are fictional.
// Each item opens the screen where you can act on it.
type Item = {
  id: string;
  kind: 'warning' | 'pay' | 'info';
  title: string;
  body: string;
  when: string;
  target: Href;      // route to open when tapped
  action: string;      // what the row leads to
};

const ITEMS: Item[] = [
  { id: 'fraud', kind: 'warning', title: 'Unusual charge check (demo)', body: 'A fictional alert. Review recent purchases.', when: 'Today', target: '/activity', action: 'Review in Activity' },
  { id: 'cc', kind: 'warning', title: 'Credit card not yet synced (demo)', body: 'Credit card ····1187 needs a connection check.', when: 'Today', target: '/account-settings', action: 'Fix in Account settings' },
  { id: 'bill', kind: 'info', title: 'Bill due soon (demo)', body: 'Northline Electric · $84.20 due in 3 days.', when: 'Today', target: '/activity', action: 'See bill in Activity' },
  { id: 'pay', kind: 'pay', title: 'Paycheck received (demo)', body: 'Harborline Payroll · +$1,625.00 posted.', when: 'Yesterday', target: '/statement', action: 'See in history' },
  { id: 'sub', kind: 'info', title: 'Subscription renewed (demo)', body: 'StreamPlus · $15.49 charged.', when: 'Nov 14', target: '/activity', action: 'See in Activity' },
  { id: 'fee', kind: 'warning', title: 'Bank fee posted (demo)', body: 'Monthly account fee · $12.00.', when: 'Nov 12', target: '/statement', action: 'See in history' },
];

const DAYS = ['Today', 'Yesterday', 'Nov 14', 'Nov 12'] as const;

// Setup help: what sends notifications and where to set them up or fix them.
const HOW: { text: string; target: Href; action: string }[] = [
  { text: 'Turn on Notifications in Settings. The bell appears on Home when it is on.', target: '/settings', action: 'Open Settings' },
  { text: 'Accounts must be connected to send balance and bill alerts. Fix a card that is not yet synced.', target: '/account-settings', action: 'Open Account settings' },
  { text: 'Add a demo account to see more alerts, such as paychecks and fees.', target: '/add-account', action: 'Add demo account' },
];

export default function Notifications() {
  const router = useRouter();
  const { c, t } = useTheme();
  const [readIds, setReadIds] = useState<string[]>([]);

  useFocusEffect(useCallback(() => {
    loadReadIds().then(setReadIds);
  }, []));

  // Opening a notification marks it read. It stays in the list, dimmed.
  const open = async (item: Item) => {
    await markNotificationRead(item.id);
    setReadIds(await loadReadIds());
    router.push(item.target);
  };

  const styles = useMemo(() => StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.canvas },
    content: { paddingHorizontal: screenInset, paddingTop: spacing[16], paddingBottom: spacing[12] },
    heading: { color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: t.h1.fontWeight, lineHeight: t.h1.lineHeight, marginTop: spacing[2], marginBottom: spacing[4] },
    group: { color: c.textSecondary, fontSize: t.caption.fontSize, fontWeight: '600', letterSpacing: 0.6, marginTop: spacing[4], marginBottom: spacing[2], textTransform: 'uppercase' },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], backgroundColor: c.surface, borderWidth: 1, borderColor: c.cardBorder, borderRadius: radius.md, padding: spacing[4], marginBottom: spacing[2], minHeight: minTarget },
    badge: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    info: { flex: 1 },
    title: { color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: t.bodyStrong.fontWeight },
    body: { color: c.textSecondary, fontSize: t.secondary.fontSize, lineHeight: t.secondary.lineHeight, marginTop: 2 },
    action: { color: c.accent, fontSize: t.caption.fontSize, fontWeight: '600', marginTop: spacing[1] },
    help: { backgroundColor: c.accentSoft, borderRadius: radius.lg, padding: spacing[4], marginTop: spacing[6] },
    helpTitle: { color: c.textPrimary, fontSize: t.h3.fontSize, fontWeight: t.h3.fontWeight, marginBottom: spacing[2] },
    helpRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], minHeight: minTarget, paddingVertical: spacing[1] },
    helpText: { flex: 1, color: c.textPrimary, fontSize: t.secondary.fontSize, lineHeight: t.secondary.lineHeight },
    helpAction: { color: c.accent, fontSize: t.caption.fontSize, fontWeight: '600' },
    pressed: { opacity: 0.7 },
  }), [c, t]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <BackLink label="Home" onPress={() => router.back()} />
      <Text style={styles.heading} accessibilityRole="header">Notifications</Text>

      {DAYS.map((day) => {
        const items = ITEMS.filter((i) => i.when === day);
        if (items.length === 0) return null;
        return (
          <View key={day}>
            <Text style={styles.group}>{day}</Text>
            {items.map((item) => {
              const Icon = item.kind === 'warning' ? ExclamationTriangleIcon : item.kind === 'pay' ? BanknotesIcon : BellAlertIcon;
              const tint = item.kind === 'warning' ? c.warning : item.kind === 'pay' ? c.success : c.accent;
              return (
                <Pressable key={item.id}
                  style={({ pressed }) => [styles.row, readIds.includes(item.id) && { opacity: 0.45 }, pressed && styles.pressed]}
                  onPress={() => open(item)} accessibilityRole="button"
                  accessibilityHint={`${item.body}. ${item.when}. ${item.action}.`}>
                  <View style={[styles.badge, { backgroundColor: c.accentSoft }]}>
                    <Icon size={20} color={tint} />
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.body}>{item.body}</Text>
                    <Text style={styles.action}>{item.action}</Text>
                  </View>
                  <ChevronRightIcon size={20} color={c.textTertiary} />
                </Pressable>
              );
            })}
          </View>
        );
      })}

      <View style={styles.help}>
        <Text style={styles.helpTitle} accessibilityRole="header">How notifications work</Text>
        {HOW.map((h) => (
          <Pressable key={h.action} style={({ pressed }) => [styles.helpRow, pressed && styles.pressed]}
            onPress={() => router.push(h.target)} accessibilityRole="button" accessibilityHint={h.action}>
            <InformationCircleIcon size={20} color={c.accent} />
            <Text style={styles.helpText}>{h.text}</Text>
            <Text style={styles.helpAction}>{h.action}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

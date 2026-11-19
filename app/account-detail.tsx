import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BackLink } from '../components/settings-ui';
import { screenInset, spacing } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';
import { DemoAccount, loadDemoAccounts, loadSyncedIds, markAccountSynced } from '../lib/accounts';
import { formatUSD } from '../lib/expenses';

// One account's own screen (Figma 30 Checking, 31 Savings, 32 Credit card).
export default function AccountDetail() {
  const router = useRouter();
  const { c, t } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [account, setAccount] = useState<DemoAccount | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  useFocusEffect(useCallback(() => {
    loadDemoAccounts().then((list) => setAccount(list.find((a) => a.id === id) ?? null));
    loadSyncedIds().then((ids) => setSynced(!!id && ids.includes(id)));
  }, [id]));

  // Retry sync, then remember the result so Accounts shows it too.
  const retrySync = () => {
    setSyncing(true);
    setTimeout(async () => {
      if (id) await markAccountSynced(id);
      setSyncing(false);
      setSynced(true);
    }, 1500);
  };

  const styles = useMemo(() => StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.canvas },
    content: { paddingHorizontal: screenInset, paddingTop: spacing[16], paddingBottom: spacing[12] },
    heading: { color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: t.h1.fontWeight, lineHeight: t.h1.lineHeight, marginTop: spacing[2] },
    sub: { color: c.textSecondary, fontSize: t.secondary.fontSize, marginTop: spacing[1] },
    card: { backgroundColor: c.surface, borderRadius: 18, padding: spacing[4], marginTop: spacing[4], gap: spacing[2] },
    label: { color: c.textSecondary, fontSize: t.caption.fontSize, fontWeight: '600' },
    value: { color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: '600', fontVariant: ['tabular-nums'] },
    big: { color: c.textPrimary, fontSize: t.h2.fontSize, fontWeight: '700', fontVariant: ['tabular-nums'] },
    ok: { color: c.success, fontSize: t.secondary.fontSize, fontWeight: '600' },
    warn: { color: c.warning, fontSize: t.secondary.fontSize, fontWeight: '600' },
    button: {
      minHeight: 52, borderRadius: 14, borderWidth: 1, borderColor: c.cardBorder, backgroundColor: c.surface,
      alignItems: 'center', justifyContent: 'center', marginTop: spacing[3],
    },
    primary: { backgroundColor: c.accent, borderColor: c.accent },
    buttonLabel: { color: c.textPrimary, fontSize: 17, fontWeight: '600' },
    primaryLabel: { color: c.onAccent },
    pressed: { opacity: 0.85 },
    note: { color: c.textSecondary, fontSize: t.caption.fontSize, lineHeight: t.caption.lineHeight, marginTop: spacing[3] },
  }), [c, t]);

  if (!account) {
    return (
      <View style={styles.screen}>
        <View style={{ padding: screenInset, paddingTop: spacing[16] }}>
          <BackLink label="Accounts" onPress={() => (router.canGoBack() ? router.back() : router.replace('/accounts'))} />
          <Text style={styles.sub}>This account could not be found.</Text>
        </View>
      </View>
    );
  }

  const isCredit = account.kind === 'credit';
  const connected = isCredit ? synced : true;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <BackLink label="Accounts" onPress={() => (router.canGoBack() ? router.back() : router.replace('/accounts'))} />
      <Text style={styles.heading} accessibilityRole="header">{account.name} ····{account.mask}</Text>
      <Text style={styles.sub}>{account.institution} · Demo account</Text>

      <View style={styles.card} accessible accessibilityLabel={
        isCredit
          ? `You owe ${formatUSD(account.owed ?? 0)}. ${connected ? 'Updated' : 'Not updated yet'}.`
          : `Available ${formatUSD(account.available ?? 0)}. Current ${formatUSD(account.current ?? 0)}.`}>
        {isCredit ? (
          <>
            <Text style={styles.label}>You owe</Text>
            <Text style={styles.big}>{formatUSD(account.owed ?? 0)}</Text>
            <Text style={styles.note}>Credit card debt. It is not part of your cash total.</Text>
          </>
        ) : (
          <>
            <Text style={styles.label}>Available</Text>
            <Text style={styles.big}>{formatUSD(account.available ?? 0)}</Text>
            <Text style={styles.label}>Current</Text>
            <Text style={styles.value}>{formatUSD(account.current ?? 0)}</Text>
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Connection</Text>
        {connected ? (
          <Text style={styles.ok}>Updated 2 min ago</Text>
        ) : (
          <Text style={styles.warn}>Not updated yet</Text>
        )}
        {isCredit && !connected && (
          <>
            {syncing && <ActivityIndicator color={c.accent} style={{ marginTop: spacing[2] }} />}
            <Pressable onPress={retrySync} disabled={syncing} accessibilityRole="button" accessibilityLabel="Retry sync"
              style={({ pressed }) => [styles.button, styles.primary, (pressed || syncing) && styles.pressed]}>
              <Text style={[styles.buttonLabel, styles.primaryLabel]}>{syncing ? 'Syncing…' : 'Retry sync'}</Text>
            </Pressable>
          </>
        )}
      </View>

      <Pressable onPress={() => router.push('/activity')} accessibilityRole="button" accessibilityLabel="View all activity"
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.buttonLabel}>View all activity</Text>
      </Pressable>

      {!isCredit && (
        <Pressable onPress={() => router.push('/withdraw')} accessibilityRole="button" accessibilityLabel="Take out cash from this account"
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Text style={styles.buttonLabel}>Take out cash</Text>
        </Pressable>
      )}

      <Pressable onPress={() => router.push('/account-settings')} accessibilityRole="button" accessibilityLabel="Account settings"
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.buttonLabel}>Account settings</Text>
      </Pressable>
    </ScrollView>
  );
}

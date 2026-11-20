import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BuildingLibraryIcon, PencilSquareIcon, ShieldCheckIcon, TrashIcon } from 'react-native-heroicons/outline';
import { BackLink, SettingsGroup, SettingsRow } from '../components/settings-ui';
import { SavedPopout } from '../components/saved-popout';
import { radius, screenInset, spacing, font } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';
import {
  DemoAccount, loadDemoAccounts, removeDemoAccount, renameDemoAccount, setDemoShowOnHome,
} from '../lib/accounts';

// Figma: 34 Account Settings. Each demo account: rename, show on Home, connection health, remove.
export default function AccountSettings() {
  const router = useRouter();
  const { c, t } = useTheme();
  const [accounts, setAccounts] = useState<DemoAccount[]>([]);
  const [savedOpen, setSavedOpen] = useState(false);
  const flashSaved = () => { setSavedOpen(true); setTimeout(() => setSavedOpen(false), 1200); };

  useFocusEffect(useCallback(() => {
    loadDemoAccounts().then(setAccounts);
  }, []));

  const refresh = async () => setAccounts(await loadDemoAccounts());

  const rename = (a: DemoAccount) => {
    const apply = async (value?: string) => {
      const name = (value ?? '').trim();
      if (!name) return;
      await renameDemoAccount(a.id, name.slice(0, 30));
      refresh();
      flashSaved();
    };
    if (Platform.OS !== 'android') {
      Alert.prompt('Rename account', 'Demo name only.', apply, 'plain-text', a.name);
    } else {
      Alert.alert('Rename account', 'Renaming is available on iPhone in this demo.');
    }
  };

  const toggleHome = async (a: DemoAccount) => {
    await setDemoShowOnHome(a.id, !(a.showOnHome ?? true));
    refresh();
    flashSaved();
  };

  const remove = (a: DemoAccount) => {
    Alert.alert('Remove demo account', `Remove ${a.name} ····${a.mask}? Fictional data only.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => { await removeDemoAccount(a.id); refresh(); } },
    ]);
  };

  const styles = useMemo(() => StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.canvas },
    content: { paddingHorizontal: screenInset, paddingTop: spacing[16], paddingBottom: spacing[12] },
    heading: { color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: t.h1.fontWeight, lineHeight: t.h1.lineHeight, marginTop: spacing[2], marginBottom: spacing[2] },
    sub: { color: c.textSecondary, fontSize: t.secondary.fontSize, marginBottom: spacing[4] },
    group: { color: c.textSecondary, fontSize: t.caption.fontSize, fontWeight: '600', letterSpacing: font(0.0375), marginTop: spacing[2], marginBottom: spacing[2], textTransform: 'uppercase' },
    note: { backgroundColor: c.accentSoft, borderRadius: radius.lg, padding: spacing[4], marginTop: spacing[2] },
    noteText: { color: c.textPrimary, fontSize: t.secondary.fontSize, lineHeight: t.secondary.lineHeight },
  }), [c, t]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <SavedPopout visible={savedOpen} message="Saved" />
      <BackLink label="Profile" onPress={() => router.back()} />
      <Text style={styles.heading} accessibilityRole="header">Account settings</Text>
      <Text style={styles.sub}>Demo accounts only.</Text>

      {accounts.length === 0 ? (
        <Text style={styles.sub}>No demo accounts. Add one from Accounts.</Text>
      ) : (
        accounts.map((a) => {
          const onHome = a.showOnHome ?? true;
          return (
            <View key={a.id}>
              <Text style={styles.group} accessibilityRole="header">{a.institution}</Text>
              <SettingsGroup>
                <SettingsRow Icon={PencilSquareIcon} title="Rename account" subtitle={`${a.name} ····${a.mask}`}
                  onPress={() => rename(a)} />
                <SettingsRow Icon={BuildingLibraryIcon} title="Show on Home" subtitle="Included in total cash"
                  value={onHome ? 'On' : 'Off'} onPress={() => toggleHome(a)} />
                <SettingsRow Icon={ShieldCheckIcon} title="Account status"
                  subtitle={a.kind === 'cash' ? 'Updated 2 min ago' : 'Not updated yet'} />
                <SettingsRow Icon={TrashIcon} title="Remove demo account" subtitle="Removes fictional data only"
                  onPress={() => remove(a)} destructive last />
              </SettingsGroup>
            </View>
          );
        })
      )}

      <View style={styles.note}>
        <Text style={styles.noteText}>Removing a demo account changes only the fictional data in this app.</Text>
      </View>
    </ScrollView>
  );
}

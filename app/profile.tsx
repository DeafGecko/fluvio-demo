import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  ArrowRightStartOnRectangleIcon, PencilSquareIcon, ShieldCheckIcon, TrashIcon, AdjustmentsHorizontalIcon,
} from 'react-native-heroicons/outline';
import { Avatar } from '../components/avatar';
import { BackLink, SettingsGroup, SettingsRow } from '../components/settings-ui';
import { SavedPopout } from '../components/saved-popout';
import { radius, screenInset, spacing, rem, font } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';
import { readAllExpenses, saveExpenses } from '../lib/expenses';

// Opened from the avatar on Home. Profile header, Settings, Accounts, data on this device, and sign out.
export default function Profile() {
  const router = useRouter();
  const { c, t, scheme } = useTheme();
  // Dark mode centers the avatar and name above the lists, as in the Figma dark frame.
  const centered = scheme === 'dark';
  const [name, setName] = useState('');
  const [expenseCount, setExpenseCount] = useState(0);
  const [savedOpen, setSavedOpen] = useState(false);
  const flashSaved = () => { setSavedOpen(true); setTimeout(() => setSavedOpen(false), 1200); };

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem('user_name').then((n) => setName(n ?? ''));
    AsyncStorage.getItem('expenses').then((d) => setExpenseCount(d ? JSON.parse(d).length : 0));
  }, []));

  const signOut = () => {
    Alert.alert('Sign out', 'You will need to sign in again. Your purchases stay on this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out', style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('onboarded');
          router.replace('/splash');
        },
      },
    ]);
  };

  // Change the name shown on Profile and in the Home greeting. Demo only.
  const editName = () => {
    const save = async (value?: string) => {
      const next = (value ?? '').trim().slice(0, 40);
      if (!next) return;
      await AsyncStorage.setItem('user_name', next);
      setName(next);
      flashSaved();
    };
    if (Platform.OS !== 'android') {
      Alert.prompt('Your name', 'Shown on Profile and Home. Pretend name only.', save, 'plain-text', name);
    } else {
      Alert.alert('Your name', 'Changing your name is available on iPhone in this demo.');
    }
  };

  const clearPurchases = () => {
    Alert.alert('Clear all purchases', 'Delete every purchase on this device? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        // Keeps everything in history (marked deleted), not erased for good.
        onPress: async () => {
          const all = await readAllExpenses();
          const now = new Date().toISOString();
          await saveExpenses(all.map((e) => (e.deletedAt ? e : { ...e, deletedAt: now })));
          setExpenseCount(0);
        },
      },
    ]);
  };

  const resetApp = () => {
    Alert.alert('Reset app', 'Clear everything and start again?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset', style: 'destructive',
        onPress: async () => { await AsyncStorage.clear(); router.replace('/splash'); },
      },
    ]);
  };

  const styles = useMemo(() => StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.canvas },
    content: { paddingHorizontal: screenInset, paddingTop: spacing[16], paddingBottom: spacing[12] },
    heading: { color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: t.h1.fontWeight, lineHeight: t.h1.lineHeight, marginTop: spacing[2], marginBottom: spacing[4] },
    profile: { flexDirection: centered ? 'column' : 'row', alignItems: 'center', gap: spacing[4], marginBottom: spacing[6] },
    avatar: { width: rem(3.5), height: rem(3.5), borderRadius: rem(1.75), backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' },
    avatarLetter: { color: c.accent, fontSize: font(1.25), fontWeight: '600' },
    profileName: { color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: t.bodyStrong.fontWeight, textAlign: centered ? 'center' : 'left' },
    profileSub: { color: c.textSecondary, fontSize: t.secondary.fontSize, marginTop: rem(0.125), textAlign: centered ? 'center' : 'left' },
    groupLabel: { color: c.textSecondary, fontSize: t.caption.fontSize, fontWeight: '600', letterSpacing: font(0.0375), marginTop: spacing[2], marginBottom: spacing[2], textTransform: 'uppercase' },
    signOut: {
      minHeight: rem(3), borderRadius: radius.md, borderWidth: 1, borderColor: c.cardBorder, backgroundColor: c.surface,
      alignItems: 'center', justifyContent: 'center', marginTop: spacing[2],
    },
    signOutLabel: { color: c.textPrimary, fontSize: font(1), fontWeight: '500' },
    pressed: { opacity: 0.8 },
  }), [c, t, centered]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <SavedPopout visible={savedOpen} message="Name saved" />
      <BackLink label="Home" onPress={() => router.back()} />
      <Text style={styles.heading} accessibilityRole="header">Profile</Text>

      <View style={styles.profile}>
        <Avatar size={rem(3.5)} label="Profile photo. Tap to change in Settings" onPress={() => router.push('/settings')} />
        <Pressable onPress={editName} accessibilityRole="button" accessibilityHint="Name, tap to change"
          style={{ flex: 1, minHeight: rem(2.75), justifyContent: 'center' }}>
          <Text style={styles.profileName}>{name || 'Fluvio'}</Text>
          <Text style={styles.profileSub}>Tap to change your name</Text>
          <Text style={styles.profileSub}>demo@fluvio.test (pretend)</Text>
        </Pressable>
      </View>

      <Text style={styles.groupLabel}>Preferences</Text>
      <SettingsGroup>
        <SettingsRow Icon={AdjustmentsHorizontalIcon} title="Settings" subtitle="Appearance, notifications, privacy, help"
          onPress={() => router.push('/settings')} />
        <SettingsRow Icon={PencilSquareIcon} title="Account settings" subtitle="Demo accounts"
          onPress={() => router.push('/account-settings')} last />
      </SettingsGroup>

      <Text style={styles.groupLabel}>Data on this device</Text>
      <SettingsGroup>
        <SettingsRow Icon={ShieldCheckIcon} title="Purchases saved" subtitle={`${expenseCount} on this device`} />
        <SettingsRow Icon={TrashIcon} title="Clear all purchases" subtitle="Permanently delete purchase data"
          onPress={clearPurchases} destructive />
        <SettingsRow Icon={ArrowRightStartOnRectangleIcon} title="Reset app" subtitle="Clear everything and start again"
          onPress={resetApp} destructive last />
      </SettingsGroup>

      <Pressable style={({ pressed }) => [styles.signOut, pressed && styles.pressed]} onPress={signOut}
        accessibilityRole="button" accessibilityLabel="Sign out">
        <Text style={styles.signOutLabel}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

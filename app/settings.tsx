import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import {
  ArrowPathIcon, BellIcon, EyeIcon, InformationCircleIcon, MoonIcon, ShieldCheckIcon, UserIcon,
} from 'react-native-heroicons/outline';
import { BackLink, SettingsGroup, SettingsRow } from '../components/settings-ui';
import { pickAvatar, removeAvatar } from '../lib/avatar';
import { screenInset, spacing } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';
import { loadDemoAccounts, seedDemoAccounts } from '../lib/accounts';
import { seedDemoData } from '../lib/demo-data';
import { setPref, usePrefs } from '../lib/prefs';

// Figma: 19 Settings. Preferences rows and demo reset. Reached from Profile.
export default function Settings() {
  const router = useRouter();
  const { c, t } = useTheme();

  const demoReset = () => {
    Alert.alert('Reset demo', 'Restore the sample purchases and statement. Accounts you added stay.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset', style: 'destructive',
        onPress: async () => {
          // Keep accounts the user added. Only create the starting accounts if there are none.
          if ((await loadDemoAccounts()).length === 0) await seedDemoAccounts();
          await seedDemoData();
        },
      },
    ]);
  };

  const prefs = usePrefs();

  const APPEARANCE_LABEL = { system: 'System', light: 'Light', dark: 'Dark' } as const;

  const chooseAppearance = () => {
    Alert.alert('Appearance', 'Choose how Fluvio looks.', [
      { text: 'System', onPress: () => setPref('appearance', 'system') },
      { text: 'Light', onPress: () => setPref('appearance', 'light') },
      { text: 'Dark', onPress: () => setPref('appearance', 'dark') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const LAYOUT_LABEL = { auto: 'Auto', phone: 'Mobile', tablet: 'Tablet' } as const;
  const chooseLayout = () => {
    Alert.alert('Screen layout', 'Choose how wide the app shows its content.', [
      { text: 'Auto', onPress: () => setPref('layout', 'auto') },
      { text: 'Mobile', onPress: () => setPref('layout', 'phone') },
      { text: 'Tablet', onPress: () => setPref('layout', 'tablet') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const toggleNotifications = () => setPref('notifications', !prefs.notifications);

  const privacyInfo = () =>
    Alert.alert('Privacy & data', 'Everything in this app is fictional. Your demo data stays on this device. No bank is contacted.');

  const aboutInfo = () =>
    Alert.alert('About Fluvio', 'Fluvio is a portfolio demo, not a bank. It does not give financial advice.');

  const styles = useMemo(() => StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.canvas },
    content: { paddingHorizontal: screenInset, paddingTop: spacing[16], paddingBottom: spacing[12] },
    heading: { color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: t.h1.fontWeight, lineHeight: t.h1.lineHeight, marginTop: spacing[2], marginBottom: spacing[4] },
  }), [c, t]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <BackLink label="Profile" onPress={() => router.back()} />
      <Text style={styles.heading} accessibilityRole="header">Settings</Text>

      <SettingsGroup>
        <SettingsRow Icon={UserIcon} title="Profile photo" subtitle="Upload a photo or remove it"
          onPress={() => Alert.alert('Profile photo', 'Choose what to do with your photo.', [
            { text: 'Upload photo', onPress: () => { pickAvatar().catch(() => Alert.alert('Could not open photos', 'Allow photo access in Settings and try again.')); } },
            { text: 'Remove photo', style: 'destructive', onPress: () => { removeAvatar(); } },
            { text: 'Cancel', style: 'cancel' },
          ])} />
        <SettingsRow Icon={MoonIcon} title="Appearance" subtitle="Light, dark, or match the system"
          value={APPEARANCE_LABEL[prefs.appearance]} onPress={chooseAppearance} />
        <SettingsRow Icon={EyeIcon} title="Larger text" subtitle="Bigger words and more space"
          value={prefs.largerText ? 'On' : 'Off'} onPress={() => setPref('largerText', !prefs.largerText)} />
        <SettingsRow Icon={BellIcon} title="Notifications" subtitle="Demo alerts on this device"
          value={prefs.notifications ? 'On' : 'Off'} onPress={toggleNotifications} />
        <SettingsRow Icon={ShieldCheckIcon} title="Privacy & data" subtitle="Everything is fictional and stays on this device"
          onPress={privacyInfo} />
        <SettingsRow Icon={MoonIcon} title="Screen layout" subtitle="Mobile or tablet width"
          value={LAYOUT_LABEL[prefs.layout]} onPress={chooseLayout} />
        <SettingsRow Icon={ArrowPathIcon} title="Show offline message" subtitle="Shows the offline message on Home"
          value={prefs.pretendOffline ? 'On' : 'Off'} onPress={() => setPref('pretendOffline', !prefs.pretendOffline)} />
        <SettingsRow Icon={ArrowPathIcon} title="Reset demo" subtitle="Restore fictional data" onPress={demoReset} />
        <SettingsRow Icon={InformationCircleIcon} title="About Fluvio" subtitle="Demo app, not a bank" onPress={aboutInfo} last />
      </SettingsGroup>
    </ScrollView>
  );
}

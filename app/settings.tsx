import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import {
  ArrowPathIcon, BellIcon, ChartBarIcon, DevicePhoneMobileIcon, InformationCircleIcon, MoonIcon, ShieldCheckIcon, UserIcon,
} from 'react-native-heroicons/outline';
import { BackLink, SettingsGroup, SettingsRow } from '../components/settings-ui';
import { SavedPopout } from '../components/saved-popout';
import { pickAvatar, removeAvatar } from '../lib/avatar';
import { screenInset, spacing } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';
import { loadDemoAccounts, seedDemoAccounts } from '../lib/accounts';
import { seedDemoData } from '../lib/demo-data';
import { setPref, usePrefs } from '../lib/prefs';
import { showChoiceAlert } from '../lib/web-alert';

// Figma: 19 Settings. Preferences rows and demo reset. Reached from Profile.
export default function Settings() {
  const router = useRouter();
  const { c, t } = useTheme();

  // Every change shows the "Saved" toast in the top right corner.
  const [savedOpen, setSavedOpen] = useState(false);
  const [savedMessage, setSavedMessage] = useState('Saved');
  const flashSaved = (message = 'Saved') => {
    setSavedMessage(message);
    setSavedOpen(true);
    setTimeout(() => setSavedOpen(false), 1200);
  };

  const demoReset = () => {
    Alert.alert('Reset demo', 'Restore the sample purchases and statement. Accounts you added stay.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset', style: 'destructive',
        onPress: async () => {
          // Keep accounts the user added. Only create the starting accounts if there are none.
          if ((await loadDemoAccounts()).length === 0) await seedDemoAccounts();
          await seedDemoData();
          flashSaved('Demo reset');
        },
      },
    ]);
  };

  const prefs = usePrefs();

  // Follows the phone unless the user picks Light or Dark for this app only.
  const APPEARANCE_LABEL = { system: 'System', light: 'Light', dark: 'Dark' } as const;
  const chooseAppearance = () => {
    showChoiceAlert('Appearance', 'Choose how Fluvio looks. System follows your phone.', [
      { text: 'System', selected: prefs.appearance === 'system', onPress: () => { setPref('appearance', 'system'); flashSaved(); } },
      { text: 'Light', selected: prefs.appearance === 'light', onPress: () => { setPref('appearance', 'light'); flashSaved(); } },
      { text: 'Dark', selected: prefs.appearance === 'dark', onPress: () => { setPref('appearance', 'dark'); flashSaved(); } },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const LAYOUT_LABEL = { auto: 'Auto', phone: 'Mobile', tablet: 'Tablet' } as const;
  const chooseLayout = () => {
    showChoiceAlert('Screen layout', 'Choose how wide the app shows its content.', [
      { text: 'Auto', selected: prefs.layout === 'auto', onPress: () => { setPref('layout', 'auto'); flashSaved(); } },
      { text: 'Mobile', selected: prefs.layout === 'phone', onPress: () => { setPref('layout', 'phone'); flashSaved(); } },
      { text: 'Tablet', selected: prefs.layout === 'tablet', onPress: () => { setPref('layout', 'tablet'); flashSaved(); } },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const toggleNotifications = () => { setPref('notifications', !prefs.notifications); flashSaved(); };

  const toggleOfflineMessage = () => { setPref('pretendOffline', !prefs.pretendOffline); flashSaved(); };

  const privacyInfo = () =>
    Alert.alert('Privacy & data', 'Everything in this app is fictional. Your demo data stays on this device. No bank is contacted.');

  const aboutInfo = () =>
    Alert.alert('About Fluvio', 'Fluvio is a portfolio demo, not a bank. It does not give financial advice.');

  const styles = useMemo(() => StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.canvas },
    content: { paddingHorizontal: screenInset, paddingTop: spacing[16], paddingBottom: spacing[12] },
    heading: { color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: t.h1.fontWeight, lineHeight: t.h1.lineHeight, marginTop: spacing[2], marginBottom: spacing[4] },
    sectionLabel: { color: c.textSecondary, fontSize: t.caption.fontSize, lineHeight: t.caption.lineHeight, fontWeight: '600', marginBottom: spacing[2], marginLeft: spacing[1] },
  }), [c, t]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <SavedPopout visible={savedOpen} message={savedMessage} />
      <BackLink label="Profile" onPress={() => router.replace('/')} />
      <Text style={styles.heading} accessibilityRole="header">Settings</Text>

      <Text style={styles.sectionLabel} accessibilityRole="header">Profile</Text>
      <SettingsGroup>
        <SettingsRow Icon={UserIcon} title="Profile photo" subtitle="Upload a photo or remove it" last
          onPress={() => Alert.alert('Profile photo', 'Choose what to do with your photo.', [
            {
              text: 'Upload photo',
              onPress: () => {
                pickAvatar()
                  .then((saved) => { if (saved) flashSaved('Photo saved'); })
                  .catch(() => Alert.alert('Could not open photos', 'Allow photo access in Settings and try again.'));
              },
            },
            { text: 'Remove photo', style: 'destructive', onPress: () => { removeAvatar(); flashSaved('Photo removed'); } },
            { text: 'Cancel', style: 'cancel' },
          ])} />
      </SettingsGroup>

      <Text style={styles.sectionLabel} accessibilityRole="header">Preferences</Text>
      <SettingsGroup>
        <SettingsRow Icon={BellIcon} title="Notifications" subtitle="Demo alerts on this device"
          value={prefs.notifications ? 'On' : 'Off'} onPress={toggleNotifications} />
        <SettingsRow Icon={MoonIcon} title="Appearance" subtitle="Light, dark, or match the phone"
          value={APPEARANCE_LABEL[prefs.appearance]} onPress={chooseAppearance} />
        <SettingsRow Icon={DevicePhoneMobileIcon} title="Screen layout" subtitle="Mobile or tablet width"
          value={LAYOUT_LABEL[prefs.layout]} onPress={chooseLayout} last />
      </SettingsGroup>

      <Text style={styles.sectionLabel} accessibilityRole="header">Privacy</Text>
      <SettingsGroup>
        <SettingsRow Icon={ShieldCheckIcon} title="Privacy & data" subtitle="Everything is fictional and stays on this device"
          onPress={privacyInfo} last />
      </SettingsGroup>

      <Text style={styles.sectionLabel} accessibilityRole="header">Demo</Text>
      <SettingsGroup>
        <SettingsRow Icon={ArrowPathIcon} title="Show offline message" subtitle="Shows the offline message on Home"
          value={prefs.pretendOffline ? 'On' : 'Off'} onPress={toggleOfflineMessage} />
        <SettingsRow Icon={ChartBarIcon} title="Usage on this device" subtitle="Which screens and buttons are used"
          onPress={() => router.push('/usage')} />
        <SettingsRow Icon={ArrowPathIcon} title="Reset demo" subtitle="Restore fictional data" onPress={demoReset} />
        <SettingsRow Icon={InformationCircleIcon} title="About Fluvio" subtitle="Demo app, not a bank" onPress={aboutInfo} last />
      </SettingsGroup>
    </ScrollView>
  );
}

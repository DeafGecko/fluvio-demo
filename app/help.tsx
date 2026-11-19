import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChatBubbleLeftIcon, InformationCircleIcon, ShieldCheckIcon } from 'react-native-heroicons/outline';
import { BackLink, SettingsGroup, SettingsRow } from '../components/settings-ui';
import { radius, screenInset, spacing } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';

// Figma: 40 Help & Support. Demo only; nothing is sent anywhere.
export default function Help() {
  const router = useRouter();
  const { c, t } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.canvas },
    content: { paddingHorizontal: screenInset, paddingTop: spacing[16], paddingBottom: spacing[12] },
    heading: { color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: t.h1.fontWeight, lineHeight: t.h1.lineHeight, marginTop: spacing[2], marginBottom: spacing[4] },
    note: { backgroundColor: c.accentSoft, borderRadius: radius.lg, padding: spacing[4], flexDirection: 'row', gap: spacing[3] },
    noteText: { flex: 1, color: c.textPrimary, fontSize: t.secondary.fontSize, lineHeight: t.secondary.lineHeight },
  }), [c, t]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <BackLink label="Settings" onPress={() => router.back()} />
      <Text style={styles.heading} accessibilityRole="header">Help & support</Text>

      <SettingsGroup>
        <SettingsRow Icon={InformationCircleIcon} title="How Fluvio works"
          subtitle="Plain-language guide to balances and transactions"
          onPress={() => Alert.alert('How Fluvio works', 'Fluvio is a demo. Balances and transactions are fictional.')} />
        <SettingsRow Icon={ShieldCheckIcon} title="Privacy & demo data" subtitle="Everything in this app is fictional"
          onPress={() => Alert.alert('Privacy & demo data', 'All data stays on this device and is fictional.')} />
        <SettingsRow Icon={ChatBubbleLeftIcon} title="Contact support" subtitle="Demo only. No messages are sent."
          onPress={() => Alert.alert('Demo only', 'No messages are sent from this demo.')} last />
      </SettingsGroup>

      <View style={styles.note}>
        <InformationCircleIcon size={20} color={c.textPrimary} />
        <Text style={styles.noteText}>Fluvio is a portfolio demo, not a bank. It does not give financial advice.</Text>
      </View>
    </ScrollView>
  );
}

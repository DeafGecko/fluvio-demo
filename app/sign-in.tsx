import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { minTarget, radius, screenInset, spacing, rem, font } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';
import { seedDemoAccounts } from '../lib/accounts';
import { seedDemoData } from '../lib/demo-data';

const DEMO_EMAIL = 'demo@fluvio.test';

// Figma: 03 Sign In (Demo). Fictional account only. Nothing connects to a bank.
// Face ID is not included yet; it needs a biometrics setup step.
export default function SignIn() {
  const router = useRouter();
  const { c, t } = useTheme();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [busy, setBusy] = useState(false);

  const canContinue = email.trim().length > 0 && !busy;

  const handleContinue = async () => {
    if (!canContinue) return;
    setBusy(true);
    const name = email.split('@')[0] || 'Demo';
    await AsyncStorage.setItem('user_name', name.charAt(0).toUpperCase() + name.slice(1));
    await seedDemoAccounts();
    await seedDemoData();
    await AsyncStorage.setItem('onboarded', 'true');
    router.replace('/');
  };

  const styles = useMemo(() => StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.canvas },
    content: { paddingHorizontal: screenInset, paddingTop: rem(4.5), paddingBottom: spacing[6], flexGrow: 1 },
    title: { color: c.textPrimary, fontSize: font(1.875), fontWeight: '700', lineHeight: font(2.375) },
    body: { color: c.textSecondary, fontSize: t.body.fontSize, lineHeight: t.body.lineHeight, marginTop: spacing[3] },
    label: { color: c.textPrimary, fontSize: t.secondary.fontSize, fontWeight: '600', marginTop: spacing[6], marginBottom: spacing[2] },
    input: {
      minHeight: minTarget + 4, backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.cardBorder,
      paddingHorizontal: spacing[4], color: c.textPrimary, fontSize: t.body.fontSize,
    },
    note: { color: c.textSecondary, fontSize: t.caption.fontSize, lineHeight: t.caption.lineHeight, marginTop: spacing[2] },
    spacer: { flex: 1, minHeight: spacing[10] },
    primary: {
      minHeight: rem(3.25), borderRadius: rem(0.875), backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center', marginTop: spacing[3],
    },
    primaryLabel: { color: c.onAccent, fontSize: font(1.0625), fontWeight: '600' },
    secondary: {
      minHeight: rem(3.25), borderRadius: rem(0.875), backgroundColor: c.surface, borderWidth: 1, borderColor: c.cardBorder,
      alignItems: 'center', justifyContent: 'center', marginTop: spacing[3],
    },
    secondaryLabel: { color: c.textPrimary, fontSize: font(1.0625), fontWeight: '600' },
    disabled: { opacity: 0.5 },
    pressed: { opacity: 0.85 },
  }), [c, t]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title} accessibilityRole="header">Start the demo</Text>
      <Text style={styles.body}>This is a pretend account. It does not connect to a bank.</Text>

      <Text style={styles.label}>Email (pretend)</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        accessibilityLabel="Email, pretend"
      />
      <Text style={styles.note}>A pretend account to try the app.</Text>

      <View style={styles.spacer} />

      <Pressable
        style={({ pressed }) => [styles.primary, (!canContinue || pressed) && styles.pressed, !canContinue && styles.disabled]}
        onPress={handleContinue}
        disabled={!canContinue}
        accessibilityRole="button"
        accessibilityLabel="Start demo"
        accessibilityState={{ disabled: !canContinue }}
      >
        <Text style={styles.primaryLabel}>{busy ? 'Starting…' : 'Start demo'}</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
        onPress={() => router.replace('/splash')}
        accessibilityRole="button"
        accessibilityLabel="Back"
      >
        <Text style={styles.secondaryLabel}>Back</Text>
      </Pressable>
    </ScrollView>
  );
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { CheckCircleIcon } from 'react-native-heroicons/solid';
import { Card, FirstRunScreen, PrimaryButton, SecondaryButton } from '../components/first-run-ui';
import { spacing } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';
import { seedDemoAccounts } from '../lib/accounts';
import { seedDemoData } from '../lib/demo-data';

// Connected. Loads the demo accounts and demo history, then marks setup as done.
export default function ConnectionSuccess() {
  const router = useRouter();
  const { c, t } = useTheme();
  const { bank } = useLocalSearchParams<{ bank?: string }>();
  const [busy, setBusy] = useState(false);

  const finish = async (to: '/' | '/accounts') => {
    setBusy(true);
    await seedDemoAccounts();
    await seedDemoData();
    await AsyncStorage.setItem('onboarded', 'true');
    router.replace(to);
  };

  return (
    <FirstRunScreen>
      <View style={{ alignItems: 'center', marginTop: spacing[8] }}>
        <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: c.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircleIcon size={56} color={c.success} />
        </View>
      </View>
      <Text style={{ color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: '700', textAlign: 'center', marginTop: spacing[4] }}
        accessibilityRole="header">Connected</Text>
      <Text style={{ color: c.textSecondary, fontSize: t.body.fontSize, lineHeight: t.body.lineHeight, textAlign: 'center', marginTop: spacing[2] }}>
        {bank ?? 'Your pretend bank'} is connected. Here are your demo accounts.
      </Text>
      <Card>
        <Text style={{ color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: '600' }}>Checking ····4821</Text>
        <Text style={{ color: c.textSecondary, fontSize: t.caption.fontSize }}>Available $4,212.10</Text>
        <Text style={{ color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: '600', marginTop: spacing[3] }}>Savings ····9033</Text>
        <Text style={{ color: c.textSecondary, fontSize: t.caption.fontSize }}>Available $8,268.45</Text>
      </Card>
      <View style={{ flex: 1 }} />
      <PrimaryButton label="View Home" disabled={busy} onPress={() => finish('/')} />
      <SecondaryButton label="Back to Accounts" onPress={() => finish('/accounts')} />
    </FirstRunScreen>
  );
}

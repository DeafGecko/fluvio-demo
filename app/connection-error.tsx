import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { ExclamationTriangleIcon } from 'react-native-heroicons/solid';
import { FirstRunScreen, PrimaryButton, SecondaryButton } from '../components/first-run-ui';
import { spacing, rem } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';
import { seedDemoAccounts } from '../lib/accounts';
import { seedDemoData } from '../lib/demo-data';

// The bank could not be reached. Retry, or use the saved demo data.
export default function ConnectionError() {
  const router = useRouter();
  const { c, t } = useTheme();
  const [retrying, setRetrying] = useState(false);

  const retry = () => {
    setRetrying(true);
    setTimeout(() => router.replace('/connection-success'), 1500);
  };

  const useSaved = async () => {
    await seedDemoAccounts();
    await seedDemoData();
    await AsyncStorage.setItem('onboarded', 'true');
    router.replace('/');
  };

  return (
    <FirstRunScreen back={() => router.back()} backLabel="Connect bank">
      <View style={{ alignItems: 'center', marginTop: spacing[8] }}>
        <View style={{ width: rem(6), height: rem(6), borderRadius: rem(3), backgroundColor: c.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}>
          <ExclamationTriangleIcon size={rem(3.5)} color={c.warning} />
        </View>
      </View>
      <Text style={{ color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: '700', textAlign: 'center', marginTop: spacing[4] }}
        accessibilityRole="header">Couldn&apos;t reach the bank</Text>
      <Text style={{ color: c.textSecondary, fontSize: t.body.fontSize, lineHeight: t.body.lineHeight, textAlign: 'center', marginTop: spacing[2] }}>
        This is a pretend bank, so nothing is wrong with your device. Try again, or use the demo data you already have.
      </Text>
      <Text style={{ color: c.textSecondary, fontSize: t.caption.fontSize, textAlign: 'center', marginTop: spacing[3] }}>
        Last updated 2 hours ago
      </Text>

      {retrying && (
        <View style={{ alignItems: 'center', marginTop: spacing[4] }} accessibilityLiveRegion="polite">
          <ActivityIndicator color={c.accent} />
        </View>
      )}

      <View style={{ flex: 1 }} />
      <PrimaryButton label="Try again" disabled={retrying} onPress={retry} />
      <SecondaryButton label="Use saved data" onPress={useSaved} />
    </FirstRunScreen>
  );
}

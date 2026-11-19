import { useRouter } from 'expo-router';
import { Text } from 'react-native';
import { FirstRunScreen, PrimaryButton, SecondaryButton } from '../components/first-run-ui';
import { spacing } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';

// Choose how to add accounts: connect a demo bank, or add one by hand.
export default function SetUp() {
  const router = useRouter();
  const { c, t } = useTheme();
  return (
    <FirstRunScreen back={() => router.back()} backLabel="Create profile">
      <Text style={{ color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: '700', marginTop: spacing[2] }} accessibilityRole="header">Set up your accounts</Text>
      <Text style={{ color: c.textSecondary, fontSize: t.body.fontSize, lineHeight: t.body.lineHeight, marginTop: spacing[3] }}>
        Pick a pretend bank to connect, or add an account by hand. You can change this later.
      </Text>
      <PrimaryButton label="Continue" onPress={() => router.push('/connect-bank')} />
      <SecondaryButton label="Add an account manually" onPress={() => router.push('/add-account')} />
    </FirstRunScreen>
  );
}

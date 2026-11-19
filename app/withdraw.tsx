import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { BackLink } from '../components/settings-ui';
import { WithdrawForm } from '../components/withdraw-form';
import { screenInset, spacing } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';

// Take cash out as its own screen (the sheet version is inside Cash on hand).
export default function Withdraw() {
  const router = useRouter();
  const { c, t } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.canvas },
    content: { paddingHorizontal: screenInset, paddingTop: spacing[16], paddingBottom: spacing[12] },
    heading: { color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: t.h1.fontWeight, lineHeight: t.h1.lineHeight, marginTop: spacing[2] },
    sub: { color: c.textSecondary, fontSize: t.secondary.fontSize, lineHeight: t.secondary.lineHeight, marginTop: spacing[2] },
  }), [c, t]);
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <BackLink label="Accounts" onPress={() => (router.canGoBack() ? router.back() : router.replace('/accounts'))} />
      <Text style={styles.heading} accessibilityRole="header">Take out cash</Text>
      <Text style={styles.sub}>Money moves from your bank to cash on hand. Cash you spend is tracked separately.</Text>
      <WithdrawForm onSaved={() => setTimeout(() => router.back(), 1800)} />
    </ScrollView>
  );
}

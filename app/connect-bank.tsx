import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { FirstRunScreen } from '../components/first-run-ui';
import { minTarget, radius, spacing } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';
import { DEMO_BANKS } from '../lib/accounts';

// Pick a pretend bank. "Summit Demo Bank" fails on purpose, to show the error screen.
const FAILS = 'Summit Demo Bank';

export default function ConnectBank() {
  const router = useRouter();
  const { c, t } = useTheme();
  const [loading, setLoading] = useState<string | null>(null);

  const connect = (bank: string) => {
    setLoading(bank);
    setTimeout(() => {
      setLoading(null);
      router.push(bank === FAILS ? '/connection-error' : { pathname: '/connection-success', params: { bank } });
    }, 1500);
  };

  return (
    <FirstRunScreen back={() => router.back()} backLabel="Set up">
      <Text style={{ color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: '700', marginTop: spacing[2] }} accessibilityRole="header">Choose a bank</Text>
      <Text style={{ color: c.textSecondary, fontSize: t.body.fontSize, lineHeight: t.body.lineHeight, marginTop: spacing[3] }}>
        These banks are pretend. No real bank is contacted and no login is needed.
      </Text>

      <View style={{ marginTop: spacing[4], gap: spacing[2] }}>
        {DEMO_BANKS.map((bank) => (
          <Pressable key={bank} onPress={() => connect(bank)} disabled={loading !== null}
            accessibilityRole="button" accessibilityLabel={`Connect ${bank}`}
            style={({ pressed }) => ({
              minHeight: minTarget, borderRadius: radius.md, borderWidth: 1, borderColor: c.border,
              backgroundColor: c.surface, paddingHorizontal: spacing[4], justifyContent: 'center', opacity: pressed ? 0.85 : 1,
            })}>
            <Text style={{ color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: '600' }}>
              {loading === bank ? 'Connecting…' : bank}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading && (
        <View style={{ alignItems: 'center', marginTop: spacing[6] }} accessibilityLiveRegion="polite">
          <ActivityIndicator color={c.accent} />
          <Text style={{ color: c.textSecondary, fontSize: t.secondary.fontSize, marginTop: spacing[2] }}>Connecting to a pretend bank…</Text>
        </View>
      )}
    </FirstRunScreen>
  );
}

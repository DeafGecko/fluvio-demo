import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { Card, FirstRunScreen, PrimaryButton, SecondaryButton } from '../components/first-run-ui';
import { ArrowsRightLeftIcon, ChartPieIcon, ShieldCheckIcon } from 'react-native-heroicons/outline';
import { useTheme } from '../hooks/use-theme';
import { FluvioLogo } from '../components/fluvio-logo';
import { spacing, rem } from '../constants/tokens';

// One feature line inside the card: an icon and a short sentence.
function Row({ Icon, color, title, last }: { Icon: any; color: string; title: string; last?: boolean }) {
  const { c, t } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingVertical: spacing[3], borderBottomWidth: last ? 0 : 1, borderBottomColor: c.border }}>
      <Icon size={rem(1.375)} color={color} />
      <Text style={{ color: c.textPrimary, fontSize: t.body.fontSize, fontWeight: '600', flex: 1 }}>{title}</Text>
    </View>
  );
}

// First screen for new users. Pick the demo tour, or go straight to demo data.
export default function Welcome() {
  const router = useRouter();
  const { c, t } = useTheme();
  return (
    <FirstRunScreen>
      <FluvioLogo size={rem(6)} />
      <Text style={{ color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: '700', lineHeight: t.h1.lineHeight, marginTop: spacing[6] }}
        accessibilityRole="header">Welcome to Fluvio</Text>
      <Text style={{ color: c.textSecondary, fontSize: t.body.fontSize, lineHeight: t.body.lineHeight, marginTop: spacing[3] }}>
        See where your money goes. Everything here is pretend, so nothing is connected to a real bank.
      </Text>
      <Card>
        <Row Icon={ArrowsRightLeftIcon} color={c.accent} title="Every purchase in one place" />
        <Row Icon={ChartPieIcon} color={c.accent} title="See where the money goes" />
        <Row Icon={ShieldCheckIcon} color={c.accent} title="Stays on this device" last />
      </Card>
      <View style={{ height: spacing[4] }} />
      <PrimaryButton label="Explore the demo" a11y="Explore the demo, button" onPress={() => router.push('/key-benefits')} />
      <SecondaryButton label="How demo data works" a11y="How demo data works, button" onPress={() => router.push('/sign-in')} />
    </FirstRunScreen>
  );
}

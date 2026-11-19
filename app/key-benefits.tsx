import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { ArrowPathIcon, ChartPieIcon, WalletIcon } from 'react-native-heroicons/outline';
import { FirstRunScreen, PrimaryButton, TextLink } from '../components/first-run-ui';
import { useTheme } from '../hooks/use-theme';
import { radius, spacing } from '../constants/tokens';

// The three benefits, shown together as cards with an icon each (as in the Figma frame).
const BENEFITS = [
  { Icon: ChartPieIcon, title: 'See your spending', body: 'Every purchase, bill, and fee in one list.' },
  { Icon: WalletIcon, title: 'Know what is left', body: 'Cash on hand and money taken out, in plain numbers.' },
  { Icon: ArrowPathIcon, title: 'Spot repeat charges', body: 'We flag a service that was charged twice in one month.' },
];

export default function KeyBenefits() {
  const router = useRouter();
  const { c, t } = useTheme();

  return (
    <FirstRunScreen back={() => router.back()} backLabel="Welcome">
      <Text style={{ color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: '700', lineHeight: t.h1.lineHeight, marginTop: spacing[4] }}
        accessibilityRole="header">Key benefits</Text>
      <View style={{ gap: spacing[3], marginTop: spacing[4] }}>
        {BENEFITS.map(({ Icon, title, body }) => (
          <View key={title} accessible
            style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3], backgroundColor: c.surface, borderRadius: radius.lg, padding: spacing[4], borderWidth: 1, borderColor: c.cardBorder }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.iconBadge, alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={22} color={c.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: '600' }}>{title}</Text>
              <Text style={{ color: c.textSecondary, fontSize: t.secondary.fontSize, lineHeight: t.secondary.lineHeight, marginTop: 2 }}>{body}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={{ flex: 1 }} />
      <PrimaryButton label="Next" onPress={() => router.push('/create-profile')} />
      <TextLink label="Skip" onPress={() => router.push('/create-profile')} />
    </FirstRunScreen>
  );
}

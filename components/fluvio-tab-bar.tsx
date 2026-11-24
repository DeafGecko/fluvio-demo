import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowsRightLeftIcon, ChartBarIcon, HomeIcon, WalletIcon } from 'react-native-heroicons/outline';
import { spacing, rem, font, compactTextScale } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';

// Figma "Tab bar": a rounded card with a border, four outline icons with labels.
// Active tab uses the accent color. Hidden screens (splash, sign-in, add) are not shown.
const TABS: { name: string; label: string; Icon: any }[] = [
  { name: 'index', label: 'Home', Icon: HomeIcon },
  { name: 'activity', label: 'Activity', Icon: ArrowsRightLeftIcon },
  { name: 'insights', label: 'Insights', Icon: ChartBarIcon },
  { name: 'accounts', label: 'Accounts', Icon: WalletIcon },
];

type Props = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigateToTab: (routeKey: string) => void;
};

export function FluvioTabBar({ state, navigateToTab }: Props) {
  const { c } = useTheme();

  const styles = StyleSheet.create({
    wrap: { backgroundColor: c.canvas, paddingHorizontal: spacing[4], paddingBottom: spacing[4], paddingTop: spacing[2] },
    bar: {
      flexDirection: 'row', alignItems: 'stretch', padding: spacing[2],
      backgroundColor: c.surface, borderWidth: 1, borderColor: c.cardBorder, borderRadius: rem(1.25),
    },
    tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[1], paddingVertical: spacing[1], minHeight: rem(3) },
    label: { fontSize: font(0.75), fontWeight: '600', lineHeight: font(1.0625) },
    pressed: { opacity: 0.7 },
  });

  return (
    <View style={styles.wrap}>
      <View style={styles.bar} accessibilityRole="tablist">
        {TABS.map(({ name, label, Icon }) => {
          const route = state.routes.find((r) => r.name === name);
          if (!route) return null;
          const focused = state.routes[state.index]?.name === name;
          const color = focused ? c.accent : c.textSecondary;
          return (
            <Pressable
              key={name}
              style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected: focused }}
              aria-selected={focused}
              onPress={() => {
                if (!focused) navigateToTab(route.key);
              }}
            >
              <Icon size={rem(1.5)} color={color} />
              <Text style={[styles.label, { color }]} numberOfLines={1} maxFontSizeMultiplier={compactTextScale}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

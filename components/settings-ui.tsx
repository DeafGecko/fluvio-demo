import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRightIcon, XMarkIcon } from 'react-native-heroicons/outline';
import { isLargeText, minTarget, spacing, rem, font } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';

// Shared pieces for the Figma Settings screens (19, 34, 40).

// Close button for pages that slide up from the bottom: an X in the top-right corner.
// Closing goes back to the page before. If there is none, it goes Home.
export function BackLink({ label, onPress }: { label: string; onPress: () => void }) {
  const { c } = useTheme();
  const router = useRouter();
  const handlePress = () => {
    if (router.canGoBack()) onPress();
    else router.replace('/');
  };
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: spacing[1] }}>
      <Pressable onPress={handlePress} onLongPress={() => router.replace('/')} delayLongPress={500}
        hitSlop={{ top: rem(0.75), bottom: rem(0.75), left: rem(0.75), right: rem(0.75) }}
        accessibilityRole="button" accessibilityLabel={`Close ${label}`}
        accessibilityHint="Long press to go to Home"
        style={{ width: minTarget, height: minTarget, alignItems: 'center', justifyContent: 'center' }}>
        <XMarkIcon size={rem(1.5)} color={c.textSecondary} />
      </Pressable>
    </View>
  );
}

export function SettingsGroup({ children }: { children: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.cardBorder, borderRadius: rem(1.125), paddingHorizontal: spacing[4], paddingVertical: spacing[1], marginBottom: spacing[4] }}>
      {children}
    </View>
  );
}

type RowProps = {
  Icon: any;
  title: string;
  subtitle?: string;
  value?: string;
  destructive?: boolean;
  onPress?: () => void;
  last?: boolean;
};

export function SettingsRow({ Icon, title, subtitle, value, destructive, onPress, last }: RowProps) {
  const { c, t } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], minHeight: rem(3.5), paddingVertical: spacing[2] },
    badge: { width: rem(2.25), height: rem(2.25), borderRadius: rem(1.125), backgroundColor: destructive ? c.surfaceMuted : c.iconBadgeStrong, alignItems: 'center', justifyContent: 'center' },
    info: { flex: 1 },
    title: { color: destructive ? c.danger : c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: t.bodyStrong.fontWeight },
    sub: { color: c.textSecondary, fontSize: t.caption.fontSize, lineHeight: t.caption.lineHeight, marginTop: rem(0.125) },
    value: { color: c.accent, fontSize: font(0.9375), fontWeight: '600' },
    divider: { height: rem(0.0625), backgroundColor: c.border },
    pressed: { opacity: 0.7 },
  }), [c, t, destructive]);

  const content = (
    <>
      <View style={styles.row}>
        {/* Large text: the decorative icon is dropped to give the title more width. */}
        {!isLargeText && (
          <View style={styles.badge}>
            <Icon size={rem(1.125)} color={destructive ? c.danger : c.accent} />
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.title}>{title}</Text>
          {!!subtitle && <Text style={styles.sub}>{subtitle}</Text>}
          {/* Large text: the value goes under the title so the title column keeps its width. */}
          {!!value && isLargeText && <Text style={styles.value}>{value}</Text>}
        </View>
        {!!value && !isLargeText && <Text style={styles.value}>{value}</Text>}
        {!!onPress && !value && <ChevronRightIcon size={rem(1.25)} color={c.textTertiary} />}
      </View>
      {!last && <View style={styles.divider} />}
    </>
  );

  if (!onPress) return <View accessible accessibilityLabel={`${title}${subtitle ? `, ${subtitle}` : ''}${value ? `, ${value}` : ''}`}>{content}</View>;
  return (
    <Pressable onPress={onPress} accessibilityRole="button"
      style={({ pressed }) => [pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

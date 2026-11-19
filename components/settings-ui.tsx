import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRightIcon, XMarkIcon } from 'react-native-heroicons/outline';
import { minTarget, spacing } from '../constants/tokens';
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
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityRole="button" accessibilityLabel={`Close ${label}`}
        accessibilityHint="Long press to go to Home"
        style={{ width: minTarget, height: minTarget, alignItems: 'center', justifyContent: 'center' }}>
        <XMarkIcon size={24} color={c.textSecondary} />
      </Pressable>
    </View>
  );
}

export function SettingsGroup({ children }: { children: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.cardBorder, borderRadius: 18, paddingHorizontal: spacing[4], paddingVertical: spacing[1], marginBottom: spacing[4] }}>
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
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], minHeight: 56, paddingVertical: spacing[2] },
    badge: { width: 36, height: 36, borderRadius: 18, backgroundColor: destructive ? c.surfaceMuted : c.iconBadge, alignItems: 'center', justifyContent: 'center' },
    info: { flex: 1 },
    title: { color: destructive ? c.danger : c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: t.bodyStrong.fontWeight },
    sub: { color: c.textSecondary, fontSize: t.caption.fontSize, lineHeight: t.caption.lineHeight, marginTop: 2 },
    value: { color: c.accent, fontSize: 15, fontWeight: '600' },
    divider: { height: 1, backgroundColor: c.border },
    pressed: { opacity: 0.7 },
  }), [c, t, destructive]);

  const content = (
    <>
      <View style={styles.row}>
        <View style={styles.badge}>
          <Icon size={18} color={destructive ? c.danger : c.accent} />
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>{title}</Text>
          {!!subtitle && <Text style={styles.sub}>{subtitle}</Text>}
        </View>
        {!!value && <Text style={styles.value}>{value}</Text>}
        {!!onPress && !value && <ChevronRightIcon size={20} color={c.textTertiary} />}
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

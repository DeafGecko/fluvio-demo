import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BackLink } from './settings-ui';
import { minTarget, radius, screenInset, spacing } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';

// Shared layout for the first-run screens (Welcome through Connection).
export function FirstRunScreen({ children, back, backLabel }: {
  children: React.ReactNode; back?: () => void; backLabel?: string;
}) {
  const { c, t } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.canvas },
    content: { paddingHorizontal: screenInset, paddingTop: spacing[16], paddingBottom: spacing[12], flexGrow: 1 },
    title: { color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: t.h1.fontWeight, lineHeight: t.h1.lineHeight, marginTop: spacing[2] },
    body: { color: c.textSecondary, fontSize: t.body.fontSize, lineHeight: t.body.lineHeight, marginTop: spacing[3] },
  }), [c, t]);
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {back && <BackLink label={backLabel ?? 'Back'} onPress={back} />}
      {children}
    </ScrollView>
  );
}

export function PrimaryButton({ label, onPress, disabled, a11y }: { label: string; onPress: () => void; disabled?: boolean; a11y?: string }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={a11y ?? label}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => ({
        minHeight: 52, borderRadius: 14, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center',
        marginTop: spacing[3], opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
      })}>
      <Text style={{ color: c.onAccent, fontSize: 17, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, a11y }: { label: string; onPress: () => void; a11y?: string }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={a11y ?? label}
      style={({ pressed }) => ({
        minHeight: 52, borderRadius: 14, borderWidth: 1, borderColor: c.cardBorder, backgroundColor: c.surface,
        alignItems: 'center', justifyContent: 'center', marginTop: spacing[3], opacity: pressed ? 0.85 : 1,
      })}>
      <Text style={{ color: c.textPrimary, fontSize: 17, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

export function TextLink({ label, onPress, a11y }: { label: string; onPress: () => void; a11y?: string }) {
  const { c, t } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="link" accessibilityLabel={a11y ?? label}
      style={{ minHeight: minTarget, alignItems: 'center', justifyContent: 'center', marginTop: spacing[2] }}>
      <Text style={{ color: c.accent, fontSize: t.bodyStrong.fontSize, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  const { c } = useTheme();
  return <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.cardBorder, borderRadius: radius.lg, padding: spacing[4], marginTop: spacing[4] }}>{children}</View>;
}

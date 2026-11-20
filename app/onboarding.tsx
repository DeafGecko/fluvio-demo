import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SparklesIcon } from 'react-native-heroicons/outline';
import { minTarget, radius, spacing, rem } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';

export default function Onboarding() {
  const router = useRouter();
  const { c, t } = useTheme();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const canStart = name.trim().length > 0 && !saving;

  const handleStart = async () => {
    if (!canStart) return;
    setSaving(true);
    await AsyncStorage.setItem('user_name', name.trim());
    await AsyncStorage.setItem('onboarded', 'true');
    router.replace('/');
  };

  const styles = useMemo(() => StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.canvas },
    container: { flex: 1, paddingHorizontal: rem(1.5), justifyContent: 'center' },
    iconWrap: {
      width: rem(4), height: rem(4), borderRadius: radius.lg, backgroundColor: c.surfaceMuted,
      alignItems: 'center', justifyContent: 'center', marginBottom: spacing[6],
    },
    title: { color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: t.h1.fontWeight, lineHeight: t.h1.lineHeight, marginBottom: spacing[3] },
    subtitle: { color: c.textSecondary, fontSize: t.body.fontSize, lineHeight: t.body.lineHeight, marginBottom: spacing[10] },
    label: { color: c.textPrimary, fontSize: t.bodyStrong.fontSize, fontWeight: t.bodyStrong.fontWeight, marginBottom: spacing[2] },
    input: {
      minHeight: minTarget, backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.cardBorder,
      paddingHorizontal: spacing[4], color: c.textPrimary, fontSize: t.body.fontSize, marginBottom: spacing[4],
    },
    button: {
      minHeight: minTarget, borderRadius: radius.md, backgroundColor: c.accent,
      alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing[4],
    },
    buttonDisabled: { backgroundColor: c.surfaceMuted, borderWidth: 1, borderColor: c.cardBorder },
    buttonLabel: { color: c.onAccent, fontSize: t.bodyStrong.fontSize, fontWeight: t.bodyStrong.fontWeight },
    buttonLabelDisabled: { color: c.textSecondary },
    pressed: { opacity: 0.85 },
    footer: { color: c.textSecondary, fontSize: t.caption.fontSize, lineHeight: t.caption.lineHeight, textAlign: 'center', marginTop: spacing[6] },
  }), [c, t]);

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        <View style={styles.iconWrap} importantForAccessibility="no" accessibilityElementsHidden>
          <SparklesIcon size={rem(2)} color={c.accent} />
        </View>

        <Text style={styles.title} accessibilityRole="header">Welcome to Fluvio</Text>
        <Text style={styles.subtitle}>
          Track your purchases and see where your money goes. Start with your first name.
        </Text>

        <Text style={styles.label}>First name</Text>
        <TextInput
          style={styles.input}
          placeholder="First name"
          placeholderTextColor={c.textTertiary}
          value={name}
          onChangeText={setName}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleStart}
          accessibilityLabel="First name"
          autoComplete="given-name"
        />

        <Pressable
          style={({ pressed }) => [
            styles.button,
            !canStart && styles.buttonDisabled,
            pressed && canStart && styles.pressed,
          ]}
          onPress={handleStart}
          disabled={!canStart}
          accessibilityRole="button"
          accessibilityLabel="Get started"
          accessibilityState={{ disabled: !canStart }}
        >
          <Text style={[styles.buttonLabel, !canStart && styles.buttonLabelDisabled]}>Get started</Text>
        </Pressable>

        <Text style={styles.footer}>Your data stays on your device.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

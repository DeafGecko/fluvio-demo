import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput } from 'react-native';
import { FirstRunScreen, PrimaryButton, TextLink } from '../components/first-run-ui';
import { minTarget, radius, spacing } from '../constants/tokens';
import { useTheme } from '../hooks/use-theme';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Name and pretend email. No password. No real personal data is collected.
export default function CreateProfile() {
  const router = useRouter();
  const { c, t } = useTheme();
  const [name, setName] = useState('Fluvio');
  const [email, setEmail] = useState('demo@fluvio.test');
  const nameError = name.trim().length === 0 ? 'Enter a name.' : name.trim().length > 40 ? 'Use 40 letters or fewer.' : '';
  const emailError = EMAIL.test(email.trim()) ? '' : 'Enter an email like demo@fluvio.test.';
  const ok = !nameError && !emailError;

  const create = async () => {
    if (!ok) return;
    await AsyncStorage.setItem('user_name', name.trim());
    await AsyncStorage.setItem('user_email', email.trim());
    router.push('/set-up');
  };

  const input = { minHeight: minTarget, backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, paddingHorizontal: spacing[4], color: c.textPrimary, fontSize: t.body.fontSize, marginTop: spacing[2] } as const;

  return (
    <FirstRunScreen back={() => router.back()} backLabel="Key benefits">
      <Text style={{ color: c.textPrimary, fontSize: t.h1.fontSize, fontWeight: '700', marginTop: spacing[2] }} accessibilityRole="header">Create a demo profile</Text>
      <Text style={{ color: c.textSecondary, fontSize: t.body.fontSize, lineHeight: t.body.lineHeight, marginTop: spacing[3] }}>
        This is a pretend profile. No password. No real bank or personal data is collected.
      </Text>

      <Text style={{ color: c.textPrimary, fontSize: t.secondary.fontSize, fontWeight: '600', marginTop: spacing[5] }}>Display name</Text>
      <TextInput style={input} value={name} onChangeText={setName} maxLength={41} accessibilityLabel="Display name" />
      {!!nameError && <Text accessibilityRole="alert" style={{ color: c.danger, fontSize: t.caption.fontSize, marginTop: spacing[1] }}>{nameError}</Text>}

      <Text style={{ color: c.textPrimary, fontSize: t.secondary.fontSize, fontWeight: '600', marginTop: spacing[5] }}>Demo email</Text>
      <TextInput style={input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" accessibilityLabel="Demo email" />
      {!!emailError && <Text accessibilityRole="alert" style={{ color: c.danger, fontSize: t.caption.fontSize, marginTop: spacing[1] }}>{emailError}</Text>}

      <PrimaryButton label="Create demo profile" onPress={create} disabled={!ok} />
      <TextLink label="Already have a demo profile? Sign in" onPress={() => router.push('/sign-in')} />
    </FirstRunScreen>
  );
}

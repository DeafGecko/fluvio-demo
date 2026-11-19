import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { UserIcon } from 'react-native-heroicons/outline';
import { useTheme } from '../hooks/use-theme';
import { AVATAR_KEY } from '../lib/avatar';

// The round profile picture: the user's photo if they have one, otherwise a person icon.
// It reloads the photo each time its screen is shown, so a new photo appears right away.
export function Avatar({ size = 44, onPress, label }: { size?: number; onPress?: () => void; label: string }) {
  const { c } = useTheme();
  const [uri, setUri] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem(AVATAR_KEY).then(setUri).catch(() => setUri(null));
  }, []));

  const circle = { width: size, height: size, borderRadius: size / 2, borderWidth: 1, borderColor: c.avatarBorder, backgroundColor: c.accentSoft, overflow: 'hidden' as const };
  const content = uri
    ? <Image source={{ uri }} style={{ width: size, height: size }} />
    : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><UserIcon size={Math.round(size * 0.5)} color={c.accent} /></View>;

  if (!onPress) return <View style={circle} accessible accessibilityLabel={label}>{content}</View>;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={circle}>
      {content}
    </Pressable>
  );
}

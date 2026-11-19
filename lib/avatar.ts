import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

// The profile photo is saved inside the app's own storage as a small image string,
// so it stays put after the app restarts.
export const AVATAR_KEY = 'avatar_uri';

// Opens the photo library. Returns true if a photo was chosen and saved.
export async function pickAvatar(): Promise<boolean> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.4,
    base64: true,
  });
  const asset = result.assets?.[0];
  if (result.canceled || !asset?.base64) return false;
  await AsyncStorage.setItem(AVATAR_KEY, `data:image/jpeg;base64,${asset.base64}`);
  return true;
}

export async function removeAvatar(): Promise<void> {
  await AsyncStorage.removeItem(AVATAR_KEY);
}

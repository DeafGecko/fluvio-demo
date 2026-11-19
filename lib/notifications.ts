import AsyncStorage from '@react-native-async-storage/async-storage';

// Demo notification ids. Keep in sync with the list on the Notifications screen.
export const NOTIFICATION_IDS = ['fraud', 'cc', 'bill', 'pay', 'sub', 'fee'] as const;

const READ_KEY = 'notifications_read';

export async function loadReadIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(READ_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

// Called when a notification is opened. It stays in the list, dimmed.
export async function markNotificationRead(id: string): Promise<void> {
  const ids = await loadReadIds();
  if (ids.includes(id)) return;
  await AsyncStorage.setItem(READ_KEY, JSON.stringify([...ids, id]));
}

// New (unread) count shown on the bell.
export async function loadUnreadCount(): Promise<number> {
  const read = await loadReadIds();
  return NOTIFICATION_IDS.filter((id) => !read.includes(id)).length;
}

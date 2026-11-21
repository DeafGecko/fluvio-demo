import AsyncStorage from '@react-native-async-storage/async-storage';

// Local usage log for the pilot: how often each screen and key button is used.
// Stored on this phone only. Nothing is sent anywhere, and no names or amounts are recorded.
const KEY = 'usage_counts_v1';

export type UsageEntry = { count: number; last: string };

// Writes run one after another, so quick taps cannot overwrite each other's counts.
let queue: Promise<void> = Promise.resolve();

async function addOne(name: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const all: Record<string, UsageEntry> = raw ? JSON.parse(raw) : {};
    const prev = all[name] ?? { count: 0, last: '' };
    all[name] = { count: prev.count + 1, last: new Date().toISOString() };
    await AsyncStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // Tracking must never break the app.
  }
}

// Call with a short name, such as "screen:/bills" or "tap:home-add".
export function trackUse(name: string): void {
  queue = queue.then(() => addOne(name));
}

export async function loadUsage(): Promise<Record<string, UsageEntry>> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function clearUsage(): Promise<void> {
  queue = queue.then(async () => {
    try { await AsyncStorage.removeItem(KEY); await AsyncStorage.removeItem(SAVES_KEY); } catch { /* ignore */ }
  });
  await queue;
}

// Save history: when each save happened and which screen it came from.
// The detail is only a category or field name, never an amount, name, or note.
const SAVES_KEY = 'save_history_v1';
const MAX_SAVES = 300;

export type SaveEntry = { at: string; from: string; detail?: string };

export function recordSave(from: string, detail?: string): void {
  queue = queue.then(async () => {
    try {
      const raw = await AsyncStorage.getItem(SAVES_KEY);
      const list: SaveEntry[] = raw ? JSON.parse(raw) : [];
      list.unshift({ at: new Date().toISOString(), from, detail });
      await AsyncStorage.setItem(SAVES_KEY, JSON.stringify(list.slice(0, MAX_SAVES)));
    } catch {
      // History must never break the app.
    }
  });
}

export async function loadSaves(): Promise<SaveEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(SAVES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

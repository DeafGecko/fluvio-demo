import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Saved user preferences. Stored on this device only.
// Text size always comes from the phone. Light or dark follows the phone unless set here.
export type Appearance = 'system' | 'light' | 'dark';

export type Prefs = {
  appearance: Appearance; // starts on 'light'. 'system' = follow the phone
  notifications: boolean;
  hideAmounts: boolean;   // privacy: mask money amounts on Home
  pretendOffline: boolean; // demo: show the offline banner
  layout: 'auto' | 'phone' | 'tablet'; // content width: auto, phone-width, or tablet-width
  monthlyLimit: number;   // the most you plan to spend in a month (Left to spend uses it)
};

const DEFAULTS: Prefs = {
  appearance: 'light', notifications: false, hideAmounts: false, pretendOffline: false, layout: 'auto', monthlyLimit: 2500,
};
const KEY = 'prefs_v1';

// On the web, saved prefs are read right away from local storage (the same place AsyncStorage keeps them),
// so the very first screen already uses the saved light or dark theme instead of flashing the system theme.
function readWebPrefsNow(): Prefs | null {
  try {
    const ls = (globalThis as any).localStorage;
    const raw = ls ? ls.getItem(KEY) : null;
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : null;
  } catch { return null; }
}

let current: Prefs = { ...DEFAULTS };
let loaded = false;
if (Platform.OS === 'web') {
  const now = readWebPrefsNow();
  if (now) { current = now; loaded = true; }
}
const listeners = new Set<(p: Prefs) => void>();

async function ensureLoaded() {
  if (loaded) return;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) current = { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { /* keep defaults */ }
  loaded = true;
  listeners.forEach((fn) => fn(current));
}

export function getPrefs(): Prefs {
  return current;
}

export async function setPref<K extends keyof Prefs>(key: K, value: Prefs[K]): Promise<void> {
  current = { ...current, [key]: value };
  listeners.forEach((fn) => fn(current));
  try { await AsyncStorage.setItem(KEY, JSON.stringify(current)); } catch { /* ignore */ }
}

// Live preferences for components. Loads saved values on first use.
export function usePrefs(): Prefs {
  const [prefs, setPrefs] = useState<Prefs>(current);
  useEffect(() => {
    listeners.add(setPrefs);
    ensureLoaded();
    return () => { listeners.delete(setPrefs); };
  }, []);
  return prefs;
}

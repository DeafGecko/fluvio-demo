import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

// Saved user preferences. Stored on this device only.
// Text size always comes from the phone. Light or dark follows the phone unless set here.
export type Appearance = 'system' | 'light' | 'dark';

export type Prefs = {
  appearance: Appearance; // 'system' = follow the phone
  notifications: boolean;
  hideAmounts: boolean;   // privacy: mask money amounts on Home
  pretendOffline: boolean; // demo: show the offline banner
  layout: 'auto' | 'phone' | 'tablet'; // content width: auto, phone-width, or tablet-width
  monthlyLimit: number;   // the most you plan to spend in a month (Left to spend uses it)
};

const DEFAULTS: Prefs = {
  appearance: 'system', notifications: false, hideAmounts: false, pretendOffline: false, layout: 'auto', monthlyLimit: 2500,
};
const KEY = 'prefs_v1';

let current: Prefs = { ...DEFAULTS };
let loaded = false;
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

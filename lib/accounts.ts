import AsyncStorage from '@react-native-async-storage/async-storage';

// Demo accounts only. Figma: "Accounts" screen says demo data is fictional.
// Nothing here connects to a bank. Balances are fixed demo values.
export const DEMO_ACCOUNTS_KEY = 'demo_accounts';

export type DemoAccount = {
  id: string;
  name: string;          // e.g. "Checking"
  mask: string;          // last four digits shown as ····1234
  kind: 'cash' | 'credit';
  available?: number;    // cash accounts
  current?: number;      // cash accounts
  owed?: number;         // credit accounts
  institution: string;
  showOnHome?: boolean;  // default true when not set
};

const DEMO_SET: DemoAccount[] = [
  { id: 'chk-4821', name: 'Checking', mask: '4821', kind: 'cash', available: 4212.1, current: 4198.8, institution: 'Northstar Demo Bank' },
  { id: 'sav-9033', name: 'Savings', mask: '9033', kind: 'cash', available: 8268.45, current: 8268.45, institution: 'Northstar Demo Bank' },
  { id: 'crd-1187', name: 'Credit card', mask: '1187', kind: 'credit', owed: 412.36, institution: 'Evergreen Credit Union (Demo)' },
];

export async function loadDemoAccounts(): Promise<DemoAccount[]> {
  try {
    const raw = await AsyncStorage.getItem(DEMO_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function seedDemoAccounts(): Promise<void> {
  await AsyncStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(DEMO_SET));
}

export const DEMO_BANKS = [
  'Northstar Demo Bank',
  'Evergreen Credit Union (Demo)',
  'Harborline Financial (Demo)',
  'Summit Demo Bank',
] as const;

// Adds one fictional account to the existing list.
export async function addDemoAccount(input: {
  institution: string; kind: 'cash' | 'credit'; name: string; mask: string; balance: number;
}): Promise<void> {
  const list = await loadDemoAccounts();
  const id = `${input.kind}-${input.mask}-${Date.now()}`;
  const account: DemoAccount = input.kind === 'cash'
    ? { id, name: input.name, mask: input.mask, kind: 'cash', available: input.balance, current: input.balance, institution: input.institution }
    : { id, name: input.name, mask: input.mask, kind: 'credit', owed: input.balance, institution: input.institution };
  await AsyncStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify([...list, account]));
}

// Account settings: rename, show on Home, remove. Demo data only.
async function saveAll(list: DemoAccount[]): Promise<void> {
  await AsyncStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(list));
}

// Which accounts have been synced (credit cards start "Not yet synced"). Saved on this device.
const SYNCED_KEY = 'synced_account_ids';

export async function loadSyncedIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(SYNCED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function markAccountSynced(id: string): Promise<void> {
  const ids = await loadSyncedIds();
  if (ids.includes(id)) return;
  await AsyncStorage.setItem(SYNCED_KEY, JSON.stringify([...ids, id]));
}

// Moves money in or out of a cash account (for example a cash withdrawal). Demo only.
export async function adjustDemoCashBalance(id: string, delta: number): Promise<void> {
  const list = await loadDemoAccounts();
  await saveAll(list.map((a) => (a.id === id && a.kind === 'cash'
    ? {
        ...a,
        available: Math.round(((a.available ?? 0) + delta) * 100) / 100,
        current: Math.round(((a.current ?? 0) + delta) * 100) / 100,
      }
    : a)));
}

export async function renameDemoAccount(id: string, name: string): Promise<void> {
  const list = await loadDemoAccounts();
  await saveAll(list.map((a) => (a.id === id ? { ...a, name } : a)));
}

export async function setDemoShowOnHome(id: string, showOnHome: boolean): Promise<void> {
  const list = await loadDemoAccounts();
  await saveAll(list.map((a) => (a.id === id ? { ...a, showOnHome } : a)));
}

export async function removeDemoAccount(id: string): Promise<void> {
  const list = await loadDemoAccounts();
  await saveAll(list.filter((a) => a.id !== id));
}

export async function clearDemoAccounts(): Promise<void> {
  await AsyncStorage.removeItem(DEMO_ACCOUNTS_KEY);
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CubeIcon, DocumentIcon, FilmIcon, HeartIcon,
  ShoppingBagIcon, ShoppingCartIcon,
} from 'react-native-heroicons/outline';
import { CarIcon } from '../components/car-icon';

export const STORAGE_KEY = 'expenses';

export type Expense = {
  id: string; name: string; amount: number;
  category: string; note: string; date: string;
  deletedAt?: string;   // set when deleted; kept in history
  accountId?: string;   // which account it was paid from (for example chk-4821); defaults to Checking
};

export const CATEGORY_NAMES = ['Food', 'Transport', 'Entertainment', 'Health', 'Shopping', 'Bills', 'Other'] as const;

export const CATEGORY_ICONS: Record<string, any> = {
  Food: ShoppingCartIcon, Transport: CarIcon, Entertainment: FilmIcon,
  Health: HeartIcon, Shopping: ShoppingBagIcon, Bills: DocumentIcon, Other: CubeIcon,
};

// Every stored purchase, including deleted ones (kept as history).
export async function readAllExpenses(): Promise<Expense[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

// Active purchases only. Deleted purchases are hidden from lists and totals.
export async function loadExpenses(): Promise<Expense[]> {
  return (await readAllExpenses()).filter((e) => !e.deletedAt);
}

export async function loadDeletedExpenses(): Promise<Expense[]> {
  return (await readAllExpenses()).filter((e) => !!e.deletedAt);
}

export async function saveExpenses(expenses: Expense[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

// Delete keeps the purchase in history. It can be restored later.
export async function softDeleteExpense(id: string): Promise<void> {
  const all = await readAllExpenses();
  await saveExpenses(all.map((e) => (e.id === id ? { ...e, deletedAt: new Date().toISOString() } : e)));
}

export async function restoreExpense(id: string): Promise<void> {
  const all = await readAllExpenses();
  await saveExpenses(all.map((e) => (e.id === id ? { ...e, deletedAt: undefined } : e)));
}

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

// Display only. Balances are never computed here.
export function formatUSD(amount: number): string {
  return usd.format(amount);
}

// Purchases are shown with a true minus sign and a "Purchase" label.
// Spending is not an error, so no danger color is applied.
export function formatSignedPurchase(amount: number): string {
  return `−${usd.format(amount)}`;
}

export function sumExpenses(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function totalsByCategory(expenses: Expense[]): Record<string, number> {
  return expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
}

// Categories the user adds themselves. Saved on this device.
const CUSTOM_CATEGORY_KEY = 'custom_categories';

export async function loadCustomCategories(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(CUSTOM_CATEGORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function addCustomCategory(name: string): Promise<void> {
  const list = await loadCustomCategories();
  const clean = name.trim().slice(0, 24);
  if (!clean || list.includes(clean) || (CATEGORY_NAMES as readonly string[]).includes(clean)) return;
  await AsyncStorage.setItem(CUSTOM_CATEGORY_KEY, JSON.stringify([...list, clean]));
}

// Icon and color for any category, including custom ones.
export function categoryIcon(name: string): any {
  return CATEGORY_ICONS[name] ?? CubeIcon;
}

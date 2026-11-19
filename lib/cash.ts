import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Expense } from './expenses';

// Cash withdrawals and cash on hand. Demo only, stored on this device.
export type Withdrawal = {
  id: string;
  fromAccountId: string;
  fromName: string;      // e.g. "Checking ····4821"
  amount: number;
  note?: string;         // e.g. "groceries cash"
  date: string;          // "Nov 18"
  at: string;            // ISO time
};

const KEY = 'cash_withdrawals';

export async function loadWithdrawals(): Promise<Withdrawal[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function addWithdrawal(w: Omit<Withdrawal, 'id' | 'at' | 'date'>): Promise<Withdrawal> {
  const list = await loadWithdrawals();
  const now = new Date();
  const item: Withdrawal = {
    ...w,
    id: `w-${now.getTime()}`,
    at: now.toISOString(),
    date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  };
  await AsyncStorage.setItem(KEY, JSON.stringify([...list, item]));
  return item;
}

// Change the amount of a withdrawal. The bank account is adjusted by the difference.
export async function updateWithdrawal(id: string, newAmount: number): Promise<void> {
  const { adjustDemoCashBalance } = await import('./accounts');
  const list = await loadWithdrawals();
  const old = list.find((w) => w.id === id);
  if (!old) return;
  await adjustDemoCashBalance(old.fromAccountId, old.amount - newAmount);
  await AsyncStorage.setItem(KEY, JSON.stringify(list.map((w) => (w.id === id ? { ...w, amount: newAmount } : w))));
}

// Delete a withdrawal. The money goes back to the bank account.
export async function deleteWithdrawal(id: string): Promise<void> {
  const { adjustDemoCashBalance } = await import('./accounts');
  const list = await loadWithdrawals();
  const old = list.find((w) => w.id === id);
  if (!old) return;
  await adjustDemoCashBalance(old.fromAccountId, old.amount);
  await AsyncStorage.setItem(KEY, JSON.stringify(list.filter((w) => w.id !== id)));
}

// Cash on hand = money taken out of the bank, minus cash spent (purchases tagged "Cash").
export function cashOnHand(withdrawals: Withdrawal[], expenses: Expense[]): number {
  const withdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);
  const spent = expenses
    .filter((e) => !e.deletedAt && e.note.startsWith('Cash'))
    .reduce((sum, e) => sum + e.amount, 0);
  return Math.round((withdrawn - spent) * 100) / 100;
}

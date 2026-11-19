import type { Expense } from './expenses';

// Double-subscription check. A subscription is a purchase tagged "Subscription"
// (for example StreamPlus, Disney+, or a gym). Names are compared loosely, so
// "Disney+" and "disney plus" count as the same service.

const MONTH_OF = (date: string) => date.split(' ')[0]; // "Nov 14" -> "Nov"

export function normalizeServiceName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\+/g, ' plus ')
    .replace(/[^a-z]/g, '');
}

export function isSubscription(e: Expense): boolean {
  return e.note.toLowerCase().includes('subscription');
}

export function currentMonthShort(now = new Date()): string {
  return now.toLocaleDateString('en-US', { month: 'short' });
}

// Active (not deleted) subscription purchases only.
function activeSubscriptions(expenses: Expense[]): Expense[] {
  return expenses.filter((e) => !e.deletedAt && isSubscription(e));
}

// Finds a subscription already paid this month that matches the name being saved.
export function findPaidThisMonth(expenses: Expense[], name: string, now = new Date()): Expense | undefined {
  const key = normalizeServiceName(name);
  if (!key) return undefined;
  const month = currentMonthShort(now);
  return activeSubscriptions(expenses).find(
    (e) => normalizeServiceName(e.name) === key && MONTH_OF(e.date) === month,
  );
}

// The individual charges behind each duplicate, newest first. Used when the card is opened.
export function listDuplicateCharges(expenses: Expense[]): Expense[] {
  const dups = findDuplicateSubscriptions(expenses);
  const keys = new Set(dups.map((d) => `${normalizeServiceName(d.name)}|${d.month}`));
  return activeSubscriptions(expenses)
    .filter((e) => keys.has(`${normalizeServiceName(e.name)}|${MONTH_OF(e.date)}`))
    .reverse();
}

// Services charged more than once in the same month.
export type DuplicateSubscription = { name: string; month: string; count: number; total: number };

export function findDuplicateSubscriptions(expenses: Expense[]): DuplicateSubscription[] {
  const groups = new Map<string, { name: string; month: string; count: number; total: number }>();
  activeSubscriptions(expenses).forEach((e) => {
    const month = MONTH_OF(e.date);
    const key = `${normalizeServiceName(e.name)}|${month}`;
    const g = groups.get(key) ?? { name: e.name, month, count: 0, total: 0 };
    g.count += 1;
    g.total += e.amount;
    groups.set(key, g);
  });
  return Array.from(groups.values()).filter((g) => g.count > 1);
}

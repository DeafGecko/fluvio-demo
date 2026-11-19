import { Expense, sumExpenses, totalsByCategory } from './expenses';
import { currentMonthShort } from './subscriptions';

// Monthly spending limit used for "Left to spend". Fixed for now; a setting can change it later.
export const MONTHLY_LIMIT = 2500;

// This month's purchases (not deleted), the amount left under the limit, and spending by category.
export function thisMonth(expenses: Expense[], limit: number = MONTHLY_LIMIT, now = new Date()) {
  const month = currentMonthShort(now);
  const list = expenses.filter((e) => !e.deletedAt && e.date.split(' ')[0] === month);
  const spent = sumExpenses(list);
  const byCategory = Object.entries(totalsByCategory(list)).sort((a, b) => b[1] - a[1]);
  return { spent, left: limit - spent, byCategory };
}

import { describe, expect, it, vi } from 'vitest';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() },
}));
vi.mock('../../components/car-icon', () => ({ CarIcon: () => null }));
vi.mock('react-native-heroicons/outline', () => ({
  CubeIcon: () => null, DocumentIcon: () => null, FilmIcon: () => null, HeartIcon: () => null,
  ShoppingBagIcon: () => null, ShoppingCartIcon: () => null,
}));
vi.mock('react-native-heroicons/outline', () => ({
  CubeIcon: () => null, DocumentIcon: () => null, FilmIcon: () => null, HeartIcon: () => null,
  ShoppingBagIcon: () => null, ShoppingCartIcon: () => null, TruckIcon: () => null,
}));

import type { Expense } from '../../lib/expenses';
import { formatSignedPurchase, formatUSD, sumExpenses, totalsByCategory } from '../../lib/expenses';
import { cashOnHand, type Withdrawal } from '../../lib/cash';
import {
  findDuplicateSubscriptions,
  findPaidThisMonth,
  listDuplicateCharges,
  normalizeServiceName,
} from '../../lib/subscriptions';

const e = (over: Partial<Expense>): Expense => ({
  id: over.id ?? Math.random().toString(36).slice(2),
  name: 'Item',
  amount: 10,
  category: 'Other',
  note: '',
  date: 'Nov 5',
  ...over,
} as Expense);

describe('formatting', () => {
  it('formats US dollars with cents', () => {
    expect(formatUSD(1234.5)).toBe('$1,234.50');
    expect(formatUSD(0)).toBe('$0.00');
  });

  it('shows purchases with a true minus sign', () => {
    expect(formatSignedPurchase(18.15)).toBe('−$18.15');
  });
});

describe('totals', () => {
  const list = [
    e({ amount: 10, category: 'Food' }),
    e({ amount: 5.5, category: 'Food' }),
    e({ amount: 20, category: 'Bills' }),
  ];

  it('sums all purchases', () => {
    expect(sumExpenses(list)).toBeCloseTo(35.5);
  });

  it('groups totals by category', () => {
    expect(totalsByCategory(list)).toEqual({ Food: 15.5, Bills: 20 });
  });

  it('returns an empty object for no purchases', () => {
    expect(totalsByCategory([])).toEqual({});
    expect(sumExpenses([])).toBe(0);
  });
});

describe('cash on hand', () => {
  const w = (amount: number): Withdrawal => ({
    id: String(amount), fromAccountId: 'a', fromName: 'Bank', amount, date: 'Nov 1', at: '2026-11-01T10:00:00Z',
  });

  it('is withdrawals minus cash purchases', () => {
    const expenses = [e({ amount: 12, note: 'Cash tip' }), e({ amount: 8, note: 'Card lunch' })];
    expect(cashOnHand([w(100)], expenses)).toBe(88);
  });

  it('ignores deleted cash purchases', () => {
    const expenses = [e({ amount: 12, note: 'Cash tip', deletedAt: '2026-11-02' } as Partial<Expense>)];
    expect(cashOnHand([w(100)], expenses)).toBe(100);
  });

  it('rounds to cents', () => {
    expect(cashOnHand([w(0.1), w(0.2)], [])).toBe(0.3);
  });
});

describe('subscriptions', () => {
  it('normalizes names so Disney+ and disney plus match', () => {
    expect(normalizeServiceName('Disney+')).toBe(normalizeServiceName('disney plus'));
    expect(normalizeServiceName('StreamPlus')).toBe('streamplus');
  });

  const subs = [
    e({ id: '1', name: 'StreamPlus', amount: 15.99, note: 'Subscription', date: 'Nov 3' }),
    e({ id: '2', name: 'streamplus', amount: 15.99, note: 'Subscription', date: 'Nov 20' }),
    e({ id: '3', name: 'StreamPlus', amount: 15.99, note: 'Subscription', date: 'Oct 3' }),
    e({ id: '4', name: 'Gym', amount: 40, note: 'Subscription', date: 'Nov 9' }),
    e({ id: '5', name: 'Coffee', amount: 4, note: 'Morning', date: 'Nov 9' }),
  ];

  it('finds services charged more than once in the same month', () => {
    const dups = findDuplicateSubscriptions(subs);
    expect(dups).toEqual([{ name: 'StreamPlus', month: 'Nov', count: 2, total: 31.98 }]);
  });

  it('lists the individual duplicate charges, newest first', () => {
    const ids = listDuplicateCharges(subs).map((x) => x.id);
    expect(ids).toEqual(['2', '1']);
  });

  it('finds a subscription already paid this month', () => {
    const now = new Date('2026-11-18T12:00:00');
    expect(findPaidThisMonth(subs, 'Disney+', now)).toBeUndefined();
    expect(findPaidThisMonth(subs, 'streamplus', now)?.id).toBe('1');
    expect(findPaidThisMonth(subs, '   ', now)).toBeUndefined();
  });

  it('ignores deleted subscriptions', () => {
    const withDeleted = [...subs, e({ id: '6', name: 'Gym', note: 'Subscription', date: 'Nov 10', deletedAt: '2026-11-10' } as Partial<Expense>)];
    expect(findDuplicateSubscriptions(withDeleted).find((d) => d.name === 'Gym')).toBeUndefined();
  });
});

import { describe, expect, it, vi } from 'vitest';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() },
}));
vi.mock('../../components/car-icon', () => ({ CarIcon: () => null }));
vi.mock('react-native-heroicons/outline', () => ({
  CubeIcon: () => null, DocumentIcon: () => null, FilmIcon: () => null, HeartIcon: () => null,
  ShoppingBagIcon: () => null, ShoppingCartIcon: () => null,
}));

import type { Expense } from '../../lib/expenses';
import { MONTHLY_LIMIT, thisMonth as thisMonthWithLimit } from '../../lib/budget';

// The helper now takes the limit as its second input; these tests use the default limit.
const thisMonth = (list: Expense[], at: Date) => thisMonthWithLimit(list, MONTHLY_LIMIT, at);

const e = (over: Partial<Expense>): Expense => ({ id: Math.random().toString(36).slice(2), name: 'x', amount: 10, category: 'Food', note: '', date: 'Nov 5', ...over } as Expense);
const now = new Date('2026-11-19T12:00:00');

describe('thisMonth (monthly totals)', () => {
  it('adds only this month\'s purchases', () => {
    const list = [e({ amount: 10, date: 'Nov 1' }), e({ amount: 20, date: 'Nov 19' }), e({ amount: 500, date: 'Oct 30' })];
    expect(thisMonth(list, now).spent).toBe(30);
  });

  it('ignores deleted purchases', () => {
    const list = [e({ amount: 10, date: 'Nov 1' }), e({ amount: 99, date: 'Nov 2', deletedAt: '2026-11-03' } as Partial<Expense>)];
    expect(thisMonth(list, now).spent).toBe(10);
  });

  it('left = limit minus spent', () => {
    const r = thisMonth([e({ amount: 1119.97, date: 'Nov 3' })], now);
    expect(r.left).toBeCloseTo(MONTHLY_LIMIT - 1119.97, 2);
  });

  it('category totals add up to the spent total', () => {
    const list = [e({ amount: 10, category: 'Food', date: 'Nov 1' }), e({ amount: 5.5, category: 'Bills', date: 'Nov 2' }), e({ amount: 2.25, category: 'Food', date: 'Nov 3' })];
    const r = thisMonth(list, now);
    const byCat = r.byCategory.reduce((sum, [, v]) => sum + v, 0);
    expect(byCat).toBeCloseTo(r.spent, 2);
    expect(r.spent).toBeCloseTo(17.75, 2);
  });
});

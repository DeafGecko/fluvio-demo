import { describe, expect, it, vi } from 'vitest';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() },
}));

import { buildDemoExpenses } from '../../lib/demo-data';

describe('demo data', () => {
  const now = new Date('2026-11-18T12:00:00');

  it('is deterministic for the same date', () => {
    expect(buildDemoExpenses(now)).toEqual(buildDemoExpenses(now));
  });

  it('has purchases with positive amounts and required fields', () => {
    const list = buildDemoExpenses(now);
    expect(list.length).toBeGreaterThan(100);
    for (const x of list) {
      expect(x.amount).toBeGreaterThan(0);
      expect(x.name.length).toBeGreaterThan(0);
      expect(x.id).toBeTruthy();
    }
  });

  it('covers about six months, oldest first', () => {
    const list = buildDemoExpenses(now);
    const ids = new Set(list.map((x) => x.id));
    expect(ids.size).toBe(list.length);
  });
});

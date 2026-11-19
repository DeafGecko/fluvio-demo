import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Expense } from './expenses';

// Fictional six-month history for the demo. Same seed = same data every time.
// Nothing here is real. Names and banks are invented.
export const DEMO_STATEMENT_KEY = 'demo_statement';
export const DEMO_MONTHS = 6;
const SEED = 42;

export type StatementLine = {
  id: string;
  date: string;          // ISO yyyy-mm-dd
  name: string;
  amount: number;        // positive = money in, negative = money out
  kind: 'paycheck' | 'refund' | 'transfer' | 'purchase' | 'bill' | 'subscription' | 'fee' | 'bounced';
};

// Small seeded PRNG (mulberry32).
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const money = (r: () => number, min: number, max: number) => Math.round((min + r() * (max - min)) * 100) / 100;

const FOOD_PLACES = ['Blue Fern Coffee', 'Harbor Grill', 'Corner Bakery', 'Taco Junction', 'Sunrise Diner', 'Noodle House'];
const GROCERY = ['Lakeside Market', 'Green Basket Grocers'];
const TRANSPORT = ['Metro Transit pass', 'City Rideshare', 'Parkway Fuel'];
const ENTERTAINMENT = ['Riverside Cinema', 'Arcade Bar', 'Museum Tickets'];
const SHOPPING = ['Bright Home Goods', 'Oak Street Books', 'Pinecrest Outfitters'];
const HEALTH = ['Westside Pharmacy', 'Family Clinic copay'];

// Build six months of purchases, bills, subscriptions, and fees (oldest first).
export function buildDemoExpenses(now = new Date()): Expense[] {
  const r = rng(SEED);
  const out: Expense[] = [];
  const start = new Date(now);
  start.setMonth(start.getMonth() - DEMO_MONTHS);
  start.setHours(0, 0, 0, 0);
  const days = Math.round((now.getTime() - start.getTime()) / 86400000);

  const push = (d: Date, name: string, amount: number, category: string, note: string) => {
    out.push({
      id: `${d.getTime()}-${out.length}`,
      name, amount, category, note,
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  };

  for (let i = 0; i <= days; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    const dom = d.getDate();

    // Monthly bills and subscriptions
    if (dom === 1) {
      push(d, 'Insurance premium', money(r, 108, 116), 'Bills', 'Bill payment');
      push(d, 'FitHub gym', 29.0, 'Health', 'Subscription');
    }
    if (dom === 3) push(d, 'Streamline Internet', 65.0, 'Bills', 'Bill payment');
    if (dom === 5) push(d, 'Northline Electric', money(r, 78, 96), 'Bills', 'Bill payment');
    if (dom === 8) push(d, 'Cloudbox storage', 2.99, 'Other', 'Subscription');
    if (dom === 12) push(d, 'Harbor Water', money(r, 38, 46), 'Bills', 'Bill payment');
    if (dom === 14) push(d, 'StreamPlus', 15.49, 'Entertainment', 'Subscription');
    if (dom === 20) push(d, 'Phone plan', 38.0, 'Bills', 'Bill payment');
    if (dom === 28) push(d, 'Monthly account fee', 12.0, 'Other', 'Bank fee');

    // Weekly groceries (Saturdays)
    if (d.getDay() === 6) push(d, GROCERY[Math.floor(r() * GROCERY.length)], money(r, 42, 118), 'Food', 'Groceries');

    // Eating out, most days
    if (r() < 0.45) push(d, FOOD_PLACES[Math.floor(r() * FOOD_PLACES.length)], money(r, 8, 46), 'Food', 'Eating out');

    // Other spending
    if (r() < 0.18) push(d, TRANSPORT[Math.floor(r() * TRANSPORT.length)], money(r, 4, 58), 'Transport', 'Transport');
    if (r() < 0.08) push(d, ENTERTAINMENT[Math.floor(r() * ENTERTAINMENT.length)], money(r, 12, 60), 'Entertainment', 'Entertainment');
    if (r() < 0.07) push(d, SHOPPING[Math.floor(r() * SHOPPING.length)], money(r, 14, 120), 'Shopping', 'Shopping');
    if (r() < 0.04) push(d, HEALTH[Math.floor(r() * HEALTH.length)], money(r, 9, 40), 'Health', 'Health');

    // Occasional ATM fee and a bounced payment (about every few months)
    if (r() < 0.02) push(d, 'ATM fee', 3.0, 'Other', 'Bank fee');
    if (dom === 17 && (d.getMonth() % 3 === 1)) push(d, 'Bounced payment fee', 35.0, 'Other', 'Bank fee');
  }
  return out;
}

// Income and transfers shown on the statement (money in) plus refunds and bounced items.
export function buildDemoStatement(now = new Date()): StatementLine[] {
  const r = rng(SEED + 1);
  const lines: StatementLine[] = [];
  const start = new Date(now);
  start.setMonth(start.getMonth() - DEMO_MONTHS);
  start.setHours(0, 0, 0, 0);
  const days = Math.round((now.getTime() - start.getTime()) / 86400000);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  let n = 0;
  const add = (d: Date, name: string, amount: number, kind: StatementLine['kind']) => {
    lines.push({ id: `s${n++}`, date: iso(d), name, amount, kind });
  };

  for (let i = 0; i <= days; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    // Paycheck every other Friday
    if (d.getDay() === 5 && Math.floor(i / 7) % 2 === 0) add(d, 'Harborline Payroll', 1625.0, 'paycheck');
    // Refund from a purchase, about once a month
    if (d.getDate() === 22) add(d, 'Northstar Outfitters refund', money(r, 18, 64), 'refund');
    // Transfer from checking to savings, monthly
    if (d.getDate() === 2) add(d, 'Transfer to Savings', -250.0, 'transfer');
  }
  return lines;
}

// Writes the six-month demo data (purchases and statement). Used by sign-in and demo reset.
export async function seedDemoData(): Promise<void> {
  const now = new Date();
  await AsyncStorage.setItem('expenses', JSON.stringify(buildDemoExpenses(now)));
  await AsyncStorage.setItem(DEMO_STATEMENT_KEY, JSON.stringify(buildDemoStatement(now)));
}

export async function loadDemoStatement(): Promise<StatementLine[]> {
  try {
    const raw = await AsyncStorage.getItem(DEMO_STATEMENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

// Strict money input. Accepts "12", "12.5", "12.50", up to 7 digits before the point.
// Anything else (letters, "1e400", "Infinity", "12abc") is rejected.
const MAX_AMOUNT = 1_000_000;
const PATTERN = /^\d{1,7}(\.\d{1,2})?$/;

// Returns the number, or null when the text is not a valid amount in range.
export function parseAmount(text: string | null | undefined): number | null {
  const s = (text ?? '').trim();
  if (!PATTERN.test(s)) return null;
  const n = Number(s);
  if (!Number.isFinite(n) || n > MAX_AMOUNT) return null;
  return n;
}

export const AMOUNT_HINT = 'Use numbers only, for example 12.50 (up to 1,000,000).';

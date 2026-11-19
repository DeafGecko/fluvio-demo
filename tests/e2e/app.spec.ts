import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Skip the first-run flow: mark the device as onboarded before the app loads.
async function onboard(page: Page) {
  await page.addInitScript(() => {
    try { window.localStorage.setItem('onboarded', 'true'); } catch {}
  });
}

// Home is ready when its heading shows. If the device is empty, load the demo data first.
async function openHomeWithDemo(page: Page) {
  await expect(page.getByRole('heading', { name: 'Your money today' })).toBeVisible({ timeout: 30_000 });
  const load = page.getByRole('button', { name: 'Load demo data' });
  if (await load.isVisible({ timeout: 3_000 }).catch(() => false)) await load.click();
  await expect(page.getByText('Left to spend')).toBeVisible({ timeout: 30_000 });
  // Purchase rows fade in after load. Wait for them so contrast checks see the final colors.
  await expect.poll(() => page.evaluate(() => {
    const rows = [...document.querySelectorAll('div')].filter((d) => d.textContent?.startsWith('Purchase ·'));
    return rows.every((row) => {
      for (let n: HTMLElement | null = row; n; n = n.parentElement) {
        if (getComputedStyle(n).opacity !== '1') return false;
      }
      return true;
    });
  }), { timeout: 10_000 }).toBe(true);
}

test.describe('app (web build)', () => {
  test('first run shows the welcome screen', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/welcome$/, { timeout: 30_000 });
    await expect(page.getByText('Welcome to Fluvio', { exact: true })).toBeVisible({ timeout: 30_000 });
  });

  test('home screen loads after onboarding', async ({ page }) => {
    await onboard(page);
    await page.goto('/');
    await openHomeWithDemo(page);
  });

  test('monthly limit can be changed from the Spend card', async ({ page }) => {
    await onboard(page);
    await page.goto('/');
    await openHomeWithDemo(page);
    await page.getByRole('button', { name: 'Edit limit' }).click();
    // Type with the on-screen keypad: clear the old amount, then 3000.
    for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Delete digit' }).click();
    for (const k of ['3', '0', '0', '0']) await page.getByRole('button', { name: k, exact: true }).click();
    await page.getByRole('button', { name: 'Save monthly limit' }).click();
    await expect(page.getByText(/of \$3,000\.00 limit used this month/)).toBeVisible({ timeout: 10_000 });
  });

  test('two-tap logging saves a purchase from the quick add sheet', async ({ page }) => {
    await onboard(page);
    await page.goto('/');
    await openHomeWithDemo(page);
    const before = await page.evaluate(() => JSON.parse(localStorage.getItem('expenses') || '[]').length);
    await page.getByRole('button', { name: 'Add expense' }).first().click();
    for (const key of ['1', '2', '.', '5', '0']) {
      await page.getByRole('button', { name: key, exact: true }).click();
    }
    await page.getByRole('button', { name: 'Save as Food' }).click();
    await expect(page.getByRole('button', { name: 'Save as Food' })).toBeHidden({ timeout: 10_000 });
    const after = await page.evaluate(() => {
      const list = JSON.parse(localStorage.getItem('expenses') || '[]');
      return { count: list.length, last: list[list.length - 1] };
    });
    expect(after.count).toBe(before + 1);
    expect(after.last.amount).toBe(12.5);
    expect(after.last.category).toBe('Food');
  });

  test('every tab opens its screen', async ({ page }) => {
    await onboard(page);
    await page.goto('/');
    await openHomeWithDemo(page);
    await page.getByRole('tab', { name: 'Activity' }).click();
    await expect(page.getByRole('tab', { name: 'Activity' })).toHaveAttribute('aria-selected', 'true');
    await page.getByRole('tab', { name: 'Insights' }).click();
    await expect(page.getByRole('tab', { name: 'Insights' })).toHaveAttribute('aria-selected', 'true');
    await page.getByRole('tab', { name: 'Accounts' }).click();
    await expect(page.getByRole('tab', { name: 'Accounts' })).toHaveAttribute('aria-selected', 'true');
    await page.getByRole('tab', { name: 'Home' }).click();
    await expect(page.getByRole('heading', { name: 'Your money today' })).toBeVisible();
  });

  test('insights shows the shortened stat labels', async ({ page }) => {
    await onboard(page);
    await page.goto('/');
    await openHomeWithDemo(page);
    await page.getByRole('tab', { name: 'Insights' }).click();
    await expect(page.getByText('Spent in ' + new Date().toLocaleDateString('en-US', { month: 'long' }), { exact: true })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('Top spend', { exact: true })).toBeVisible();
    await expect(page.getByText('Total logged', { exact: true })).toHaveCount(0);
  });

  test('home has no detectable accessibility violations (WCAG 2.1 AA)', async ({ page }) => {
    await onboard(page);
    await page.goto('/');
    await openHomeWithDemo(page);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
  });
});

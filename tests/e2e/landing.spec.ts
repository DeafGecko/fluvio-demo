import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('landing page (demo.html)', () => {
  test('shows brand, phone preview and switch on desktop', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop layout only');
    await page.goto('/demo.html');
    await expect(page.getByRole('heading', { name: 'Fluvio' })).toBeVisible();
    await expect(page.locator('.phone')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Mobile' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tablet' })).toBeVisible();
  });

  test('phone-width screens show the See full screen button, not the mockup', async ({ page, isMobile }) => {
    test.skip(isMobile, 'uses its own viewport');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/demo.html');
    await expect(page.getByRole('link', { name: 'See full screen' })).toBeVisible();
    await expect(page.locator('.phone')).toBeHidden();
  });

  test('Tablet switch changes the frame aspect ratio', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop layout only');
    await page.goto('/demo.html');
    await page.getByRole('button', { name: 'Tablet' }).click();
    await expect(page.locator('.phone')).toHaveClass(/tablet/);
  });

  test('has no detectable accessibility violations (WCAG 2.1 AA)', async ({ page }) => {
    await page.goto('/demo.html');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });

  test('loads without page errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/demo.html');
    await page.waitForLoadState('load');
    expect(errors).toEqual([]);
  });
});

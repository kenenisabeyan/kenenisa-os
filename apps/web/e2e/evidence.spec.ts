import { test, expect } from '@playwright/test';

test.describe('Evidence Vault & Weekly Reviews E2E Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'kenenisa@kenenisa-os.internal');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/app/dashboard');
  });

  test('navigates to Evidence Vault, creates evidence record, and views details', async ({ page }) => {
    await page.click('a[href="/app/evidence"]');
    await expect(page).toHaveURL('/app/evidence');
    await expect(page.locator('h1')).toContainText('Evidence Vault');

    await page.click('button:has-text("+ Add Evidence")');
    await page.fill('input[placeholder*="Planning Engine"]', 'Playwright Test Evidence Artifact');
    await page.fill('textarea', 'E2E test demonstrating evidence creation');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Playwright Test Evidence Artifact')).toBeVisible();
  });

  test('navigates to Reviews page and views factual weekly context summary', async ({ page }) => {
    await page.click('a[href="/app/reviews"]');
    await expect(page).toHaveURL('/app/reviews');
    await expect(page.locator('h1')).toContainText('Engineering Feedback');

    await expect(page.locator('text=Factual Summary')).toBeVisible();
    await expect(page.locator('text=Completed Tasks')).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('Opportunities & Career Execution Engine E2E Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'kenenisa@kenenisa-os.internal');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/app/dashboard');
  });

  test('navigates to Opportunities page, creates career opportunity, and views details', async ({ page }) => {
    await page.click('a[href="/app/opportunities"]');
    await expect(page).toHaveURL('/app/opportunities');
    await expect(page.locator('h1')).toContainText('Career Execution & Opportunities');

    await page.click('button#add-opportunity-btn');
    await page.fill('input[placeholder*="Senior Backend Engineer"]', 'Playwright E2E Freelance API Opportunity');
    await page.fill('input[placeholder*="Acme Inc"]', 'Playwright Test Client');
    await page.fill('textarea', 'E2E test opportunity for career pipeline verification');
    await page.click('button[type="submit"]');

    // Should redirect to opportunity detail page
    await expect(page).toHaveURL(/\/app\/opportunities\/cm/);
    await expect(page.locator('h1')).toContainText('Playwright E2E Freelance API Opportunity');
    await expect(page.locator('text=Playwright Test Client')).toBeVisible();

    // Verify workspace tabs and relationship linkers
    await expect(page.locator('button:has-text("Linked Skills")')).toBeVisible();
    await expect(page.locator('button:has-text("Linked Projects")')).toBeVisible();
    await expect(page.locator('button:has-text("Linked Evidence")')).toBeVisible();
    await expect(page.locator('button:has-text("Linked Tasks")')).toBeVisible();
    await expect(page.locator('button:has-text("Activity Timeline")')).toBeVisible();
  });
});

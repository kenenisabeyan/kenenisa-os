import { test, expect } from '@playwright/test';

test.describe('Analytics & Personal Operating Intelligence E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'kenenisa@kenenisa-os.internal');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/app/dashboard');
  });

  test('navigates to Analytics control center and inspects deterministic metrics', async ({ page }) => {
    await page.click('a[href="/app/analytics"]');
    await expect(page).toHaveURL('/app/analytics');
    await expect(page.locator('h1')).toContainText('Personal Operating Intelligence');

    await expect(page.locator('#analytics-page')).toBeVisible();
    await expect(page.locator('text=Tasks Completed')).toBeVisible();
    await expect(page.locator('text=Planned Capacity')).toBeVisible();
    await expect(page.locator('text=Learning Logged')).toBeVisible();
    await expect(page.locator('text=Evidence Produced')).toBeVisible();

    // Switch periods
    await page.click('#period-btn-week');
    await page.waitForTimeout(300);

    // Switch tabs
    await page.click('#tab-projects');
    await expect(page.locator('text=Projects Analytics')).toBeVisible();

    await page.click('#tab-workstreams');
    await expect(page.locator('text=Workstream Resource & Output Allocation')).toBeVisible();

    await page.click('#tab-learning');
    await expect(page.locator('text=Skill Capabilities')).toBeVisible();

    await page.click('#tab-history');
    await expect(page.locator('text=Historical Weekly Operating Snapshots')).toBeVisible();
  });
});

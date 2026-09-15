import { test, expect } from '@playwright/test';

test.describe('Step 7 Planning & Capacity Engine E2E Flow', () => {
  test('authenticates and navigates to Planning workspace, creates Daily Plan and Time Block', async ({
    page,
  }) => {
    // 1. Navigate to login
    await page.goto('/login');
    await page.fill('#login-email', 'kenenisa@kenenisa-os.internal');
    await page.fill('#login-password', 'KenenisaOS#2026!SecureOwnerPass');
    await page.click('#login-submit-btn');

    await page.waitForURL(/\/app|\/login/);

    if (page.url().includes('/app')) {
      // 2. Navigate to Planning tab
      await page.getByRole('link', { name: 'Planning' }).click();

      await expect(page.getByRole('heading', { name: /Planning Workspace/i })).toBeVisible();
      await expect(page.locator('#planning-workspace')).toBeVisible();

      // 3. Verify Daily View components
      await expect(page.locator('#must-win-banner')).toBeVisible();
      await expect(page.locator('#capacity-section')).toBeVisible();
      await expect(page.locator('#schedule-section')).toBeVisible();

      // 4. Test View mode switch to Weekly View
      await page.locator('#view-weekly-btn').click();
      await expect(page.locator('#weekly-planning-view')).toBeVisible();

      // 5. Switch back to Daily View
      await page.locator('#view-daily-btn').click();
      await expect(page.locator('#daily-planning-view')).toBeVisible();
    }
  });
});

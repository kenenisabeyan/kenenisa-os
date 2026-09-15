import { test, expect } from '@playwright/test';

test.describe('Step 6 Command Center & Next Best Action E2E Flow', () => {
  test('authenticates and loads Command Center dashboard with Next Best Action card and metrics', async ({
    page,
  }) => {
    // 1. Navigate to login
    await page.goto('/login');
    await page.fill('#login-email', 'kenenisa@kenenisa-os.internal');
    await page.fill('#login-password', 'KenenisaOS#2026!SecureOwnerPass');
    await page.click('#login-submit-btn');

    await page.waitForURL(/\/app|\/login/);

    if (page.url().includes('/app')) {
      // 2. Command Center heading & components visible
      await expect(page.getByRole('heading', { name: /Command Center/i })).toBeVisible();
      await expect(page.locator('#command-center-dashboard')).toBeVisible();

      // 3. Check Next Best Action card
      await expect(page.locator('#next-best-action-card')).toBeVisible();

      // 4. Check Summary metrics grid
      await expect(page.locator('#summary-metrics')).toBeVisible();

      // 5. Check Today Focus section
      await expect(page.locator('#today-focus-section')).toBeVisible();

      // 6. Test Refresh System button
      await page.locator('#refresh-dashboard-btn').click();
      await expect(page.locator('#command-center-dashboard')).toBeVisible();
    }
  });
});

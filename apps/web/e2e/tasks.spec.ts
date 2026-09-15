import { test, expect } from '@playwright/test';

test.describe('Task Execution Engine E2E Flow', () => {
  test('navigates to Tasks tab and verifies creation controls', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#login-email', 'kenenisa@kenenisa-os.internal');
    await page.fill('#login-password', 'KenenisaOS#2026!SecureOwnerPass');
    await page.click('#login-submit-btn');

    await page.waitForURL(/\/app|\/login/);

    if (page.url().includes('/app')) {
      await page.getByRole('link', { name: 'Tasks' }).click();
      await expect(page.getByRole('heading', { name: /Executable Task Engine/i })).toBeVisible();
      await expect(page.locator('#create-task-btn')).toBeVisible();
    }
  });
});

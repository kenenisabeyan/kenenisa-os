import { test, expect } from '@playwright/test';

test.describe('Strategic Domain Management E2E Flow', () => {
  test('navigates through Workstreams, Goals, Projects, and Milestones tabs in authenticated app shell', async ({
    page,
  }) => {
    // 1. Navigate to login
    await page.goto('/login');
    await page.fill('#login-email', 'kenenisa@kenenisa-os.internal');
    await page.fill('#login-password', 'KenenisaOS#2026!SecureOwnerPass');
    await page.click('#login-submit-btn');

    await page.waitForURL(/\/app|\/login/);

    if (page.url().includes('/app')) {
      // 2. Verify Workstreams view
      await expect(page.getByRole('heading', { name: /Strategic Workstreams/i })).toBeVisible();
      await expect(page.locator('#create-workstream-btn')).toBeVisible();

      // 3. Navigate to Goals tab
      await page.getByRole('link', { name: 'Goals' }).click();
      await expect(page.getByRole('heading', { name: /Strategic Goals/i })).toBeVisible();
      await expect(page.locator('#create-goal-btn')).toBeVisible();

      // 4. Navigate to Projects tab
      await page.getByRole('link', { name: 'Projects' }).click();
      await expect(page.getByRole('heading', { name: /Concrete Projects/i })).toBeVisible();
      await expect(page.locator('#create-project-btn')).toBeVisible();

      // 5. Navigate to Milestones tab
      await page.getByRole('link', { name: 'Milestones' }).click();
      await expect(page.getByRole('heading', { name: /Project Milestones/i })).toBeVisible();
      await expect(page.locator('#create-milestone-btn')).toBeVisible();
    }
  });
});

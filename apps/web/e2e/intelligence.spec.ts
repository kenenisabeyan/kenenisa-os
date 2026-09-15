import { test, expect } from '@playwright/test';

test.describe('Intelligence Core (Step 12) E2E Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'kenenisa@kenenisa-os.internal');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/app/dashboard');
  });

  test('navigates to Intelligence workspace, sends chat query, and verifies contextual response', async ({ page }) => {
    await page.click('a[href="/app/intelligence"]');
    await expect(page).toHaveURL('/app/intelligence');
    await expect(page.locator('h1')).toContainText('KENENISA OS Intelligence Core');

    // Type query and submit
    await page.fill('input#intelligence-chat-input', 'What is my next best action today?');
    await page.click('button[type="submit"]');

    // Verify response message appears
    await expect(page.locator('text=KENENISA OS Intelligence')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Next Best Action')).toBeVisible();

    // Verify Memory Drawer button
    await page.click('button:has-text("Operating Memory")');
    await expect(page.locator('h2:has-text("Personal Operating Memory")')).toBeVisible();
    await page.click('button:has-text("Close")');
  });
});

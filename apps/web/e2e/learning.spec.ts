import { test, expect } from '@playwright/test';

test.describe('Learning & Skills Workspace E2E Specification', () => {
  test('navigates to Learning workspace and loads items dashboard', async ({ page }) => {
    await page.goto('/app/learning');

    await expect(page).toHaveURL(/.*\/app\/learning/);
    await expect(page.getByText('Learning & Capability Intelligence')).toBeVisible();
    await expect(page.getByRole('button', { name: '+ New Learning Item' })).toBeVisible();
  });

  test('navigates to Skills workspace and displays skill matrix', async ({ page }) => {
    await page.goto('/app/skills');

    await expect(page).toHaveURL(/.*\/app\/skills/);
    await expect(page.getByText('Skill Matrix & Capabilities')).toBeVisible();
    await expect(page.getByRole('button', { name: '+ Add Skill' })).toBeVisible();
  });
});

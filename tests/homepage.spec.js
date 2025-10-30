import { test, expect } from '@playwright/test';

test('index.html loads correctly', async ({ page }) => {
  // Navigate to the local server
  await page.goto('http://127.0.0.1:5500');

  // Wait for the page to load completely
  await page.waitForLoadState('networkidle');

  // Check title
  await expect(page).toHaveTitle('Incremental Game');

  // Verify the main game elements are present
  await expect(page.locator('#game-title')).toHaveText('Lineage Incremental');
  await expect(page.locator('#age-title')).toHaveText('Baby');
  await expect(page.locator('#age-points')).toHaveText('Age: 0');
  await expect(page.locator('#gain')).toBeVisible();
});
import { test, expect } from '@playwright/test';

test.describe('Page Load and Initial State', () => {
  test('index.html loads correctly', async ({ page }) => {
    // Navigate to the local server
    await page.goto('http://127.0.0.1:5500');

    // Wait for network idle state
    await page.waitForLoadState('networkidle');

    // Check title
    await expect(page).toHaveTitle('Incremental Game');

    // Verify the main game elements are present
    await expect(page.locator('#game-title')).toHaveText('Lineage Incremental');
    await expect(page.locator('#age-title')).toHaveText('Baby');
    await expect(page.locator('#age-points')).toHaveText('Baby Age: 0');
    await expect(page.locator('#gain')).toBeVisible();
  });

  test('loads correctly in Firefox', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('http://127.0.0.1:5500');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveTitle('Incremental Game');
    await expect(page.locator('#game-title')).toHaveText('Lineage Incremental');
    await expect(page.locator('#age-title')).toHaveText('Baby');
    await expect(page.locator('#age-points')).toHaveText('Baby Age: 0');
    await expect(page.locator('#gain')).toBeVisible();

    await context.close();
  });

  test('loads correctly with slow network', async ({ page }) => {
    // Simulate slow network conditions
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
      await route.continue();
    });

    await page.goto('http://127.0.0.1:5500');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveTitle('Incremental Game');
    await expect(page.locator('#game-title')).toHaveText('Lineage Incremental');
    await expect(page.locator('#age-title')).toHaveText('Baby');
    await expect(page.locator('#age-points')).toHaveText('Baby Age: 0');
    await expect(page.locator('#gain')).toBeVisible();
  });

  test('shows basic HTML when JavaScript is disabled', async ({ page }) => {
    // Disable JavaScript
    await page.route('**/*.js', route => route.abort());

    await page.goto('http://127.0.0.1:5500');
    await page.waitForLoadState('domcontentloaded');

    // Should still show basic HTML structure
    await expect(page.locator('#game-title')).toHaveText('Lineage Incremental');
    await expect(page.locator('#banner')).toBeVisible();

    // JavaScript-dependent elements should not be present or functional
    await expect(page.locator('#age-title')).toHaveText('Infant'); // Default HTML value
    await expect(page.locator('#age-points')).toHaveText('Age: 0'); // Default HTML value
  });
});
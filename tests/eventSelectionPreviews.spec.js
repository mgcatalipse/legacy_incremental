import { test, expect } from '@playwright/test';

test.describe('Event Selection and Stat Previews', () => {
  test('should show agility +5 preview when selecting "Learn to Walk" at age 0', async ({ page }) => {
    // Navigate to the local server
    await page.goto('http://127.0.0.1:5500');

    // Wait for network idle state
    await page.waitForLoadState('networkidle');

    // Verify we're at age 0 (Baby)
    await expect(page.locator('#age-title')).toHaveText('Baby');
    await expect(page.locator('#age-points')).toHaveText('Baby Age: 0');

    // Find and check the "Learn to Walk" checkbox
    const learnToWalkCheckbox = page.locator('input[data-event-id="first_steps"]');
    await expect(learnToWalkCheckbox).toBeVisible();

    // Check the checkbox
    await learnToWalkCheckbox.check();

    // Verify the checkbox is checked
    await expect(learnToWalkCheckbox).toBeChecked();

    // Wait for UI to update after checkbox change
    await page.waitForTimeout(100);

    // Verify agility stat shows +5 preview (base 5 + 5 = 10)
    const agilityStat = page.locator('.stat-item').filter({ hasText: 'Agility:' });
    await expect(agilityStat.locator('.stat-value')).toContainText('10 (+5)');

    // Verify health stat shows -2 preview (base 100 - 2 = 98)
    const healthStat = page.locator('.stat-item').filter({ hasText: 'Health:' });
    await expect(healthStat.locator('.stat-value')).toContainText('98 (-2)');
  });

  test('should handle multiple event selections within limits', async ({ page }) => {
    await page.goto('http://127.0.0.1:5500');
    await page.waitForLoadState('networkidle');

    // Select "Learn to Walk"
    await page.locator('input[data-event-id="first_steps"]').check();
    await page.waitForTimeout(100);

    // Select "First Words" (should be within limit of 1 for baby)
    await page.locator('input[data-event-id="first_words"]').check();
    await page.waitForTimeout(100);

    // Verify both are selected
    await expect(page.locator('input[data-event-id="first_steps"]')).toBeChecked();
    await expect(page.locator('input[data-event-id="first_words"]')).toBeChecked();

    // Verify combined previews: agility +5 (10 total), intelligence +5 (10 total), stress +2 (2 total), health -2 (98 total)
    await expect(page.locator('.stat-item').filter({ hasText: 'Agility:' }).locator('.stat-value')).toContainText('10 (+5)');
    await expect(page.locator('.stat-item').filter({ hasText: 'Intelligence:' }).locator('.stat-value')).toContainText('10 (+5)');
    await expect(page.locator('.stat-item').filter({ hasText: 'Stress:' }).locator('.stat-value')).toContainText('2 (+2)');
    await expect(page.locator('.stat-item').filter({ hasText: 'Health:' }).locator('.stat-value')).toContainText('98 (-2)');
  });

  test('should show penalties when exceeding selection limits', async ({ page }) => {
    await page.goto('http://127.0.0.1:5500');
    await page.waitForLoadState('networkidle');

    // Select "Learn to Walk"
    await page.locator('input[data-event-id="first_steps"]').check();
    await page.waitForTimeout(100);

    // Select "First Words"
    await page.locator('input[data-event-id="first_words"]').check();
    await page.waitForTimeout(100);

    // Select "Enjoy life" (repeatable)
    await page.locator('input[data-event-id="enjoy_life"]').check();
    await page.waitForTimeout(100);

    // Verify all three are selected (exceeding limit of 1)
    await expect(page.locator('input[data-event-id="first_steps"]')).toBeChecked();
    await expect(page.locator('input[data-event-id="first_words"]')).toBeChecked();
    await expect(page.locator('input[data-event-id="enjoy_life"]')).toBeChecked();

    // Verify penalties are applied (multiplied by number of events = 3)
    // "Learn to Walk" penalty: health -2 * 3 * 1.5 = -9 (base 100 - 9 = 91)
    // "First Words" penalty: stress +2 * 3 * 1 = +6 (base 0 + 2 + 6 = 8)
    // "Enjoy life" has no penalties
    await expect(page.locator('.stat-item').filter({ hasText: 'Health:' }).locator('.stat-value')).toContainText('91 (-9)');
    await expect(page.locator('.stat-item').filter({ hasText: 'Stress:' }).locator('.stat-value')).toContainText('8 (+8)'); // +2 from first words +6 from penalty
  });

  test('should remove previews when unchecking events', async ({ page }) => {
    await page.goto('http://127.0.0.1:5500');
    await page.waitForLoadState('networkidle');

    // Select "Learn to Walk"
    await page.locator('input[data-event-id="first_steps"]').check();
    await page.waitForTimeout(100);

    // Verify preview is shown
    await expect(page.locator('.stat-item').filter({ hasText: 'Agility:' }).locator('.stat-value')).toContainText('10 (+5)');

    // Uncheck the event
    await page.locator('input[data-event-id="first_steps"]').uncheck();
    await page.waitForTimeout(100);

    // Verify preview is removed
    await expect(page.locator('.stat-item').filter({ hasText: 'Agility:' }).locator('.stat-value')).toContainText('5');
    await expect(page.locator('.stat-item').filter({ hasText: 'Agility:' }).locator('.stat-value')).not.toContainText('(+5)');
  });
});
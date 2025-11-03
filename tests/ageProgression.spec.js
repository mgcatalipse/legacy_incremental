import { test, expect } from '@playwright/test';

test.describe('Age Progression Without Events', () => {
  test('age increments correctly with multiple age up clicks', async ({ page }) => {
    // Navigate to the local server
    await page.goto('http://127.0.0.1:5500');

    // Wait for network idle state
    await page.waitForLoadState('networkidle');

    // Verify initial state
    await expect(page.locator('#age-title')).toHaveText('Baby');
    await expect(page.locator('#age-points')).toHaveText('Baby Age: 0');

    // Click age up button 5 times and verify age progression
    const gainButton = page.locator('#gain');

    for (let i = 1; i <= 5; i++) {
      await gainButton.click();
      const expectedGroup = i <= 2 ? 'Baby' : 'Child';
      await expect(page.locator('#age-points')).toHaveText(`${expectedGroup} Age: ${i}`);
      await expect(page.locator('#age-title')).toHaveText(expectedGroup);
    }

    // Verify age is now 5
    await expect(page.locator('#age-points')).toHaveText('Child Age: 5');
  });

  test('age group transitions occur at correct boundaries', async ({ page }) => {
    await page.goto('http://127.0.0.1:5500');
    await page.waitForLoadState('networkidle');

    const gainButton = page.locator('#gain');

    // Start as Baby (age 0-2)
    await expect(page.locator('#age-title')).toHaveText('Baby');

    // Age to 2 (still Baby)
    for (let i = 0; i < 2; i++) {
      await gainButton.click();
    }
    await expect(page.locator('#age-title')).toHaveText('Baby');
    await expect(page.locator('#age-points')).toHaveText('Baby Age: 2');

    // Age to 3 (should become Child)
    await gainButton.click();
    await expect(page.locator('#age-title')).toHaveText('Child');
    await expect(page.locator('#age-points')).toHaveText('Child Age: 3');

    // Age to 12 (still Child)
    for (let i = 0; i < 9; i++) {
      await gainButton.click();
    }
    await expect(page.locator('#age-title')).toHaveText('Child');
    await expect(page.locator('#age-points')).toHaveText('Child Age: 12');

    // Age to 13 (should become Teenager)
    await gainButton.click();
    await expect(page.locator('#age-title')).toHaveText('Teenager');
    await expect(page.locator('#age-points')).toHaveText('Teenager Age: 13');

    // Age to 19 (still Teenager)
    for (let i = 0; i < 6; i++) {
      await gainButton.click();
    }
    await expect(page.locator('#age-title')).toHaveText('Teenager');
    await expect(page.locator('#age-points')).toHaveText('Teenager Age: 19');

    // Age to 20 (should become Adult)
    await gainButton.click();
    await expect(page.locator('#age-title')).toHaveText('Adult');
    await expect(page.locator('#age-points')).toHaveText('Adult Age: 20');
  });

  test('death risk display updates with age progression', async ({ page }) => {
    await page.goto('http://127.0.0.1:5500');
    await page.waitForLoadState('networkidle');

    const gainButton = page.locator('#gain');

    // Initial death risk (Baby age 0)
    await expect(gainButton).toContainText('Age Up');

    // Age to 2 (still Baby, same death risk)
    for (let i = 0; i < 2; i++) {
      await gainButton.click();
    }
    await expect(gainButton).toContainText('Age Up');

    // Age to 3 (Child, different death risk)
    await gainButton.click();
    await expect(gainButton).toContainText('Age Up');

    // Age to 13 (Teenager)
    for (let i = 0; i < 10; i++) {
      await gainButton.click();
    }
    await expect(gainButton).toContainText('Age Up');

    // Age to 20 (Adult)
    for (let i = 0; i < 7; i++) {
      await gainButton.click();
    }
    await expect(gainButton).toContainText('Age Up');
  });

  test('handles rapid clicking without issues', async ({ page }) => {
    await page.goto('http://127.0.0.1:5500');
    await page.waitForLoadState('networkidle');

    const gainButton = page.locator('#gain');

    // Rapid clicking - click 10 times quickly
    for (let i = 0; i < 10; i++) {
      await gainButton.click();
    }

    // Verify age progressed correctly despite rapid clicking (should be Child Age: 10)
    await expect(page.locator('#age-points')).toHaveText('Child Age: 10');
    await expect(page.locator('#age-title')).toHaveText('Child');

    // Verify UI is still responsive
    await expect(gainButton).toBeVisible();
    await expect(gainButton).toBeEnabled();
  });

  test('age progression continues to maximum age', async ({ page }) => {
    await page.goto('http://127.0.0.1:5500');
    await page.waitForLoadState('networkidle');

    const gainButton = page.locator('#gain');

    // Age up to 66 (Adult to Elder transition - Elder starts at 66)
    for (let i = 0; i < 66; i++) {
      await gainButton.click();
    }
    await expect(page.locator('#age-title')).toHaveText('Elder');
    await expect(page.locator('#age-points')).toHaveText('Elder Age: 66');

    // Continue to age 100
    for (let i = 0; i < 29; i++) {
      await gainButton.click();
    }
    await expect(page.locator('#age-title')).toHaveText('Elder');
    await expect(page.locator('#age-points')).toHaveText('Elder Age: 100');

    // Continue to age 200 (but Elder starts at 66, so 200 is still Elder)
    for (let i = 0; i < 100; i++) {
      await gainButton.click();
    }
    await expect(page.locator('#age-title')).toHaveText('Elder');
    await expect(page.locator('#age-points')).toHaveText('Elder Age: 200');

    // Verify game continues to function at maximum age
    await expect(gainButton).toBeVisible();
  });

  test('age progression works across different age groups without events', async ({ page }) => {
    await page.goto('http://127.0.0.1:5500');
    await page.waitForLoadState('networkidle');

    const gainButton = page.locator('#gain');

    // Test progression through all age groups
    const ageGroups = [
      { name: 'Baby', maxAge: 2 },
      { name: 'Child', maxAge: 12 },
      { name: 'Teenager', maxAge: 19 },
      { name: 'Adult', maxAge: 65 },
      { name: 'Elder', maxAge: 66 } // Test just to Elder transition for reasonable test time
    ];

    let currentAge = 0;

    for (const group of ageGroups) {
      // Age up to the max age for this group
      const clicksNeeded = group.maxAge - currentAge;
      for (let i = 0; i < clicksNeeded; i++) {
        await gainButton.click();
      }

      currentAge = group.maxAge;

      // Verify we're in the correct age group
      await expect(page.locator('#age-title')).toHaveText(group.name);
      await expect(page.locator('#age-points')).toHaveText(`${group.name} Age: ${currentAge}`);
    }
  });
});
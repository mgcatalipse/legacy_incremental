import { test, expect } from '@playwright/test';
import { clickWithTimeout } from './helpers.js';

test.describe('Event Availability Filtering - UI Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the local server
    await page.goto('http://127.0.0.1:5500');

    // Wait for network idle state
    await page.waitForLoadState('networkidle');

    // Wait for JavaScript to initialize
    await page.waitForTimeout(1000);
  });

  test('displays baby events for age 0', async ({ page }) => {
    // Verify we're at age 0 (baby)
    await expect(page.locator('#age-points')).toHaveText('Baby Age: 0');

    // Check that baby events are displayed
    await expect(page.locator('#events-list')).toContainText('Learn to Walk');
    await expect(page.locator('#events-list')).toContainText('First Words');

    // Verify child events are not shown
    await expect(page.locator('#events-list')).not.toContainText('Attend School');
  });

  test('displays child events for age 5', async ({ page }) => {
    // Age up to child age (age 5)
    for (let i = 0; i < 5; i++) {
      await clickWithTimeout(page, '#gain');
    }

    // Verify age
    await expect(page.locator('#age-points')).toHaveText('Child Age: 5');

    // Check that child events are displayed
    await expect(page.locator('#events-list')).toContainText('Attend School');

    // Verify baby events are not shown (one-time events disappear after age range)
    await expect(page.locator('#events-list')).not.toContainText('Learn to Walk');
    await expect(page.locator('#events-list')).not.toContainText('First Words');
  });

  test('displays teen events for age 15', async ({ page }) => {
    // Disable death for this test
    await page.evaluate(() => {
      gameState.disableDeath = true;
    });

    // Age up to teen age (age 15)
    for (let i = 0; i < 15; i++) {
      await clickWithTimeout(page, '#gain');
    }

    // Verify age
    await expect(page.locator('#age-points')).toHaveText('Teenager Age: 15');

    // Check that teen events are displayed
    await expect(page.locator('#events-list')).toContainText('Graduate High School');
    await expect(page.locator('#events-list')).toContainText('Get Part-time Job'); // Updated to match actual event name

    // Verify child events are not shown
    await expect(page.locator('#events-list')).not.toContainText('Attend School');
  });

  test('one-time events disappear after completion', async ({ page }) => {
    // Start at age 0
    await expect(page.locator('#age-points')).toHaveText('Baby Age: 0');

    // Select and complete "Learn to Walk" event
    await page.check('input[data-event-id="first_steps"]');
    await clickWithTimeout(page, '#gain');

    // Age increments after event processing, so should be age 1 now
    await expect(page.locator('#age-points')).toHaveText('Baby Age: 1');
    await expect(page.locator('#events-list')).not.toContainText('Learn to Walk');
    await expect(page.locator('#events-list')).toContainText('First Words');
  });

  test('repeatable events remain available after completion', async ({ page }) => {
    // Age up to child age (age 5)
    for (let i = 0; i < 5; i++) {
      await clickWithTimeout(page, '#gain');
    }

    // Select and complete "Attend School" (repeatable)
    await page.check('input[data-event-id="school"]');
    await clickWithTimeout(page, '#gain');

    // Age increments to 6 after event processing
    await expect(page.locator('#age-points')).toHaveText('Child Age: 6');
    await expect(page.locator('#events-list')).toContainText('Attend School');
  });

  test('handles age boundaries correctly - age 2 to 3 transition', async ({ page }) => {
    // Age up to age 2 (still baby) - age increments after each click
    for (let i = 0; i < 2; i++) {
      await clickWithTimeout(page, '#gain');
    }

    await expect(page.locator('#age-points')).toHaveText('Baby Age: 2');
    await expect(page.locator('#events-list')).toContainText('Learn to Walk');
    await expect(page.locator('#events-list')).toContainText('First Words');

    // Age up to age 3 (now child)
    await clickWithTimeout(page, '#gain');

    await expect(page.locator('#age-points')).toHaveText('Child Age: 3');
    await expect(page.locator('#events-list')).toContainText('Attend School');
    await expect(page.locator('#events-list')).not.toContainText('Learn to Walk');
    await expect(page.locator('#events-list')).not.toContainText('First Words');
  });

  test('shows events for maximum age', async ({ page }) => {
    // Disable death for this test
    await page.evaluate(() => {
      gameState.disableDeath = true;
    });

    // Age up to elder age (age 70) - events are available up to 200
    for (let i = 0; i < 70; i++) {
      await clickWithTimeout(page, '#gain');
    }

    // Should show elder events
    await expect(page.locator('#events-list')).toContainText('Retire');
    await expect(page.locator('#events-list')).toContainText('Share Wisdom');
  });

  test('respects special requirements for family events', async ({ page }) => {
    // Disable death for this test
    await page.evaluate(() => {
      gameState.disableDeath = true;
    });

    // Age up to teen age (age 16) - when "Find a Wife" becomes available
    for (let i = 0; i < 16; i++) {
      await clickWithTimeout(page, '#gain');
    }

    await expect(page.locator('#age-points')).toHaveText('Teenager Age: 16');

    // Should show "Find a Wife" but not "Wedding" or "Try for Children"
    await expect(page.locator('#events-list')).toContainText('Find a Wife');
    await expect(page.locator('#events-list')).not.toContainText('Wedding');
    await expect(page.locator('#events-list')).not.toContainText('Try for Children');

    // Note: Testing full family mechanics would require more complex setup
    // This basic test verifies the UI filtering works for special requirements
  });

  test('displays elder events for age 65', async ({ page }) => {
    // Disable death for this test
    await page.evaluate(() => {
      gameState.disableDeath = true;
    });

    // Age up to adult age (age 65) - adult group goes to 65
    for (let i = 0; i < 65; i++) {
      await clickWithTimeout(page, '#gain', { timeout: 50 });
    }

    await expect(page.locator('#age-points')).toHaveText('Adult Age: 65');

    // Age up one more to reach elder (age 66)
    await clickWithTimeout(page, '#gain');

    await expect(page.locator('#age-points')).toHaveText('Elder Age: 66');

    // Check that elder events are displayed
    await expect(page.locator('#events-list')).toContainText('Retire');

    // Verify some adult events may still be shown (overlapping ranges)
  });

  test('events update dynamically when aging up', async ({ page }) => {
    // Start at age 0
    await expect(page.locator('#age-points')).toHaveText('Baby Age: 0');
    await expect(page.locator('#events-list')).toContainText('Learn to Walk');

    // Age up once
    await clickWithTimeout(page, '#gain');

    // Still baby events at age 1
    await expect(page.locator('#age-points')).toHaveText('Baby Age: 1');
    await expect(page.locator('#events-list')).toContainText('Learn to Walk');

    // Age up to age 3 (transition to child)
    await clickWithTimeout(page, '#gain');
    await clickWithTimeout(page, '#gain');

    // Should now show child events
    await expect(page.locator('#age-points')).toHaveText('Child Age: 3');
    await expect(page.locator('#events-list')).toContainText('Attend School');
    await expect(page.locator('#events-list')).not.toContainText('Learn to Walk');
  });
});
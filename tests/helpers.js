/**
 * Helper function that wraps Playwright's click method with a default timeout pause of 100ms.
 * Accepts the same parameters as Playwright's click method, with timeout defaulting to 100ms for the pause after clicking.
 * @param {Page} page - The Playwright page object
 * @param {string} selector - The selector to click
 * @param {object} options - Options object for the click method, including an optional timeout for the pause
 */
export async function clickWithTimeout(page, selector, options = {}) {
  const { timeout, ...clickOptions } = options;
  await page.click(selector, clickOptions);
  await page.waitForTimeout(timeout ?? 100);
}
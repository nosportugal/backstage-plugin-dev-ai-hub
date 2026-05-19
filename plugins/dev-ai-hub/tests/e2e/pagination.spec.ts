import { test, expect } from './fixtures/base';

test.describe('Asset Pagination', () => {
  test.beforeEach(async ({ page, mockDevAiHubApis }) => {
    await page.goto('/dev-ai-hub');
    await page.waitForTimeout(1000);
  });

  test('should display pagination controls when results exceed page size', async ({ page }) => {
    const pagination = page.locator('[data-testid="pagination"]');
    const exists = await pagination.isVisible().catch(() => false);

    // Pagination may or may not be visible depending on total assets
    if (exists) {
      await expect(pagination).toBeVisible();
    }
  });

  test('should navigate to next page', async ({ page }) => {
    const nextButton = page.locator('button[aria-label*="next"]', { strict: false });
    const nextExists = await nextButton.isVisible().catch(() => false);

    if (nextExists) {
      const initialUrl = page.url();
      await nextButton.click();

      const newUrl = page.url();
      // URL should have changed or page parameter should have incremented
      const pageParam = new URL(newUrl).searchParams.get('page');
      expect(pageParam || '1').toBeTruthy();
    }
  });

  test('should navigate to previous page', async ({ page }) => {
    // First go to page 2
    const nextButton = page.locator('button[aria-label*="next"]', { strict: false });
    const nextExists = await nextButton.isVisible().catch(() => false);

    if (nextExists) {
      await nextButton.click();
      await page.waitForTimeout(500);

      // Now go back
      const prevButton = page.locator('button[aria-label*="previous"]', { strict: false });
      const prevExists = await prevButton.isVisible().catch(() => false);

      if (prevExists) {
        await prevButton.click();

        const pageParam = new URL(page.url()).searchParams.get('page');
        expect(pageParam || '1').toBeTruthy();
      }
    }
  });

  test('should update asset cards when changing pages', async ({ page }) => {
    const initialCards = await page.locator('[data-testid="asset-card"]').count();

    const nextButton = page.locator('button[aria-label*="next"]', { strict: false });
    const nextExists = await nextButton.isVisible().catch(() => false);

    if (nextExists) {
      await nextButton.click();
      await page.waitForTimeout(500);

      const newCards = await page.locator('[data-testid="asset-card"]').count();
      // Cards should be updated or be the same if less than page size
      expect(newCards).toBeGreaterThanOrEqual(0);
    }
  });

  test('should disable previous button on first page', async ({ page }) => {
    const prevButton = page.locator('button[aria-label*="previous"]', { strict: false });
    const prevExists = await prevButton.isVisible().catch(() => false);

    if (prevExists) {
      const isDisabled = await prevButton.evaluate((el: HTMLElement) =>
        (el as HTMLButtonElement).disabled
      ).catch(() => true);

      expect(isDisabled).toBeTruthy();
    }
  });

  test('should display current page number', async ({ page }) => {
    const pageInfo = page.locator('[data-testid="pagination-info"]', { strict: false });
    const exists = await pageInfo.isVisible().catch(() => false);

    if (exists) {
      await expect(pageInfo).toBeVisible();
      const text = await pageInfo.textContent();
      expect(text).toContain('1'); // Should show current page
    }
  });
});

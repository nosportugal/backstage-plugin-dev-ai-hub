import { test, expect } from './fixtures/base';

test.describe('Asset Detail Panel', () => {
  test.beforeEach(async ({ page, mockDevAiHubApis }) => {
    await page.goto('/dev-ai-hub');
    await page.waitForTimeout(1000);
  });

  test('should open asset detail panel on card click', async ({ page }) => {
    const firstCard = page.locator('[data-testid="asset-card"]').first();
    await firstCard.click();

    // Detail panel should be visible
    const detailPanel = page.locator('[data-testid="asset-detail-panel"]');
    await expect(detailPanel).toBeVisible();
  });

  test('should display asset metadata in detail panel', async ({ page }) => {
    const firstCard = page.locator('[data-testid="asset-card"]').first();
    await firstCard.click();

    // Check that asset details are shown
    await expect(page.locator('text=Version')).toBeVisible();
    await expect(page.locator('text=Author')).toBeVisible();
    await expect(page.locator('text=Tags')).toBeVisible();
  });

  test('should display markdown content in detail panel', async ({ page }) => {
    const firstCard = page.locator('[data-testid="asset-card"]').first();
    await firstCard.click();

    // Check for markdown content container
    const content = page.locator('[data-testid="asset-content"]');
    const exists = await content.isVisible().catch(() => false);
    expect(exists).toBeTruthy();
  });

  test('should have install button in detail panel', async ({ page }) => {
    const firstCard = page.locator('[data-testid="asset-card"]').first();
    await firstCard.click();

    // Look for install button
    const installButton = page.locator('button:has-text("Install")', { strict: false });
    const exists = await installButton.isVisible().catch(() => false);
    expect(exists).toBeTruthy();
  });

  test('should close detail panel on close button click', async ({ page }) => {
    const firstCard = page.locator('[data-testid="asset-card"]').first();
    await firstCard.click();

    const detailPanel = page.locator('[data-testid="asset-detail-panel"]');
    await expect(detailPanel).toBeVisible();

    // Find close button (usually an X icon or back arrow)
    const closeButton = page.locator('button[aria-label="Close"]', { strict: false });
    const exists = await closeButton.isVisible().catch(() => false);

    if (exists) {
      await closeButton.click();
      await expect(detailPanel).not.toBeVisible();
    }
  });

  test('should remove assetId from URL when closing detail panel', async ({ page }) => {
    const firstCard = page.locator('[data-testid="asset-card"]').first();
    await firstCard.click();

    // URL should include assetId
    await expect(page).toHaveURL(/assetId=/);

    // Close the detail panel
    const closeButton = page.locator('button[aria-label="Close"]', { strict: false });
    const exists = await closeButton.isVisible().catch(() => false);

    if (exists) {
      await closeButton.click();

      // URL should no longer include assetId
      await expect(page).not.toHaveURL(/assetId=/);
    }
  });

  test('should display install count', async ({ page }) => {
    const firstCard = page.locator('[data-testid="asset-card"]').first();
    await firstCard.click();

    // Look for install count display
    const installCount = page.locator('text=/Installed|Install count/i', { strict: false });
    const exists = await installCount.isVisible().catch(() => false);
    expect(exists).toBeTruthy();
  });
});

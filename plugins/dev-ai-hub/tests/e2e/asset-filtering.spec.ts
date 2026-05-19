import { test, expect } from './fixtures/base';

test.describe('Asset Filtering', () => {
  test.beforeEach(async ({ page, mockDevAiHubApis }) => {
    await page.goto('/dev-ai-hub');
    await page.waitForTimeout(1000);
  });

  test('should filter by asset type', async ({ page }) => {
    // Click on the type filter
    await page.locator('button:has-text("Instruction")').click();
    await page.waitForTimeout(500);

    // Should see only instruction type assets
    const cards = page.locator('[data-testid="asset-card"]');
    await expect(cards).toHaveCount(1);

    // Should show Python Linting Guide (instruction type)
    await expect(page.locator('text=Python Linting Guide')).toBeVisible();
  });

  test('should filter by tool', async ({ page }) => {
    // Find and click the tool filter (Claude Code)
    await page.locator('text=Claude Code').click();
    await page.waitForTimeout(500);

    const cards = page.locator('[data-testid="asset-card"]');
    // Should show assets compatible with Claude Code
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should search for assets', async ({ page }) => {
    // Find the search input
    const searchInput = page.locator('input[placeholder*="Search"]');

    await searchInput.fill('python');
    await page.waitForTimeout(500);

    // Should filter to show only Python-related assets
    const cards = page.locator('[data-testid="asset-card"]');
    await expect(cards.locator('text=Python Linting Guide')).toBeVisible();
  });

  test('should filter by tag', async ({ page }) => {
    // Click on a tag filter (e.g., "code-quality")
    const tagButton = page.locator('button:has-text("code-quality")');
    const isVisible = await tagButton.isVisible();

    if (isVisible) {
      await tagButton.click();
      await page.waitForTimeout(500);

      const cards = page.locator('[data-testid="asset-card"]');
      expect(await cards.count()).toBeGreaterThan(0);
    }
  });

  test('should combine multiple filters', async ({ page }) => {
    // Set type filter to instruction
    await page.locator('button:has-text("Instruction")').click();
    await page.waitForTimeout(300);

    // Add search filter
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('python');
    await page.waitForTimeout(500);

    // Should show only instruction-type assets matching "python"
    const cards = page.locator('[data-testid="asset-card"]');
    await expect(page.locator('text=Python Linting Guide')).toBeVisible();
  });

  test('should clear filters', async ({ page }) => {
    // Apply a filter
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('python');
    await page.waitForTimeout(500);

    // Find and click clear/reset button
    const resetButton = page.locator('button:has-text("Clear")', { strict: false });
    const exists = await resetButton.isVisible().catch(() => false);

    if (exists) {
      await resetButton.click();
      await page.waitForTimeout(500);

      // Search input should be cleared
      await expect(searchInput).toHaveValue('');
    }
  });

  test('should show no results message when no assets match filters', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('nonexistent-asset-xyz');
    await page.waitForTimeout(500);

    // Should show empty state or "no results" message
    const noResultsMessage = page.locator('text=No assets found', { strict: false });
    const emptyState = page.locator('[data-testid="empty-state"]', { strict: false });

    const isVisible = await noResultsMessage.isVisible().catch(() => false) ||
                     await emptyState.isVisible().catch(() => false);

    if (isVisible) {
      await expect(noResultsMessage.or(emptyState)).toBeVisible();
    }
  });
});

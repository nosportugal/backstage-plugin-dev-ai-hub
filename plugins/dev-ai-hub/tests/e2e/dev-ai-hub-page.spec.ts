import { test, expect } from './fixtures/base';

test.describe('Dev AI Hub Page', () => {
  test.beforeEach(async ({ page, mockDevAiHubApis }) => {
    await page.goto('/dev-ai-hub');
  });

  test('should load the main page', async ({ page }) => {
    await expect(page).toHaveTitle(/AI Hub/);
  });

  test('should display the main heading', async ({ page }) => {
    await expect(page.locator('text=AI Hub')).toBeVisible();
  });

  test('should display asset stats cards', async ({ page }) => {
    // Check for stat cards showing asset counts by type
    await expect(page.locator('text=Instructions')).toBeVisible();
    await expect(page.locator('text=Agents')).toBeVisible();
    await expect(page.locator('text=Skills')).toBeVisible();
    await expect(page.locator('text=Workflows')).toBeVisible();
  });

  test('should display asset cards in grid', async ({ page }) => {
    // Wait for assets to load
    await page.waitForTimeout(1000);

    // Check that asset cards are visible
    const cards = page.locator('[data-testid="asset-card"]');
    await expect(cards).toHaveCount(3);
  });

  test('should display asset names and descriptions', async ({ page }) => {
    await page.waitForTimeout(1000);

    await expect(page.locator('text=Python Linting Guide')).toBeVisible();
    await expect(page.locator('text=React Code Review Agent')).toBeVisible();
    await expect(page.locator('text=TypeScript Migration Skill')).toBeVisible();
  });

  test('should display pagination controls', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Check for pagination controls
    const pagination = page.locator('[data-testid="pagination"]');
    await expect(pagination).toBeVisible();
  });

  test('should navigate to asset detail on card click', async ({ page }) => {
    await page.waitForTimeout(1000);

    const firstCard = page.locator('[data-testid="asset-card"]').first();
    await firstCard.click();

    // Check that URL includes assetId parameter
    await expect(page).toHaveURL(/assetId=/);
  });
});

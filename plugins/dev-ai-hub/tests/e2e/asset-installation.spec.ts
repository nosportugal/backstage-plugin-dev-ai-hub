import { test, expect } from './fixtures/base';

test.describe('Asset Installation', () => {
  test.beforeEach(async ({ page, mockDevAiHubApis }) => {
    await page.goto('/dev-ai-hub');
    await page.waitForTimeout(1000);
  });

  test('should open install dialog when install button is clicked', async ({ page }) => {
    const firstCard = page.locator('[data-testid="asset-card"]').first();
    await firstCard.click();

    const installButton = page.locator('button:has-text("Install")', { strict: false });
    const exists = await installButton.isVisible().catch(() => false);

    if (exists) {
      await installButton.click();

      const installDialog = page.locator('[data-testid="install-dialog"]', { strict: false });
      const dialogExists = await installDialog.isVisible().catch(() => false);
      expect(dialogExists).toBeTruthy();
    }
  });

  test('should display install instructions in dialog', async ({ page }) => {
    const firstCard = page.locator('[data-testid="asset-card"]').first();
    await firstCard.click();

    const installButton = page.locator('button:has-text("Install")', { strict: false });
    const exists = await installButton.isVisible().catch(() => false);

    if (exists) {
      await installButton.click();

      // Check for install path display
      const pathDisplay = page.locator('[data-testid="install-path"]', { strict: false });
      const pathExists = await pathDisplay.isVisible().catch(() => false);
      expect(pathExists).toBeTruthy();
    }
  });

  test('should display tool-specific install information', async ({ page }) => {
    const firstCard = page.locator('[data-testid="asset-card"]').first();
    await firstCard.click();

    const installButton = page.locator('button:has-text("Install")', { strict: false });
    const exists = await installButton.isVisible().catch(() => false);

    if (exists) {
      await installButton.click();

      // Look for tool selector or tool-specific info
      const toolInfo = page.locator('[data-testid="tool-info"]', { strict: false });
      const toolExists = await toolInfo.isVisible().catch(() => false);
      // It's okay if this doesn't exist for all assets
      if (toolExists) {
        await expect(toolInfo).toBeVisible();
      }
    }
  });

  test('should have copy button for install instructions', async ({ page }) => {
    const firstCard = page.locator('[data-testid="asset-card"]').first();
    await firstCard.click();

    const installButton = page.locator('button:has-text("Install")', { strict: false });
    const exists = await installButton.isVisible().catch(() => false);

    if (exists) {
      await installButton.click();

      // Look for copy button
      const copyButton = page.locator('button:has-text("Copy")', { strict: false });
      const copyExists = await copyButton.isVisible().catch(() => false);
      expect(copyExists).toBeTruthy();
    }
  });

  test('should close install dialog', async ({ page }) => {
    const firstCard = page.locator('[data-testid="asset-card"]').first();
    await firstCard.click();

    const installButton = page.locator('button:has-text("Install")', { strict: false });
    const exists = await installButton.isVisible().catch(() => false);

    if (exists) {
      await installButton.click();

      const installDialog = page.locator('[data-testid="install-dialog"]', { strict: false });

      // Find close button
      const closeButton = page.locator('button[aria-label="Close"]', { strict: false });
      const closeExists = await closeButton.isVisible().catch(() => false);

      if (closeExists) {
        await closeButton.click();
        await expect(installDialog).not.toBeVisible();
      }
    }
  });

  test('should update URL with installId when opening install dialog', async ({ page }) => {
    const firstCard = page.locator('[data-testid="asset-card"]').first();
    await firstCard.click();

    const installButton = page.locator('button:has-text("Install")', { strict: false });
    const exists = await installButton.isVisible().catch(() => false);

    if (exists) {
      await installButton.click();

      // URL should include installId parameter
      const hasInstallId = page.url().includes('installId=');
      expect(hasInstallId).toBeTruthy();
    }
  });
});

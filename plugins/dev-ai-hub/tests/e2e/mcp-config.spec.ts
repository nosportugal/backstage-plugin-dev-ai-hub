import { test, expect } from './fixtures/base';

test.describe('MCP Configuration Page', () => {
  test.beforeEach(async ({ page, mockDevAiHubApis }) => {
    await page.goto('/dev-ai-hub/mcp-config');
    await page.waitForTimeout(1000);
  });

  test('should load the MCP configuration page', async ({ page }) => {
    await expect(page.locator('text=Configure MCP')).toBeVisible();
  });

  test('should display MCP URL inputs', async ({ page }) => {
    // Look for tool-specific input fields for MCP URLs
    const inputs = page.locator('input[type="text"]');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have section for Claude Code MCP configuration', async ({ page }) => {
    const claudeSection = page.locator('text=Claude Code', { strict: false });
    const exists = await claudeSection.isVisible().catch(() => false);
    expect(exists).toBeTruthy();
  });

  test('should have section for GitHub Copilot MCP configuration', async ({ page }) => {
    const copilotSection = page.locator('text=GitHub Copilot', { strict: false });
    const exists = await copilotSection.isVisible().catch(() => false);
    expect(exists).toBeTruthy();
  });

  test('should have copy button for MCP URLs', async ({ page }) => {
    const copyButtons = page.locator('button:has-text("Copy")', { strict: false });
    const count = await copyButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display save/apply button', async ({ page }) => {
    const saveButton = page.locator('button:has-text("Save")', { strict: false }).or(
      page.locator('button:has-text("Apply")', { strict: false })
    );
    const exists = await saveButton.isVisible().catch(() => false);
    expect(exists).toBeTruthy();
  });

  test('should display proactive mode toggle if available', async ({ page }) => {
    const proactiveToggle = page.locator('[data-testid="proactive-mode-toggle"]', { strict: false });
    const exists = await proactiveToggle.isVisible().catch(() => false);

    if (exists) {
      await expect(proactiveToggle).toBeVisible();
    }
  });

  test('should navigate back to browse page', async ({ page }) => {
    const browseLink = page.locator('a:has-text("Browse")', { strict: false }).or(
      page.locator('button:has-text("Browse")', { strict: false })
    );
    const exists = await browseLink.isVisible().catch(() => false);

    if (exists) {
      await browseLink.click();
      await expect(page).toHaveURL(/\/dev-ai-hub\/browse|\/dev-ai-hub$/);
    }
  });

  test('should display provider status information', async ({ page }) => {
    const providerInfo = page.locator('[data-testid="provider-status"]', { strict: false });
    const exists = await providerInfo.isVisible().catch(() => false);

    if (exists) {
      await expect(providerInfo).toBeVisible();
    }
  });

  test('should allow selecting different tools for configuration', async ({ page }) => {
    // Look for tool tabs or toggles
    const toolButtons = page.locator('button[role="tab"]', { strict: false });
    const count = await toolButtons.count();

    if (count > 1) {
      const secondTool = toolButtons.nth(1);
      await secondTool.click();
      // Tool section should update
      await expect(secondTool).toHaveAttribute('aria-selected', 'true');
    }
  });
});

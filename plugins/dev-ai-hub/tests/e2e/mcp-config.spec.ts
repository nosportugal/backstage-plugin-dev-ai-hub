import { test, expect } from './fixtures/base';

// McpConfigPage is registered at /mcp-config in dev/index.tsx
const PAGE_URL = '/mcp-config';

test.describe('MCP Configuration Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
    await expect(page.getByText('Configure MCP Server')).toBeVisible();
  });

  test('renders the page heading', async ({ page }) => {
    await expect(page.getByText('Configure MCP Server')).toBeVisible();
  });

  test('renders the subtitle', async ({ page }) => {
    await expect(
      page.getByText('Connect your AI tool to the Dev AI Hub via Model Context Protocol.'),
    ).toBeVisible();
  });

  test('shows tabs for all three supported tools', async ({ page }) => {
    // TOOL_CONFIGS defines Claude Code, GitHub Copilot, Google Gemini
    await expect(page.getByRole('tab', { name: /Claude Code/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /GitHub Copilot/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Google Gemini/i })).toBeVisible();
  });

  test('"Claude Code" tab is selected by default', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /Claude Code/i })).toHaveAttribute('aria-selected', 'true');
  });

  test('Claude Code panel shows .mcp.json config snippet', async ({ page }) => {
    await expect(page.getByText('.mcp.json', { exact: true })).toBeVisible();
  });

  test('switching to GitHub Copilot tab shows .vscode/settings.json snippet', async ({ page }) => {
    await page.getByRole('tab', { name: /GitHub Copilot/i }).click();
    await expect(page.getByText('.vscode/settings.json', { exact: true })).toBeVisible();
  });

  test('switching to Google Gemini tab shows gemini-config.json snippet', async ({ page }) => {
    await page.getByRole('tab', { name: /Google Gemini/i }).click();
    await expect(page.getByText('gemini-config.json')).toBeVisible();
  });

  test('shows the "MCP Endpoint" section', async ({ page }) => {
    await expect(page.getByText('MCP Endpoint')).toBeVisible();
  });

  test('"Copy URL" button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Copy URL' })).toBeVisible();
  });

  test('"Copy config" button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Copy config' })).toBeVisible();
  });

  test('proactive suggestions switch is unchecked by default', async ({ page }) => {
    const toggle = page.getByRole('switch', { name: 'Proactive suggestions' });
    await expect(toggle).toBeVisible();
    await expect(toggle).not.toBeChecked();
  });

  test('enabling proactive toggle appends ?proactive=true to the MCP URL', async ({ page }) => {
    await page.getByRole('switch', { name: 'Proactive suggestions' }).click({ force: true });
    await expect(page.getByText(/proactive=true/).first()).toBeVisible();
  });

  test('switching tabs updates the tool param in the MCP URL', async ({ page }) => {
    const urlBefore = await page.getByText(/\/mcp\?/).first().textContent();
    expect(urlBefore).toContain('tool=claude-code');

    await page.getByRole('tab', { name: /GitHub Copilot/i }).click();
    const urlAfter = await page.getByText(/\/mcp\?/).first().textContent();
    expect(urlAfter).toContain('tool=github-copilot');
  });

  test('hint text references ?tool= and suggest_assets', async ({ page }) => {
    await expect(page.getByText(/Omit \?tool=/)).toBeVisible();
    await expect(page.getByText(/suggest_assets/)).toBeVisible();
  });

  test('"Copy URL" button label changes to "Copied!" after click', async ({ page }) => {
    await page.getByRole('button', { name: 'Copy URL' }).click();
    await expect(page.getByRole('button', { name: 'Copied!' })).toBeVisible();
  });
});

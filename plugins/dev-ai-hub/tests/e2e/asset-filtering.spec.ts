import { test, expect } from './fixtures/base';
import { DEV_ASSETS } from './fixtures/mock-api';

const PAGE_URL = '/dev-ai-hub';

test.describe('Asset Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
    await expect(page.getByText(DEV_ASSETS[0].name)).toBeVisible();
  });

  // ── Search ────────────────────────────────────────────────────────────────

  test('SearchField has the correct placeholder text', async ({ page }) => {
    await expect(
      page.getByRole('searchbox', { name: 'Search assets' }),
    ).toHaveAttribute('placeholder', 'Search assets by name, description or content…');
  });

  test('searching by partial name filters the grid', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Search assets' }).fill('typescript');
    await expect(page.getByText('TypeScript Best Practices')).toBeVisible();
    await expect(page.getByText('Code Review Agent')).not.toBeVisible();
  });

  test('search is case-insensitive', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Search assets' }).fill('GIT COMMIT');
    await expect(page.getByText('Git Commit', { exact: true })).toBeVisible();
  });

  test('search by description matches partial words', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Search assets' }).fill('conventional git commit');
    await expect(page.getByText('Git Commit', { exact: true })).toBeVisible();
  });

  test('empty search restores all results', async ({ page }) => {
    const search = page.getByRole('searchbox', { name: 'Search assets' });
    await search.fill('typescript');
    await expect(page.getByText('TypeScript Best Practices')).toBeVisible();

    await search.clear();
    for (const asset of DEV_ASSETS) {
      await expect(page.getByText(asset.name, { exact: true })).toBeVisible();
    }
  });

  test('no-match search shows empty state', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Search assets' }).fill('xyznotfound');
    await expect(page.getByText('No assets found')).toBeVisible();
  });

  // ── Type filter ───────────────────────────────────────────────────────────

  test('all type-filter buttons are rendered', async ({ page }) => {
    for (const label of ['All', 'Instructions', 'Agents', 'Skills', 'Workflows']) {
      await expect(page.getByRole('button', { name: label }).first()).toBeVisible();
    }
  });

  test('"Instructions" button filters to instruction assets only', async ({ page }) => {
    await page.getByRole('button', { name: 'Instructions', exact: true }).click();
    // 2 instruction assets in the mock
    await expect(page.getByText('2 assets found')).toBeVisible();
    await expect(page.getByText('TypeScript Best Practices')).toBeVisible();
    await expect(page.getByText('Security Guidelines')).toBeVisible();
    await expect(page.getByText('Code Review Agent')).not.toBeVisible();
  });

  test('"Skills" button filters to skill assets only', async ({ page }) => {
    await page.getByRole('button', { name: 'Skills', exact: true }).click();
    await expect(page.getByText('1 asset found')).toBeVisible();
    await expect(page.getByText('Git Commit', { exact: true })).toBeVisible();
  });

  test('"Workflows" button filters to workflow assets only', async ({ page }) => {
    await page.getByRole('button', { name: 'Workflows', exact: true }).click();
    await expect(page.getByText('1 asset found')).toBeVisible();
    await expect(page.getByText('Feature Development Workflow')).toBeVisible();
  });

  test('"All" button clears the type filter', async ({ page }) => {
    await page.getByRole('button', { name: 'Skills', exact: true }).click();
    await expect(page.getByText('1 asset found')).toBeVisible();

    await page.getByRole('button', { name: 'All', exact: true }).click();
    await expect(page.getByText(`${DEV_ASSETS.length} assets found`)).toBeVisible();
  });

  // ── AI Tool filter ────────────────────────────────────────────────────────

  test('all AI-tool filter buttons are rendered', async ({ page }) => {
    for (const label of ['All Tools', 'Claude Code', 'GitHub Copilot', 'Google Gemini', 'Cursor']) {
      await expect(page.getByRole('button', { name: label }).first()).toBeVisible();
    }
  });

  test('"Claude Code" tool filter shows only claude-code-compatible assets', async ({ page }) => {
    await page.getByRole('button', { name: 'Claude Code' }).first().click();
    // claude-code: mock-1, mock-2, mock-3 (all), mock-5
    await expect(page.getByText('TypeScript Best Practices')).toBeVisible();
    await expect(page.getByText('Code Review Agent')).toBeVisible();
    await expect(page.getByText('Git Commit', { exact: true })).toBeVisible(); // tools: ['all']
    await expect(page.getByText('Security Guidelines')).toBeVisible();
    await expect(page.getByText('Product Manager')).not.toBeVisible(); // github-copilot only
  });

  test('"Cursor" tool filter shows only cursor-compatible assets', async ({ page }) => {
    await page.getByRole('button', { name: 'Cursor' }).first().click();
    // cursor: mock-4 (github-copilot, cursor), mock-3 (all)
    await expect(page.getByText('Feature Development Workflow')).toBeVisible();
    await expect(page.getByText('Git Commit', { exact: true })).toBeVisible(); // tools: ['all']
  });

  // ── Tags ──────────────────────────────────────────────────────────────────

  test('tag chips are rendered for the current result set', async ({ page }) => {
    // 'typescript' tag is present in mock-1
    await expect(page.getByRole('button', { name: '#typescript' }).first()).toBeVisible();
  });

  test('clicking a tag chip filters by that tag', async ({ page }) => {
    await page.getByRole('button', { name: '#git' }).first().click();
    // mock-3 has ['git', 'commits', 'conventional-commits']
    await expect(page.getByText('Git Commit', { exact: true })).toBeVisible();
    await expect(page.getByText('TypeScript Best Practices')).not.toBeVisible();
  });

  test('clicking a second tag chip adds an AND condition', async ({ page }) => {
    await page.getByRole('button', { name: '#typescript' }).first().click();
    await page.getByRole('button', { name: '#best-practices' }).first().click();
    // Only mock-1 has both 'typescript' AND 'best-practices'
    await expect(page.getByText('TypeScript Best Practices')).toBeVisible();
    await expect(page.getByText('Security Guidelines')).not.toBeVisible();
  });

  test('clicking an active tag chip deselects it', async ({ page }) => {
    const tagBtn = page.getByRole('button', { name: '#typescript' }).first();
    await tagBtn.click();
    await expect(page.getByText('TypeScript Best Practices')).toBeVisible();
    await expect(page.getByText('Code Review Agent')).not.toBeVisible();

    await tagBtn.click(); // deselect
    await expect(page.getByText('Code Review Agent')).toBeVisible();
  });
});

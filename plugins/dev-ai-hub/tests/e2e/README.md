# Dev AI Hub E2E Tests

Comprehensive Playwright tests for the Dev AI Hub Backstage plugin frontend.

## Test Structure

```
tests/e2e/
├── fixtures/
│   ├── base.ts           # Test base with fixture setup
│   └── mock-api.ts       # API mocking utilities
├── dev-ai-hub-page.spec.ts       # Main page, layout, stats
├── asset-filtering.spec.ts        # Search, filtering, tags
├── asset-detail.spec.ts           # Detail panel UI
├── asset-installation.spec.ts     # Install dialog flow
├── pagination.spec.ts             # Pagination controls
└── mcp-config.spec.ts            # MCP configuration page
```

## Running Tests

Install dependencies:

```bash
yarn install
```

Run all tests:

```bash
yarn test:e2e
```

Run tests in UI mode (recommended for debugging):

```bash
yarn test:e2e:ui
```

Run tests with debug mode:

```bash
yarn test:e2e:debug
```

Run specific test file:

```bash
yarn test:e2e asset-filtering.spec.ts
```

## Test Coverage

### Dev AI Hub Page (`dev-ai-hub-page.spec.ts`)
- Page load and title verification
- Asset stats display (Instructions, Agents, Skills, Workflows)
- Asset grid rendering
- Asset card visibility and metadata
- Pagination controls
- Asset detail navigation

### Asset Filtering (`asset-filtering.spec.ts`)
- Filter by asset type (instruction, agent, skill, workflow)
- Filter by tool compatibility (Claude Code, GitHub Copilot, etc.)
- Full-text search functionality
- Filter by tags
- Combined filters
- Clear filters functionality
- No results state

### Asset Detail Panel (`asset-detail.spec.ts`)
- Open detail panel on card click
- Display asset metadata (version, author, tags)
- Markdown content rendering
- Install button availability
- Close detail panel
- URL parameter handling (assetId)
- Install count display

### Asset Installation (`asset-installation.spec.ts`)
- Open install dialog
- Display install instructions
- Tool-specific information
- Copy button for instructions
- Close install dialog
- URL parameter handling (installId)

### Pagination (`pagination.spec.ts`)
- Pagination controls visibility
- Navigate to next page
- Navigate to previous page
- Asset cards update on page change
- Previous button disabled on first page
- Current page display

### MCP Configuration (`mcp-config.spec.ts`)
- Page load verification
- MCP URL input fields
- Tool-specific sections (Claude Code, GitHub Copilot, etc.)
- Copy button for URLs
- Save/apply button
- Proactive mode toggle (if available)
- Navigation to browse page
- Provider status display
- Tool selection

## Mock API

Tests use mocked API responses via `fixtures/mock-api.ts`. This includes:

- Asset list with filtering support
- Stats endpoint
- Providers endpoint

The mock API automatically applies filters based on query parameters, simulating the real API behavior.

## Best Practices

1. **Use `data-testid` attributes**: Test selectors use `data-testid` for reliable targeting
2. **Handle optional elements**: Tests check if UI elements exist before interacting (tools/features may vary)
3. **Wait for content**: Tests include appropriate waits for async content loading
4. **Flexible selectors**: Multiple selector strategies to handle different UI implementations
5. **URL-based navigation**: Tests verify state via URL parameters when applicable

## Adding New Tests

1. Create a new `.spec.ts` file in `tests/e2e/`
2. Import the base test fixture: `import { test, expect } from './fixtures/base';`
3. Add test groups using `test.describe()`
4. Use `mockDevAiHubApis` fixture for API mocking
5. Use `data-testid` attributes for reliable element targeting

Example:

```typescript
import { test, expect } from './fixtures/base';

test.describe('New Feature', () => {
  test.beforeEach(async ({ page, mockDevAiHubApis }) => {
    await page.goto('/dev-ai-hub');
  });

  test('should do something', async ({ page }) => {
    await expect(page.locator('text=Feature')).toBeVisible();
  });
});
```

## Debugging

- Use `--debug` flag to run tests in debug mode with browser automation inspector
- Use `--ui` mode for interactive test execution
- Check generated `test-results/` and `playwright-report/` directories
- Screenshots and traces are captured on failure

## Configuration

See `playwright.config.ts` at the project root for:

- Test timeouts and retries
- Browser configuration (Chromium, Firefox, WebKit)
- Base URL and screenshot settings
- Web server startup

## CI/CD Integration

The tests are configured to run in CI with:

- Single worker (for consistency)
- 2 automatic retries
- HTML report generation
- Screenshots on failure

For local development, tests run in parallel with reusable existing server.

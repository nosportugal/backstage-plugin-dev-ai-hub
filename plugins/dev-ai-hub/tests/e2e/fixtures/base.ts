/**
 * Pre-seed Backstage's guest-auth localStorage keys so every page load
 * auto-signs in as Guest (legacy token path) without a running auth backend.
 *
 * Keys come from @backstage/core-components SignInPage/providers internals:
 *   PROVIDER_STORAGE_KEY  → '@backstage/core:SignInPage:provider'
 *   enableLegacyGuestToken (guestProvider.tsx)
 *
 * API calls to the backend are intercepted via page.route() and served with
 * the canonical mock data from mock-api.ts, keeping tests predictable and
 * independent of a running backend.
 */
import { test as base, expect } from '@playwright/test';
import {
  MOCK_ASSETS_FULL,
  MOCK_PROVIDER,
  MOCK_STATS,
  buildListResponse,
} from './mock-api';

export const test = base.extend<object>({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      localStorage.setItem('@backstage/core:SignInPage:provider', 'guest');
      localStorage.setItem('enableLegacyGuestToken', 'true');
      // Mock clipboard so Copy buttons work without browser permissions
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: async () => {} },
        configurable: true,
      });
    });

    await page.route('**/api/dev-ai-hub/**', async route => {
      const url = new URL(route.request().url());
      const path = url.pathname.replace(/^.*\/api\/dev-ai-hub/, '');
      const method = route.request().method();

      if (method === 'GET' && path === '/assets') {
        await route.fulfill({ json: buildListResponse(url.searchParams) });
      } else if (method === 'GET' && /^\/assets\/[^/]+$/.test(path)) {
        const id = decodeURIComponent(path.split('/')[2]);
        const asset = MOCK_ASSETS_FULL.find(a => a.id === id);
        if (asset) await route.fulfill({ json: asset });
        else await route.fulfill({ status: 404, json: { error: 'Not found' } });
      } else if (method === 'GET' && path === '/stats') {
        await route.fulfill({ json: MOCK_STATS });
      } else if (method === 'GET' && path === '/providers') {
        await route.fulfill({ json: [MOCK_PROVIDER] });
      } else if (method === 'POST' && path.endsWith('/track-install')) {
        await route.fulfill({ status: 204, body: '' });
      } else {
        await route.continue();
      }
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);
  },
});

export { expect };

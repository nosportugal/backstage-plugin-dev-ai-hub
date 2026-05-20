/**
 * Pre-seed Backstage's guest-auth localStorage keys so every page load
 * auto-signs in as Guest (legacy token path) without a running auth backend.
 *
 * Keys come from @backstage/core-components SignInPage/providers internals:
 *   PROVIDER_STORAGE_KEY  → '@backstage/core:SignInPage:provider'
 *   enableLegacyGuestToken (guestProvider.tsx)
 */
import { test as base, expect } from '@playwright/test';

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
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);
  },
});

export { expect };

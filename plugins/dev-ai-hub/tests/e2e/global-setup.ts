import { chromium } from '@playwright/test';
import path from 'path';

export const STORAGE_STATE = path.join(__dirname, '.auth.json');

/**
 * Clicks through the Backstage guest sign-in screen once and saves the
 * browser storage state so every test can start already authenticated.
 */
export default async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:3000');
  await page.getByRole('button', { name: /enter/i }).click();
  // Wait until the guest session is active (sidebar or main content appears)
  await page.waitForURL(url => !url.pathname.startsWith('/sign-in'), { timeout: 15_000 });

  await page.context().storageState({ path: STORAGE_STATE });
  await browser.close();
}

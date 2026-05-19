import { test as base } from '@playwright/test';
import { mockAssetListApi, mockStatsApi, mockProvidersApi } from './mock-api';

type DevAiHubFixtures = {
  mockDevAiHubApis: void;
};

export const test = base.extend<DevAiHubFixtures>({
  mockDevAiHubApis: async ({ page }, use) => {
    await mockAssetListApi(page);
    await mockStatsApi(page);
    await mockProvidersApi(page);
    await use();
  },
});

export { expect } from '@playwright/test';

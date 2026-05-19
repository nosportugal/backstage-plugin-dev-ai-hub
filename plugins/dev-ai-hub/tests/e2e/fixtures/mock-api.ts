import { Page } from '@playwright/test';

export async function mockAssetListApi(page: Page) {
  await page.route('**/api/dev-ai-hub/assets*', async route => {
    const url = route.request().url();
    const params = new URL(url).searchParams;

    const mockAssets = [
      {
        id: 'python-linting',
        providerId: 'main',
        name: 'python-linting',
        label: 'Python Linting Guide',
        description: 'Best practices for Python linting and code quality',
        type: 'instruction',
        tools: ['claude-code', 'github-copilot'],
        tags: ['python', 'linting', 'code-quality'],
        author: 'Dev Team',
        version: '1.0.0',
        installCount: 42,
        syncedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'react-code-review',
        providerId: 'main',
        name: 'react-code-review',
        label: 'React Code Review Agent',
        description: 'AI agent specialized in reviewing React code for best practices',
        type: 'agent',
        tools: ['claude-code', 'cursor'],
        tags: ['react', 'code-review', 'javascript'],
        author: 'Dev Team',
        version: '2.1.0',
        installCount: 127,
        syncedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'ts-migration',
        providerId: 'main',
        name: 'ts-migration',
        label: 'TypeScript Migration Skill',
        description: 'Skill for migrating JavaScript projects to TypeScript',
        type: 'skill',
        tools: ['all'],
        tags: ['typescript', 'migration', 'javascript'],
        author: 'Dev Team',
        version: '1.5.0',
        installCount: 89,
        syncedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Apply filters from query params
    let filtered = mockAssets;

    if (params.has('type')) {
      const type = params.get('type');
      filtered = filtered.filter(a => a.type === type);
    }

    if (params.has('tool')) {
      const tool = params.get('tool');
      filtered = filtered.filter(a => a.tools.includes(tool) || a.tools.includes('all'));
    }

    if (params.has('search')) {
      const search = params.get('search')?.toLowerCase() || '';
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(search) ||
        a.label.toLowerCase().includes(search) ||
        a.description.toLowerCase().includes(search)
      );
    }

    const page = parseInt(params.get('page') || '1', 10);
    const pageSize = parseInt(params.get('pageSize') || '20', 10);
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    await route.abort('blockedbyclient');
    await route.continue({
      response: {
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items,
          totalCount: filtered.length,
          page,
          pageSize,
        }),
      },
    });
  });
}

export async function mockStatsApi(page: Page) {
  await page.route('**/api/dev-ai-hub/stats', async route => {
    await route.abort('blockedbyclient');
    await route.continue({
      response: {
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalAssets: 3,
          byType: {
            instruction: 1,
            agent: 1,
            skill: 1,
            workflow: 0,
          },
          byTool: {
            'claude-code': 2,
            'github-copilot': 1,
            cursor: 1,
            'google-gemini': 0,
          },
          byProvider: {
            main: 3,
          },
        }),
      },
    });
  });
}

export async function mockProvidersApi(page: Page) {
  await page.route('**/api/dev-ai-hub/providers', async route => {
    await route.abort('blockedbyclient');
    await route.continue({
      response: {
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'main',
            type: 'github',
            target: 'https://github.com/org/ai-assets',
            branch: 'main',
            status: 'idle',
            assetCount: 3,
            lastSync: new Date().toISOString(),
          },
        ]),
      },
    });
  });
}

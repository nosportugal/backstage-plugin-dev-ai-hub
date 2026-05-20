/**
 * Dev-mode API data reference.
 *
 * These values mirror what dev/index.tsx registers so tests can reference
 * real asset names, counts, and types without hard-coding strings in multiple places.
 */

export const DEV_ASSETS = [
  { id: 'mock-1', name: 'TypeScript Best Practices', type: 'instruction', installCount: 14, tools: ['claude-code', 'github-copilot'] },
  { id: 'mock-2', name: 'Code Review Agent',         type: 'agent',       installCount: 8,  tools: ['claude-code'] },
  { id: 'mock-3', name: 'Git Commit',                type: 'skill',       installCount: 22, tools: ['all'] },
  { id: 'mock-4', name: 'Feature Development Workflow', type: 'workflow',  installCount: 5,  tools: ['github-copilot', 'cursor'] },
  { id: 'mock-5', name: 'Security Guidelines',       type: 'instruction', installCount: 3,  tools: ['google-gemini', 'claude-code'] },
  { id: 'mock-6', name: 'Product Manager',           type: 'agent',       installCount: 0,  tools: ['github-copilot'] },
] as const;

export const DEV_STATS = {
  total: DEV_ASSETS.length,
  byType: { instruction: 2, agent: 2, skill: 1, workflow: 1 },
};

/** Any asset name from the dev mock that is guaranteed to be visible */
export const FIRST_ASSET = DEV_ASSETS[0].name; // 'TypeScript Best Practices'

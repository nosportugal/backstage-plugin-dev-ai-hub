# 0.2.0 — 2026-05-27

## Breaking changes

### Package scope renamed `@julianpedro` → `@nospt`

All four packages were renamed. Update any imports and `package.json` references in your Backstage installation:

```
@julianpedro/plugin-dev-ai-hub          → @nospt/plugin-dev-ai-hub
@julianpedro/plugin-dev-ai-hub-backend  → @nospt/plugin-dev-ai-hub-backend
@julianpedro/plugin-dev-ai-hub-common   → @nospt/plugin-dev-ai-hub-common
@julianpedro/plugin-dev-ai-hub-node     → @nospt/plugin-dev-ai-hub-node
```

### Frontend — New Frontend System only

The plugin dropped support for the legacy frontend system. It now uses Backstage's New Frontend System (NFS) exclusively. Installation is:

```ts
// packages/app/src/App.tsx
import { devAiHubPlugin } from '@nospt/plugin-dev-ai-hub';

const app = createApp({
  features: [devAiHubPlugin],
});
```

The plugin exposes two routes: `root` (main hub page) and `mcpConfig`. The sidebar item is registered automatically.

---

## What changed

### Frontend — Migrated to Backstage UI (`@backstage/ui`)

All components were moved from MUI (`@mui/material`) to Backstage's own UI library (`@backstage/ui@^0.14.3`). This aligns the plugin with the direction of the Backstage design system and removes the MUI peer dependency requirement from consumers.

`@backstage/core-components`, `@backstage/core-plugin-api`, and `@backstage/frontend-plugin-api` are now regular `dependencies` (not `peerDependencies`).

### Backend — Improved YAML ↔ markdown pairing

The `AssetParser` no longer requires `content:` to be set in the YAML envelope. When omitted, the sync service now resolves the markdown file by **directory junction**: it finds the single `.md` file co-located in the same directory as the `.yaml`. This makes the YAML envelopes simpler to author.

The old `AssetParser.isAssetFile()` static method was removed — file filtering is now handled earlier in the sync pipeline.

### Backend — Provider purge on startup removed

`AiAssetStore.purgeProvider()` and the startup loop that removed assets for de-configured providers were removed. Providers are no longer automatically purged when removed from `app-config.yaml`. If you need to clean up stale provider data, do it manually via the database.

### Backend — MCP tool response format improved

`list_assets`, `search_assets`, and `get_popular` now return structured JSON with pagination metadata (`totalCount`, `page`, `pageSize`, `totalPages`) and a `provider` object per asset. The `suggest_assets` tool (proactive mode) returns `install_hint` fields to guide the model directly to `install_asset`.

### Dev app — Real API client wired

The dev app (`plugins/dev-ai-hub/dev/index.tsx`) now uses the real `DevAiHubClient` against a running backend. Mock data is kept only in the E2E test fixtures (`tests/e2e/fixtures/mock-api.ts`), not shared with the dev environment.

---

## Testing

- **68 Playwright E2E tests** added across 5 spec files covering the main page, asset filtering, detail panel, install dialog, and MCP config page. Run with `yarn test:e2e` from the root.
- **Backend smoke tests** added (`router.smoke.test.ts`) — spins up an in-memory SQLite store and exercises the full router without mocking the service layer.
- **AssetParser unit tests** extended to cover the new directory-junction pairing and edge cases.

---

## Infrastructure

- GitHub Actions split into three dedicated workflows: `ci.yml` (lint + unit tests), `cd.yaml` (publish), `e2e.yml` (Playwright).
- Package manager updated to Yarn 4.13.0.
- `package-lock.json` removed; Yarn lockfile is the single source of truth.

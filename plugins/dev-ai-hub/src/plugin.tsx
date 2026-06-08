import {
  createFrontendPlugin,
  PageBlueprint,
  SubPageBlueprint,
  ApiBlueprint,
  createApiFactory,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import { RiRobot3Fill } from '@remixicon/react';
import { devAiHubApiRef, DevAiHubClient } from './api/DevAiHubClient';
import { rootRouteRef, mcpConfigRouteRef, mcpCatalogRouteRef } from './routes';

export const devAiHubPlugin = createFrontendPlugin({
  pluginId: 'dev-ai-hub',
  routes: {
    root: rootRouteRef,
    mcpConfig: mcpConfigRouteRef,
    mcpCatalog: mcpCatalogRouteRef,
  },
  extensions: [
    ApiBlueprint.make({
      params: defineParams =>
        defineParams(
          createApiFactory({
            api: devAiHubApiRef,
            deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
            factory: ({ discoveryApi, fetchApi }) =>
              new DevAiHubClient(discoveryApi, fetchApi),
          }),
        ),
    }),
    PageBlueprint.make({
      params: {
        path: '/dev-ai-hub',
        title: 'Dev AI Hub',
        icon: <RiRobot3Fill />,
        routeRef: rootRouteRef,
      },
    }),
    SubPageBlueprint.make({
      name: 'browse',
      params: {
        path: 'browse',
        title: 'Browse',
        loader: () =>
          import('./components/DevAiHubPage').then(m => <m.DevAiHubPage />),
      },
    }),
    SubPageBlueprint.make({
      name: 'mcp-config',
      params: {
        path: 'mcp-config',
        title: 'Configure MCP',
        routeRef: mcpConfigRouteRef,
        loader: () =>
          import('./components/McpConfigPage').then(m => <m.McpConfigPage />),
      },
    }),
    SubPageBlueprint.make({
      name: 'mcp-catalog',
      params: {
        path: 'mcp-catalog',
        title: 'MCP Catalog',
        routeRef: mcpCatalogRouteRef,
        loader: () =>
          import('./components/McpCatalogPage').then(m => <m.McpCatalogPage />),
      },
    }),
  ],
});

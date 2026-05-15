import {
  createFrontendPlugin,
  PageBlueprint,
  SubPageBlueprint,
  ApiBlueprint,
  NavItemBlueprint,
  createApiFactory,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import HubIcon from '@mui/icons-material/Hub';
import { devAiHubApiRef, DevAiHubClient } from './api/DevAiHubClient';
import { rootRouteRef, mcpConfigRouteRef } from './routes';

export const devAiHubPlugin = createFrontendPlugin({
  pluginId: 'dev-ai-hub',
  routes: {
    root: rootRouteRef,
    mcpConfig: mcpConfigRouteRef,
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
    NavItemBlueprint.make({
      params: {
        title: 'AI Hub',
        routeRef: rootRouteRef,
        icon: HubIcon,
      },
    }),
  ],
});

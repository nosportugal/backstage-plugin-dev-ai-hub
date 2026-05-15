import { useEffect, useState } from 'react';
import {
  Box, Flex, Text, ButtonIcon, ToggleButton, Switch,
  Tabs, TabList, Tab, TabPanel,
  Tooltip, TooltipTrigger,
} from '@backstage/ui';
import { RiFileCopyLine, RiCheckLine, RiDatabase2Line } from '@remixicon/react';
import { useApi, discoveryApiRef } from '@backstage/core-plugin-api';
import { ToolIcon } from '../ToolIcon';
import { useCopyToClipboard, useProviders } from '../../hooks';
import type { AiTool } from '@nospt/plugin-dev-ai-hub-common';
import styles from './McpConfigPage.module.css';

interface ToolConfig {
  tool: AiTool;
  label: string;
  file: string;
  description: string;
  buildConfig: (mcpUrl: string) => string;
}

const TOOL_CONFIGS: ToolConfig[] = [
  {
    tool: 'claude-code',
    label: 'Claude Code',
    file: '.mcp.json',
    description: 'Add to .mcp.json in your project root (or run via claude mcp add):',
    buildConfig: url => JSON.stringify({
      mcpServers: { 'dev-ai-hub': { type: 'http', url } },
    }, null, 2),
  },
  {
    tool: 'github-copilot',
    label: 'GitHub Copilot',
    file: '.vscode/settings.json',
    description: 'Add to your VS Code settings (.vscode/settings.json or user settings):',
    buildConfig: url => JSON.stringify({
      'github.copilot.chat.mcp.servers': { 'dev-ai-hub': { type: 'http', url } },
    }, null, 2),
  },
  {
    tool: 'google-gemini',
    label: 'Google Gemini',
    file: 'gemini-config.json',
    description: 'Add to your Gemini CLI configuration:',
    buildConfig: url => JSON.stringify({
      mcpServers: { 'dev-ai-hub': { url } },
    }, null, 2),
  },
];

function providerLabel(target: string): string {
  return target.split('/').pop()?.replace(/\.git$/, '') ?? target;
}

export function McpConfigPage() {
  const discoveryApi = useApi(discoveryApiRef);
  const { copy: copyUrl, copied: copiedUrl } = useCopyToClipboard();
  const { copy: copySnippet, copied: copiedSnippet } = useCopyToClipboard();
  const [selectedToolKey, setSelectedToolKey] = useState<string>('claude-code');
  const [baseUrl, setBaseUrl] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [proactiveEnabled, setProactiveEnabled] = useState(false);

  const { providers } = useProviders();
  const showProviderFilter = providers.length > 1;

  useEffect(() => {
    discoveryApi.getBaseUrl('dev-ai-hub').then(url => setBaseUrl(url));
  }, [discoveryApi]);

  const cfg = TOOL_CONFIGS.find(t => t.tool === selectedToolKey) ?? TOOL_CONFIGS[0];

  const buildMcpUrl = () => {
    if (!baseUrl) return 'loading...';
    const params = new URLSearchParams();
    params.set('tool', cfg.tool);
    if (selectedProvider) params.set('provider', selectedProvider);
    if (proactiveEnabled) params.set('proactive', 'true');
    return `${baseUrl}/mcp?${params.toString()}`;
  };

  const mcpUrl = buildMcpUrl();
  const configSnippet = baseUrl ? cfg.buildConfig(mcpUrl) : '';

  const [isDark, setIsDark] = useState(() => {
    if (typeof document === 'undefined') return false;
    return document.documentElement.getAttribute('data-theme-mode') === 'dark' ||
      document.body.getAttribute('data-theme-mode') === 'dark';
  });

  useEffect(() => {
    const getIsDark = () =>
      document.documentElement.getAttribute('data-theme-mode') === 'dark' ||
      document.body.getAttribute('data-theme-mode') === 'dark';

    const observer = new MutationObserver(() => setIsDark(getIsDark()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme-mode'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme-mode'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.pageRoot}>
      <Text variant="title-small" weight="bold">Configure MCP Server</Text>
      <Text variant="body-small" color="secondary" className={styles.subtitle}>
        Connect your AI tool to the Dev AI Hub via Model Context Protocol.
      </Text>

      <div className={styles.configContent}>
        <Tabs selectedKey={selectedToolKey} onSelectionChange={key => setSelectedToolKey(key as string)}>
          <TabList className={styles.tabBar}>
            {TOOL_CONFIGS.map(t => (
              <Tab key={t.tool} id={t.tool}>
                <span className={styles.tabContent}>
                  <ToolIcon tool={t.tool} size={16} />
                  <span>{t.label}</span>
                </span>
              </Tab>
            ))}
          </TabList>

          {TOOL_CONFIGS.map(t => (
            <TabPanel key={t.tool} id={t.tool}>
              {showProviderFilter && (
                <Box className={styles.providerSection}>
                  <Text variant="body-x-small" color="secondary" className={styles.sectionLabel}>
                    Scope to Provider
                  </Text>
                  <Flex className={styles.chipsRow}>
                    <ToggleButton
                      id="all-providers"
                      size="small"
                      className={styles.filterChip}
                      isSelected={!selectedProvider}
                      onChange={() => setSelectedProvider('')}
                      style={{
                        borderColor: !selectedProvider ? 'var(--bui-fg-primary)' : 'var(--bui-border-1)',
                        backgroundColor: !selectedProvider ? 'var(--bui-fg-primary)' : 'transparent',
                        color: !selectedProvider ? 'var(--bui-bg-neutral-1)' : 'var(--bui-fg-secondary)',
                      }}
                    >
                      All providers
                    </ToggleButton>
                    {providers.map(p => {
                      const isSelected = selectedProvider === p.id;
                      const label = providerLabel(p.target);
                      return (
                        <ToggleButton
                          key={p.id}
                          id={p.id}
                          size="small"
                          className={styles.filterChip}
                          iconStart={<RiDatabase2Line size={12} style={{ color: isSelected ? 'var(--bui-bg-neutral-1)' : 'inherit' }} />}
                          isSelected={isSelected}
                          onChange={() => setSelectedProvider(isSelected ? '' : p.id)}
                          style={{
                            borderColor: isSelected ? 'var(--bui-fg-primary)' : 'var(--bui-border-1)',
                            backgroundColor: isSelected ? 'var(--bui-fg-primary)' : 'transparent',
                            color: isSelected ? 'var(--bui-bg-neutral-1)' : 'var(--bui-fg-secondary)',
                          }}
                        >
                          {label}
                        </ToggleButton>
                      );
                    })}
                  </Flex>
                </Box>
              )}

              <Flex className={styles.proactiveSection}>
                <Flex className={styles.proactiveRow}>
                  <Switch
                    isSelected={proactiveEnabled}
                    onChange={setProactiveEnabled}
                    aria-label="Proactive suggestions"
                  />
                  <Box>
                    <Text variant="body-small" weight="bold">Proactive suggestions</Text>
                    <Text variant="body-x-small" color="secondary">
                      The AI will automatically suggest relevant assets based on your project context.
                      Disable if you prefer to search manually.
                    </Text>
                  </Box>
                </Flex>
              </Flex>

              <Box className={styles.urlSection}>
                <Text variant="body-x-small" color="secondary" className={styles.sectionLabel}>
                  MCP Endpoint
                </Text>
                <Flex className={styles.urlBox}>
                  <Text variant="body-small" className={styles.urlText}>
                    {mcpUrl}
                  </Text>
                  <TooltipTrigger>
                    <ButtonIcon
                      aria-label="Copy URL"
                      icon={copiedUrl ? <RiCheckLine size={14} style={{ color: 'var(--bui-fg-success)' }} /> : <RiFileCopyLine size={14} />}
                      variant="tertiary"
                      onPress={() => copyUrl(mcpUrl)}
                    />
                    <Tooltip>{copiedUrl ? 'Copied!' : 'Copy URL'}</Tooltip>
                  </TooltipTrigger>
                </Flex>
              </Box>

              <Text variant="body-x-small" color="secondary" className={styles.sectionLabel}>
                {t.file}
              </Text>
              <Text variant="body-x-small" color="secondary" style={{ display: 'block', marginBottom: 'var(--bui-space-2)', marginTop: 'var(--bui-space-1)' }}>
                {t.description}
              </Text>
              <div className={styles.snippetContainer}>
                <pre className={`${styles.snippetPre} ${isDark ? styles.snippetPreDark : styles.snippetPreLight}`}>
                  {configSnippet}
                </pre>
                <TooltipTrigger>
                  <ButtonIcon
                    aria-label="Copy config"
                    className={styles.copySnippetButton}
                    icon={copiedSnippet ? <RiCheckLine size={14} style={{ color: 'var(--bui-fg-success)' }} /> : <RiFileCopyLine size={14} />}
                    variant="tertiary"
                    onPress={() => copySnippet(configSnippet)}
                  />
                  <Tooltip>{copiedSnippet ? 'Copied!' : 'Copy config'}</Tooltip>
                </TooltipTrigger>
              </div>

              <Text variant="body-x-small" color="secondary" className={styles.hint}>
                💡 Omit <code>?tool=</code> from the URL to receive assets for all AI tools.
                {showProviderFilter && ' Omit ?provider= to receive assets from all repositories.'}
                {' '}Proactive suggestions add <code>?proactive=true</code> and register the{' '}
                <code>suggest_assets</code> tool and <code>check_for_assets</code> prompt.
              </Text>
            </TabPanel>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

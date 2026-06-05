import { useEffect, useState } from 'react';
import {
  Box, Flex, Text, Button, ButtonIcon, ToggleButton, Switch,
  Tabs, TabList, Tab, TabPanel,
  Tooltip, TooltipTrigger,
} from '@backstage/ui';
import { RiFileCopyLine, RiCheckLine, RiDatabase2Line, RiServerLine } from '@remixicon/react';
import { useApi, discoveryApiRef } from '@backstage/core-plugin-api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { ToolIcon } from '../ToolIcon';
import { useCopyToClipboard, useProviders, useMcpCatalog } from '../../hooks';
import type { AiTool, McpCatalogEntry } from '@julianpedro/plugin-dev-ai-hub-common';
import { devAiHubTranslationRef } from '../../translation';
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

function CatalogEntryCard({ entry }: { entry: McpCatalogEntry }) {
  const { t } = useTranslationRef(devAiHubTranslationRef);
  const handleInstallVscode = () => {
    const config: Record<string, unknown> = { name: entry.id, type: entry.type };
    if (entry.type === 'http') config.url = entry.url;
    if (entry.type === 'stdio') {
      config.command = entry.command;
      if (entry.args?.length) config.args = entry.args;
      if (entry.env && Object.keys(entry.env).length) config.env = entry.env;
    }
    window.location.href = `vscode:mcp/install?${encodeURIComponent(JSON.stringify(config))}`;
  };

  const handleInstallCursor = () => {
    const config: Record<string, unknown> = { type: entry.type };
    if (entry.type === 'http') config.url = entry.url;
    if (entry.type === 'stdio') {
      config.command = entry.command;
      if (entry.args?.length) config.args = entry.args;
      if (entry.env && Object.keys(entry.env).length) config.env = entry.env;
    }
    window.location.href = `cursor://anysphere.cursor-deeplink/mcp/install?name=${encodeURIComponent(entry.name)}&config=${btoa(JSON.stringify(config))}`;
  };

  const canInstall =
    (entry.type === 'http' && !!entry.url) ||
    (entry.type === 'stdio' && !!entry.command);

  return (
    <Box className={styles.catalogCard}>
      <Flex align="center" style={{ gap: 'var(--bui-space-2)' }}>
        <Box className={styles.catalogIcon}>
          {entry.icon ? (
            <img
              src={entry.icon}
              alt={entry.name}
              className={styles.catalogIconImage}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <RiServerLine size={20} style={{ color: 'var(--bui-fg-secondary)' }} />
          )}
        </Box>
        <Box style={{ minWidth: 0, flex: 1 }}>
          <Text variant="body-small" weight="bold">{entry.name}</Text>
          <Text variant="body-x-small" color="secondary">{entry.type.toUpperCase()}</Text>
        </Box>
      </Flex>
      {entry.description && (
        <Text variant="body-x-small" color="secondary" className={styles.catalogDescription}>
          {entry.description}
        </Text>
      )}
      <Flex style={{ gap: 'var(--bui-space-2)', marginTop: 'auto' }}>
        <Button size="small" variant="secondary" isDisabled={!canInstall} onPress={handleInstallVscode}>
          {t('mcpConfigDialog.catalogVscode')}
        </Button>
        <Button size="small" variant="secondary" isDisabled={!canInstall} onPress={handleInstallCursor}>
          {t('mcpConfigDialog.catalogCursor')}
        </Button>
      </Flex>
    </Box>
  );
}

export function McpConfigPage() {
  const { t } = useTranslationRef(devAiHubTranslationRef);
  const discoveryApi = useApi(discoveryApiRef);
  const { copy: copyUrl, copied: copiedUrl } = useCopyToClipboard();
  const { copy: copySnippet, copied: copiedSnippet } = useCopyToClipboard();
  const [selectedToolKey, setSelectedToolKey] = useState<string>('claude-code');
  const [baseUrl, setBaseUrl] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [proactiveEnabled, setProactiveEnabled] = useState(false);

  const { providers } = useProviders();
  const showProviderFilter = providers.length > 1;
  const { catalog } = useMcpCatalog();

  useEffect(() => {
    discoveryApi.getBaseUrl('dev-ai-hub').then(url => setBaseUrl(url));
  }, [discoveryApi]);

  const cfg = TOOL_CONFIGS.find(c => c.tool === selectedToolKey) ?? TOOL_CONFIGS[0];

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
      <Text variant="title-small" weight="bold">{t('mcpConfigDialog.configureTitle')}</Text>
      <Text variant="body-small" color="secondary" className={styles.subtitle}>
        {t('mcpConfigDialog.configureSubtitle')}
      </Text>

      {catalog.length > 0 && (
        <Box className={styles.catalogSection}>
          <Flex align="center" style={{ gap: 'var(--bui-space-2)', marginBottom: 'var(--bui-space-2)' }}>
            <RiServerLine size={16} style={{ color: 'var(--bui-fg-secondary)' }} />
            <Text variant="body-medium" weight="bold">{t('mcpConfigDialog.catalogTab')}</Text>
            <Text variant="body-x-small" color="secondary">
              {t('mcpConfigDialog.catalogAvailable', { n: String(catalog.length) })}
            </Text>
          </Flex>
          <Text variant="body-x-small" color="secondary" style={{ display: 'block', marginBottom: 'var(--bui-space-3)' }}>
            {t('mcpConfigDialog.catalogDescription')}
          </Text>
          <div className={styles.catalogGrid}>
            {catalog.map(entry => (
              <CatalogEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </Box>
      )}

      <div className={styles.configContent}>
        <Tabs selectedKey={selectedToolKey} onSelectionChange={key => setSelectedToolKey(key as string)}>
          <TabList className={styles.tabBar}>
            {TOOL_CONFIGS.map(cfgItem => (
              <Tab key={cfgItem.tool} id={cfgItem.tool}>
                <span className={styles.tabContent}>
                  <ToolIcon tool={cfgItem.tool} size={16} />
                  <span>{cfgItem.label}</span>
                </span>
              </Tab>
            ))}
          </TabList>

          {TOOL_CONFIGS.map(cfgItem => (
            <TabPanel key={cfgItem.tool} id={cfgItem.tool}>
              {showProviderFilter && (
                <Box className={styles.providerSection}>
                  <Text variant="body-x-small" color="secondary" className={styles.sectionLabel}>
                    {t('mcpConfigDialog.scopeToProvider')}
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
                      {t('mcpConfigDialog.allProviders')}
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
                    aria-label={t('mcpConfigDialog.proactiveSuggestions')}
                  />
                  <Box>
                    <Text variant="body-small" weight="bold">{t('mcpConfigDialog.proactiveSuggestions')}</Text>
                    <Text variant="body-x-small" color="secondary">
                      {t('mcpConfigDialog.proactiveDescription')}
                    </Text>
                  </Box>
                </Flex>
              </Flex>

              <Box className={styles.urlSection}>
                <Text variant="body-x-small" color="secondary" className={styles.sectionLabel}>
                  {t('mcpConfigDialog.mcpEndpoint')}
                </Text>
                <Flex className={styles.urlBox}>
                  <Text variant="body-small" className={styles.urlText}>
                    {mcpUrl}
                  </Text>
                  <TooltipTrigger>
                    <ButtonIcon
                      aria-label={copiedUrl ? t('mcpConfigDialog.copied') : t('mcpConfigDialog.copyUrl')}
                      icon={copiedUrl ? <RiCheckLine size={14} style={{ color: 'var(--bui-fg-success)' }} /> : <RiFileCopyLine size={14} />}
                      variant="tertiary"
                      onPress={() => copyUrl(mcpUrl)}
                    />
                    <Tooltip>{copiedUrl ? t('mcpConfigDialog.copied') : t('mcpConfigDialog.copyUrl')}</Tooltip>
                  </TooltipTrigger>
                </Flex>
              </Box>

              <Text variant="body-x-small" color="secondary" className={styles.sectionLabel}>
                {cfgItem.file}
              </Text>
              <Text variant="body-x-small" color="secondary" style={{ display: 'block', marginBottom: 'var(--bui-space-2)', marginTop: 'var(--bui-space-1)' }}>
                {(() => {
                  if (cfgItem.tool === 'claude-code') return t('mcpConfigDialog.claudeConfigDesc');
                  if (cfgItem.tool === 'github-copilot') return t('mcpConfigDialog.copilotConfigDesc');
                  return t('mcpConfigDialog.geminiConfigDesc');
                })()}
              </Text>
              <div className={styles.snippetContainer}>
                <pre className={`${styles.snippetPre} ${isDark ? styles.snippetPreDark : styles.snippetPreLight}`}>
                  {configSnippet}
                </pre>
                <TooltipTrigger>
                  <ButtonIcon
                    aria-label={t('mcpConfigDialog.copyConfig')}
                    className={styles.copySnippetButton}
                    icon={copiedSnippet ? <RiCheckLine size={14} style={{ color: 'var(--bui-fg-success)' }} /> : <RiFileCopyLine size={14} />}
                    variant="tertiary"
                    onPress={() => copySnippet(configSnippet)}
                  />
                  <Tooltip>{copiedSnippet ? t('mcpConfigDialog.copied') : t('mcpConfigDialog.copyConfig')}</Tooltip>
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

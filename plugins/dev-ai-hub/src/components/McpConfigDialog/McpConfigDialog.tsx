import { useEffect, useState } from 'react';
import {
  Box, Flex, Text, Button, ButtonIcon, ToggleButton, Switch,
  Dialog, DialogTrigger, DialogHeader, DialogBody, DialogFooter,
  Tabs, TabList, Tab, TabPanel,
  Tooltip, TooltipTrigger,
} from '@backstage/ui';
import { RiFileCopyLine, RiCheckLine, RiDatabase2Line } from '@remixicon/react';
import { useApi, discoveryApiRef } from '@backstage/core-plugin-api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { ToolIcon } from '../ToolIcon';
import { useCopyToClipboard, useProviders } from '../../hooks';
import type { AiTool } from '@nospt/plugin-dev-ai-hub-common';
import styles from './McpConfigDialog.module.css';

interface ToolConfig {
  tool: AiTool;
  label: string;
  file: string;
  description: string;
  buildConfig: (mcpUrl: string) => string;
}

const TYPE_ACCENT: Record<string, string> = {
  http: '#2563EB',
  stdio: '#059669',
};

function providerLabel(target: string): string {
  return target.split('/').pop()?.replace(/\.git$/, '') ?? target;
}

// ─── MCP Catalog entry card ───────────────────────────────────────────────────

interface CatalogEntryCardProps {
  entry: McpCatalogEntry;
}

function CatalogEntryCard({ entry }: CatalogEntryCardProps) {
  const { t } = useTranslationRef(devAiHubTranslationRef);
  const accent = TYPE_ACCENT[entry.type] ?? '#64748b';

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
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderLeft: `3px solid ${accent}`,
        borderRadius: 2,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        height: '100%',
        minHeight: 148,
        transition: 'all 0.15s ease',
        '&:hover': {
          boxShadow: `0 4px 16px ${accent}25`,
          borderColor: `${accent}60`,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            backgroundColor: `${accent}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 2px 8px ${accent}20`,
          }}
        >
          {entry.icon ? (
            <Box
              component="img"
              src={entry.icon}
              alt={entry.name}
              sx={{ width: 32, height: 32, objectFit: 'contain' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <StorageIcon sx={{ fontSize: '1.4rem', color: accent }} />
          )}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25, flexWrap: 'wrap' }}>
            <Typography variant="subtitle2" fontWeight={700} noWrap title={entry.name} sx={{ flex: 1 }}>
              {entry.name}
            </Typography>
            <Chip
              label={entry.type}
              size="small"
              sx={{
                height: 18,
                fontSize: '0.6rem',
                fontFamily: 'monospace',
                fontWeight: 700,
                bgcolor: `${accent}18`,
                color: accent,
                border: '1px solid',
                borderColor: `${accent}40`,
              }}
            />
          </Box>
          {entry.description && (
            <Typography variant="caption" color="text.secondary" title={entry.description} sx={{ display: 'block', lineHeight: 1.4 }}>
              {entry.description}
            </Typography>
          )}
          {entry.type === 'http' && entry.url && (
            <Typography
              variant="caption"
              sx={{ display: 'block', fontFamily: 'monospace', fontSize: '0.68rem', color: 'text.disabled', mt: 0.25, wordBreak: 'break-all' }}
            >
              {entry.url}
            </Typography>
          )}
          {entry.type === 'stdio' && entry.command && (
            <Typography
              variant="caption"
              sx={{ display: 'block', fontFamily: 'monospace', fontSize: '0.68rem', color: 'text.disabled', mt: 0.25 }}
            >
              {[entry.command, ...(entry.args ?? [])].join(' ')}
            </Typography>
          )}
        </Box>
      </Box>

      {canInstall && (
        <Divider sx={{ mt: 'auto' }} />
      )}
      {canInstall && (
        <Box sx={{ display: 'flex', gap: 0.75 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<OpenInBrowserIcon sx={{ fontSize: '0.85rem !important' }} />}
            onClick={handleInstallVscode}
            fullWidth
            sx={{
              fontSize: '0.75rem',
              fontWeight: 700,
              py: 0.5,
              borderColor: `${accent}50`,
              color: accent,
              '&:hover': { borderColor: accent, bgcolor: `${accent}0a` },
            }}
          >
            {t('mcpConfigDialog.installInVscode')}
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ToolIcon tool="cursor" branded={false} sx={{ fontSize: '0.85rem !important', color: `${accent} !important` }} />}
            onClick={handleInstallCursor}
            fullWidth
            sx={{
              fontSize: '0.75rem',
              fontWeight: 700,
              py: 0.5,
              borderColor: `${accent}50`,
              color: accent,
              '&:hover': { borderColor: accent, bgcolor: `${accent}0a` },
            }}
          >
            {t('mcpConfigDialog.installInCursor')}
          </Button>
        </Box>
      )}
    </Box>
  );
}

// ─── Main dialog ──────────────────────────────────────────────────────────────

interface McpConfigDialogProps {
  open: boolean;
  onClose: () => void;
}

export function McpConfigDialog({ open, onClose }: McpConfigDialogProps) {
  const discoveryApi = useApi(discoveryApiRef);
  const { copy: copyUrl, copied: copiedUrl } = useCopyToClipboard();
  const { copy: copySnippet, copied: copiedSnippet } = useCopyToClipboard();
  const [selectedToolKey, setSelectedToolKey] = useState<string>('claude-code');
  const [baseUrl, setBaseUrl] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [proactiveEnabled, setProactiveEnabled] = useState(false);
  const [toolConfigExpanded, setToolConfigExpanded] = useState(false);
  const [manualExpanded, setManualExpanded] = useState(false);

  const { providers } = useProviders();
  const { catalog } = useMcpCatalog();
  const showProviderFilter = providers.length > 1;

  const toolConfigs = useMemo<ToolConfig[]>(() => [
    {
      tool: 'claude-code',
      label: 'Claude Code',
      file: '.mcp.json',
      description: t('mcpConfigDialog.claudeConfigDesc'),
      buildConfig: url => JSON.stringify({
        mcpServers: { 'dev-ai-hub': { type: 'http', url } },
      }, null, 2),
    },
    {
      tool: 'github-copilot',
      label: 'GitHub Copilot',
      file: '.vscode/settings.json',
      description: t('mcpConfigDialog.copilotConfigDesc'),
      buildConfig: url => JSON.stringify({
        'github.copilot.chat.mcp.servers': { 'dev-ai-hub': { type: 'http', url } },
      }, null, 2),
    },
    {
      tool: 'google-gemini',
      label: 'Google Gemini',
      file: 'gemini-config.json',
      description: t('mcpConfigDialog.geminiConfigDesc'),
      buildConfig: url => JSON.stringify({
        mcpServers: { 'dev-ai-hub': { url } },
      }, null, 2),
    },
    {
      tool: 'cursor',
      label: 'Cursor',
      file: '.cursor/mcp.json',
      description: t('mcpConfigDialog.cursorConfigDesc'),
      buildConfig: url => JSON.stringify({
        mcpServers: { 'dev-ai-hub': { type: 'http', url } },
      }, null, 2),
    },
  ], [t]);

  useEffect(() => {
    if (open) {
      discoveryApi.getBaseUrl('dev-ai-hub').then(url => setBaseUrl(url));
    }
  }, [open, discoveryApi]);

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

  // Detect dark mode by observing BUI's data-theme-mode attribute, which
  // reflects the Backstage theme toggle (not the OS preference).
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
    <DialogTrigger>
      <Dialog
        isOpen={open}
        isDismissable
        onOpenChange={o => { if (!o) onClose(); }}
      >
        <DialogHeader>
          <Text variant="title-small" weight="bold">Configure MCP Server</Text>
          <Text variant="body-small" color="secondary" className={styles.subtitle}>
            Connect your AI tool to the Dev AI Hub via Model Context Protocol.
          </Text>
        </DialogHeader>

        <DialogBody>
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

            {/* All tab panels share the same content below */}
            {TOOL_CONFIGS.map(t => (
              <TabPanel key={t.tool} id={t.tool}>
                {/* Provider filter — only shown when there are 2+ providers */}
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

                {/* Proactive suggestions toggle */}
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

                {/* MCP URL */}
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

                {/* Config snippet */}
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
        </DialogBody>

        <DialogFooter>
          <Button onClick={onClose} variant="secondary" slot="close">
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
}

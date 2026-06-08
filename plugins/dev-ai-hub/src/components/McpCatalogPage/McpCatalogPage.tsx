import { Box, Flex, Text, Button } from '@backstage/ui';
import { RiServerLine } from '@remixicon/react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { useMcpCatalog } from '../../hooks';
import type { McpCatalogEntry } from '@julianpedro/plugin-dev-ai-hub-common';
import { devAiHubTranslationRef } from '../../translation';
import styles from './McpCatalogPage.module.css';

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

export function McpCatalogPage() {
  const { t } = useTranslationRef(devAiHubTranslationRef);
  const { catalog } = useMcpCatalog();

  return (
    <div className={styles.pageRoot}>
      <Flex align="center" style={{ gap: 'var(--bui-space-2)' }}>
        <RiServerLine size={20} style={{ color: 'var(--bui-fg-secondary)' }} />
        <Text variant="title-small" weight="bold">{t('mcpConfigDialog.catalogTab')}</Text>
        {catalog.length > 0 && (
          <Text variant="body-x-small" color="secondary">
            {t('mcpConfigDialog.catalogAvailable', { n: String(catalog.length) })}
          </Text>
        )}
      </Flex>
      <Text variant="body-small" color="secondary" className={styles.subtitle}>
        {t('mcpConfigDialog.catalogDescription')}
      </Text>

      {catalog.length === 0 ? (
        <Flex direction="column" align="center" className={styles.catalogEmpty}>
          <RiServerLine size={32} style={{ color: 'var(--bui-fg-secondary)' }} />
          <Text variant="body-small" weight="bold">{t('mcpConfigDialog.catalogEmpty')}</Text>
          <Text variant="body-x-small" color="secondary">{t('mcpConfigDialog.catalogAddHint')}</Text>
        </Flex>
      ) : (
        <div className={styles.catalogGrid}>
          {catalog.map(entry => (
            <CatalogEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

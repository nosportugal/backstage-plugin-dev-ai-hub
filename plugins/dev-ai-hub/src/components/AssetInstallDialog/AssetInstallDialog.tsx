import { useState } from 'react';
import {
  Box, Flex, Text, Button, Tag, TagGroup, Skeleton,
  Dialog, DialogTrigger, DialogHeader, DialogBody, DialogFooter,
  Tooltip, TooltipTrigger,
} from '@backstage/ui';
import { RiFileCopyLine, RiDownloadLine, RiCheckLine, RiFolderZipLine } from '@remixicon/react';
import type { AiTool } from '@julianpedro/plugin-dev-ai-hub-common';
import { getInstallPathsForAsset } from '@julianpedro/plugin-dev-ai-hub-common';
import { useApi } from '@backstage/core-plugin-api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { devAiHubApiRef } from '../../api/DevAiHubClient';
import { useAssetDetail } from '../../hooks';
import { ToolIcon } from '../ToolIcon';
import { devAiHubTranslationRef } from '../../translation';
import styles from './AssetInstallDialog.module.css';

const TOOL_LABELS: Record<string, string> = {
  'claude-code':    'Claude Code',
  'github-copilot': 'GitHub Copilot',
  'google-gemini':  'Google Gemini',
  'cursor':         'Cursor',
};

interface AssetInstallDialogProps {
  assetId: string | null;
  onClose: () => void;
}

export function AssetInstallDialog({ assetId, onClose }: AssetInstallDialogProps) {
  const { t } = useTranslationRef(devAiHubTranslationRef);
  const [copiedTool, setCopiedTool] = useState<string | null>(null);
  const api = useApi(devAiHubApiRef);
  const { asset, loading } = useAssetDetail(assetId);

  const handleClose = () => {
    onClose();
    setCopiedTool(null);
  };

  const handleCopy = (tool: string) => {
    if (!asset) return;
    navigator.clipboard.writeText(asset.content).then(() => {
      setCopiedTool(tool);
      setTimeout(() => setCopiedTool(null), 2000);
    });
    api.trackInstall(asset.id).catch(() => {});
  };

  const resourcePaths = asset?.resourcesContent
    ? Object.keys(asset.resourcesContent)
    : [];
  const isZipSkill = asset?.type === 'skill' && resourcePaths.length > 0;

  const handleDownload = async (_tool: string, installPath: string) => {
    if (!asset) return;
    if (isZipSkill) {
      const url = await api.getDownloadUrl(asset.id);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${asset.name.replace(/\s+/g, '-').toLowerCase()}.zip`;
      a.click();
    } else {
      const filename = installPath.split('/').pop() ?? `${asset.name}.md`;
      const blob = new Blob([asset.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
    api.trackInstall(asset.id).catch(() => {});
  };

  const installPaths = asset
    ? getInstallPathsForAsset(asset.type, asset.tools, asset.name, {
        installPath: asset.installPath,
        installPaths: asset.installPaths,
      })
    : {};

  return (
    <DialogTrigger>
      <Dialog
        isOpen={!!assetId}
        isDismissable
        onOpenChange={open => { if (!open) handleClose(); }}
      >
        <DialogHeader>
          {asset ? t('assetInstallDialog.dialogTitle', { name: asset.name }) : 'Install'}
          <Text variant="body-small" color="secondary" className={styles.subtitle}>
            {t('assetInstallDialog.dialogSubtitle')}
          </Text>
        </DialogHeader>

        <DialogBody>
          <Flex direction="column" style={{ gap: 'var(--bui-space-3)' }}>
            {loading && (
              <Flex className={styles.loadingContainer}>
                <Skeleton style={{ width: '100%', height: 80 }} />
              </Flex>
            )}

            {!loading && asset && isZipSkill && (
              <Box className={styles.zipInfo}>
                <Flex className={styles.zipHeader}>
                  <RiFolderZipLine size={16} style={{ color: 'var(--bui-fg-info)' }} />
                  <Text variant="body-small" weight="bold" style={{ color: 'var(--bui-fg-info)' }}>
                    {t('assetInstallDialog.bundledSkillTitle')}
                  </Text>
                </Flex>
                <Text variant="body-x-small" color="secondary" style={{ display: 'block', marginBottom: 'var(--bui-space-2)' }}>
                  {t('assetInstallDialog.bundledSkillDescription')}
                </Text>
                <TagGroup aria-label="Bundled files">
                  <Flex className={styles.zipFiles}>
                    <Tag id="skill-md" size="small" className={styles.monoTag}>SKILL.md</Tag>
                    {resourcePaths.map(p => (
                      <Tag key={p} id={p} size="small" className={styles.monoTag}>{p}</Tag>
                    ))}
                  </Flex>
                </TagGroup>
              </Box>
            )}

            {!loading && asset && Object.entries(installPaths).map(([tool, installPath]) => (
              <Box key={tool} className={styles.toolSection}>
                <Flex className={styles.toolHeader}>
                  <ToolIcon tool={tool as AiTool} size={16} />
                  <Text variant="body-small" weight="bold">
                    {TOOL_LABELS[tool] ?? tool}
                  </Text>
                </Flex>

                <Text variant="body-x-small" color="secondary" style={{ display: 'block', marginBottom: 'var(--bui-space-1)' }}>
                  {t('assetInstallDialog.installPathLabel')}
                </Text>
                <Box className={styles.installPathBox}>
                  {installPath}
                </Box>

                <Flex className={styles.toolActions}>
                  <TooltipTrigger>
                    <Button
                      variant="secondary"
                      onClick={() => handleCopy(tool)}
                    >
                      {copiedTool === tool ? <RiCheckLine size={14} /> : <RiFileCopyLine size={14} />}
                      {copiedTool === tool ? t('assetInstallDialog.copied') : t('assetInstallDialog.copyContent')}
                    </Button>
                    <Tooltip>{copiedTool === tool ? t('assetInstallDialog.copied') : t('assetInstallDialog.copyTooltip')}</Tooltip>
                  </TooltipTrigger>
                  <TooltipTrigger>
                    <Button
                      variant="secondary"
                      onClick={() => handleDownload(tool, installPath)}
                    >
                      {isZipSkill ? <RiFolderZipLine size={14} /> : <RiDownloadLine size={14} />}
                      {isZipSkill ? t('assetInstallDialog.downloadZip') : t('assetInstallDialog.download')}
                    </Button>
                    <Tooltip>{isZipSkill ? t('assetInstallDialog.downloadZipTooltip') : t('assetInstallDialog.downloadTooltip')}</Tooltip>
                  </TooltipTrigger>
                </Flex>
              </Box>
            ))}
          </Flex>
        </DialogBody>

        <DialogFooter>
          <Button onClick={handleClose} variant="secondary" slot="close">
            {t('assetInstallDialog.close')}
          </Button>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
}

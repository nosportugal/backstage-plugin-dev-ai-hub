import { useState } from 'react';
import {
  Box, Flex, Text, Button, Tag, TagGroup, Skeleton,
  Dialog, DialogTrigger, DialogHeader, DialogBody, DialogFooter,
  Tooltip, TooltipTrigger,
} from '@backstage/ui';
import { RiFileCopyLine, RiDownloadLine, RiCheckLine, RiFolderZipLine } from '@remixicon/react';
import type { AiTool } from '@nospt/plugin-dev-ai-hub-common';
import { getInstallPathsForAsset } from '@nospt/plugin-dev-ai-hub-common';
import { useApi } from '@backstage/core-plugin-api';
import { devAiHubApiRef } from '../../api/DevAiHubClient';
import { useAssetDetail } from '../../hooks';
import { ToolIcon } from '../ToolIcon';
import styles from './AssetInstallDialog.module.css';

const TOOL_LABELS: Record<string, string> = {
  'claude-code':    'Claude Code',
  'github-copilot': 'GitHub Copilot',
  'google-gemini':  'Google Gemini',
  'cursor':         'Cursor',
};

/**
 * vscode:chat-agent/install can only place files inside .github/ (agents → .github/agents/,
 * instructions → .github/instructions/). Root-level files like AGENTS.md, CLAUDE.md, etc.
 * cannot be installed via deep link — the handler would put them in the wrong directory.
 */
function canUseVscodeDeepLink(type: string, tools: string[], installPath?: string): boolean {
  if (type !== 'agent' && type !== 'instruction') return false;
  if (!tools.includes('github-copilot')) return false;
  // If a custom install path is defined and it doesn't live under .github/, skip the button.
  if (installPath && !installPath.startsWith('.github/')) return false;
  return true;
}

function buildVscodeRedirectUrl(asset: AiAsset, backendUrl: string): string {
  const safeName = (asset.label ?? asset.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const filename = asset.type === 'instruction'
    ? `${safeName}.instructions.md`
    : `${safeName}.agent.md`;
  const fileUrl = `${backendUrl}/assets/${encodeURIComponent(asset.id)}/agent-md/${filename}`;
  const vscodeUri = `vscode:chat-agent/install?url=${encodeURIComponent(fileUrl)}`;
  return `https://vscode.dev/redirect?url=${encodeURIComponent(vscodeUri)}`;
}

// ─── Single-asset view ───────────────────────────────────────────────────────

interface SingleAssetViewProps {
  asset: AiAsset;
}

function SingleAssetView({ asset }: SingleAssetViewProps) {
  const [copiedTool, setCopiedTool] = useState<string | null>(null);
  const api = useApi(devAiHubApiRef);
  const discoveryApi = useApi(discoveryApiRef);
  const { t } = useTranslationRef(devAiHubTranslationRef);

  const resourcePaths = asset.resourcesContent ? Object.keys(asset.resourcesContent) : [];
  const isZipSkill = asset.type === 'skill' && resourcePaths.length > 0;

  const installPaths = getInstallPathsForAsset(asset.type, asset.tools, asset.name, {
    installPath: asset.installPath,
    installPaths: asset.installPaths,
  });

  const handleCopy = (tool: string) => {
    navigator.clipboard.writeText(asset.content).then(() => {
      setCopiedTool(tool);
      setTimeout(() => setCopiedTool(null), 2000);
    });
    api.trackInstall(asset.id).catch(() => {});
  };

  const handleDownload = async (_tool: string, installPath: string) => {
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

  const handleInstallInVscode = async () => {
    const backendUrl = await discoveryApi.getBaseUrl('dev-ai-hub');
    const a = document.createElement('a');
    a.href = buildVscodeRedirectUrl(asset, backendUrl);
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    api.trackInstall(asset.id).catch(() => {});
  };

  const showVscodeButton = canUseVscodeDeepLink(asset.type, asset.tools, installPaths['github-copilot']);

  return (
    <>
      {isZipSkill && (
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'info.main',
            borderRadius: 2,
            p: 1.5,
            bgcolor: theme => `${theme.palette.info.main}12`,
            mb: 0.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <FolderZipIcon sx={{ fontSize: '1rem', color: 'info.main' }} />
            <Typography variant="subtitle2" fontWeight={700} color="info.main">
              {t('assetInstallDialog.bundledSkillTitle')}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {t('assetInstallDialog.bundledSkillDescription')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            <Chip label="SKILL.md" size="small" sx={{ fontFamily: 'monospace', fontSize: '0.7rem', height: 20 }} />
            {resourcePaths.map(p => (
              <Chip key={p} label={p} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontSize: '0.7rem', height: 20 }} />
            ))}
          </Box>
        </Box>
      )}

      {Object.entries(installPaths).map(([tool, installPath]) => (
        <Box
          key={tool}
          sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <ToolIcon tool={tool as AiTool} sx={{ fontSize: '1rem' }} />
            <Typography variant="subtitle2" fontWeight={700}>
              {TOOL_LABELS[tool] ?? tool}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            {t('assetInstallDialog.installPathLabel')}
          </Typography>
          <Box
            sx={{
              bgcolor: 'action.hover',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              px: 1.5,
              py: 0.75,
              fontFamily: 'monospace',
              fontSize: '0.78rem',
              wordBreak: 'break-all',
              mb: 1.25,
            }}
          >
            {installPath}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {showVscodeButton && tool === 'github-copilot' && (
              <Button
                size="small"
                variant="contained"
                startIcon={<OpenInBrowserIcon />}
                onClick={handleInstallInVscode}
                fullWidth
              >
                {t('assetInstallDialog.installInVscode')}
              </Button>
            )}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={copiedTool === tool ? t('assetInstallDialog.copied') : t('assetInstallDialog.copyTooltip')}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={copiedTool === tool ? <CheckIcon /> : <ContentCopyIcon />}
                  onClick={() => handleCopy(tool)}
                  color={copiedTool === tool ? 'success' : 'primary'}
                  sx={{ flex: 1 }}
                >
                  {copiedTool === tool ? t('assetInstallDialog.copied') : t('assetInstallDialog.copyContent')}
                </Button>
              </Tooltip>
              <Tooltip title={isZipSkill ? t('assetInstallDialog.downloadZipTooltip') : t('assetInstallDialog.downloadTooltip')}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={isZipSkill ? <FolderZipIcon /> : <DownloadIcon />}
                  onClick={() => handleDownload(tool, installPath)}
                  sx={{ flex: 1 }}
                >
                  {isZipSkill ? t('assetInstallDialog.downloadZip') : t('assetInstallDialog.download')}
                </Button>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      ))}
    </>
  );
}

// ─── Bundle item step ─────────────────────────────────────────────────────────

interface BundleItemStepProps {
  item: BundleItem;
  stepIndex: number;
  total: number;
}

function BundleItemStep({ item, stepIndex, total }: BundleItemStepProps) {
  const [copied, setCopied] = useState(false);
  const api = useApi(devAiHubApiRef);
  const discoveryApi = useApi(discoveryApiRef);
  const { asset, loading } = useAssetDetail(item.assetId ?? null);
  const { t } = useTranslationRef(devAiHubTranslationRef);

  const installPaths = asset
    ? getInstallPathsForAsset(asset.type, asset.tools, asset.name, {
        installPath: asset.installPath,
        installPaths: asset.installPaths,
      })
    : {};
  const firstInstallPath = Object.values(installPaths)[0];

  const handleCopy = () => {
    if (!asset) return;
    navigator.clipboard.writeText(asset.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    api.trackInstall(asset.id).catch(() => {});
  };

  const handleDownload = async () => {
    if (!asset) return;
    const filename = (firstInstallPath?.split('/').pop()) ?? `${asset.name}.md`;
    const blob = new Blob([asset.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    api.trackInstall(asset.id).catch(() => {});
  };

  const handleInstallInVscode = async () => {
    if (!asset) return;
    const backendUrl = await discoveryApi.getBaseUrl('dev-ai-hub');
    const a = document.createElement('a');
    a.href = buildVscodeRedirectUrl(asset, backendUrl);
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    api.trackInstall(asset.id).catch(() => {});
  };

  const showVscodeButton = asset && canUseVscodeDeepLink(asset.type, asset.tools, installPaths['github-copilot']);

  return (
    <DialogTrigger>
      <Dialog
        isOpen={!!assetId}
        isDismissable
        onOpenChange={open => { if (!open) handleClose(); }}
      >
        <DialogHeader>
          {asset ? `Install: ${asset.name}` : 'Install'}
          <Text variant="body-small" color="secondary" className={styles.subtitle}>
            Copy the content and place the file at the path shown for your tool.
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
                    Bundled skill — downloads as .zip
                  </Text>
                </Flex>
                <Text variant="body-x-small" color="secondary" style={{ display: 'block', marginBottom: 'var(--bui-space-2)' }}>
                  This skill includes resource files alongside <code>SKILL.md</code>.
                  Extract the zip and place all files in the skill directory.
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
                  Install path
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
                      {copiedTool === tool ? 'Copied!' : 'Copy Content'}
                    </Button>
                    <Tooltip>{copiedTool === tool ? 'Copied!' : 'Copy markdown content'}</Tooltip>
                  </TooltipTrigger>
                  <TooltipTrigger>
                    <Button
                      variant="secondary"
                      onClick={() => handleDownload(tool, installPath)}
                    >
                      {isZipSkill ? <RiFolderZipLine size={14} /> : <RiDownloadLine size={14} />}
                      {isZipSkill ? 'Download .zip' : 'Download'}
                    </Button>
                    <Tooltip>{isZipSkill ? 'Download as .zip with all bundled files' : 'Download file with correct name'}</Tooltip>
                  </TooltipTrigger>
                </Flex>
              </Box>
            ))}
          </Flex>
        </DialogBody>

        <DialogFooter>
          <Button onClick={handleClose} variant="secondary" slot="close">
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
}

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Box, Flex, Text, Button,
  Dialog, DialogTrigger, DialogHeader, DialogBody, DialogFooter,
} from '@backstage/ui';
import { RiQuestionLine } from '@remixicon/react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import type { AiAssetSummary } from '@julianpedro/plugin-dev-ai-hub-common';
import { devAiHubTranslationRef } from '../../translation';
import styles from './AssetHelpDialog.module.css';

interface AssetHelpDialogProps {
  asset: AiAssetSummary | null;
  onClose: () => void;
}

export function AssetHelpDialog({ asset, onClose }: AssetHelpDialogProps) {
  const { t } = useTranslationRef(devAiHubTranslationRef);
  return (
    <DialogTrigger>
      <Dialog
        isOpen={!!asset}
        isDismissable
        onOpenChange={open => { if (!open) onClose(); }}
      >
        <DialogHeader>
          <Flex align="center" style={{ gap: 'var(--bui-space-2)' }}>
            <RiQuestionLine size={20} style={{ color: 'var(--bui-fg-secondary)', flexShrink: 0 }} />
            <Box>
              <Text variant="body-medium" weight="bold">
                {asset?.label ?? asset?.name ?? ''}
              </Text>
              <Text variant="body-small" color="secondary" style={{ display: 'block' }}>
                {t('assetHelpDialog.subtitle')}
              </Text>
            </Box>
          </Flex>
        </DialogHeader>

        <DialogBody>
          <Box className={styles.markdown}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {asset?.helpText ?? ''}
            </ReactMarkdown>
          </Box>
        </DialogBody>

        <DialogFooter>
          <Button variant="secondary" onPress={onClose}>
            {t('assetHelpDialog.close')}
          </Button>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
}

import { useState, useMemo, type ElementType } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Flex, Text, Skeleton, TablePagination } from '@backstage/ui';
import { RiArticleLine, RiRobot2Line, RiToolsLine, RiGitBranchLine } from '@remixicon/react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import type { AssetType, AiTool } from '@julianpedro/plugin-dev-ai-hub-common';
import { AssetCard } from '../AssetCard';
import { AssetFilters } from '../AssetFilters';
import type { AssetFiltersValue } from '../AssetFilters';
import { AssetDetailPanel } from '../AssetDetailPanel';
import { AssetInstallDialog } from '../AssetInstallDialog';
import { AssetHelpDialog } from '../AssetHelpDialog';
import { useAssets, useStats, useProviders } from '../../hooks';
import { devAiHubTranslationRef } from '../../translation';
import styles from './DevAiHubPage.module.css';

const DEFAULT_FILTERS: AssetFiltersValue = {
  types: [],
  tools: [],
  search: '',
  tags: [],
  providerId: undefined,
};

const PAGE_SIZE = 24;

const STATS_CONFIG: { key: AssetType; label: string; Icon: ElementType; gradient: string; shadow: string }[] = [
  { key: 'instruction', label: 'Instructions', Icon: RiArticleLine,
    gradient: 'linear-gradient(135deg, #54A0FF 0%, #2980FF 100%)', shadow: '#54A0FF40' },
  { key: 'agent',       label: 'Agents',       Icon: RiRobot2Line,
    gradient: 'linear-gradient(135deg, #FF6B9D 0%, #E0507A 100%)', shadow: '#FF6B9D40' },
  { key: 'skill',       label: 'Skills',       Icon: RiToolsLine,
    gradient: 'linear-gradient(135deg, #6AB04C 0%, #4A8F2E 100%)', shadow: '#6AB04C40' },
  { key: 'workflow',    label: 'Workflows',    Icon: RiGitBranchLine,
    gradient: 'linear-gradient(135deg, #F9CA24 0%, #D4A800 100%)', shadow: '#F9CA2440' },
];

export function DevAiHubPage() {
  const { t } = useTranslationRef(devAiHubTranslationRef);
  const [filters, setFilters] = useState<AssetFiltersValue>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedAssetId = searchParams.get('assetId');
  const installAssetId = searchParams.get('installId');
  const helpAssetId = searchParams.get('helpId');

  const handleViewAsset = (id: string) =>
    setSearchParams(p => { const n = new URLSearchParams(p); n.set('assetId', id); return n; });

  const handleCloseDetail = () =>
    setSearchParams(p => { const n = new URLSearchParams(p); n.delete('assetId'); return n; });

  const handleInstallAsset = (id: string) =>
    setSearchParams(p => { const n = new URLSearchParams(p); n.set('installId', id); return n; });

  const handleCloseInstall = () =>
    setSearchParams(p => { const n = new URLSearchParams(p); n.delete('installId'); return n; });

  const handleHelpAsset = (id: string) =>
    setSearchParams(p => { const n = new URLSearchParams(p); n.set('helpId', id); return n; });

  const handleCloseHelp = () =>
    setSearchParams(p => { const n = new URLSearchParams(p); n.delete('helpId'); return n; });

  const { stats } = useStats();
  const { providers } = useProviders();

  const apiFilter = useMemo(
    () => ({
      type: filters.types.length === 1 ? (filters.types[0] as AssetType) : undefined,
      tool: filters.tools.length === 1 ? (filters.tools[0] as AiTool) : undefined,
      search: filters.search || undefined,
      tags: filters.tags.length > 0 ? filters.tags : undefined,
      providerId: filters.providerId || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [filters, page],
  );

  const { result, loading } = useAssets(apiFilter);

  const handleFiltersChange = (next: AssetFiltersValue) => {
    setFilters(next);
    setPage(1);
  };

  const totalPages = result ? Math.ceil(result.totalCount / PAGE_SIZE) : 0;

  const helpAsset = useMemo(
    () => result?.items.find(a => a.id === helpAssetId) ?? null,
    [result, helpAssetId],
  );

  const availableTags = useMemo(() => {
    if (!result) return [];
    const tagSet = new Set<string>();
    result.items.forEach(a => a.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [result]);

  return (
    <div className={styles.pageRoot}>
      <div className={styles.content}>
        {/* Stats row */}
        <div className={styles.statsGrid}>
          {STATS_CONFIG.map(({ key, label, Icon, gradient, shadow }) => {
            const isActive = filters.types[0] === key;
            return (
              <div
                key={key}
                className={styles.statCard}
                onClick={() => handleFiltersChange({ ...filters, types: isActive ? [] : [key] })}
                style={{
                  background: gradient,
                  boxShadow: isActive ? `0 8px 24px ${shadow}` : `0 2px 8px ${shadow}`,
                  transform: isActive ? 'translateY(-2px)' : 'none',
                  outline: isActive ? '2px solid rgba(255,255,255,0.6)' : 'none',
                  outlineOffset: 2,
                }}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter') handleFiltersChange({ ...filters, types: isActive ? [] : [key] }); }}
              >
                <div className={styles.statCardInner}>
                  <Box>
                    <Text variant="title-large" weight="bold" className={styles.statValue}>
                      {stats ? (stats.byType[key] ?? 0) : <Skeleton style={{ width: 32 }} />}
                    </Text>
                    <Text variant="body-small" className={styles.statLabel}>
                      {label}
                    </Text>
                  </Box>
                  <div className={styles.statIconBox}>
                    <Icon size={22} style={{ color: '#fff' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <AssetFilters
          value={filters}
          onChange={handleFiltersChange}
          availableTags={availableTags}
          providers={providers.length > 1 ? providers : undefined}
        />

        {/* Results summary */}
        {result && !loading && (
          <Text variant="body-x-small" color="secondary" style={{ marginBottom: 'var(--bui-space-4)', display: 'block' }}>
            {t(
              result.totalCount === 1
                ? 'devAiHubPage.resultsFoundOne'
                : 'devAiHubPage.resultsFoundOther',
              { n: String(result.totalCount) },
            )}
          </Text>
        )}

        {/* Asset grid — 4 columns on large screens */}
        <div className={styles.assetGrid}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} style={{ height: 150, borderRadius: 'var(--bui-radius-2)' }} />
              ))
            : result?.items.map(asset => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onView={handleViewAsset}
                  onInstall={handleInstallAsset}
                  onHelp={handleHelpAsset}
                />
              ))}
        </div>

        {/* Empty state */}
        {!loading && result?.items.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyEmoji}>🤖</div>
            <Text variant="title-small" color="secondary" weight="bold">{t('devAiHubPage.noAssetsTitle')}</Text>
            <Text variant="body-small" color="secondary" style={{ marginTop: 'var(--bui-space-1)' }}>
              {t('devAiHubPage.noAssetsSubtitle')}
            </Text>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Flex className={styles.paginationRow}>
            <TablePagination
              pageSize={PAGE_SIZE}
              offset={(page - 1) * PAGE_SIZE}
              totalCount={result?.totalCount ?? 0}
              hasNextPage={page < totalPages}
              hasPreviousPage={page > 1}
              onNextPage={() => setPage(p => p + 1)}
              onPreviousPage={() => setPage(p => p - 1)}
            />
          </Flex>
        )}
      </div>

      <AssetDetailPanel
        assetId={selectedAssetId}
        onClose={handleCloseDetail}
      />

      <AssetInstallDialog
        assetId={installAssetId}
        onClose={handleCloseInstall}
      />

      <AssetHelpDialog
        asset={helpAsset}
        onClose={handleCloseHelp}
      />
    </div>
  );
}

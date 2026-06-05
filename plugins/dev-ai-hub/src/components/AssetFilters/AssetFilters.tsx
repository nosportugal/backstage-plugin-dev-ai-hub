import type { ElementType } from 'react';
import { Box, Flex, Text, SearchField, ToggleButton, ToggleButtonGroup } from '@backstage/ui';
import { RiAppsLine, RiArticleLine, RiRobot2Line, RiToolsLine, RiGitBranchLine, RiDatabase2Line } from '@remixicon/react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import type { AssetType, AiTool, AiHubProvider } from '@julianpedro/plugin-dev-ai-hub-common';
import { ToolIcon } from '../ToolIcon';
import { devAiHubTranslationRef } from '../../translation';
import styles from './AssetFilters.module.css';

const ASSET_TYPES: { value: AssetType | 'all'; label: string; color: string; Icon: ElementType }[] = [
  { value: 'all',         label: 'All',          color: '#DCDDE1', Icon: RiAppsLine },
  { value: 'instruction', label: 'Instructions', color: '#54A0FF', Icon: RiArticleLine },
  { value: 'agent',       label: 'Agents',       color: '#FF6B9D', Icon: RiRobot2Line },
  { value: 'skill',       label: 'Skills',       color: '#6AB04C', Icon: RiToolsLine },
  { value: 'workflow',    label: 'Workflows',    color: '#F9CA24', Icon: RiGitBranchLine },
];

const AI_TOOLS: { value: AiTool | 'all'; label: string }[] = [
  { value: 'all', label: 'All Tools' },
  { value: 'claude-code', label: 'Claude Code' },
  { value: 'github-copilot', label: 'GitHub Copilot' },
  { value: 'google-gemini', label: 'Google Gemini' },
  { value: 'cursor', label: 'Cursor' },
];

export interface AssetFiltersValue {
  types: AssetType[];
  tools: AiTool[];
  search: string;
  tags: string[];
  providerId?: string;
}

interface AssetFiltersProps {
  value: AssetFiltersValue;
  onChange: (value: AssetFiltersValue) => void;
  availableTags?: string[];
  providers?: AiHubProvider[];
}

export function AssetFilters({ value, onChange, availableTags = [], providers }: AssetFiltersProps) {
  const { t } = useTranslationRef(devAiHubTranslationRef);
  const selectedType = value.types.length === 1 ? value.types[0] : 'all';
  const selectedTool = value.tools.length === 1 ? value.tools[0] : 'all';
  const showProviderFilter = providers && providers.length > 1;

  const handleTypeClick = (type: AssetType | 'all') => {
    onChange({ ...value, types: type === 'all' ? [] : [type] });
  };

  const handleToolClick = (tool: AiTool | 'all') => {
    onChange({ ...value, tools: tool === 'all' ? [] : [tool] });
  };

  const handleTagToggle = (tag: string) => {
    const next = value.tags.includes(tag)
      ? value.tags.filter(existing => existing !== tag)
      : [...value.tags, tag];
    onChange({ ...value, tags: next });
  };

  const handleProviderClick = (id: string | undefined) => {
    onChange({ ...value, providerId: id });
  };

  return (
    <Flex className={styles.container}>
      <SearchField
        aria-label="Search assets"
        className={styles.searchField}
        placeholder={t('assetFilters.searchPlaceholder')}
        value={value.search}
        onChange={v => onChange({ ...value, search: v })}
      />

      <Flex className={styles.filtersRow}>
        {/* Type filter */}
        <Box>
          <Text variant="body-x-small" color="secondary" className={styles.filterLabel}>
            {t('assetFilters.typeHeader')}
          </Text>
          <Flex className={styles.filterChips}>
              {ASSET_TYPES.map(opt => {
                const isSelected = selectedType === opt.value;
                const TypeIcon = opt.Icon;
                return (
                  <ToggleButton
                    key={opt.value}
                    id={opt.value}
                    size="small"
                    className={`${styles.filterChip} ${isSelected ? styles.filterChipSelected : ''}`}
                    iconStart={<TypeIcon size={14} style={{ color: isSelected ? '#fff' : opt.color }} />}
                    isSelected={isSelected}
                    onChange={() => handleTypeClick(opt.value as AssetType | 'all')}
                    style={{
                      borderColor: isSelected ? opt.color : `${opt.color}30`,
                      backgroundColor: isSelected ? opt.color : `${opt.color}10`,
                      color: isSelected ? '#fff' : opt.color,
                    }}
                  >
                    {opt.value === 'all' ? t('assetFilters.typeAll') : opt.label}
                  </ToggleButton>
                );
              })}
            </Flex>
        </Box>

        {/* AI Tool filter */}
        <Box>
          <Text variant="body-x-small" color="secondary" className={styles.filterLabel}>
            {t('assetFilters.aiToolHeader')}
          </Text>
          <Flex className={styles.filterChips}>
              {AI_TOOLS.map(opt => {
                const isSelected = selectedTool === opt.value;
                const iconEl = opt.value !== 'all'
                  ? <ToolIcon tool={opt.value as AiTool} branded size={14} />
                  : undefined;
                return (
                  <ToggleButton
                    key={opt.value}
                    id={opt.value}
                    size="small"
                    className={`${styles.filterChip} ${isSelected ? styles.toolChipSelected : ''}`}
                    iconStart={iconEl}
                    isSelected={isSelected}
                    onChange={() => handleToolClick(opt.value as AiTool | 'all')}
                    style={{
                      borderColor: isSelected ? 'var(--bui-fg-link)' : 'var(--bui-border-1)',
                      backgroundColor: isSelected ? 'var(--bui-bg-accent-1)' : 'transparent',
                      color: isSelected ? 'var(--bui-fg-link)' : 'var(--bui-fg-secondary)',
                    }}
                  >
                    {opt.value === 'all' ? t('assetFilters.allTools') : opt.label}
                  </ToggleButton>
                );
              })}
            </Flex>
        </Box>

        {/* Provider filter — only shown when there are 2+ providers */}
        {showProviderFilter && (
          <Box>
            <Text variant="body-x-small" color="secondary" className={styles.filterLabel}>
              {t('assetFilters.providerHeader')}
            </Text>
            <Flex className={styles.filterChips}>
                <ToggleButton
                  id="all-providers"
                  size="small"
                  className={`${styles.filterChip} ${!value.providerId ? styles.filterChipSelected : ''}`}
                  iconStart={<RiAppsLine size={14} />}
                  isSelected={!value.providerId}
                  onChange={() => handleProviderClick(undefined)}
                  style={{
                    borderColor: !value.providerId ? 'var(--bui-fg-primary)' : 'var(--bui-border-1)',
                    backgroundColor: !value.providerId ? 'var(--bui-fg-primary)' : 'transparent',
                    color: !value.providerId ? 'var(--bui-bg-neutral-1)' : 'var(--bui-fg-secondary)',
                  }}
                >
                  {t('assetFilters.typeAll')}
                </ToggleButton>
                {providers.map(p => {
                  const isSelected = value.providerId === p.id;
                  const label = p.target.split('/').slice(-1)[0]?.replace(/\.git$/, '') ?? p.id;
                  return (
                    <ToggleButton
                      key={p.id}
                      id={p.id}
                      size="small"
                      className={`${styles.filterChip} ${isSelected ? styles.filterChipSelected : ''}`}
                      iconStart={<RiDatabase2Line size={14} style={{ color: isSelected ? 'var(--bui-bg-neutral-1)' : 'inherit' }} />}
                      isSelected={isSelected}
                      onChange={() => handleProviderClick(isSelected ? undefined : p.id)}
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
      </Flex>

      {availableTags.length > 0 && (
        <Box>
          <Text variant="body-x-small" color="secondary" className={styles.filterLabel}>
            {t('assetFilters.tagsHeader')}
          </Text>
          <Flex className={styles.filterChips}>
              {availableTags.map(tag => {
                const isActive = value.tags.includes(tag);
                return (
                  <ToggleButton
                    key={tag}
                    id={tag}
                    size="small"
                    className={`${styles.tagChip} ${isActive ? styles.tagChipSelected : ''}`}
                    isSelected={isActive}
                    onChange={() => handleTagToggle(tag)}
                    style={{
                      fontWeight: isActive ? 700 : 400,
                      backgroundColor: isActive ? 'var(--bui-bg-solid)' : 'transparent',
                      color: isActive ? '#fff' : 'var(--bui-fg-secondary)',
                      borderColor: isActive ? 'var(--bui-bg-solid)' : 'var(--bui-border-1)',
                    }}
                  >
                    #{tag}
                  </ToggleButton>
                );
              })}
            </Flex>
        </Box>
      )}
    </Flex>
  );
}

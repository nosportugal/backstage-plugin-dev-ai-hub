import type { ElementType } from 'react';
import { Box, Flex, Text, SearchField, ToggleButton, ToggleButtonGroup } from '@backstage/ui';
import { RiAppsLine, RiArticleLine, RiRobot2Line, RiToolsLine, RiGitBranchLine, RiDatabase2Line } from '@remixicon/react';
import type { AssetType, AiTool, AiHubProvider } from '@nospt/plugin-dev-ai-hub-common';
import { ToolIcon } from '../ToolIcon';
import styles from './AssetFilters.module.css';

const ASSET_TYPES: { value: AssetType | 'all'; label: string; color: string; Icon: ElementType }[] = [
  { value: 'all', label: 'All', color: '#64748b', Icon: RiAppsLine },
  { value: 'instruction', label: 'Instructions', color: '#2563EB', Icon: RiArticleLine },
  { value: 'agent', label: 'Agents', color: '#7C3AED', Icon: RiRobot2Line },
  { value: 'skill', label: 'Skills', color: '#059669', Icon: RiToolsLine },
  { value: 'workflow', label: 'Workflows', color: '#D97706', Icon: RiGitBranchLine },
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
      ? value.tags.filter(t => t !== tag)
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
        placeholder="Search assets by name, description or content…"
        value={value.search}
        onChange={v => onChange({ ...value, search: v })}
      />

      <Flex className={styles.filtersRow}>
        {/* Type filter */}
        <Box>
          <Text variant="body-x-small" color="secondary" className={styles.filterLabel}>
            Type
          </Text>
          <Flex className={styles.filterChips}>
              {ASSET_TYPES.map(t => {
                const isSelected = selectedType === t.value;
                const TypeIcon = t.Icon;
                return (
                  <ToggleButton
                    key={t.value}
                    id={t.value}
                    size="small"
                    className={`${styles.filterChip} ${isSelected ? styles.filterChipSelected : ''}`}
                    iconStart={<TypeIcon size={14} style={{ color: isSelected ? '#fff' : t.color }} />}
                    isSelected={isSelected}
                    onChange={() => handleTypeClick(t.value as AssetType | 'all')}
                    style={{
                      borderColor: isSelected ? t.color : `${t.color}30`,
                      backgroundColor: isSelected ? t.color : `${t.color}10`,
                      color: isSelected ? '#fff' : t.color,
                    }}
                  >
                    {t.label}
                  </ToggleButton>
                );
              })}
            </Flex>
        </Box>

        {/* AI Tool filter */}
        <Box>
          <Text variant="body-x-small" color="secondary" className={styles.filterLabel}>
            AI Tool
          </Text>
          <Flex className={styles.filterChips}>
              {AI_TOOLS.map(t => {
                const isSelected = selectedTool === t.value;
                const iconEl = t.value !== 'all'
                  ? <ToolIcon tool={t.value as AiTool} branded size={14} />
                  : undefined;
                return (
                  <ToggleButton
                    key={t.value}
                    id={t.value}
                    size="small"
                    className={`${styles.filterChip} ${isSelected ? styles.toolChipSelected : ''}`}
                    iconStart={iconEl}
                    isSelected={isSelected}
                    onChange={() => handleToolClick(t.value as AiTool | 'all')}
                    style={{
                      borderColor: isSelected ? 'var(--bui-fg-link)' : 'var(--bui-border-1)',
                      backgroundColor: isSelected ? 'var(--bui-bg-accent-1)' : 'transparent',
                      color: isSelected ? 'var(--bui-fg-link)' : 'var(--bui-fg-secondary)',
                    }}
                  >
                    {t.label}
                  </ToggleButton>
                );
              })}
            </Flex>
        </Box>

        {/* Provider filter — only shown when there are 2+ providers */}
        {showProviderFilter && (
          <Box>
            <Text variant="body-x-small" color="secondary" className={styles.filterLabel}>
              Provider
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
                  All
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
            Tags
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

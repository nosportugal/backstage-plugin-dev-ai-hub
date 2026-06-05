import type { CSSProperties } from 'react';
import { RiInfinityLine, RiNavigationLine } from '@remixicon/react';
import { siAnthropic, siGithub, siGooglegemini } from 'simple-icons';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import type { AiTool } from '@julianpedro/plugin-dev-ai-hub-common';
import { devAiHubTranslationRef } from '../../translation';

type SvgTool = Exclude<AiTool, 'all' | 'cursor'>;

const TOOL_ICON: Record<SvgTool, { path: string; hex: string; label: string }> = {
  'claude-code':    { ...siAnthropic,    label: 'Claude Code' },
  'github-copilot': { ...siGithub,       label: 'GitHub Copilot' },
  'google-gemini':  { ...siGooglegemini, label: 'Google Gemini' },
};

interface ToolIconProps {
  tool: AiTool;
  /** Use the brand's official color. Defaults to true. */
  branded?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Icon size in pixels. Defaults to 20. */
  size?: number;
}

export function ToolIcon({ tool, branded = true, className, style, size = 20 }: ToolIconProps) {
  const { t } = useTranslationRef(devAiHubTranslationRef);
  if (tool === 'all') {
    return (
      <RiInfinityLine
        size={size}
        className={className}
        style={{ color: 'var(--bui-fg-secondary)', ...style }}
        aria-label={t('toolIcon.universal')}
      />
    );
  }

  if (tool === 'cursor') {
    return (
      <RiNavigationLine
        size={size}
        className={className}
        style={{ color: branded ? 'var(--bui-fg-primary)' : 'inherit', ...style }}
        aria-label="Cursor"
      />
    );
  }

  const cfg = TOOL_ICON[tool as SvgTool];
  if (!cfg) return null;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      style={{ color: branded ? `#${cfg.hex}` : 'inherit', ...style }}
      aria-label={cfg.label}
      role="img"
    >
      <path d={cfg.path} />
    </svg>
  );
}

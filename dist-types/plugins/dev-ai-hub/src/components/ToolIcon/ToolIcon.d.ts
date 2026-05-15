import type { CSSProperties } from 'react';
import type { AiTool } from '@nospt/plugin-dev-ai-hub-common';
interface ToolIconProps {
    tool: AiTool;
    /** Use the brand's official color. Defaults to true. */
    branded?: boolean;
    className?: string;
    style?: CSSProperties;
    /** Icon size in pixels. Defaults to 20. */
    size?: number;
}
export declare function ToolIcon({ tool, branded, className, style, size }: ToolIconProps): import("react/jsx-runtime").JSX.Element | null;
export {};

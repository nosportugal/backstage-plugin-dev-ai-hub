import type { AiAssetFrontmatter } from '@julianpedro/plugin-dev-ai-hub-common';
import type { AiAssetInput } from '../types';
export interface ParsedAssetMeta {
    meta: AiAssetFrontmatter;
    /**
     * Resolved explicit .md path — only set when the YAML has a `content:` field.
     * When absent, the sync service resolves the md file by directory junction.
     */
    mdPath?: string;
    yamlRaw: string;
}
export declare class AssetParser {
    /**
     * Parse the YAML metadata file (the envelope).
     * Returns null when the YAML is invalid or missing required fields.
     */
    static parseYaml(yamlContent: string, yamlFilePath: string): ParsedAssetMeta | null;
    /**
     * Build the full AiAssetInput from parsed metadata + raw markdown content.
     * The mdContent is stored verbatim — never modified.
     * actualMdPath is the resolved path of the md file as found by the sync service.
     */
    static buildAsset(parsed: ParsedAssetMeta, mdContent: string, providerId: string, repoUrl: string, branch: string, yamlFilePath: string, actualMdPath: string, resourcesContent?: Record<string, string>): AiAssetInput;
    static buildId(providerId: string, yamlPath: string): string;
}

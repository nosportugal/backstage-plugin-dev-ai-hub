import { z } from 'zod';
export declare const AiToolEnum: z.ZodEnum<["all", "github-copilot", "claude-code", "google-gemini", "cursor"]>;
export declare const AssetTypeEnum: z.ZodEnum<["instruction", "agent", "skill", "workflow", "bundle"]>;
/**
 * Schema for the YAML metadata file (.yaml) that acts as an envelope.
 * The actual asset content lives in the referenced .md file.
 */
export declare const AiAssetFrontmatterSchema: z.ZodObject<{
    /** Path to the .md content file, relative to the .yaml file directory.
     *  If omitted, the parser falls back to <same-name>.md by convention. */
    content: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    /** Human-readable display label shown in the UI. Falls back to `name` when omitted. */
    label: z.ZodOptional<z.ZodString>;
    description: z.ZodString;
    type: z.ZodEnum<["instruction", "agent", "skill", "workflow", "bundle"]>;
    tools: z.ZodArray<z.ZodEnum<["all", "github-copilot", "claude-code", "google-gemini", "cursor"]>, "many">;
    tags: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    author: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    icon: z.ZodOptional<z.ZodString>;
    version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    updatedAt: z.ZodOptional<z.ZodString>;
    installPath: z.ZodOptional<z.ZodString>;
    installPaths: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    resources: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        ref: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        ref: string;
    }, {
        ref: string;
    }>, "many">>;
    help: z.ZodOptional<z.ZodString>;
    mcps: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
        id: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name?: string | undefined;
        icon?: string | undefined;
    }, {
        id: string;
        name?: string | undefined;
        icon?: string | undefined;
    }>]>, "many">>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    /** Path to the .md content file, relative to the .yaml file directory.
     *  If omitted, the parser falls back to <same-name>.md by convention. */
    content: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    /** Human-readable display label shown in the UI. Falls back to `name` when omitted. */
    label: z.ZodOptional<z.ZodString>;
    description: z.ZodString;
    type: z.ZodEnum<["instruction", "agent", "skill", "workflow", "bundle"]>;
    tools: z.ZodArray<z.ZodEnum<["all", "github-copilot", "claude-code", "google-gemini", "cursor"]>, "many">;
    tags: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    author: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    icon: z.ZodOptional<z.ZodString>;
    version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    updatedAt: z.ZodOptional<z.ZodString>;
    installPath: z.ZodOptional<z.ZodString>;
    installPaths: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    resources: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        ref: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        ref: string;
    }, {
        ref: string;
    }>, "many">>;
    help: z.ZodOptional<z.ZodString>;
    mcps: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
        id: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name?: string | undefined;
        icon?: string | undefined;
    }, {
        id: string;
        name?: string | undefined;
        icon?: string | undefined;
    }>]>, "many">>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    /** Path to the .md content file, relative to the .yaml file directory.
     *  If omitted, the parser falls back to <same-name>.md by convention. */
    content: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    /** Human-readable display label shown in the UI. Falls back to `name` when omitted. */
    label: z.ZodOptional<z.ZodString>;
    description: z.ZodString;
    type: z.ZodEnum<["instruction", "agent", "skill", "workflow", "bundle"]>;
    tools: z.ZodArray<z.ZodEnum<["all", "github-copilot", "claude-code", "google-gemini", "cursor"]>, "many">;
    tags: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    author: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    icon: z.ZodOptional<z.ZodString>;
    version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    updatedAt: z.ZodOptional<z.ZodString>;
    installPath: z.ZodOptional<z.ZodString>;
    installPaths: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    resources: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        ref: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        ref: string;
    }, {
        ref: string;
    }>, "many">>;
    help: z.ZodOptional<z.ZodString>;
    mcps: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
        id: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name?: string | undefined;
        icon?: string | undefined;
    }, {
        id: string;
        name?: string | undefined;
        icon?: string | undefined;
    }>]>, "many">>;
}, z.ZodTypeAny, "passthrough">>;
export type AiAssetFrontmatter = z.infer<typeof AiAssetFrontmatterSchema>;
/**
 * Schema for the mcp-catalog.yaml file placed at the root of a provider
 * repository. Defines external MCP servers that users can install with one click.
 */
export declare const McpCatalogFileSchema: z.ZodObject<{
    servers: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodString>;
        type: z.ZodEnum<["http", "stdio"]>;
        url: z.ZodOptional<z.ZodString>;
        command: z.ZodOptional<z.ZodString>;
        args: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        env: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        type: "http" | "stdio";
        id: string;
        description?: string | undefined;
        icon?: string | undefined;
        url?: string | undefined;
        command?: string | undefined;
        args?: string[] | undefined;
        env?: Record<string, string> | undefined;
    }, {
        name: string;
        type: "http" | "stdio";
        id: string;
        description?: string | undefined;
        icon?: string | undefined;
        url?: string | undefined;
        command?: string | undefined;
        args?: string[] | undefined;
        env?: Record<string, string> | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    servers: {
        name: string;
        type: "http" | "stdio";
        id: string;
        description?: string | undefined;
        icon?: string | undefined;
        url?: string | undefined;
        command?: string | undefined;
        args?: string[] | undefined;
        env?: Record<string, string> | undefined;
    }[];
}, {
    servers: {
        name: string;
        type: "http" | "stdio";
        id: string;
        description?: string | undefined;
        icon?: string | undefined;
        url?: string | undefined;
        command?: string | undefined;
        args?: string[] | undefined;
        env?: Record<string, string> | undefined;
    }[];
}>;
export type McpCatalogFile = z.infer<typeof McpCatalogFileSchema>;

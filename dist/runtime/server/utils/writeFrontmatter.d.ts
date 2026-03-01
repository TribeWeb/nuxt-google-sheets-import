export type WriteOutputFormat = 'frontmatter' | 'json' | 'yaml';
export type WriteOverwriteMode = 'skip' | 'overwrite' | 'overwrite-frontmatter';
export type WriteAction = 'written' | 'overwritten' | 'skipped';
export interface WriteRecordInput {
    record: Record<string, unknown>;
    baseContentDir: string;
    folder: string;
    slugKey: string;
    orderKey?: string;
    outputFormat?: WriteOutputFormat;
    overwriteMode?: WriteOverwriteMode;
}
export interface WriteRecordResult {
    filePath: string;
    action: WriteAction;
}
export declare function writeRecordAsFrontmatter(input: WriteRecordInput): Promise<WriteRecordResult>;

interface GetValuesPayload {
    spreadsheetId: string;
    sheetTitle: string;
    range: string;
    schema: string;
}
interface WritePayload {
    records: Record<string, unknown>[];
    schema?: string;
    folder: string;
    slugKey: string;
    orderKey?: string;
    contentDir?: string;
    outputFormat?: 'frontmatter' | 'json' | 'yaml';
    overwriteMode?: 'skip' | 'overwrite' | 'overwrite-frontmatter';
}
export declare function useGoogleSheetsImport(): {
    getSheets: (spreadsheetId: string) => Promise<any>;
    getValues: (payload: GetValuesPayload) => Promise<any>;
    getCollectionType: (schema: string) => Promise<any>;
    writeFiles: (payload: WritePayload) => Promise<any>;
};
export {};

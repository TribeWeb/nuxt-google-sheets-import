import type { MaybeRefOrGetter } from 'vue';
export interface GoogleSheetsImportQuery {
    spreadsheetId: string;
    sheetTitle: string;
    range: string;
    schema: string;
}
interface WorkflowOptions {
    query?: MaybeRefOrGetter<GoogleSheetsImportQuery>;
}
export declare function useGoogleSheetsImportWorkflow(options?: WorkflowOptions): {
    source: any;
    sourceStatus: any;
    sourceError: any;
    sheetTitles: any;
    upperCaseRange: any;
    selectedSheetPreview: any;
    sourceQuery: any;
    activeQuery: any;
    canLoadValues: any;
    selectedCollectionType: any;
    selectedCollectionTypeStatus: any;
    resolvedBaseContentDir: any;
    resolvedDestinationPath: any;
    loadSheetTitles: (spreadsheetId?: string) => Promise<void>;
    status: any;
    writeStatus: any;
    importError: any;
    writeError: any;
    writeSummary: any;
    values: any;
    validationErrors: any;
    logs: any;
    writeFile: any;
    columnList: any;
    productsLength: any;
    logsLength: any;
    canWrite: any;
    previewRows: any;
    shownValidationErrors: any;
    loadValues: (queryArg?: GoogleSheetsImportQuery) => Promise<void>;
    writeValues: () => Promise<void>;
};
export {};

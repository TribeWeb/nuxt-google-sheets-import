import { z } from 'zod';
export declare function transformAndValidateRows(values: string[][], schema: z.ZodTypeAny): {
    records: Record<string, unknown>[];
    errors: string[];
};

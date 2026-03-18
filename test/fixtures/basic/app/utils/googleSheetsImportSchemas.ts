import { z } from 'zod'

export const smokeSchema = z.object({
  slug: z.string().min(1),
})

export const schemas = {
  smokeSchema,
}

export const googleSheetsImportSchemas = schemas

import * as z from 'zod/v4'

const example = z.object({
  slug: z.string().min(1).max(100),
  pageOrder: z.coerce.number().int(),
})

export const googleSheetsImportSchemas = {
  example,
}

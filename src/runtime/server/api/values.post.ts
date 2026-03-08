import { z } from 'zod'
import { transformAndValidateRows } from '../utils/transform'
import { readBody, defineEventHandler, createError } from 'h3'
import { useRuntimeConfig, googleSheetsImportSchemas } from '#imports'

const bodySchema = z.object({
  spreadsheetId: z.string().length(44),
  sheetTitle: z.string().min(1),
  range: z.string().min(1),
  schema: z.string().min(1),
})

interface ValuesResponse {
  values?: string[][]
}

export default defineEventHandler(async (event) => {
  const body = bodySchema.parse(await readBody(event))
  const { googleSheetsImport } = useRuntimeConfig()
  const apiKey = googleSheetsImport?.googleApiKeyRuntimeKey

  if (!apiKey || typeof apiKey !== 'string') {
    throw createError({ statusCode: 500, statusMessage: `Missing Google API key in nuxt.config googleSheetsImport: { googleApiKeyRuntimeKey: '${apiKey}' }` })
  }

  const encodedRange = encodeURIComponent(`${body.sheetTitle}!${body.range}`)
  const googleResponse = await $fetch<ValuesResponse>(`https://sheets.googleapis.com/v4/spreadsheets/${body.spreadsheetId}/values/${encodedRange}?key=${apiKey}`)

  const values = googleResponse.values ?? []
  const schemaMap = (googleSheetsImportSchemas ?? {}) as Record<string, z.ZodTypeAny>
  const schema = schemaMap[body.schema]

  if (!schema) {
    throw createError({ statusCode: 400, statusMessage: `Unknown schema: ${body.schema}` })
  }

  const transformed = transformAndValidateRows(values, schema)

  return {
    headers: values[0] ?? [],
    records: transformed.records,
    errors: transformed.errors,
  }
})

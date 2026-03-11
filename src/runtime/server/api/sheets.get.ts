import { z } from 'zod'
import { columnCountToRange } from '../utils/googleSheets'
import { getValidatedQuery, defineEventHandler, createError } from 'h3'
import { useRuntimeConfig } from '#imports'

const querySchema = z.object({
  spreadsheetId: z.string().length(44),
})

type GoogleSheetsResponse = {
  sheets?: Array<{
    properties?: {
      title?: string
      gridProperties?: {
        columnCount?: number
      }
    }
  }>
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const apiKey = config.googleApiKey

  const { spreadsheetId } = await getValidatedQuery(event, query => querySchema.parse(query))

  if (!apiKey || typeof apiKey !== 'string') {
    throw createError({ statusCode: 500, statusMessage: `Missing Google API key in nuxt.config googleSheetsImport: { googleApiKeyRuntimeKey: '${apiKey}' }` })
  }

  const response = await $fetch<GoogleSheetsResponse>(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${apiKey}`)

  return {
    spreadsheetId,
    sheets: (response.sheets ?? []).map((sheet) => {
      const columnCount = sheet.properties?.gridProperties?.columnCount ?? 1
      return {
        label: sheet.properties?.title ?? '',
        range: columnCountToRange(columnCount),
      }
    }).filter(sheet => sheet.label),
  }
})

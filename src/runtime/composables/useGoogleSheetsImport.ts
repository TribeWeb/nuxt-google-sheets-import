interface GoogleSheetOption {
  label: string
  range: string
}

interface GetValuesPayload {
  spreadsheetId: string
  sheetTitle: string
  range: string
  schema: string
}

interface WritePayload {
  records: Record<string, unknown>[]
  schema?: string
  folder: string
  slugKey: string
  orderKey?: string
  contentDir?: string
  outputFormat?: 'frontmatter' | 'json' | 'yaml'
  overwriteMode?: 'skip' | 'overwrite' | 'overwrite-frontmatter'
}

export function useGoogleSheetsImport() {
  const config = useRuntimeConfig()
  const apiBase = config.public.googleSheetsImport?.apiBase ?? '/api/google-sheets-import'

  const getSheets = async (spreadsheetId: string) => {
    const response = await $fetch<{ sheets: GoogleSheetOption[] }>(`${apiBase}/sheets`, {
      query: { spreadsheetId }
    })

    return response.sheets
  }

  const getValues = async (payload: GetValuesPayload) => {
    return await $fetch<{ headers: string[], records: Record<string, unknown>[], errors: string[] }>(`${apiBase}/values`, {
      method: 'POST',
      body: payload
    })
  }

  const getCollectionType = async (schema: string) => {
    return await $fetch<{ collectionType: 'page' | 'data' | 'unknown', baseContentDir: string }>(`${apiBase}/collection-type`, {
      query: { schema }
    })
  }

  const getSchemaColumns = async (schema?: string) => {
    return await $fetch<{
      schema: string | null
      schemas: string[]
      columns: string[]
      collectionType: 'page' | 'data' | 'unknown'
      pageOverrideColumns: string[]
    }>(`${apiBase}/schema-columns`, {
      query: schema ? { schema } : undefined
    })
  }

  const writeFiles = async (payload: WritePayload) => {
    return await $fetch<{
      count: number
      logs: string[]
      contentDir: string
      summary: {
        written: number
        overwritten: number
        skipped: number
      }
    }>(`${apiBase}/write`, {
      method: 'POST',
      body: payload
    })
  }

  return {
    getSheets,
    getValues,
    getCollectionType,
    getSchemaColumns,
    writeFiles
  }
}

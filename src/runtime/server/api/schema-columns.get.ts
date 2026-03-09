import { z } from 'zod'
import { resolveCollectionTypeBySchema } from '../utils/collectionType'
import { getSchemaColumns, PAGE_SCHEMA_OVERRIDE_COLUMNS } from '../utils/schemaColumns'
import { getValidatedQuery, defineEventHandler, createError } from 'h3'
import { googleSheetsImportSchemas } from '#imports'

const querySchema = z.object({
  schema: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const { schema } = await getValidatedQuery(event, query => querySchema.parse(query))

  const schemaMap = (googleSheetsImportSchemas ?? {}) as Record<string, z.ZodTypeAny>
  const availableSchemas = Object.keys(schemaMap).sort((left, right) => left.localeCompare(right))

  if (!schema) {
    return {
      schema: null,
      schemas: availableSchemas,
      columns: [],
      collectionType: 'unknown',
      pageOverrideColumns: [],
    }
  }

  const collectionType = await resolveCollectionTypeBySchema(schema)

  const selectedSchema = schemaMap[schema]
  if (!selectedSchema) {
    throw createError({
      statusCode: 400,
      statusMessage: `Unknown schema: ${schema}`,
    })
  }

  const columns = getSchemaColumns(selectedSchema)

  return {
    schema,
    schemas: availableSchemas,
    columns,
    collectionType,
    pageOverrideColumns: collectionType === 'page' ? PAGE_SCHEMA_OVERRIDE_COLUMNS : [],
  }
})

import { z } from 'zod'
import { resolveCollectionTypeBySchema } from '../utils/collectionType'
import { defineEventHandler, getValidatedQuery } from 'h3'
import { useRuntimeConfig } from '#imports'

const querySchema = z.object({
  schema: z.string().optional(),
})

type CollectionType = 'page' | 'data'

export default defineEventHandler(async (event) => {
  const { schema } = await getValidatedQuery(event, query => querySchema.parse(query))
  const config = useRuntimeConfig(event)
  const moduleConfig = config.googleSheetsImport as {
    defaultContentDir: string
  }

  const collectionType = await resolveCollectionTypeBySchema(schema)

  const baseContentDir = collectionType === 'page'
    ? 'content'
    : collectionType === 'data'
      ? 'content/data'
      : moduleConfig.defaultContentDir

  return {
    schema: schema ?? null,
    collectionType,
    baseContentDir,
  }
})

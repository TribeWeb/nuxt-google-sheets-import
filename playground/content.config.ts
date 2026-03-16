import { defineContentConfig, defineCollection } from '@nuxt/content'
import { googleSheetsImportSchemas } from './utils/googleSheetsImportSchemas'

export default defineContentConfig({
  collections: {
    example: defineCollection({
      type: 'page',
      source: 'example/*.md',
      schema: googleSheetsImportSchemas.example,
    }),
  },
})

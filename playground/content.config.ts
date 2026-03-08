import { defineContentConfig, defineCollection } from '@nuxt/content'
import { example, example2 } from './utils/googleSheetImportSchemas'

export default defineContentConfig({
  collections: {
    example: defineCollection({
      type: 'page',
      source: 'example/*.md',
      schema: example,
    }),
    example2: defineCollection({
      type: 'page',
      source: 'example2/*.md',
      schema: example2,
    }),
  },
})

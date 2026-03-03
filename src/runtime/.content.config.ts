import { defineContentConfig, defineCollection } from '@nuxt/content'
import { example } from './import/schemas'

export default defineContentConfig({
  collections: {
    exampleSchema: defineCollection({
      type: 'page',
      source: 'example/*.md',
      schema: example,
    }),
  },
})

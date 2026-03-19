import { defineContentConfig, defineCollection } from '@nuxt/content'
import { myRenamedSchemas } from './app/utils/myRenamedSchemas'

export default defineContentConfig({
  collections: {
    example: defineCollection({
      type: 'page',
      source: 'example/*.md',
      schema: myRenamedSchemas.myExample,
    }),
  },
})

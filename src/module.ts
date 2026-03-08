import {
  addComponentsDir,
  addImports,
  addImportsDir,
  addServerImports,
  addServerHandler,
  createResolver,
  defineNuxtModule,
  extendPages,
} from '@nuxt/kit'

export interface ModuleOptions {
  apiBase: string
  googleApiKeyRuntimeKey: string
  defaultContentDir: string
  collectionTypeBySchema: Record<string, 'page' | 'data'>
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-google-sheets-import',
    configKey: 'googleSheetsImport',
  },
  moduleDependencies: {
    '@nuxt/ui': {
      version: '>=4',
    },
  },
  defaults: {
    apiBase: '/api/google-sheets-import',
    googleApiKeyRuntimeKey: 'googleApiKey',
    defaultContentDir: 'content/data',
    collectionTypeBySchema: {},
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const normalizedCollectionTypeBySchema = Object.entries(options.collectionTypeBySchema).reduce<Record<string, 'page' | 'data'>>((acc, [key, value]) => {
      const trimmed = key.trim()
      acc[trimmed] = value
      acc[trimmed.toLowerCase()] = value
      acc[trimmed.replace(/[-\s]+/g, '_').toLowerCase()] = value
      return acc
    }, {})

    nuxt.options.runtimeConfig.googleSheetsImport = {
      apiBase: options.apiBase,
      googleApiKeyRuntimeKey: options.googleApiKeyRuntimeKey,
      defaultContentDir: options.defaultContentDir,
      collectionTypeBySchema: normalizedCollectionTypeBySchema,
    }

    nuxt.options.runtimeConfig.public.googleSheetsImport = {
      apiBase: options.apiBase,
      defaultContentDir: options.defaultContentDir,
      collectionTypeBySchema: normalizedCollectionTypeBySchema,
    }

    nuxt.options.css.push(resolver.resolve('./runtime/assets/css/main.css'))

    extendPages((pages) => {
      pages.push({
        name: 'google-sheets-import',
        path: '/google-sheets-import',
        file: resolver.resolve('./runtime/pages/google-sheets-import.vue'),
      })
    })

    addServerHandler({
      route: `${options.apiBase}/sheets`,
      method: 'get',
      handler: resolver.resolve('./runtime/server/api/sheets.get'),
    })

    addServerHandler({
      route: `${options.apiBase}/values`,
      method: 'post',
      handler: resolver.resolve('./runtime/server/api/values.post'),
    })

    addServerHandler({
      route: `${options.apiBase}/collection-type`,
      method: 'get',
      handler: resolver.resolve('./runtime/server/api/collection-type.get'),
    })

    addServerHandler({
      route: `${options.apiBase}/schema-columns`,
      method: 'get',
      handler: resolver.resolve('./runtime/server/api/schema-columns.get'),
    })

    addServerHandler({
      route: `${options.apiBase}/write`,
      method: 'post',
      handler: resolver.resolve('./runtime/server/api/write.post'),
    })

    addImportsDir(resolver.resolve('./runtime/composables'))

    addComponentsDir({
      path: resolver.resolve('./runtime/components'),
    })

    addImports([
      {
        from: '~/utils/googleSheetImportSchemas',
        name: 'schemas',
        as: 'googleSheetsImportSchemas',
      },
      {
        from: resolver.resolve('./runtime/types/googleSheetsApi'),
        name: 'GoogleSheetsApiValues',
        type: true,
      },
      {
        from: resolver.resolve('./runtime/types/googleSheetsApi'),
        name: 'GoogleSheetsApiValuesResponse',
        type: true,
      },
      {
        from: resolver.resolve('./runtime/types/googleSheetsApi'),
        name: 'GoogleSheetsApiSheet',
        type: true,
      },
      {
        from: resolver.resolve('./runtime/types/googleSheetsApi'),
        name: 'GoogleSheetsApiSheetResponse',
        type: true,
      },
      {
        from: resolver.resolve('./runtime/types/googleSheetsApi'),
        name: 'ProductObject',
        type: true,
      },
      {
        from: resolver.resolve('./runtime/types/googleSheetsApi'),
        name: 'TransformedGoogleSheetsApiResult',
        type: true,
      },
    ])

    addServerImports([
      {
        from: '~/utils/googleSheetImportSchemas',
        name: 'schemas',
        as: 'googleSheetsImportSchemas',
      },
    ])
  },
})

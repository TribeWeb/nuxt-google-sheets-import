import {
  addComponentsDir,
  addImports,
  addImportsDir,
  addServerImports,
  addServerHandler,
  createResolver,
  defineNuxtModule
} from '@nuxt/kit'

export interface ModuleOptions {
  apiBase: string
  googleApiKeyRuntimeKey: string
  defaultContentDir: string
  collectionTypeBySchema: Record<string, 'page' | 'data'>
  schemaRegistryImport: string
  schemaRegistryExport: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'google-sheets-import',
    configKey: 'googleSheetsImport'
  },
  defaults: {
    apiBase: '/api/google-sheets-import',
    googleApiKeyRuntimeKey: 'googleApiKey',
    defaultContentDir: 'content/data',
    collectionTypeBySchema: {},
    schemaRegistryImport: '#imports',
    schemaRegistryExport: 'schemas'
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
      schemaRegistryImport: options.schemaRegistryImport,
      schemaRegistryExport: options.schemaRegistryExport
    }

    nuxt.options.runtimeConfig.public.googleSheetsImport = {
      apiBase: options.apiBase,
      defaultContentDir: options.defaultContentDir,
      collectionTypeBySchema: normalizedCollectionTypeBySchema
    }

    addServerHandler({
      route: `${options.apiBase}/sheets`,
      method: 'get',
      handler: resolver.resolve('./runtime/server/api/sheets.get')
    })

    addServerHandler({
      route: `${options.apiBase}/values`,
      method: 'post',
      handler: resolver.resolve('./runtime/server/api/values.post')
    })

    addServerHandler({
      route: `${options.apiBase}/collection-type`,
      method: 'get',
      handler: resolver.resolve('./runtime/server/api/collection-type.get')
    })

    addServerHandler({
      route: `${options.apiBase}/schema-columns`,
      method: 'get',
      handler: resolver.resolve('./runtime/server/api/schema-columns.get')
    })

    addServerHandler({
      route: `${options.apiBase}/write`,
      method: 'post',
      handler: resolver.resolve('./runtime/server/api/write.post')
    })

    addImportsDir(resolver.resolve('./runtime/composables'))

    addComponentsDir({
      path: resolver.resolve('./runtime/components')
    })

    addImports([
      {
        from: resolver.resolve('./runtime/types/googleSheetsApi'),
        name: 'GoogleSheetsApiValues',
        type: true
      },
      {
        from: resolver.resolve('./runtime/types/googleSheetsApi'),
        name: 'GoogleSheetsApiValuesResponse',
        type: true
      },
      {
        from: resolver.resolve('./runtime/types/googleSheetsApi'),
        name: 'GoogleSheetsApiSheet',
        type: true
      },
      {
        from: resolver.resolve('./runtime/types/googleSheetsApi'),
        name: 'GoogleSheetsApiSheetResponse',
        type: true
      },
      {
        from: resolver.resolve('./runtime/types/googleSheetsApi'),
        name: 'ProductObject',
        type: true
      },
      {
        from: resolver.resolve('./runtime/types/googleSheetsApi'),
        name: 'TransformedGoogleSheetsApiResult',
        type: true
      }
    ])

    addServerImports([
      {
        from: options.schemaRegistryImport,
        name: options.schemaRegistryExport,
        as: 'googleSheetsImportSchemas'
      }
    ])
  }
})

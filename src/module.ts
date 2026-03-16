import {
  addComponentsDir,
  addImports,
  addImportsDir,
  addServerImports,
  addServerHandler,
  createResolver,
  defineNuxtModule,
  extendPages,
  addTemplate,
} from '@nuxt/kit'

export interface ModuleOptions {
  apiBase: string
  defaultContentDir: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-google-sheets-import',
    configKey: 'googleSheetsImport',
  },
  moduleDependencies: {
    '@nuxt/content': {
      version: '>=3',
    },
    '@nuxt/ui': {
      version: '>=4',
    },
  },
  defaults: {
    apiBase: '/api/google-sheets-import',
    defaultContentDir: 'content/data',
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    addTemplate({
      filename: 'googleSheetsImportSchemaExample.ts',
      src: resolver.resolve('./runtime/app/examples/googleSheetsImportSchemasExample.ts'),
      dst: 'utils/googleSheetsImportSchemasExample.ts',
      write: true,
    })

    nuxt.options.runtimeConfig.googleSheetsImport = {
      ...nuxt.options.runtimeConfig.googleSheetsImport,
      apiBase: options.apiBase,
      defaultContentDir: options.defaultContentDir,
    }

    nuxt.options.runtimeConfig.public.googleSheetsImport = {
      ...nuxt.options.runtimeConfig.public.googleSheetsImport,
      apiBase: options.apiBase,
      defaultContentDir: options.defaultContentDir,
    }

    nuxt.options.css.push(resolver.resolve('./runtime/app/assets/css/main.css'))

    extendPages((pages) => {
      pages.push({
        name: 'google-sheets-import',
        path: '/google-sheets-import',
        file: resolver.resolve('./runtime/app/pages/google-sheets-import.vue'),
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

    addImportsDir(resolver.resolve('./runtime/app/composables'))

    addComponentsDir({
      path: resolver.resolve('./runtime/app/components'),
    })

    addImports([
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
        from: '~/utils/googleSheetsImportSchemas',
        name: 'googleSheetsImportSchemas',
        as: 'googleSheetsImportSchemas',
      },
    ])
  },
})

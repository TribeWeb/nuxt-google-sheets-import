export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  googleSheetsImport: {
    apiBase: '/api/google-sheets-import',
    googleApiKeyRuntimeKey: 'googleApiKey',
    schemaRegistryImport: '~/server/google-sheets/schemas',
    schemaRegistryExport: 'schemas',
    defaultContentDir: 'content',
    collectionTypeBySchema: {
      machinesSmoke: 'data',
      machines: 'page',
      materials: 'data'
    }
  }
})

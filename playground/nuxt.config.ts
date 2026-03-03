export default defineNuxtConfig({
  modules: [
    '../src/module'
  ],
  devtools: { enabled: true },
  compatibilityDate: 'latest',
  googleSheetsImport: {
    apiBase: '/api/google-sheets-import',
    googleApiKeyRuntimeKey: 'AIzaSyD-ior9_9IMze4P5iWEtfKa1PakkmHcpec',
    schemaRegistryImport: '~/import/schemas',
    schemaRegistryExport: 'schemas',
    defaultContentDir: 'content',
    collectionTypeBySchema: {
      machinesSmoke: 'data',
      example: 'page'
    }
  }
})
